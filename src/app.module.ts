import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GatePassModule } from './gate-pass/gate-pass.module';
import { PassCategoryModule } from './pass-category/pass-category.module';
import { BankModule } from './bank/bank.module';
import { SupplierModule } from './supplier/supplier.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { VendorModule } from './vendor/vendor.module';
import { CustomerModule } from './customer/customer.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductSubCategoryModule } from './product-sub-category/product-sub-category.module';
import { ProductModule } from './product/product.module';
import { UomModule } from './uom/uom.module';
import { PackingMaterialModule } from './packing-material/packing-material.module';
import { QcSpecificationModule } from './qc-specification/qc-specification.module';
import { StorageLocationModule } from './storage-location/storage-location.module';

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
    VendorModule,
    CustomerModule,
    ProductCategoryModule,
    ProductSubCategoryModule,
    ProductModule,
    UomModule,
    PackingMaterialModule,
    QcSpecificationModule,
    StorageLocationModule,
  ],
})
export class AppModule {}
