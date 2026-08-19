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
import { QcSpecificationService } from './qc-specification.service';
import { CreateQcSpecificationDto } from './dto/create-qc-specification.dto';
import { UpdateQcSpecificationDto } from './dto/update-qc-specification.dto';

@Controller('qc-specification')
export class QcSpecificationController {
  constructor(
    private readonly qcSpecificationService: QcSpecificationService,
  ) {}

  @Post()
  create(@Body() createDto: CreateQcSpecificationDto) {
    return this.qcSpecificationService.create(createDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('itemType') itemType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.qcSpecificationService.findAll(
      search,
      itemType,
      status,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.qcSpecificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateQcSpecificationDto,
  ) {
    return this.qcSpecificationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.qcSpecificationService.remove(id);
  }
}
