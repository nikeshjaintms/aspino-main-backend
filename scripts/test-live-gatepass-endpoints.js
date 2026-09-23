const { PrismaService } = require('../dist/src/prisma/prisma.service');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'd:/Aspino-GatePass/aspino-main-backend/.env' });

const prisma = new PrismaService();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
const BASE_URL = 'http://localhost:5001';

const ENDPOINTS_TO_TEST = [
  { name: 'Users List', path: '/users', method: 'GET', requiredSubject: 'users', action: 'read' },
  { name: 'Roles List', path: '/roles', method: 'GET', requiredSubject: 'roles', action: 'read' },
  { name: 'Permissions List', path: '/permissions', method: 'GET', requiredSubject: 'permissions', action: 'read' },
  { name: 'Pass Categories', path: '/pass-category', method: 'GET', requiredSubject: 'pass_category', action: 'read' },
  { name: 'Gate Passes', path: '/gate-pass', method: 'GET', requiredSubject: 'gatepass', action: 'read' },
  { name: 'Product Categories', path: '/product-category', method: 'GET', requiredSubject: 'product_category', action: 'read' },
  { name: 'Product Sub-Categories', path: '/product-sub-category', method: 'GET', requiredSubject: 'product_sub_category', action: 'read' },
  { name: 'UOM Master', path: '/uom', method: 'GET', requiredSubject: 'uom', action: 'read' },
  { name: 'Product Master', path: '/product', method: 'GET', requiredSubject: 'product', action: 'read' },
  { name: 'Packing Materials', path: '/packing-material', method: 'GET', requiredSubject: 'packing_material', action: 'read' },
  { name: 'QC Specifications', path: '/qc-specification', method: 'GET', requiredSubject: 'qc_specification', action: 'read' },
  { name: 'Storage Locations', path: '/storage-location', method: 'GET', requiredSubject: 'storage_location', action: 'read' },
  { name: 'Bank Master', path: '/bank', method: 'GET', requiredSubject: 'bank', action: 'read' },
  { name: 'Vendor Master', path: '/vendor', method: 'GET', requiredSubject: 'vendor', action: 'read' },
  { name: 'Customer Master', path: '/customer', method: 'GET', requiredSubject: 'customer', action: 'read' },
  { name: 'Suppliers Master', path: '/supplier', method: 'GET', requiredSubject: 'supplier', action: 'read' },
  { name: 'Audit Logs', path: '/audit/logs', method: 'GET', requiredSubject: 'audit', action: 'read' },
];

function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.roleRelation?.name || user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function testRoleEndpoints(user, roleLabel) {
  const token = generateToken(user);
  console.log(`\n======================================================`);
  console.log(`  TESTING LIVE HTTP APIS FOR: ${roleLabel} (${user.email})`);
  console.log(`======================================================`);

  const results = [];

  for (const ep of ENDPOINTS_TO_TEST) {
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let statusIcon = '❓';
      if (res.status === 200 || res.status === 201) {
        statusIcon = '✅ 200 OK';
      } else if (res.status === 403) {
        statusIcon = '🚫 403 FORBIDDEN';
      } else {
        statusIcon = `⚠️ ${res.status}`;
      }

      results.push({
        Feature: ep.name,
        Endpoint: ep.path,
        Status: statusIcon,
      });
    } catch (e) {
      results.push({
        Feature: ep.name,
        Endpoint: ep.path,
        Status: `💥 ERR: ${e.message}`,
      });
    }
  }

  console.table(results);
}

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    include: { roleRelation: true },
  });

  const testCoordinator = await prisma.user.findFirst({
    where: { email: 'test.coordinator@aspino.com' },
    include: { roleRelation: true },
  });

  if (superAdmin) {
    await testRoleEndpoints(superAdmin, 'SUPER_ADMIN');
  } else {
    console.log('No SuperAdmin user found');
  }

  if (testCoordinator) {
    await testRoleEndpoints(testCoordinator, 'TEST_COORDINATOR');
  } else {
    console.log('No TestCoordinator user found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
