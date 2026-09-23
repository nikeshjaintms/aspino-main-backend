const { PrismaService } = require('../dist/src/prisma/prisma.service');
const { CaslAbilityFactory } = require('../dist/src/casl/casl-ability.factory');
require('dotenv').config({ path: 'd:/Aspino-GatePass/aspino-main-backend/.env' });

const prisma = new PrismaService();

const MODULES_TO_TEST = [
  { module: 'users', action: 'read', endpoint: '/users' },
  { module: 'users', action: 'create', endpoint: '/users' },
  { module: 'roles', action: 'read', endpoint: '/roles' },
  { module: 'roles', action: 'update', endpoint: '/roles' },
  { module: 'permissions', action: 'read', endpoint: '/permissions' },
  { module: 'pass_category', action: 'read', endpoint: '/pass-category' },
  { module: 'pass_category', action: 'create', endpoint: '/pass-category' },
  { module: 'gatepass', action: 'read', endpoint: '/gate-pass' },
  { module: 'gatepass', action: 'create', endpoint: '/gate-pass' },
  { module: 'product_category', action: 'read', endpoint: '/product-category' },
  { module: 'product_sub_category', action: 'read', endpoint: '/product-sub-category' },
  { module: 'uom', action: 'read', endpoint: '/uom' },
  { module: 'product', action: 'read', endpoint: '/product' },
  { module: 'packing_material', action: 'read', endpoint: '/packing-material' },
  { module: 'qc_specification', action: 'read', endpoint: '/qc-specification' },
  { module: 'storage_location', action: 'read', endpoint: '/storage-location' },
  { module: 'bank', action: 'read', endpoint: '/bank' },
  { module: 'vendor', action: 'read', endpoint: '/vendor' },
  { module: 'customer', action: 'read', endpoint: '/customer' },
  { module: 'supplier', action: 'read', endpoint: '/supplier' },
  { module: 'audit', action: 'read', endpoint: '/audit/logs' },
  { module: 'vouchers', action: 'read', endpoint: '/vouchers' },
  { module: 'accounts', action: 'read', endpoint: '/accounts' },
  { module: 'customer_ledger', action: 'read', endpoint: '/customer-ledger' },
  { module: 'supplier_ledger', action: 'read', endpoint: '/supplier-ledger' },
  { module: 'financial_reports', action: 'read', endpoint: '/financial-reports' },
];

async function runTests() {
  console.log('========================================================');
  console.log('       ASPINO-GATEPASS PERMISSIONS VERIFICATION         ');
  console.log('========================================================\n');

  const factory = new CaslAbilityFactory(prisma);

  // Fetch all users with their roles
  const users = await prisma.user.findMany({
    include: {
      roleRelation: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  console.log(`Found ${users.length} users in database.\n`);

  for (const user of users) {
    const roleName = user.roleRelation?.name || user.role || 'UNKNOWN';
    const ability = await factory.createForUser(user.id);
    const payload = await factory.getUserPermissionsPayload(user.id);

    console.log(`--------------------------------------------------------`);
    console.log(`👤 User: ${user.email} | Role: ${roleName} (${user.roleRelation?.displayName || ''})`);
    console.log(`🔑 SuperAdmin: ${payload.isSuperAdmin} | Assigned Perms: ${payload.permissions.length}`);

    let passedCount = 0;
    let failedCount = 0;
    const results = [];

    for (const test of MODULES_TO_TEST) {
      const allowed = ability.can(test.action, test.module);
      const isExpectedSuperAdmin = payload.isSuperAdmin;
      
      results.push({
        Module: test.module,
        Action: test.action,
        Allowed: allowed ? '✅ YES' : '❌ NO',
      });

      if (allowed) passedCount++;
      else failedCount++;
    }

    console.table(results);
    console.log(`Summary: ${passedCount} Allowed | ${failedCount} Denied\n`);
  }
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
