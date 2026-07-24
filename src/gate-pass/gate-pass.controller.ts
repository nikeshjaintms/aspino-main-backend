import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Patch,
  Res,
} from '@nestjs/common';
import { GatePassService } from './gate-pass.service';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import type { Response } from 'express';

@Controller('gate-pass')
export class GatePassController {
  constructor(private readonly service: GatePassService) {}

  @Post()
  async create(@Body() dto: CreateGatePassDto) {
    return this.service.createGatePass(dto);
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.service.getAllGatePasses(type, search, parsedPage, parsedLimit);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.service.generateGatePassPdfBuffer(id);
    const pass = await this.service.getGatePassById(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="GatePass_${pass.passNumber}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.end(pdfBuffer);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getGatePassById(id);
  }

  @Patch(':id/timeout')
  async recordTimeOut(@Param('id', ParseIntPipe) id: number) {
    return this.service.recordTimeOut(id);
  }

  @Patch(':id/link-grn-po')
  async linkGrnPo(
    @Param('id', ParseIntPipe) id: number,
    @Body('poNumber') poNumber?: string,
    @Body('grnNumber') grnNumber?: string,
  ) {
    return this.service.linkGrnPo(id, poNumber, grnNumber);
  }
}
