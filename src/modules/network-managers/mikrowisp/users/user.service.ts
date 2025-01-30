import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { MikrowispAdapter } from '../mikrowisp.adapter';
import { CreateUserDto } from './dto/create-user.dto';
import { GetClientDetailsDto } from './dto/get-client-details.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveServiceDto } from './dto/active-service.dto';
import { SuspendServiceDto } from './dto/suspend-service.dto';
import { NewPreRegistroDto } from './dto/new-preregister.dto';
import { ListInstallDto } from './dto/list-install.dto';
import { MikrowispUser } from '../../interfaces/mikrowisp-user.interface';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class UserService implements MikrowispUser {
  constructor(
    @Inject('MikrowispAdapter') private readonly adapter: MikrowispAdapter,
  ) {}
  async createUser(data: CreateUserDto) {
    return this.adapter.post('/NewUser', data);
  }

  async getClientDetails(data: GetClientDetailsDto) {
    try {
      const response = await this.adapter.post('/GetClientsDetails', data);

      if (response.estado === 'error') {
        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }
      const userData = response.datos[0];

      if (userData.estado === 'RETIRADO') {
        throw new CustomException({
          message:
            'The service of the client has been removed from the system.',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      const dataToResponse = {
        name: userData.nombre,
        status: userData.estado,
        address: userData.direccion_principal,
        dni: userData.cedula,
        email: userData.correo,
        phone: userData.telefono,
        services: userData.servicios,
      };

      return dataToResponse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getClientDetails Mikrowisp',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async updateUser(data: UpdateUserDto) {
    try {
      const response = await this.adapter.post('/UpdateUser', data);

      if (response.estado === 'error') {
        throw new CustomException({
          message: response.mensaje,
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      return response;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error in updateUser (user.service.ts)',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async activateService(data: ActiveServiceDto) {
    return this.adapter.post('/ActiveService', data);
  }

  async suspendService(data: SuspendServiceDto) {
    return this.adapter.post('/SuspendService', data);
  }

  async newPreRegistro(data: NewPreRegistroDto) {
    return this.adapter.post('/NewPreRegistro', data);
  }

  async listInstall(data: ListInstallDto) {
    return this.adapter.post('/ListInstall', data);
  }
}
