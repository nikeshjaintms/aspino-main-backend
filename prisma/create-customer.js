const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running Customer table migration...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Customer" (
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
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_customerCode_key" ON "Customer"("customerCode");
  `);

  console.log('Customer table successfully verified in database!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
