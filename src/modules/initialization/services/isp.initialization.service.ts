import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';

@Injectable()
export class IspInitializationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async initialize(): Promise<void> {
    const ispCount = await this.prisma.isp.count();
    console.log('ispCount', ispCount);
    if (ispCount > 0) {
      return;
    }

    const mikrowisp = await this.prisma.network_manager.findUnique({
      where: { name: 'MIKROWISP' },
    });

    if (!mikrowisp) {
      return;
    }

    const isp = await this.prisma.isp.create({
      data: {
        name: 'MikroWISP DEMO',
        email: 'contact@mikrowisp-isp.com',
        rif: 'J-12345678-9',
        network_manager_id: mikrowisp.id,
        is_active: true,
      },
    });

    await this.prisma.isp_configuration.create({
      data: {
        isp_id: isp.id,
        igtf_rate: 3,
        iva_rate: 16,
        add_iva_ves: true,
        add_iva_usd: false,
        add_igtf: true,
        commission_type: 'ISP_ASSUMES',
        instance_subdomain: 'demo.mikrosystem.net',
        instance_ip: '123.45.67.89',
        instance_token: this.encryptionService.encrypt(
          'mikrowisp_instance_token_123',
        ),
        admin_software_token: this.encryptionService.encrypt(
          'admin_software_token_456',
        ),
        is_active: true,
      },
    });

    const wisphub = await this.prisma.network_manager.findUnique({
      where: { name: 'WISPHUB' },
    });

    if (wisphub) {
      await this.prisma.isp.create({
        data: {
          name: 'WISPHUB DEMO',
          email: 'contact@wisphub-isp.com',
          rif: 'J-12345378-9',
          network_manager_id: wisphub.id,
          is_active: false,
        },
      });
    }
  }
}
