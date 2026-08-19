import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating / verifying new Master tables...');

  // 1. PackingMaterial
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PackingMaterial" (
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
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PackingMaterial_materialCode_key" ON "PackingMaterial"("materialCode");
  `);

  // 2. QcSpecification
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "QcSpecification" (
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
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "QcSpecification_specCode_key" ON "QcSpecification"("specCode");
  `);

  // 3. StorageLocation
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "StorageLocation" (
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
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "StorageLocation_locationCode_key" ON "StorageLocation"("locationCode");
  `);

  console.log('✅ All 3 Master tables created / verified successfully.');
}

main()
  .catch((e) => {
    console.error('Error creating tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
