import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { balance_status, payment_type } from '@prisma/client';
import {
  AutomaticBalanceRegistrationDto,
  BalanceRegistrationResult,
  // BalanceMovementDto,
} from './balance.interface';

@Injectable()
export class AutomaticBalanceRegistrationService {
  constructor(private prisma: PrismaService) {}

  /** registerAutomaticBalance
   * Registra un saldo automático
   * @param data - Datos del saldo automático
   * @returns - Resultado del saldo automático
   */
  async registerAutomaticBalance(
    data: AutomaticBalanceRegistrationDto,
  ): Promise<BalanceRegistrationResult> {
    const {
      clientProfileId,
      transactionId,
      receivedAmountUsd,
      expectedAmountUsd,
    } = data;

    try {
      // Verificar si el monto recibido es menor al esperado
      if (receivedAmountUsd >= expectedAmountUsd) {
        return {
          isRegistered: false,
          remainingAmountUsd: 0,
          message: 'El monto recibido es igual o mayor al esperado',
        };
      }

      // Calcular el monto restante en USD
      const remainingAmountUsd = Number(
        (expectedAmountUsd - receivedAmountUsd).toFixed(2),
      );

      // Registrar el saldo a favor
      const clientBalance = await this.prisma.client_balance.create({
        data: {
          transaction_id: transactionId,
          client_profile_id: clientProfileId,
          initial_amount: receivedAmountUsd,
          current_amount: receivedAmountUsd,
          status: balance_status.AVAILABLE,
        },
      });

      return {
        isRegistered: true,
        balanceId: clientBalance.id,
        remainingAmountUsd,
        message: `Pago parcial registrado. Monto faltante: ${remainingAmountUsd} USD`,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al registrar el saldo automático',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /** applyBalanceToPayment
   * Aplica un saldo a un pago
   * @param data - Datos del saldo a aplicar
   * @returns - Resultado de la aplicación del saldo
   */
  async applyBalanceToPayment(data: {
    clientProfileId: number;
    balanceApplied: number;
    invoiceId: string;
    networkManager: string;
    invoiceData: any;
  }): Promise<{
    balancePayments: Array<{
      balanceId: number;
      amountUsed: number;
      remainingBalance: number;
    }>;
  }> {
    try {
      let remainingAmountToApply = data.balanceApplied;
      const balancePayments = [];

      // Obtener todos los saldos activos ordenados por fecha de creación
      const activeBalances = await this.prisma.client_balance.findMany({
        where: {
          client_profile_id: data.clientProfileId,
          status: {
            in: [balance_status.AVAILABLE, balance_status.PARTIALLY_USED],
          },
        },
        orderBy: {
          created_at: 'asc', // Procesar primero los más antiguos
        },
        include: {
          transaction: true,
        },
      });

      if (activeBalances.length === 0) {
        throw new CustomException({
          message: 'No hay saldos disponibles',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.NO_AVAILABLE_BALANCE,
        });
      }

      await this.prisma.$transaction(async (prisma) => {
        for (const balance of activeBalances) {
          if (remainingAmountToApply <= 0) break;

          // Calcular cuánto podemos usar de este saldo específico
          const amountToUseFromBalance = Math.min(
            balance.current_amount,
            remainingAmountToApply,
          );

          // Crear registro de pago de factura para esta porción del saldo
          const invoicePayment = await prisma.invoice_payments.create({
            data: {
              invoice_id: data.invoiceId,
              transaction_id: balance.transaction_id,
              // client_profile_id: data.clientProfileId,
              network_manager: data.networkManager,
              payment_type: payment_type.BALANCE,
              amount: amountToUseFromBalance,
              invoice_data: {
                ...data.invoiceData,
                balance_payment: {
                  balance_id: balance.id,
                  amount_used: amountToUseFromBalance,
                  original_balance: balance.current_amount,
                },
              },
            },
          });

          // Registrar el movimiento del balance
          await prisma.balance_movement.create({
            data: {
              client_balance_id: balance.id,
              invoice_payment_id: invoicePayment.id,
              amount_used: amountToUseFromBalance,
              remaining_balance: Number(
                (balance.current_amount - amountToUseFromBalance).toFixed(2),
              ),
            },
          });

          // Actualizar el estado del balance
          const newRemainingBalance = Number(
            (balance.current_amount - amountToUseFromBalance).toFixed(2),
          );

          await prisma.client_balance.update({
            where: { id: balance.id },
            data: {
              current_amount: newRemainingBalance,
              status:
                newRemainingBalance === 0
                  ? balance_status.DEPLETED
                  : balance_status.PARTIALLY_USED,
            },
          });

          // Registrar el uso de este saldo
          balancePayments.push({
            balanceId: balance.id,
            amountUsed: amountToUseFromBalance,
            remainingBalance: newRemainingBalance,
          });

          remainingAmountToApply = Number(
            (remainingAmountToApply - amountToUseFromBalance).toFixed(2),
          );
        }

        if (remainingAmountToApply > 0) {
          throw new CustomException({
            message: `Saldo insuficiente para completar la operación. Falta: ${remainingAmountToApply}`,
            statusCode: HttpStatus.BAD_REQUEST,
            errorCode: ErrorCode.INSUFFICIENT_BALANCE,
          });
        }
      });

      return { balancePayments };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al aplicar el saldo al pago',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BALANCE_APPLICATION_ERROR,
        details: error,
      });
    }
  }

  /** verifyAvailableBalance
   * Verifica si el cliente tiene saldo suficiente y retorna los balances a utilizar
   * @param clientProfileId - ID del cliente
   * @param amountNeeded - Monto necesario
   * @returns - Resultado de la verificación
   */
  async verifyAvailableBalance(
    clientProfileId: number,
    amountNeeded: number,
  ): Promise<{
    isAvailable: boolean;
    availableAmount: number;
    balancesToUse?: Array<{
      balanceId: number;
      currentAmount: number;
      amountToUse: number;
    }>;
  }> {
    const activeBalances = await this.prisma.client_balance.findMany({
      where: {
        client_profile_id: clientProfileId,
        status: {
          in: [balance_status.AVAILABLE, balance_status.PARTIALLY_USED],
        },
      },
      orderBy: {
        created_at: 'asc', // Ordenar por antigüedad
      },
    });

    let remainingAmount = amountNeeded;
    let totalAvailable = 0;
    const balancesToUse = [];

    for (const balance of activeBalances) {
      totalAvailable += balance.current_amount;

      if (remainingAmount > 0) {
        const amountToUse = Math.min(balance.current_amount, remainingAmount);
        balancesToUse.push({
          balanceId: balance.id,
          currentAmount: balance.current_amount,
          amountToUse,
        });
        remainingAmount = Number((remainingAmount - amountToUse).toFixed(2));
      }
    }

    return {
      isAvailable: totalAvailable >= amountNeeded,
      availableAmount: totalAvailable,
      balancesToUse: balancesToUse.length > 0 ? balancesToUse : undefined,
    };
  }
}
