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

  const categoryMap: Record<string, string> = {};
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
      item.categoryId = cat?.id || '';
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

  // Seed Product Category, Sub-Category & Product Masters
  console.log('Seeding Product Masters...');
  const defaultProductCategories = [
    {
      categoryCode: 'CAT-API',
      categoryName: 'Active Pharmaceutical Ingredients',
      description: 'Primary active raw drug substances used in pharmaceutical manufacturing.',
    },
    {
      categoryCode: 'CAT-FDF',
      categoryName: 'Finished Dosage Forms',
      description: 'Completed commercial formulations packed for distribution and patient administration.',
    },
    {
      categoryCode: 'CAT-EXC',
      categoryName: 'Excipients & Additives',
      description: 'Inactive formulation substances like binders, disintegrants, and lubricants.',
    },
    {
      categoryCode: 'CAT-PKG',
      categoryName: 'Packaging Materials',
      description: 'Primary, secondary, and tertiary pharmaceutical packaging materials.',
    },
  ];

  const seededCategories: any[] = [];
  for (const pc of defaultProductCategories) {
    const dbCat = await prisma.productCategory.upsert({
      where: { categoryCode: pc.categoryCode },
      update: pc,
      create: pc,
    });
    seededCategories.push(dbCat);
    console.log(`  └─ Seeded ProductCategory: ${dbCat.categoryName} (${dbCat.categoryCode})`);
  }

  const categoryMapByCode: Record<string, string> = Object.fromEntries(
    seededCategories.map((c) => [c.categoryCode, c.id])
  );

  const defaultSubCategories = [
    {
      subCategoryCode: 'SUB-TAB',
      subCategoryName: 'Solid Orals (Tablets)',
      categoryCode: 'CAT-FDF',
      description: 'Compressed and coated solid tablets for oral ingestion.',
    },
    {
      subCategoryCode: 'SUB-CAP',
      subCategoryName: 'Capsules (Hard & Soft Gel)',
      categoryCode: 'CAT-FDF',
      description: 'Gelatin and vegetarian capsules containing active formulation powders/liquids.',
    },
    {
      subCategoryCode: 'SUB-INJ',
      subCategoryName: 'Parenterals & Injectables',
      categoryCode: 'CAT-FDF',
      description: 'Sterile vials and ampoules for intravenous or intramuscular injection.',
    },
    {
      subCategoryCode: 'SUB-SYN',
      subCategoryName: 'Synthetic APIs',
      categoryCode: 'CAT-API',
      description: 'Chemically synthesized active pharmaceutical ingredients.',
    },
    {
      subCategoryCode: 'SUB-BLIST',
      subCategoryName: 'Blister Foils (Alu-Alu / PVC)',
      categoryCode: 'CAT-PKG',
      description: 'Primary barrier packaging foils for tablets and capsules.',
    },
  ];

  const seededSubCategories: any[] = [];
  for (const psc of defaultSubCategories) {
    const { categoryCode, ...subCatData } = psc;
    const catId = categoryMapByCode[categoryCode];
    if (catId) {
      const dbSubCat = await prisma.productSubCategory.upsert({
        where: { subCategoryCode: subCatData.subCategoryCode },
        update: { ...subCatData, categoryId: catId },
        create: { ...subCatData, categoryId: catId },
      });
      seededSubCategories.push(dbSubCat);
      console.log(`  └─ Seeded ProductSubCategory: ${dbSubCat.subCategoryName} (${dbSubCat.subCategoryCode})`);
    }
  }

  const subCatMapByCode: Record<string, string> = Object.fromEntries(
    seededSubCategories.map((s) => [s.subCategoryCode, s.id])
  );

  const defaultProducts = [
    {
      productCode: 'PRD-TAB-PCM-500',
      name: 'Paracetamol 500mg Tablets BP/IP',
      categoryCode: 'CAT-FDF',
      subCategoryCode: 'SUB-TAB',
      uom: 'Strips (STP)',
      shelfLife: '36 Months',
      storageCondition: 'Store below 25°C in a dry place',
      standardCost: 18.50,
      hsnCode: '30049099',
      qcSpecification: 'QC-SPEC-TAB-PCM-01 | Dissolution > 80% in 30min, Assay 98.0%-102.0%',
    },
    {
      productCode: 'PRD-CAP-AMX-250',
      name: 'Amoxicillin 250mg Capsules USP',
      categoryCode: 'CAT-FDF',
      subCategoryCode: 'SUB-CAP',
      uom: 'Boxes (BOX)',
      shelfLife: '24 Months',
      storageCondition: 'Protect from light and moisture',
      standardCost: 45.00,
      hsnCode: '30041010',
      qcSpecification: 'QC-SPEC-CAP-AMX-02 | Moisture < 2.0%, Potency 95.0%-105.0%',
    },
    {
      productCode: 'PRD-INJ-CEF-1G',
      name: 'Ceftriaxone Sodium for Injection 1g Vial',
      categoryCode: 'CAT-FDF',
      subCategoryCode: 'SUB-INJ',
      uom: 'Vials (VIAL)',
      shelfLife: '24 Months',
      storageCondition: 'Store between 2°C - 8°C (Cold Storage / Refrigerate)',
      standardCost: 85.20,
      hsnCode: '30042010',
      qcSpecification: 'QC-SPEC-INJ-CEF-01 | Sterility test compliant, Bacterial endotoxins < 0.20 EU/mg',
    },
    {
      productCode: 'PRD-API-IBU-01',
      name: 'Ibuprofen API Micronized Powder',
      categoryCode: 'CAT-API',
      subCategoryCode: 'SUB-SYN',
      uom: 'Kilograms (KG)',
      shelfLife: '48 Months',
      storageCondition: 'Controlled Room Temperature (20°C - 25°C)',
      standardCost: 1250.00,
      hsnCode: '29163990',
      qcSpecification: 'QC-SPEC-API-IBU-01 | Particle size d90 < 20um, Purity >= 99.5%',
    },
  ];

  for (const prd of defaultProducts) {
    const { categoryCode, subCategoryCode, ...prdData } = prd;
    const catId = categoryMapByCode[categoryCode];
    const subCatId = subCategoryCode ? subCatMapByCode[subCategoryCode] : null;
    if (catId) {
      await prisma.product.upsert({
        where: { productCode: prdData.productCode },
        update: {
          ...prdData,
          categoryId: catId,
          subCategoryId: subCatId,
        },
        create: {
          ...prdData,
          categoryId: catId,
          subCategoryId: subCatId,
        },
      });
      console.log(`  └─ Seeded Product: ${prdData.name} (${prdData.productCode})`);
    }
  }

  // Seed UOM Master
  console.log('Seeding UOM Master...');
  const defaultUoms = [
    {
      uomCode: 'KG',
      uomName: 'Kilogram',
      conversionFactor: 1.0,
      description: 'Base metric unit of mass for chemical raw materials and bulk ingredients.',
    },
    {
      uomCode: 'GM',
      uomName: 'Gram',
      conversionFactor: 0.001,
      description: 'Metric mass unit equal to one-thousandth of a kilogram for precise weighing.',
    },
    {
      uomCode: 'MG',
      uomName: 'Milligram',
      conversionFactor: 0.000001,
      description: 'Active ingredient dosage unit for high-potency APIs and powders.',
    },
    {
      uomCode: 'LTR',
      uomName: 'Litre',
      conversionFactor: 1.0,
      description: 'Metric unit of volume for solvents, liquid preparations, and purifications.',
    },
    {
      uomCode: 'ML',
      uomName: 'Millilitre',
      conversionFactor: 0.001,
      description: 'Liquid volume unit for oral syrups, injectables, and drop solutions.',
    },
    {
      uomCode: 'TAB',
      uomName: 'Tablet',
      conversionFactor: 1.0,
      description: 'Solid unit dosage form for compressed tablets.',
    },
    {
      uomCode: 'CAP',
      uomName: 'Capsule',
      conversionFactor: 1.0,
      description: 'Unit dosage form for hard and soft gelatin capsules.',
    },
    {
      uomCode: 'STP',
      uomName: 'Strip',
      conversionFactor: 10.0,
      description: 'Standard blister strip packaging containing 10 or 15 units.',
    },
    {
      uomCode: 'BOX',
      uomName: 'Box',
      conversionFactor: 100.0,
      description: 'Secondary corrugated or mono-carton box packaging.',
    },
    {
      uomCode: 'VIAL',
      uomName: 'Vial',
      conversionFactor: 1.0,
      description: 'Glass vial unit for sterile injectable liquid and lyophilized powders.',
    },
    {
      uomCode: 'AMP',
      uomName: 'Ampoule',
      conversionFactor: 1.0,
      description: 'Hermetically sealed small glass ampoule for parenteral solutions.',
    },
    {
      uomCode: 'NOS',
      uomName: 'Numbers / Units',
      conversionFactor: 1.0,
      description: 'Count-based measurement for components, bottles, and discrete articles.',
    },
    {
      uomCode: 'PCK',
      uomName: 'Pack',
      conversionFactor: 1.0,
      description: 'Bundled presentation pack for retail and hospital pharmacy distribution.',
    },
  ];

  for (const u of defaultUoms) {
    await prisma.uom.upsert({
      where: { uomCode: u.uomCode },
      update: u,
      create: u,
    });
    console.log(`  └─ Seeded UOM: ${u.uomName} (${u.uomCode})`);
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
