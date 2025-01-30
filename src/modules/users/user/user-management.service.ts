import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { NetworkManagerFactoryService } from 'src/modules/network-managers/network-manager-factory.service';

@Injectable()
export class UserManagementService {
  constructor(
    private prisma: PrismaService,
    private networkManagerFactory: NetworkManagerFactoryService,
  ) {}

  async updateUser(
    id: number,
    updateData: {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
      address?: string;
    },
  ): Promise<{ message: string }> {
    try {
      // Buscar usuario con su perfil de cliente
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          client_profile: {
            include: {
              isp: {
                include: {
                  network_manager: true,
                },
              },
            },
          },
        },
      });
      const networkManagerName =
        user?.client_profile?.isp?.network_manager.name;

      if (!user) {
        throw new CustomException({
          message: 'Usuario no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.USER_NOT_FOUND,
        });
      }

      // Validar email único si se está actualizando
      if (updateData.email) {
        const existingEmail = await this.prisma.user.findUnique({
          where: { email: updateData.email },
        });
        if (existingEmail && existingEmail.id !== id) {
          throw new CustomException({
            message: 'El email ya está en uso',
            statusCode: HttpStatus.CONFLICT,
            errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
          });
        }
      }

      // Si el usuario tiene un perfil de cliente y un administrador de red asignado
      if (user.client_profile?.network_manager_user_id) {
        const networkManager =
          this.networkManagerFactory.createNetworkManager(networkManagerName);

        // Actualizar en el administrador de red
        await networkManager.updateUser({
          userId: user.client_profile?.network_manager_user_id,
          email: updateData.email,
          password: updateData.password,
          name: updateData.name,
          phone: updateData.phone,
          address: updateData.address,
        });
      }

      // Actualizar usuario en nuestra base de datos
      await this.prisma.user.update({
        where: { id },
        data: {
          email: updateData.email,
          password: updateData.password,
          updated_at: new Date(),
          client_profile: user.client_profile
            ? {
                update: {
                  name: updateData.name,
                  phone: updateData.phone,
                  address: updateData.address,
                },
              }
            : undefined,
        },
      });

      return { message: 'Usuario actualizado exitosamente' };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error al actualizar el usuario',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.USER_UPDATE_ERROR,
      });
    }
  }

  async softUserDelete(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  async hardUserDelete(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new CustomException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }
    await this.prisma.user.delete({ where: { id } });
  }
}
