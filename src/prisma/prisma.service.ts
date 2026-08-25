import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully.');

      // Ensure Vendor table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."Vendor" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "serviceType" TEXT NOT NULL,
          "address" TEXT,
          "contactName" TEXT,
          "mobile" TEXT,
          "email" TEXT,
          "contractReference" TEXT,
          "approvalStatus" TEXT NOT NULL DEFAULT 'Approved',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Vendor_code_key" ON "public"."Vendor"("code");
      `);

      // Ensure Customer table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."Customer" (
          "id" TEXT NOT NULL,
          "customerCode" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "billingAddress" TEXT,
          "shippingAddress" TEXT,
          "gstNo" TEXT,
          "creditTerms" TEXT,
          "contactPerson" TEXT,
          "email" TEXT,
          "phone" TEXT,
          "customerType" TEXT NOT NULL DEFAULT 'DOMESTIC',
          "isDomestic" BOOLEAN NOT NULL DEFAULT true,
          "country" TEXT DEFAULT 'India',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerCode_key" ON "public"."Customer"("customerCode");
      `);

      // Ensure ProductCategory table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."ProductCategory" (
          "id" TEXT NOT NULL,
          "categoryCode" TEXT NOT NULL,
          "categoryName" TEXT NOT NULL,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_categoryCode_key" ON "public"."ProductCategory"("categoryCode");
      `);

      // Ensure ProductSubCategory table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."ProductSubCategory" (
          "id" TEXT NOT NULL,
          "subCategoryCode" TEXT NOT NULL,
          "subCategoryName" TEXT NOT NULL,
          "categoryId" TEXT NOT NULL,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ProductSubCategory_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ProductSubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "ProductSubCategory_subCategoryCode_key" ON "public"."ProductSubCategory"("subCategoryCode");
      `);

      // Ensure Product table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."Product" (
          "id" TEXT NOT NULL,
          "productCode" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "categoryId" TEXT NOT NULL,
          "subCategoryId" TEXT,
          "uom" TEXT NOT NULL,
          "shelfLife" TEXT NOT NULL,
          "storageCondition" TEXT NOT NULL,
          "standardCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          "hsnCode" TEXT NOT NULL,
          "qcSpecification" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."ProductSubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Product_productCode_key" ON "public"."Product"("productCode");
      `);

      // Ensure Uom table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."Uom" (
          "id" TEXT NOT NULL,
          "uomCode" TEXT NOT NULL,
          "uomName" TEXT NOT NULL,
          "conversionFactor" DOUBLE PRECISION DEFAULT 1.0,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Uom_uomCode_key" ON "public"."Uom"("uomCode");
      `);

      // Ensure PackingMaterial table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."PackingMaterial" (
          "id" TEXT NOT NULL,
          "materialCode" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'PRIMARY',
          "description" TEXT NOT NULL,
          "approvedSuppliers" JSONB,
          "linkedSpecification" TEXT,
          "uom" TEXT NOT NULL,
          "standardCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
          "minimumStock" DOUBLE PRECISION DEFAULT 0.0,
          "storageCondition" TEXT DEFAULT 'Ambient',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PackingMaterial_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "PackingMaterial_materialCode_key" ON "public"."PackingMaterial"("materialCode");
      `);

      // Ensure QcSpecification table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."QcSpecification" (
          "id" TEXT NOT NULL,
          "specCode" TEXT NOT NULL,
          "productMaterialCode" TEXT NOT NULL,
          "itemName" TEXT NOT NULL,
          "itemType" TEXT NOT NULL DEFAULT 'PRODUCT',
          "testParameters" JSONB NOT NULL,
          "testMethod" TEXT,
          "acceptableLimits" TEXT,
          "versionNo" TEXT NOT NULL DEFAULT 'v1.0',
          "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "reviewDate" TIMESTAMP(3),
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "preparedBy" TEXT,
          "approvedBy" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "QcSpecification_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "QcSpecification_specCode_key" ON "public"."QcSpecification"("specCode");
      `);

      // Ensure StorageLocation table and index exist in PostgreSQL
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "public"."StorageLocation" (
          "id" TEXT NOT NULL,
          "locationCode" TEXT NOT NULL,
          "locationName" TEXT NOT NULL,
          "warehouse" TEXT DEFAULT 'Main Warehouse',
          "storageCondition" TEXT NOT NULL DEFAULT 'AMBIENT',
          "capacity" TEXT NOT NULL,
          "linkedStoreType" TEXT NOT NULL DEFAULT 'RAW_MATERIAL_STORE',
          "temperatureRange" TEXT,
          "humidityRange" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "StorageLocation_locationCode_key" ON "public"."StorageLocation"("locationCode");
      `);

      // Ensure Bank table and index exist in PostgreSQL (and id is TEXT)
      await this.$executeRawUnsafe(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        CREATE TABLE IF NOT EXISTS "public"."Bank" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Bank_name_key" ON "public"."Bank"("name");

        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'Bank' AND column_name = 'id' AND data_type = 'integer'
          ) THEN
            ALTER TABLE "public"."Bank" ALTER COLUMN "id" DROP DEFAULT;
            ALTER TABLE "public"."Bank" ADD COLUMN IF NOT EXISTS "new_id" TEXT DEFAULT gen_random_uuid()::text;
            UPDATE "public"."Bank" SET "new_id" = gen_random_uuid()::text WHERE "new_id" IS NULL;
            ALTER TABLE "public"."Bank" DROP CONSTRAINT IF EXISTS "Bank_pkey";
            ALTER TABLE "public"."Bank" DROP COLUMN "id";
            ALTER TABLE "public"."Bank" RENAME COLUMN "new_id" TO "id";
            ALTER TABLE "public"."Bank" ALTER COLUMN "id" SET NOT NULL;
            ALTER TABLE "public"."Bank" ADD CONSTRAINT "Bank_pkey" PRIMARY KEY ("id");
          END IF;
        END $$;
      `);

      this.logger.log(
        'Ensured all Master table schemas (Vendor, Customer, ProductCategory, ProductSubCategory, Product, Uom, PackingMaterial, QcSpecification, StorageLocation, Bank) in PostgreSQL database.',
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to PostgreSQL database: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
