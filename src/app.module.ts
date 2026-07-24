import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GatePassModule } from './gate-pass/gate-pass.module';
import { PassCategoryModule } from './pass-category/pass-category.module';
import { BankModule } from './bank/bank.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    GatePassModule,
    PassCategoryModule,
    BankModule,
    SupplierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
