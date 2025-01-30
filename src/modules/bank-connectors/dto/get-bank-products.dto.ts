import { IsEnum, IsOptional } from 'class-validator';

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

export class GetBankProductsDto {
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ALL;
}
