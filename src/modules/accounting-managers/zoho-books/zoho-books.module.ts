import { Module } from '@nestjs/common';
import { ZohoBooksService } from './zoho-books.service';
import { ZohoBooksController } from './zoho-books.controller';

@Module({
  controllers: [ZohoBooksController],
  providers: [ZohoBooksService],
})
export class ZohoBooksModule {}
