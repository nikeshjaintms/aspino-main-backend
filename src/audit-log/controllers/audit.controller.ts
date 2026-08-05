import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(
    @Query()
    query: PaginationQueryDto & {
      userEmail?: string;
      userRole?: string;
      action?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.auditService.getLogs(query);
  }
}
