import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateIspConfigurationDto } from './dto/create-isp-configuration.dto';
import { UpdateIspConfigurationDto } from './dto/update-isp-configuration.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class IspConfigurationService {
  constructor(private prisma: PrismaService) {}

  async create(createIspConfigurationDto: CreateIspConfigurationDto) {
    try {
      return await this.prisma.isp_configuration.create({
        data: createIspConfigurationDto,
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al crear la configuración del ISP',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async findAll() {
    try {
      return await this.prisma.isp_configuration.findMany({
        include: {
          isp: true,
        },
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al obtener las configuraciones',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async findOne(id: number) {
    try {
      const config = await this.prisma.isp_configuration.findUnique({
        where: { id },
        include: {
          isp: true,
        },
      });

      if (!config) {
        throw new CustomException({
          message: 'Configuración no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      return config;
    } catch (error) {
      if (error instanceof CustomException) throw error;

      throw new CustomException({
        message: 'Error al obtener la configuración',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        details: error,
      });
    }
  }

  async update(
    id: number,
    updateIspConfigurationDto: UpdateIspConfigurationDto,
  ) {
    try {
      return await this.prisma.isp_configuration.update({
        where: { id },
        data: updateIspConfigurationDto,
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al actualizar la configuración',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.isp_configuration.delete({
        where: { id },
      });
    } catch (error) {
      throw new CustomException({
        message: 'Error al eliminar la configuración',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }
}
