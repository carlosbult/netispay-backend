import { Test, TestingModule } from '@nestjs/testing';
import { ZohoBooksService } from './zoho-books.service';

describe('ZohoBooksService', () => {
  let service: ZohoBooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZohoBooksService],
    }).compile();

    service = module.get<ZohoBooksService>(ZohoBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
