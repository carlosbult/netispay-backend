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
import { IspConfigurationService } from './isp-configuration.service';
import { CreateIspConfigurationDto } from './dto/create-isp-configuration.dto';
import { UpdateIspConfigurationDto } from './dto/update-isp-configuration.dto';
import { ApiTags } from '@nestjs/swagger';
import { SessionGuard } from 'src/modules/auth/session/session.guard';
import { GetSession } from 'src/modules/auth/session/session.decorator';

@ApiTags('ISP Configuration')
@Controller('settings/isp-configuration')
@UseGuards(SessionGuard)
export class IspConfigurationController {
  constructor(
    private readonly ispConfigurationService: IspConfigurationService,
  ) {}

  @Post()
  create(
    @Body() createIspConfigurationDto: CreateIspConfigurationDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.ispConfigurationService.create(createIspConfigurationDto);
  }

  @Get()
  findAll(@GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.ispConfigurationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.ispConfigurationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIspConfigurationDto: UpdateIspConfigurationDto,
    @GetSession() session,
  ) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.ispConfigurationService.update(+id, updateIspConfigurationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetSession() session) {
    const userId = session.userId;
    console.log('userId: ', userId);
    return this.ispConfigurationService.remove(+id);
  }
}
