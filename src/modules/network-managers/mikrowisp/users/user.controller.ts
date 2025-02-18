import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetClientDetailsDto } from './dto/get-client-details.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveServiceDto } from './dto/active-service.dto';
import { SuspendServiceDto } from './dto/suspend-service.dto';
import { NewPreRegistroDto } from './dto/new-preregister.dto';
import { ListInstallDto } from './dto/list-install.dto';
import { SessionGuard } from 'src/modules/auth/session/session.guard';
import { GetSession } from 'src/modules/auth/session/session.decorator';

@Controller('mikrowisp/user')
@UseGuards(SessionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  createUser(@Body() createUserDto: CreateUserDto, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.createUser(createUserDto);
  }

  @Post('details')
  getClientDetails(
    @Body() getClientDetailsDto: GetClientDetailsDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.getClientDetails(getClientDetailsDto);
  }

  @Post('update')
  updateUser(@Body() updateUserDto: UpdateUserDto, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.updateUser(updateUserDto);
  }

  @Post('activate-service')
  activateService(
    @Body() activeServiceDto: ActiveServiceDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.activateService(activeServiceDto);
  }

  @Post('suspend-service')
  suspendService(
    @Body() suspendServiceDto: SuspendServiceDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.suspendService(suspendServiceDto);
  }

  @Post('new-preregistro')
  newPreRegistro(
    @Body() newPreRegistroDto: NewPreRegistroDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.newPreRegistro(newPreRegistroDto);
  }

  @Post('list-install')
  listInstall(
    @Body() listInstallDto: ListInstallDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.userService.listInstall(listInstallDto);
  }
}
