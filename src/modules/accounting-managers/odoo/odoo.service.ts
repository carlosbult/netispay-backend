import { Injectable } from '@nestjs/common';
import { CreateOdooDto } from './dto/create-odoo.dto';
import { UpdateOdooDto } from './dto/update-odoo.dto';

@Injectable()
export class OdooService {
  create(createOdooDto: CreateOdooDto) {
    return 'This action adds a new odoo';
  }

  findAll() {
    return `This action returns all odoo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} odoo`;
  }

  update(id: number, updateOdooDto: UpdateOdooDto) {
    return `This action updates a #${id} odoo`;
  }

  remove(id: number) {
    return `This action removes a #${id} odoo`;
  }
}
