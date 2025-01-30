import { HttpStatus, Injectable } from '@nestjs/common';
import { NetworkManager } from './interfaces/network-manager.interface';
import { MikrowispFactoryService } from './mikrowisp/mikrowisp-factory.service';
import { WisphubFactoryService } from './wisphub/wisphub-factory.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class NetworkManagerFactoryService {
  constructor(
    private readonly mikrowispFactory: MikrowispFactoryService,
    private readonly wisphubFactory: WisphubFactoryService,
  ) {}

  createNetworkManager(type: string): NetworkManager {
    switch (type) {
      case 'WISPHUB':
        return this.wisphubFactory.createNetworkManager(type);
      case 'MIKROWISP':
        return this.mikrowispFactory.createNetworkManager(type);
      default:
        throw new CustomException({
          message: 'Network Manager not registered',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NETWORK_MANAGER_NOT_REGISTERED,
        });
    }
  }
}
