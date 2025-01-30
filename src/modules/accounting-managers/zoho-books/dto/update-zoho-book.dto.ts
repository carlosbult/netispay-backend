import { PartialType } from '@nestjs/swagger';
import { CreateZohoBookDto } from './create-zoho-book.dto';

export class UpdateZohoBookDto extends PartialType(CreateZohoBookDto) {}
