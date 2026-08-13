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
import { PassCategoryService } from './pass-category.service';
import { CreatePassCategoryDto } from './dto/create-pass-category.dto';
import { UpdatePassCategoryDto } from './dto/update-pass-category.dto';

@Controller('pass-category')
export class PassCategoryController {
  constructor(private readonly passCategoryService: PassCategoryService) {}

  @Post()
  create(@Body() createPassCategoryDto: CreatePassCategoryDto) {
    return this.passCategoryService.create(createPassCategoryDto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.passCategoryService.findAll(
      type,
      search,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.passCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePassCategoryDto: UpdatePassCategoryDto,
  ) {
    return this.passCategoryService.update(id, updatePassCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.passCategoryService.remove(id);
  }
}
