import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IspConfigurationService } from './isp-configuration.service';
import { CreateIspConfigurationDto } from './dto/create-isp-configuration.dto';
import { UpdateIspConfigurationDto } from './dto/update-isp-configuration.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ISP Configuration')
@Controller('settings/isp-configuration')
export class IspConfigurationController {
  constructor(
    private readonly ispConfigurationService: IspConfigurationService,
  ) {}

  @Post()
  create(@Body() createIspConfigurationDto: CreateIspConfigurationDto) {
    return this.ispConfigurationService.create(createIspConfigurationDto);
  }

  @Get()
  findAll() {
    return this.ispConfigurationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ispConfigurationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIspConfigurationDto: UpdateIspConfigurationDto,
  ) {
    return this.ispConfigurationService.update(+id, updateIspConfigurationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ispConfigurationService.remove(+id);
  }
}
