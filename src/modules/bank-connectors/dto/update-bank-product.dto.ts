import { PartialType } from '@nestjs/mapped-types';
import { CreateBankProductDto } from './create-bank-product.dto';

export class UpdateBankProductDto extends PartialType(CreateBankProductDto) {}
