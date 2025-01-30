import { Injectable, HttpStatus } from '@nestjs/common';
import { balance_status } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class PaymentCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  async calculatePayment(
    amountUSD: number,
    bankProductId: number,
    userId: number,
  ) {
    const { bankProduct, ispConfig, dolarRate } =
      await this.getConfigurations(bankProductId);

    // Obtener saldo disponible del cliente
    const availableBalance = await this.getClientAvailableBalance(userId);
    console.log('availableBalance: ', availableBalance);

    const bankConfig = bankProduct.configurations[0];
    let result;

    if (bankConfig.currency === 'USD') {
      result = this.calculateUSDPayment(amountUSD, ispConfig);
    } else {
      result = this.calculateVESPayment(
        amountUSD,
        ispConfig,
        dolarRate.bcv_rate,
      );
    }

    // Aplicar comisión del sistema si corresponde
    let operationCost = false;
    if (ispConfig.commission_type === 'CLIENT_ASSUMES') {
      operationCost = true;
      result = this.applySystemCommission(
        result,
        bankConfig.currency,
        dolarRate.bcv_rate,
      );
    }

    // Ahora aplicamos el saldo disponible al monto final
    const finalAmount = result.amount;
    const adjustedAmount = this.applyAvailableBalance(
      finalAmount,
      availableBalance,
      bankConfig.currency,
      dolarRate.bcv_rate,
    );
    const balanceApplied = Number((finalAmount - adjustedAmount).toFixed(2));

    return this.roundAllNumbers({
      ...result,
      amount: adjustedAmount,
      originalAmount: finalAmount,
      balanceApplied,
      currency: bankConfig.currency,
      exchangeRate: dolarRate.bcv_rate,
      operationCost,
    });
  }

  /** getConfigurations */
  private async getConfigurations(bankProductId: number) {
    const bankProduct = await this.prisma.bank_product.findUnique({
      where: { id: bankProductId },
      include: { configurations: true },
    });

    if (!bankProduct) {
      throw new CustomException({
        message: 'Producto bancario no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    const ispConfig = await this.prisma.isp_configuration.findFirst({
      where: { isp: { is_active: true } },
      include: { isp: true },
    });

    if (!ispConfig) {
      throw new CustomException({
        message: 'No se encontró configuración de ISP activo',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    const dolarRate = await this.prisma.dolar_rate.findFirst({
      orderBy: { created_at: 'desc' },
    });

    if (!dolarRate) {
      throw new CustomException({
        message: 'No se encontró tasa de cambio actual',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    return { bankProduct, ispConfig, dolarRate };
  }

  /** calculateUSDPayment */
  private calculateUSDPayment(amount: number, ispConfig: any) {
    let baseAmount = amount;
    let igtfAmount = 0;
    let ivaAmount = 0;

    if (!ispConfig.add_igtf && !ispConfig.add_iva_usd) {
      // Desintegrar el monto total para obtener la base imponible
      const totalRate =
        1 + ispConfig.igtf_rate / 100 + ispConfig.iva_rate / 100;
      baseAmount = amount / totalRate;
      igtfAmount = (baseAmount * ispConfig.igtf_rate) / 100;
      ivaAmount = (baseAmount * ispConfig.iva_rate) / 100;
    } else if (!ispConfig.add_igtf && ispConfig.add_iva_usd) {
      // Desintegrar solo el IGTF
      const igtfRate = 1 + ispConfig.igtf_rate / 100;
      baseAmount = amount / igtfRate;
      igtfAmount = (baseAmount * ispConfig.igtf_rate) / 100;
      ivaAmount = (baseAmount * ispConfig.iva_rate) / 100;
    } else if (ispConfig.add_igtf && !ispConfig.add_iva_usd) {
      // Desintegrar solo el IVA
      const ivaRate = 1 + ispConfig.iva_rate / 100;
      baseAmount = amount / ivaRate;
      ivaAmount = (baseAmount * ispConfig.iva_rate) / 100;
      igtfAmount = (amount * ispConfig.igtf_rate) / 100;
    } else {
      // Ambos impuestos se suman al monto base
      igtfAmount = (amount * ispConfig.igtf_rate) / 100;
      ivaAmount = (amount * ispConfig.iva_rate) / 100;
    }

    return {
      amount: baseAmount + igtfAmount + ivaAmount,
      details: {
        baseAmount,
        igtfAmount,
        ivaAmount,
      },
      includesIGTF: ispConfig.add_igtf,
      includesIVA: ispConfig.add_iva_usd,
      allowPartialPayment: ispConfig.allow_partial_payment,
    };
  }

  /** calculateVESPayment */
  private calculateVESPayment(amountUSD: number, ispConfig: any, rate: number) {
    const amountVES = amountUSD * rate;
    let baseAmount = amountVES;
    let ivaAmount = 0;

    if (!ispConfig.add_iva_ves) {
      // Desintegrar el IVA del monto total
      const ivaRate = 1 + ispConfig.iva_rate / 100;

      baseAmount = amountVES / ivaRate;
      ivaAmount = (baseAmount * ispConfig.iva_rate) / 100;
    } else {
      // El IVA se suma al monto base
      ivaAmount = (amountVES * ispConfig.iva_rate) / 100;
    }

    return {
      amount: baseAmount + ivaAmount,
      details: {
        baseAmount,
        ivaAmount,
      },
      includesIGTF: false,
      includesIVA: ispConfig.add_iva_ves,
      allowPartialPayment: ispConfig.allow_partial_payment,
    };
  }

  /** applySystemCommission */
  private applySystemCommission(result: any, currency: string, rate: number) {
    const systemCommission = 0.5;
    const commissionInCurrency =
      currency === 'USD' ? systemCommission : systemCommission * rate;

    return {
      ...result,
      amount: result.amount + commissionInCurrency,
      details: {
        ...result.details,
        systemCommission: commissionInCurrency,
      },
    };
  }

  /** roundAllNumbers */
  private roundAllNumbers(obj: any): any {
    if (typeof obj !== 'object') return obj;

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === 'number'
          ? Number(value.toFixed(2))
          : this.roundAllNumbers(value),
      ]),
    );
  }

  /** getClientAvailableBalance */
  private async getClientAvailableBalance(userId: number): Promise<number> {
    const activeBalances = await this.prisma.client_balance.findMany({
      where: {
        client_profile: {
          user_id: userId,
        },
        status: {
          in: [balance_status.AVAILABLE, balance_status.PARTIALLY_USED],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Sumar todos los current_amount de los balances activos
    const totalAvailableBalance = activeBalances.reduce(
      (sum, balance) => sum + balance.current_amount,
      0,
    );

    return Number(totalAvailableBalance.toFixed(2));
  }

  /** applyAvailableBalance */
  private applyAvailableBalance(
    finalAmount: number,
    availableBalance: number,
    currency: string,
    rate: number,
  ): number {
    if (availableBalance <= 0) {
      return finalAmount;
    }

    // Convertir el saldo disponible a la moneda del monto final si es necesario
    const adjustedBalance =
      currency !== 'USD' ? availableBalance * rate : availableBalance;

    // Si el saldo disponible cubre todo el monto
    if (adjustedBalance >= finalAmount) {
      return 0;
    }

    // Si el saldo cubre parcialmente
    return Number((finalAmount - adjustedBalance).toFixed(2));
  }
}
