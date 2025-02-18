import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NetworkManagerService } from './network-manager.service';
import { CreateNetworkManagerDto } from './dto/create-network-manager.dto';
import { UpdateNetworkManagerDto } from './dto/update-network-manager.dto';
import { ApiTags } from '@nestjs/swagger';
import { SessionGuard } from 'src/modules/auth/session/session.guard';
import { GetSession } from 'src/modules/auth/session/session.decorator';

@ApiTags('Network Managers')
@Controller('settings/network-manager')
@UseGuards(SessionGuard)
export class NetworkManagerController {
  constructor(private readonly networkManagerService: NetworkManagerService) {}

  @Post()
  create(
    @Body() createNetworkManagerDto: CreateNetworkManagerDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.networkManagerService.create(createNetworkManagerDto);
  }

  @Get()
  findAll(@GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.networkManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.networkManagerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNetworkManagerDto: UpdateNetworkManagerDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.networkManagerService.update(+id, updateNetworkManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.networkManagerService.remove(+id);
  }
}
