import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateNetworkManagerDto } from './dto/create-network-manager.dto';
import { UpdateNetworkManagerDto } from './dto/update-network-manager.dto';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class NetworkManagerService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async create(createNetworkManagerDto: CreateNetworkManagerDto) {
    try {
      const encryptedApiUrl = this.encryptionService.encrypt(
        createNetworkManagerDto.api_url,
      );
      const encryptedApiKey = this.encryptionService.encrypt(
        createNetworkManagerDto.api_key,
      );
      const encryptedApiSecret = this.encryptionService.encrypt(
        createNetworkManagerDto.api_secret,
      );

      const createObject = {
        ...createNetworkManagerDto,
        ...(encryptedApiUrl && { api_url: encryptedApiUrl }),
        ...(encryptedApiKey && { api_key: encryptedApiKey }),
        ...(encryptedApiSecret && { api_secret: encryptedApiSecret }),
      };

      return await this.prisma.network_manager.create({
        data: createObject,
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al crear el gestor de red',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async findAll() {
    try {
      return await this.prisma.network_manager.findMany({
        include: {
          isp: true,
        },
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al obtener los gestores de red',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async findOne(id: number) {
    try {
      const networkManager = await this.prisma.network_manager.findUnique({
        where: { id },
        include: {
          isp: true,
        },
      });

      if (!networkManager) {
        throw new CustomException({
          message: 'Gestor de red no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      let api_key: string | undefined;
      let api_secret: string | undefined;

      if (networkManager.api_key) {
        api_key = this.encryptionService.decrypt(networkManager.api_key);
      }
      if (networkManager.api_secret) {
        api_secret = this.encryptionService.decrypt(networkManager.api_secret);
      }

      return { ...networkManager, api_key, api_secret };
    } catch (error) {
      if (error instanceof CustomException) throw error;

      throw new CustomException({
        message: 'Error al obtener el gestor de red',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async update(id: number, updateNetworkManagerDto: UpdateNetworkManagerDto) {
    try {
      let encryptedApiKey: string | undefined;
      let encryptedApiSecret: string | undefined;

      if (updateNetworkManagerDto.api_key) {
        encryptedApiKey = this.encryptionService.encrypt(
          updateNetworkManagerDto.api_key,
        );
      }

      if (updateNetworkManagerDto.api_secret) {
        encryptedApiSecret = this.encryptionService.encrypt(
          updateNetworkManagerDto.api_secret,
        );
      }

      const updateObject = {
        ...updateNetworkManagerDto,

        ...(encryptedApiKey && { api_key: encryptedApiKey }),
        ...(encryptedApiSecret && { api_secret: encryptedApiSecret }),
      };

      return await this.prisma.network_manager.update({
        where: { id },
        data: updateObject,
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al actualizar el gestor de red',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.network_manager.delete({
        where: { id },
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al eliminar el gestor de red',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
