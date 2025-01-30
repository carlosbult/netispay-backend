import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { PrismaService } from 'prisma/prisma.service';
import { NetworkManagerFactoryService } from 'src/modules/network-managers/network-manager-factory.service';
import { balance_status } from '@prisma/client';

@Injectable()
export class UserQueryService {
  constructor(
    private prisma: PrismaService,
    private readonly networkManagerFactory: NetworkManagerFactoryService,
  ) {}

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          is_authenticated: true,
          last_login: true,
          is_active: true,
          is_deleted: true,
          client_profile: {
            include: {
              client_balance: {
                where: {
                  status: {
                    in: [
                      balance_status.AVAILABLE,
                      balance_status.PARTIALLY_USED,
                    ],
                  },
                },
                select: {
                  id: true,
                  initial_amount: true,
                  current_amount: true,
                  status: true,
                  created_at: true,
                  updated_at: true,
                },
              },
              configuration: true,
              isp: {
                select: {
                  network_manager: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new CustomException({
          message: 'Usuario no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.USER_NOT_FOUND,
        });
      }

      return { ...user };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'There was an error getting the user by id',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }
  }

  async getAllUsers(filters: {
    id?: number;
    name?: string;
    dni?: number;
    city?: string;
    role?: string;
    page: number;
    pageSize: number;
  }) {
    const { id, name, dni, city, role, page, pageSize } = filters;
    const where: any = {};

    if (id) where.id = id;
    if (name) where.profile = { name: { contains: name, mode: 'insensitive' } };
    if (dni) where.profile = { dni: dni };
    if (city) where.profile = { city: { contains: city, mode: 'insensitive' } };
    if (role) where.role = role;

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        is_active: true,
        role: true,
        created_at: true,
        // profile: {
        //   select: {
        //     name: true,
        //     lastName: true,
        //     dni: true,
        //     city: true,
        //   },
        // },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalUsers = await this.prisma.user.count({ where });

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    };
  }
}
