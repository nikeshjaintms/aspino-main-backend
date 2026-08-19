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
import { StorageLocationService } from './storage-location.service';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';

@Controller('storage-location')
export class StorageLocationController {
  constructor(
    private readonly storageLocationService: StorageLocationService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStorageLocationDto) {
    return this.storageLocationService.create(createDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('storageCondition') storageCondition?: string,
    @Query('linkedStoreType') linkedStoreType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.storageLocationService.findAll(
      search,
      storageCondition,
      linkedStoreType,
      status,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storageLocationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStorageLocationDto,
  ) {
    return this.storageLocationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storageLocationService.remove(id);
  }
}
