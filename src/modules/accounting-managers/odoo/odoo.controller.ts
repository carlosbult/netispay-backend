import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OdooService } from './odoo.service';
import { CreateOdooDto } from './dto/create-odoo.dto';
import { UpdateOdooDto } from './dto/update-odoo.dto';

@Controller('odoo')
export class OdooController {
  constructor(private readonly odooService: OdooService) {}

  @Post()
  create(@Body() createOdooDto: CreateOdooDto) {
    return this.odooService.create(createOdooDto);
  }

  @Get()
  findAll() {
    return this.odooService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.odooService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOdooDto: UpdateOdooDto) {
    return this.odooService.update(+id, updateOdooDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.odooService.remove(+id);
  }
}
