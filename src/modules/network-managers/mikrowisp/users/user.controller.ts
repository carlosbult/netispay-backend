import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetClientDetailsDto } from './dto/get-client-details.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveServiceDto } from './dto/active-service.dto';
import { SuspendServiceDto } from './dto/suspend-service.dto';
import { NewPreRegistroDto } from './dto/new-preregister.dto';
import { ListInstallDto } from './dto/list-install.dto';

@Controller('mikrowisp/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('details')
  getClientDetails(@Body() getClientDetailsDto: GetClientDetailsDto) {
    return this.userService.getClientDetails(getClientDetailsDto);
  }

  @Post('update')
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }

  @Post('activate-service')
  activateService(@Body() activeServiceDto: ActiveServiceDto) {
    return this.userService.activateService(activeServiceDto);
  }

  @Post('suspend-service')
  suspendService(@Body() suspendServiceDto: SuspendServiceDto) {
    return this.userService.suspendService(suspendServiceDto);
  }

  @Post('new-preregistro')
  newPreRegistro(@Body() newPreRegistroDto: NewPreRegistroDto) {
    return this.userService.newPreRegistro(newPreRegistroDto);
  }

  @Post('list-install')
  listInstall(@Body() listInstallDto: ListInstallDto) {
    return this.userService.listInstall(listInstallDto);
  }
}
