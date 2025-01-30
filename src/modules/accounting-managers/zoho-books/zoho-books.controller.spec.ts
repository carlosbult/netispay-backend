import { Test, TestingModule } from '@nestjs/testing';
import { ZohoBooksController } from './zoho-books.controller';
import { ZohoBooksService } from './zoho-books.service';

describe('ZohoBooksController', () => {
  let controller: ZohoBooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoBooksController],
      providers: [ZohoBooksService],
    }).compile();

    controller = module.get<ZohoBooksController>(ZohoBooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
