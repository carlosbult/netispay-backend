import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { BANK_PRODUCTS_BY_BANK } from '../constants/bank-products.constant';
import { bank_product, bank_products_name } from '@prisma/client';
import { BankProduct } from '../interfaces/bank-product.interface';

@Injectable()
export class BankProductInitializationService {
  private readonly logger = new Logger(BankProductInitializationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Inicializa los productos bancarios que no existan en el sistema
   */
  async initialize(): Promise<void> {
    try {
      this.logger.log('Iniciando verificación de productos bancarios...');

      // Procesar banco por banco
      for (const [bankCode, bankData] of Object.entries(
        BANK_PRODUCTS_BY_BANK,
      )) {
        await this.initializeBankProducts(bankCode, bankData);
      }

      this.logger.log('Inicialización de productos bancarios completada');
    } catch (error) {
      this.logger.error(
        'Error durante la inicialización de productos bancarios',
        error,
      );
      throw error;
    }
  }

  private async initializeBankProducts(
    bankCode: string,
    bankData: { bankName: string; products: BankProduct[] },
  ): Promise<void> {
    try {
      this.logger.log(
        `Verificando productos para ${bankData.bankName} (${bankCode})...`,
      );

      const existingProducts = await this.prisma.bank_product.findMany({
        where: { banks: { code: bankCode } },
        select: { name: true },
      });

      const existingProductNames = new Set(existingProducts.map((p) => p.name));
      const productsToCreate = bankData.products.filter(
        (product) => !existingProductNames.has(product.name),
      );

      if (productsToCreate.length === 0) {
        this.logger.verbose(
          `No hay nuevos productos para ${bankData.bankName}`,
        );
        return;
      }

      this.logger.log(
        `Creando ${productsToCreate.length} productos para ${bankData.bankName}...`,
      );
      await Promise.all(
        productsToCreate.map((product) => this.createBankProduct(product)),
      );
    } catch (error) {
      this.logger.error(
        `Error procesando productos de ${bankData.bankName}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crea un nuevo producto bancario
   */
  private async createBankProduct(product: BankProduct): Promise<void> {
    try {
      await this.prisma.bank_product.create({
        data: {
          name: product.name,
          banks: {
            connect: {
              code: product.bank_code,
            },
          },
          api_url: this.encryptionService.encrypt(product.api_url),
          api_key: this.encryptionService.encrypt(product.api_key),
          api_secret: this.encryptionService.encrypt(product.api_secret),
          payment_category: product.payment_category,
          is_active: true,
          configurations: product.configurations,
          bank_product_specific_config: {
            create: product.properties.map((property) => ({
              property_key: property.property_key,
              property_value: property.property_value,
              title: property.title,
              description: property.description,
            })),
          },
        },
      });

      this.logger.verbose(
        `Producto bancario creado: ${product.name} para banco ${product.bank_code}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al crear producto bancario ${product.name} para banco ${product.bank_code}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtiene un producto bancario específico
   */
  async getBankProduct(
    name: bank_products_name,
    bankCode: string,
  ): Promise<bank_product | null> {
    try {
      return await this.prisma.bank_product.findFirst({
        where: {
          name,
          banks: {
            code: bankCode,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Error al buscar producto bancario ${name} para banco ${bankCode}`,
        error,
      );
      return null;
    }
  }
}
