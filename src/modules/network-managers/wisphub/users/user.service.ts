import {
  Injectable,
  Inject,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { WisphubAdapter } from '../wisphub.adapter';
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
    @Inject('WisphubAdapter') private readonly adapter: WisphubAdapter,
  ) {}

  async createUser(data: CreateUserDto) {
    return this.adapter.post('/NewUser', data);
  }

  async getClientDetails(data: GetClientDetailsDto) {
    try {
      const clientEndpoint = data.idcliente
        ? `/clientes/${data.idcliente}`
        : '/clientes';
      const profileEndpoint = data.idcliente
        ? `/clientes/${data.idcliente}/perfil`
        : null;

      const [clientResponse, profileResponse] = await Promise.all([
        this.adapter.get(clientEndpoint),
        profileEndpoint ? this.adapter.get(profileEndpoint) : null,
      ]);

      if (clientResponse.estado === 'RETIRADO') {
        throw new CustomException({
          message:
            'The service of the client has been removed from the system.',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.BAD_REQUEST,
        });
      }

      const address =
        `${profileResponse.direccion || ''} ${profileResponse.localidad || ''}`.trim();
      const name =
        `${profileResponse.nombre || ''} ${profileResponse.apellidos || ''}`.trim();

      const dataToResponse = {
        name,
        status: clientResponse.estado,
        address,
        dni: profileResponse.cedula,
        email: profileResponse.email,
        phone: profileResponse.telefono,
        services: clientResponse ? clientResponse.plan_internet : null,
      };
      console.log('dataToResponse: ', dataToResponse);

      return dataToResponse;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getClientDetails WISPHUB',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  async updateUser(data: UpdateUserDto) {
    return this.adapter.post('/UpdateUser', data);
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
