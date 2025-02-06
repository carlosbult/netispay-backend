import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { roles_options } from '@prisma/client';
import { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { hashPassword } from 'src/common/utils/hashPassword';
// import { MailService } from 'src/common/utils/sendMail';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { NetworkManagerFactoryService } from 'src/modules/network-managers/network-manager-factory.service';
import { AdministrativeDto } from '../dto/administrative.dto';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class UserCreationService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // private readonly mailService: MailService,
    private readonly networkManagerFactory: NetworkManagerFactoryService,
  ) {}

  async adminUserCreate(createUser: AdministrativeDto) {
    const { email, role, password, name, phone } = createUser;

    if (role !== roles_options.ADMIN && role !== roles_options.ACCOUNTING) {
      throw new CustomException({
        message: 'Role must be ADMIN or ACCOUNTING',
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: ErrorCode.BAD_REQUEST,
      });
    }

    try {
      const activeIsp = await this.prisma.isp.findFirst({
        where: { is_active: true },
      });
      const hashedPassword = await hashPassword(password);
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        throw new CustomException({
          message: 'EL correo electronico ya existe en nuestra base de datos',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.USER_ALREADY_EXISTS,
        });
      }

      const createdUser = await this.prisma.user.create({
        data: {
          email,
          role: role,
          password: hashedPassword,
          is_authenticated: false,
          is_active: true,
          is_deleted: false,
          admin_profile: {
            create: {
              name,
              phone,
              isp_id: activeIsp.id,
              configuration: {
                create: {
                  is_active: true,
                },
              },
            },
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return {
        message: 'Usuario creado de manera exitosa',
        userId: createdUser.id,
      };
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new CustomException({
        message: 'Error creando usuario',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  /** Create client user */
  async clientUserCreate(createUser: UserDto): Promise<{ message: string }> {
    const { email, password, network_manager_user_id } = createUser;
    console.log(email, password, network_manager_user_id);

    await this.validateUserCreation(email, network_manager_user_id);

    const hashedPassword = await hashPassword(password);
    const activeIsp = await this.getActiveIsp();

    const userDataFromNetworkManager = await this.getUserDataFromNetworkManager(
      network_manager_user_id,
      activeIsp,
    );
    const userDataWithHashedPassword = this.prepareUserData(
      createUser,
      hashedPassword,
      userDataFromNetworkManager,
    );

    const createdUser = await this.prisma.user.create({
      data: {
        email: userDataWithHashedPassword.email,
        role: 'CLIENT',
        password: userDataWithHashedPassword.password,
        is_authenticated: false,
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        client_profile: {
          create: {
            name: userDataWithHashedPassword.name,
            dni: userDataWithHashedPassword.dni,
            phone: userDataWithHashedPassword.phone,
            address: userDataWithHashedPassword.address,
            isp_id: activeIsp.id,
            network_manager_user_id:
              userDataWithHashedPassword.network_manager_user_id,
            type_of_person: userDataWithHashedPassword.type_of_person,
            configuration: {
              create: {
                is_active: true,
              },
            },
          },
        },
      },
    });

    console.log(createdUser);

    //TO DO enhance the return
    return { message: 'the user is create successfully' };
  }

  private async validateUserCreation(
    email: string,
    network_manager_user_id: number,
  ): Promise<void> {
    console.log('network_manager_user_id: ', network_manager_user_id);
    const activeIsp = await this.getActiveIsp();
    await this.checkExistingUser(email);
    await this.validateNetworkManager(activeIsp);
  }

  private async getActiveIsp() {
    const activeIsp = await this.prisma.isp.findFirst({
      where: { is_active: true },
      include: { network_manager: true },
    });

    if (!activeIsp) {
      throw new CustomException({
        message: 'No active ISP found',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.NO_ACTIVE_ISP,
      });
    }

    return activeIsp;
  }

  private async checkExistingUser(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new CustomException({
        message: 'Email already exists',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
      });
    }
  }

  private async validateNetworkManager(activeIsp: any): Promise<void> {
    const networkManager = this.networkManagerFactory.createNetworkManager(
      activeIsp.network_manager.name,
    );
    if (!networkManager) {
      throw new CustomException({
        message: 'Network manager not registered',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.NETWORK_MANAGER_NOT_REGISTERED,
      });
    }
  }

  private async getUserDataFromNetworkManager(
    userId: number,
    activeIsp: any,
  ): Promise<any> {
    const networkManager = this.networkManagerFactory.createNetworkManager(
      activeIsp.network_manager.name,
    );
    const userData = await networkManager.getUserData({ userId });
    if (!userData) {
      throw new CustomException({
        message: 'Usuario no encontrado en administrador de red',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    }
    return userData;
  }

  private prepareUserData(
    createUser: UserDto,
    hashedPassword: string,
    networkManagerData: any,
  ): UserDto {
    const { dni, name, address, phone } = networkManagerData;
    return {
      ...createUser,
      password: hashedPassword,
      name,
      phone,
      dni,
      address,
    };
  }
}
