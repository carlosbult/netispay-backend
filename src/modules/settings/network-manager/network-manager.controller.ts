import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NetworkManagerService } from './network-manager.service';
import { CreateNetworkManagerDto } from './dto/create-network-manager.dto';
import { UpdateNetworkManagerDto } from './dto/update-network-manager.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Network Managers')
@Controller('settings/network-manager')
export class NetworkManagerController {
  constructor(private readonly networkManagerService: NetworkManagerService) {}

  @Post()
  create(@Body() createNetworkManagerDto: CreateNetworkManagerDto) {
    return this.networkManagerService.create(createNetworkManagerDto);
  }

  @Get()
  findAll() {
    return this.networkManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.networkManagerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNetworkManagerDto: UpdateNetworkManagerDto,
  ) {
    return this.networkManagerService.update(+id, updateNetworkManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.networkManagerService.remove(+id);
  }
}
