import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { NETWORK_MANAGERS } from '../constants/network-managers.constant';

@Injectable()
export class NetworkManagerInitializationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async initialize(): Promise<void> {
    const managersCount = await this.prisma.network_manager.count();
    if (managersCount > 0) {
      return;
    }
    await Promise.all(
      NETWORK_MANAGERS.map((manager) =>
        this.prisma.network_manager.create({
          data: {
            name: manager.name,
            api_url: manager.api_url,
            api_key: manager.api_key
              ? this.encryptionService.encrypt(manager.api_key)
              : '',
            api_secret: manager.api_secret
              ? this.encryptionService.encrypt(manager.api_secret)
              : '',
          },
        }),
      ),
    );
  }
}
