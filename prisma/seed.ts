import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@aspino.com';
  const adminPassword = 'admin123';
  const adminName = 'Aspino Admin';

  console.log('Seeding User table with Admin user...');

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin user created in User table!`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    });
    console.log(`ℹ️ Admin user updated in User table (${adminEmail})`);
  }

  // Seed Pass Categories CRUD Table
  console.log('Seeding PassCategory table...');
  const defaultCategories = [
    {
      code: 'IN_MAT',
      name: 'Material Delivery',
      type: 'INWARD' as const,
      description: 'Raw materials, chemical drums, packaging supplies from vendors',
    },
    {
      code: 'IN_VIS',
      name: 'Visitor Entry',
      type: 'INWARD' as const,
      description: 'Audit teams, inspectors, guest visitors, official personnel',
    },
    {
      code: 'IN_LAB',
      name: 'Contractor / Labour Entry',
      type: 'INWARD' as const,
      description: 'Temporary maintenance workers, contractors, third-party labour',
    },
    {
      code: 'OUT_SALES',
      name: 'Sales Dispatch',
      type: 'OUTWARD' as const,
      description: 'Finished pharma product dispatches with verified Invoice & COA',
    },
    {
      code: 'OUT_RET',
      name: 'Non-Sale Returnable',
      type: 'OUTWARD' as const,
      description: 'Equipment repair dispatch, sample dispatch, calibration returns',
    },
  ];

  const categoryMap: Record<string, number> = {};
  for (const cat of defaultCategories) {
    const dbCat = await prisma.passCategory.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
    categoryMap[cat.code] = dbCat.id;
    console.log(`  └─ Seeded PassCategory: ${cat.name} (${cat.type})`);
  }

  // Seed Gate Passes
  console.log('Seeding GatePass table with demo records...');
  const seedPasses = [
    {
      passNumber: 'GP-IN-2026-001',
      type: 'INWARD' as const,
      categoryId: categoryMap['IN_MAT'],
      status: 'COMPLETED' as const,
      vehicleNumber: 'MH-04-JK-8842',
      driverName: 'Rajesh Kumar',
      driverContact: '+91 98201 44512',
      transporterName: 'VRL Logistics',
      supplierSource: 'Reliance Chemical Industries Ltd',
      deliveryChallanNumber: 'DC-99410',
      declaredQuantity: '500 Ltrs',
      poNumber: 'PO-2026-8812',
      grnNumber: 'GRN-2026-401',
      timeIn: new Date(Date.now() - 4 * 3600 * 1000),
      timeOut: new Date(Date.now() - 1 * 3600 * 1000),
      notes: 'Raw chemical drums received in good condition',
    },
    {
      passNumber: 'GP-IN-2026-002',
      type: 'INWARD' as const,
      categoryId: categoryMap['IN_VIS'],
      status: 'GATE_IN' as const,
      vehicleNumber: 'MH-12-PQ-2019',
      driverName: 'Amit Sharma',
      driverContact: '+91 98700 11223',
      transporterName: 'Self Drive',
      supplierSource: 'FDA Audit Inspector Team',
      deliveryChallanNumber: 'N/A',
      declaredQuantity: '1 Vehicle',
      timeIn: new Date(Date.now() - 2 * 3600 * 1000),
      notes: 'Routine Compliance Inspection Visit',
    },
    {
      passNumber: 'GP-OUT-2026-001',
      type: 'OUTWARD' as const,
      categoryId: categoryMap['OUT_SALES'],
      status: 'GATE_IN' as const,
      vehicleNumber: 'KA-01-AB-1234',
      driverName: 'Suresh Patil',
      driverContact: '+91 99112 33445',
      transporterName: 'SafeExpress Logistics',
      invoiceNumber: 'INV-2026-9021',
      coaGenerated: true,
      purpose: 'Pharma Batch Dispatch to Cipla Healthcare',
      timeIn: new Date(Date.now() - 30 * 60 * 1000),
      notes: 'Invoice & COA Verified. Awaiting final gate out dispatch approval.',
    },
    {
      passNumber: 'GP-OUT-2026-002',
      type: 'OUTWARD' as const,
      categoryId: categoryMap['OUT_RET'],
      status: 'COMPLETED' as const,
      vehicleNumber: 'MH-43-XY-9012',
      driverName: 'Vikas Mane',
      driverContact: '+91 97654 32100',
      transporterName: 'Local Transport',
      purpose: 'Centrifuge Equipment Repair at Siemens Service Center',
      coaGenerated: false,
      timeIn: new Date(Date.now() - 8 * 3600 * 1000),
      timeOut: new Date(Date.now() - 6 * 3600 * 1000),
      notes: 'Returnable Gate Pass Issued (Expected return: 25-Jul-2026)',
    },
  ];

  for (const item of seedPasses) {
    if (!item.categoryId) {
      // Fallback if categoryMap lookup failed (e.g. if code was renamed)
      const cat = await prisma.passCategory.findFirst();
      item.categoryId = cat?.id || 1;
    }
    await prisma.gatePass.upsert({
      where: { passNumber: item.passNumber },
      update: item as any,
      create: item as any,
    });
    console.log(`  └─ Seeded GatePass: ${item.passNumber} (${item.type})`);
  }

  // Seed Banks
  console.log('Seeding Bank table...');
  const defaultBanks = [
    { name: 'State Bank of India' },
    { name: 'HDFC Bank' },
    { name: 'ICICI Bank' },
    { name: 'Axis Bank' },
    { name: 'Punjab National Bank' }
  ];

  const seededBanks: any[] = [];
  for (const b of defaultBanks) {
    const bank = await prisma.bank.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    });
    seededBanks.push(bank);
    console.log(`  └─ Seeded Bank: ${b.name}`);
  }

  // Seed Suppliers
  console.log('Seeding Supplier table...');
  const defaultSuppliers = [
    {
      code: "SUP-2026-001",
      name: "PharmaCorp Ltd",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@pharmacorp.com",
      phone: "+91 98765 43210",
      address: "Plot 42, GIDC Industrial Estate, Andheri East, Mumbai, Maharashtra - 400069",
      gstNo: "27AAAAA1111A1Z1",
      approvedCategories: ["Antibiotics", "Solvents", "Active Ingredients"],
      approvalStatus: "Approved",
      bankName: "State Bank of India",
      accountNumber: "332211009988",
      ifscCode: "SBIN0001234",
      accountName: "PharmaCorp Limited Account",
      rating: 4.8,
      history: "Reliable deliveries with minor delays in Q1 2026. Official audit passed in May 2026.",
    },
    {
      code: "SUP-2026-002",
      name: "MediSupply Inc",
      contactPerson: "Priya Sharma",
      email: "priya@medisupply.in",
      phone: "+91 87654 32109",
      address: "12 Connaught Place, Block B, New Delhi, Delhi - 110001",
      gstNo: "07BBBBB2222B2Z2",
      approvedCategories: ["General Chemicals", "Packaging Materials"],
      approvalStatus: "Approved",
      bankName: "HDFC Bank",
      accountNumber: "5010022334455",
      ifscCode: "HDFC0000123",
      accountName: "MediSupply Inc",
      rating: 4.5,
      history: "High quality packaging supplies. Consistent lead times. Audit passed in Dec 2025.",
    }
  ];

  for (const s of defaultSuppliers) {
    const matchedBank = seededBanks.find(b => b.name === s.bankName);
    const { bankName, ...supplierData } = s;
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: {
        ...supplierData,
        bankId: matchedBank?.id,
      },
      create: {
        ...supplierData,
        bankId: matchedBank?.id,
      },
    });
    console.log(`  └─ Seeded Supplier: ${s.name} (${s.code})`);
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
