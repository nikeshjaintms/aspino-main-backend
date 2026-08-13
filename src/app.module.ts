import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GatePassModule } from './gate-pass/gate-pass.module';
import { PassCategoryModule } from './pass-category/pass-category.module';
import { BankModule } from './bank/bank.module';
import { SupplierModule } from './supplier/supplier.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    GatePassModule,
    PassCategoryModule,
    BankModule,
    SupplierModule,
    AuditLogModule,
  ],
})
export class AppModule {}
