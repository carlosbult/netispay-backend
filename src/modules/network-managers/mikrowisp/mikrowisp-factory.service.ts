import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { NetworkManagerFactory } from '../interfaces/network-manager-factory.interface';
import { NetworkManager } from '../interfaces/network-manager.interface';
import { MikrowispService } from './mikrowisp.service';
import { InvoiceService } from './invoices/invoice.service';
import { UserService } from './users/user.service';
import { BankProductFactoryService } from '../../bank-connectors/bank-product-factory.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

@Injectable()
export class MikrowispFactoryService implements NetworkManagerFactory {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
    private readonly bankProductFactory: BankProductFactoryService,
    private readonly prisma: PrismaService,
  ) {}

  createNetworkManager(type: string): NetworkManager {
    if (type === 'MIKROWISP') {
      return new MikrowispService(
        this.invoiceService,
        this.userService,
        this.prisma,
      );
    }

    throw new CustomException({
      message: 'Network Manager not supported',
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.NETWORK_MANAGER_NOT_SUPPORTED,
    });
  }
}
