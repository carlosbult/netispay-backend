import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ZohoBooksService } from './zoho-books.service';
import { CreateZohoBookDto } from './dto/create-zoho-book.dto';
import { UpdateZohoBookDto } from './dto/update-zoho-book.dto';

@Controller('zoho-books')
export class ZohoBooksController {
  constructor(private readonly zohoBooksService: ZohoBooksService) {}

  @Post()
  create(@Body() createZohoBookDto: CreateZohoBookDto) {
    return this.zohoBooksService.create(createZohoBookDto);
  }

  @Get()
  findAll() {
    return this.zohoBooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zohoBooksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateZohoBookDto: UpdateZohoBookDto,
  ) {
    return this.zohoBooksService.update(+id, updateZohoBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zohoBooksService.remove(+id);
  }
}
