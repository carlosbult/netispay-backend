import { HttpStatus, Injectable } from '@nestjs/common';
import { bank_products_name, payment_type } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { NetworkManagerFactoryService } from 'src/modules/network-managers/network-manager-factory.service';
import { GetInvoicesDto } from '../dto/get-invoices.dto';
import { BankProductFactoryService } from 'src/modules/bank-connectors/bank-product-factory.service';
import { AutomaticBalanceRegistrationService } from './automatic-balance-registration.service';
import { processPayment } from 'src/modules/bank-connectors/interfaces/bank-product.interface';

@Injectable()
export class UserInvoicesService {
  constructor(
    private prisma: PrismaService,
    private readonly networkManagerFactory: NetworkManagerFactoryService,
    private readonly bankProductFactory: BankProductFactoryService,
    private readonly automaticBalanceRegistrationService: AutomaticBalanceRegistrationService,
  ) {}

  /**
   * Obtiene las facturas de un usuario
   * @param filters - Filtros para obtener las facturas
   * @returns - Facturas del usuario
   */
  async getInvoices(filters: GetInvoicesDto) {
    console.log('filters de getInvoices: ', filters);
    const { id, status, limit } = filters;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          client_profile: {
            include: {
              isp: {
                select: {
                  network_manager: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new CustomException({
          message: 'Usuario no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.USER_NOT_FOUND,
        });
      }

      const networkManager = this.networkManagerFactory.createNetworkManager(
        user.client_profile.isp.network_manager.name,
      );

      const invoices = await networkManager.getInvoices({
        userId: user.client_profile.network_manager_user_id,
        status,
        limit,
      });

      return { invoices };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoices',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /**
   * Obtiene las facturas por su id
   * @param filters - Filtros para obtener las facturas
   * @returns - Facturas
   */
  async getInvoiceById(filters: { invoiceIds: number[] }) {
    const { invoiceIds } = filters;
    try {
      const activeIsp = await this.prisma.isp.findFirst({
        where: { is_active: true },
        select: {
          network_manager: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!activeIsp.network_manager) {
        throw new CustomException({
          message: 'Network Manager configuration not found',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NO_ACTIVE_ISP,
        });
      }

      const networkManager = this.networkManagerFactory.createNetworkManager(
        activeIsp.network_manager.name,
      );

      const invoices = await Promise.all(
        invoiceIds.map((invoiceId) =>
          networkManager.getInvoiceById({ invoiceId }),
        ),
      );

      return { invoices };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in getInvoiceById',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /**
   * Procesa el pago de una factura
   * @param data - Datos del pago
   * @returns - Resultado del pago
   */
  async processPayment(data: {
    userId: number;
    bankCode: string;
    expectedAmount: number;
    allowPartialPayment: boolean;
    productType: bank_products_name;
    paymentData: processPayment;
    invoices: { id: string; amount: number }[];
    balanceApplied?: number;
  }): Promise<any> {
    const {
      userId,
      bankCode,
      expectedAmount,
      productType,
      paymentData,
      invoices,
      balanceApplied,
    } = data;

    try {
      // 1. Obtener información del usuario y validar
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          client_profile: {
            include: {
              isp: {
                select: {
                  network_manager: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new CustomException({
          message: 'Usuario no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.USER_NOT_FOUND,
        });
      }

      // 2. Procesar el pago con el banco
      const bankProduct = this.bankProductFactory.createProduct(
        bankCode,
        productType,
      );
      const paymentResult = await bankProduct.processPayment({
        ...paymentData,
        clientProfileId: userId,
      });

      if (!paymentResult.success) {
        return paymentResult;
      }

      const totalReceived = Number(
        (paymentResult.amount + (balanceApplied || 0)).toFixed(2),
      );

      // 3. Si el monto es menor al esperado, registrar el saldo automáticamente
      if (totalReceived < expectedAmount) {
        // Registrar el saldo automáticamente
        const balanceResult =
          await this.automaticBalanceRegistrationService.registerAutomaticBalance(
            {
              clientProfileId: user.client_profile.id,
              transactionId: paymentResult.transactionId,
              receivedAmountUsd:
                paymentResult.currency === 'USD'
                  ? paymentResult.amount
                  : paymentResult.amount / paymentData.exchangeRate,
              expectedAmountUsd:
                paymentResult.currency === 'USD'
                  ? expectedAmount
                  : expectedAmount / paymentData.exchangeRate,
            },
          );

        // Retornar respuesta indicando pago parcial y saldo registrado
        return {
          success: false,
          balanceRegistered: true,
          balanceDetails: {
            balanceId: balanceResult.balanceId,
            remainingAmountUsd: balanceResult.remainingAmountUsd,
            message: balanceResult.message,
          },
          paymentResult,
        };
      }

      // 4. Verificar si el saldo aplicado es suficiente
      if (balanceApplied) {
        const balanceVerification =
          await this.automaticBalanceRegistrationService.verifyAvailableBalance(
            user.client_profile.id,
            balanceApplied,
          );

        // Aqui deberia poder guardar el valor de la transaccion como balance

        if (!balanceVerification.isAvailable) {
          throw new CustomException({
            message: `Saldo insuficiente. Disponible: ${balanceVerification.availableAmount}`,
            statusCode: HttpStatus.BAD_REQUEST,
            errorCode: ErrorCode.INSUFFICIENT_BALANCE,
          });
        }
      }

      // 5. Si el monto es correcto, procesar el pago en el administrador de red
      const networkManager = this.networkManagerFactory.createNetworkManager(
        user.client_profile.isp.network_manager.name,
      );

      const networkManagerResponses = await Promise.all(
        // Verificar el monto que se le enviara al administrador de red
        invoices.map(async (invoice) => {
          const networkManagerResponse = await networkManager.processPayment({
            invoiceId: parseInt(invoice.id),
            paymentMethod: paymentResult.paymentMethod,
            amount: invoice.amount,
            transactionId: paymentResult.bankReference,
            bankCode: paymentResult.bankCode,
            clientProfileId: user.client_profile.id,
            allowPartialPayment: false,
          });

          // 6. Crear el registro de pago de factura
          if (balanceApplied) {
            await this.automaticBalanceRegistrationService.applyBalanceToPayment(
              {
                clientProfileId: user.client_profile.id,
                balanceApplied:
                  paymentResult.currency === 'USD'
                    ? balanceApplied
                    : balanceApplied / paymentData.exchangeRate,
                invoiceId: invoice.id,
                networkManager: user.client_profile.isp.network_manager.name,
                invoiceData: networkManagerResponse.updatedInvoiceData,
              },
            );
          }

          await this.prisma.invoice_payments.create({
            data: {
              transaction_id: paymentResult.transactionId,
              invoice_id: invoice.id,
              // client_profile_id: user.client_profile.id,
              payment_type: payment_type.BANK_TRANSACTION,
              amount: paymentResult.amount,
              network_manager: user.client_profile.isp.network_manager.name,
              invoice_data: networkManagerResponse.updatedInvoiceData,
            },
          });

          return networkManagerResponse;
        }),
      );

      return {
        success: true,
        paymentResult: {
          ...paymentResult,
          status: 'COMPLETED',
        },
        networkManagerResponse: {
          invoices: networkManagerResponses,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in processPayment',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /**
   * Elimina una transacción
   * @param transactionId - ID de la transacción
   * @returns - Resultado de la eliminación
   */
  async deleteTransaction(transactionId: string): Promise<any> {
    try {
      // 1. Buscar la transacción para obtener el ISP y network manager
      const transaction = await this.prisma.transactions.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
          invoice_payments: true,
        },
      });

      if (!transaction || transaction.invoice_payments.length === 0) {
        throw new CustomException({
          message: 'Transacción no encontrada o sin pagos asociados',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      const networkManagerName =
        transaction.invoice_payments[0].network_manager;

      // 2. Crear instancia del network manager correspondiente
      const networkManager =
        this.networkManagerFactory.createNetworkManager(networkManagerName);

      console.dir(transaction, { depth: null });

      // 3. Ejecutar la eliminación de la transacción
      const result = await networkManager.deleteTransaction({
        transactionId: transactionId,
        invoice_payments: transaction.invoice_payments,
      });

      // 3. Eliminar registros en nuestra base de datos
      await this.prisma.$transaction([
        // Eliminar los pagos de facturas
        this.prisma.invoice_payments.deleteMany({
          where: {
            transaction_id: transaction.id,
          },
        }),
        // Eliminar la transacción
        this.prisma.transactions.delete({
          where: {
            id: transaction.id,
          },
        }),
      ]);

      return {
        success: true,
        message: 'Transacción eliminada exitosamente',
        details: result,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al eliminar la transacción',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /**
   * Obtiene las transacciones
   * @param filters - Filtros para obtener las transacciones
   * @returns - Transacciones
   */
  async getTransactions(filters: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { limit = 10, offset = 0, startDate, endDate } = filters;
    try {
      const whereClause: any = {};

      // Agregar filtros de fecha si se proporcionan
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at.gte = startDate;
        if (endDate) whereClause.created_at.lte = endDate;
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transactions.findMany({
          where: whereClause,
          include: {
            dolar_rate: true,
            bank_product: {
              select: {
                name: true,
                banks: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            invoice_payments: true,
            client_balance: true,
            client_profile: true,
            admin_profile: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        this.prisma.transactions.count({
          where: whereClause,
        }),
      ]);

      return {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + transactions.length < total,
        },
      };
    } catch (error) {
      throw new CustomException({
        message: 'Error al obtener las transacciones',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
