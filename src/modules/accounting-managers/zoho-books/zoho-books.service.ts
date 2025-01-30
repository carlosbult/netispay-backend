import { Injectable } from '@nestjs/common';
import { CreateZohoBookDto } from './dto/create-zoho-book.dto';
import { UpdateZohoBookDto } from './dto/update-zoho-book.dto';

@Injectable()
export class ZohoBooksService {
  create(createZohoBookDto: CreateZohoBookDto) {
    return 'This action adds a new zohoBook';
  }

  findAll() {
    return `This action returns all zohoBooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zohoBook`;
  }

  update(id: number, updateZohoBookDto: UpdateZohoBookDto) {
    return `This action updates a #${id} zohoBook`;
  }

  remove(id: number) {
    return `This action removes a #${id} zohoBook`;
  }
}
