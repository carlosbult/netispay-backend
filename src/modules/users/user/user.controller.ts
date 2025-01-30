import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseFilters,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AdministrativeDto } from '../dto/administrative.dto';
import { UserDto } from '../dto/user.dto';
import { CustomExceptionFilter } from 'src/common/filters/custom-exception.filter';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';
import { UserCreationService } from './user-creation.service';
import { UserQueryService } from './user-query.service';
import { UserManagementService } from './user-management.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userCreationService: UserCreationService,
    private readonly userQueryService: UserQueryService,
    private readonly userManagementService: UserManagementService,
  ) {}

  @Post('userCreate')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: UserDto })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @UseFilters(new CustomExceptionFilter())
  async userCreate(@Body() UserDto: UserDto) {
    return this.userCreationService.clientUserCreate(UserDto);
  }

  @Post('administrativeProfileCreation')
  @ApiOperation({ summary: 'Crear un perfil administrativo' })
  @ApiBody({ type: AdministrativeDto })
  @ApiCreatedResponse({
    description: 'Perfil administrativo creado exitosamente',
    type: AdministrativeDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @UseFilters(new CustomExceptionFilter())
  async administrativeRolesCreation(
    @Body() AdministrativeDto: AdministrativeDto,
  ) {
    return this.userCreationService.adminUserCreate(AdministrativeDto);
  }

  @ApiCreatedResponse({
    description: 'Detalles del usuario obtenidos exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error ' })
  @Get(':id')
  @UseFilters(new CustomExceptionFilter())
  async getMyUser(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.userQueryService.getUserById(id);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in getMyUser',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @ApiOkResponse({ description: 'Lista de usuarios obtenida exitosamente' })
  @Get()
  @UseFilters(new CustomExceptionFilter())
  getAllUsers(
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('dni') dni?: string,
    @Query('city') city?: string,
    @Query('role') role?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const filters = {
      id: id ? Number(id) : undefined,
      name,
      dni: dni ? Number(dni) : undefined,
      city,
      role,
      page: Number(page),
      pageSize: Number(pageSize),
    };
    return this.userQueryService.getAllUsers(filters);
  }

  @Delete('softDelete/:id')
  @UseFilters(new CustomExceptionFilter())
  async softUserDelete(@Param('id') id: string): Promise<void> {
    const parsedId = parseInt(id, 10);
    return this.userManagementService.softUserDelete(parsedId);
  }

  // @UseGuards(RolesGuard)
  @Put('updateUser/:id')
  @UseFilters(new CustomExceptionFilter())
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<{ message: string }> {
    try {
      const parsedId = parseInt(id, 10);
      const response = await this.userManagementService.updateUser(
        parsedId,
        updateData,
      );
      return response;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException({
        message: 'Error in updateUser',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.BAD_REQUEST,
        details: error,
      });
    }
  }

  @Delete('hardDelete/:id')
  @UseFilters(new CustomExceptionFilter())
  async hardUserDelete(@Param('id') id: string): Promise<void> {
    const parsedId = parseInt(id, 10);
    return this.userManagementService.hardUserDelete(parsedId);
  }
}
