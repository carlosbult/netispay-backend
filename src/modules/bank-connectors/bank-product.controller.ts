import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ManageBankProductService } from './services/manage-bank-product.service';
import { CreateBankProductDto } from './dto/create-bank-product.dto';
import { UpdateBankProductDto } from './dto/update-bank-product.dto';
import { GetBankProductsDto } from './dto/get-bank-products.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Bank Products')
@Controller('bank-products')
export class BankProductController {
  constructor(private readonly bankProductService: ManageBankProductService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto bancario' })
  @ApiBody({ type: CreateBankProductDto })
  @ApiResponse({
    status: 201,
    description: 'Producto bancario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createBankProductDto: CreateBankProductDto) {
    return this.bankProductService.create(createBankProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de productos bancarios' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'number',
    description: 'Filtrar por estado del producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos bancarios obtenida exitosamente',
    type: [GetBankProductsDto],
  })
  findAll(@Query() query: GetBankProductsDto) {
    return this.bankProductService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto bancario por ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del producto bancario',
  })
  @ApiResponse({ status: 200, description: 'Producto bancario encontrado' })
  @ApiResponse({ status: 404, description: 'Producto bancario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.bankProductService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un producto bancario' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del producto bancario',
  })
  @ApiBody({ type: UpdateBankProductDto })
  @ApiResponse({
    status: 200,
    description: 'Producto bancario actualizado parcialmente',
  })
  @ApiResponse({ status: 404, description: 'Producto bancario no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateBankProductDto: UpdateBankProductDto,
  ) {
    return this.bankProductService.update(+id, updateBankProductDto);
  }
}
