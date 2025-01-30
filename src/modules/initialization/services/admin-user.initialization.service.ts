import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';
import { hashPassword } from 'src/common/utils/hashPassword';

@Injectable()
export class AdminUserInitializationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async initialize(): Promise<void> {
    const adminCount = await this.prisma.user.count({
      where: {
        role: 'ADMIN',
      },
    });

    if (adminCount > 0) {
      return;
    }

    // Crear usuario administrador
    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@admin.com',
        password: await hashPassword('admin1234'),
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Crear perfil de administrador
    await this.prisma.admin_profile.create({
      data: {
        user_id: admin.id,
        name: 'Administrador',
        phone: '+58 412-1234567',
        configuration: {
          create: {
            notification_preference: 'EMAIL',
            is_active: true,
          },
        },
      },
    });
  }
}
