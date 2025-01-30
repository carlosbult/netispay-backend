import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WisphubService } from './wisphub.service';
import { CreateMikrowispDto } from './dto/create-wisphub.dto';
import { UpdateMikrowispDto } from './dto/update-wisphub.dto';

@Controller('wisphub')
export class WisphubController {
  constructor(private readonly wisphubService: WisphubService) {}

  // @Post()
  // create(@Body() createMikrowispDto: CreateMikrowispDto) {
  //   return this.mikrowispService.create(createMikrowispDto);
  // }

  // @Get()
  // findAll() {
  //   return this.mikrowispService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.mikrowispService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMikrowispDto: UpdateMikrowispDto) {
  //   return this.mikrowispService.update(+id, updateMikrowispDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.mikrowispService.remove(+id);
  // }
}
