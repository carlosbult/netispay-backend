import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBankProductDto } from '../dto/create-bank-product.dto';
import { UpdateBankProductDto } from '../dto/update-bank-product.dto';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class ManageBankProductService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  // Obetner todos los bancos registrados en la tabla bank
  async getBanks() {
    const banks = await this.prisma.banks.findMany();
    return banks;
  }

  // Crear un nuevo producto bancario
  async create(createBankProductDto: CreateBankProductDto) {
    try {
      const { configurations, properties, ...productData } =
        createBankProductDto;

      const encryptedApiUrl = this.encryptionService.encrypt(
        productData.api_url,
      );
      const encryptedApiKey = this.encryptionService.encrypt(
        productData.api_key,
      );
      const encryptedApiSecret = this.encryptionService.encrypt(
        productData.api_secret,
      );

      const createObject = {
        ...productData,
        ...(encryptedApiUrl && { api_url: encryptedApiUrl }),
        ...(encryptedApiKey && { api_key: encryptedApiKey }),
        ...(encryptedApiSecret && { api_secret: encryptedApiSecret }),
      };

      const createdProduct = await this.prisma.bank_product.create({
        data: {
          ...createObject,
          configurations: {
            create: configurations,
          },
          bank_product_specific_config: {
            create: properties,
          },
        },
        include: {
          configurations: true,
          bank_product_specific_config: true,
          banks: true,
        },
      });

      return {
        success: true,
        message: 'Nuevo producto bancario creado exitosamente',
        product: createdProduct,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in create product',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  // Actualizar un producto bancario
  async update(id: number, updateBankProductDto: UpdateBankProductDto) {
    try {
      const { configurations, properties, ...productData } =
        updateBankProductDto;

      if (configurations) {
        // Obtener configuraciones existentes
        const existingConfigs =
          await this.prisma.bank_product_configuration.findMany({
            where: { bank_product_id: id },
          });

        for (const config of configurations) {
          const existingConfig = existingConfigs.find(
            (ec) => ec.currency === config.currency,
          );

          if (existingConfig) {
            await this.prisma.bank_product_configuration.update({
              where: { id: existingConfig.id },
              data: config,
            });
          } else {
            await this.prisma.bank_product_configuration.create({
              data: {
                ...config,
                bank_product_id: id,
              },
            });
          }
        }
      }

      if (properties) {
        const existingProperties =
          await this.prisma.bank_product_properties.findMany({
            where: { bank_product_id: id },
          });

        for (const property of properties) {
          const existingProperty = existingProperties.find(
            (ep) => ep.property_key === property.property_key,
          );

          if (existingProperty) {
            await this.prisma.bank_product_properties.update({
              where: { id: existingProperty.id },
              data: property,
            });
          } else {
            await this.prisma.bank_product_properties.create({
              data: {
                ...property,
                bank_product_id: id,
              },
            });
          }
        }
      }

      // Encriptar los datos
      let encryptedApiUrl: string | undefined;
      let encryptedApiKey: string | undefined;
      let encryptedApiSecret: string | undefined;

      if (productData.api_url) {
        // https://api.binance.com/api/v1
        encryptedApiUrl = this.encryptionService.encrypt(productData.api_url);
      }

      if (productData.api_key) {
        encryptedApiKey = this.encryptionService.encrypt(productData.api_key);
      }

      if (productData.api_secret) {
        encryptedApiSecret = this.encryptionService.encrypt(
          productData.api_secret,
        );
      }

      const updateObject = {
        ...productData,
        ...(encryptedApiUrl && { api_url: encryptedApiUrl }),
        ...(encryptedApiKey && { api_key: encryptedApiKey }),
        ...(encryptedApiSecret && { api_secret: encryptedApiSecret }),
      };

      const updatedProduct = await this.prisma.bank_product.update({
        where: { id },
        data: updateObject,
        include: {
          configurations: true,
          bank_product_specific_config: true,
          banks: true,
        },
      });

      const api_url = this.encryptionService.decrypt(updatedProduct.api_url);
      const api_key = this.encryptionService.decrypt(updatedProduct.api_key);

      return {
        success: true,
        message: 'Producto bancario actualizado exitosamente',
        updatedProduct: {
          ...updatedProduct,
          api_url: api_url,
          api_key: api_key,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in update product',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  // Obtener todos los productos bancarios
  async findAll(status?: 'active' | 'inactive' | 'all') {
    const where = status === 'all' ? {} : { is_active: status === 'active' };

    try {
      const products = await this.prisma.bank_product.findMany({
        where,
        select: {
          id: true,
          bank_id: true,
          name: true,
          is_active: true,
          payment_category: true,
          api_url: true,
          api_key: true,
          label: true,
          bank_product_specific_config: {
            select: {
              id: true,
              property_key: true,
              property_value: true,
              title: true,
              description: true,
            },
          },
          configurations: {
            select: {
              id: true,
              bank_product_id: true,
              description: true,
              bank_commission_rate: true,
              bank_operation_rate: true,
              currency: true,
            },
          },
          banks: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          payment_category: 'asc',
        },
      });

      // Agrupar productos por categoría
      const groupedProducts = products.reduce(
        (acc, product) => {
          const category = product.payment_category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(product);
          return acc;
        },
        {} as Record<string, typeof products>,
      );

      return {
        totalProducts: products.length,
        products: groupedProducts,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in findAll product',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  // Obtener un producto bancario por su ID
  async findOne(id: number) {
    try {
      const product = await this.prisma.bank_product.findUnique({
        where: { id },
        include: {
          bank_product_specific_config: true,
          configurations: true,
          banks: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Bank product with ID ${id} not found`);
      }

      const api_url = this.encryptionService.decrypt(product.api_url);
      const api_key = this.encryptionService.decrypt(product.api_key);

      return {
        product: {
          ...product,
          api_url: api_url,
          api_key: api_key,
        },
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in findOne product',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
