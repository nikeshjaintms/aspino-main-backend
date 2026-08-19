import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductSubCategoryService } from './product-sub-category.service';
import { CreateProductSubCategoryDto } from './dto/create-product-sub-category.dto';
import { UpdateProductSubCategoryDto } from './dto/update-product-sub-category.dto';

@Controller('product-sub-category')
export class ProductSubCategoryController {
  constructor(
    private readonly productSubCategoryService: ProductSubCategoryService,
  ) {}

  @Post()
  create(@Body() createDto: CreateProductSubCategoryDto) {
    return this.productSubCategoryService.create(createDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.productSubCategoryService.findAll(
      search,
      categoryId,
      status,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productSubCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductSubCategoryDto,
  ) {
    return this.productSubCategoryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productSubCategoryService.remove(id);
  }
}
