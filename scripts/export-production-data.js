const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'd:/Aspino-GatePass/aspino-main-backend/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function exportData() {
  console.log('Fetching roles...');
  const rolesRes = await pool.query('SELECT id, name, "displayName", description, "isSystem" FROM roles ORDER BY name');
  
  console.log('Fetching permissions...');
  const permsRes = await pool.query('SELECT id, name, action, module, application, description FROM permissions ORDER BY module, action, name');
  
  console.log('Fetching role_permissions...');
  const rpRes = await pool.query(`
    SELECT rp.id, rp."roleId", rp."permissionId", r.name as role_name, p.name as perm_name
    FROM role_permissions rp
    JOIN roles r ON rp."roleId" = r.id
    JOIN permissions p ON rp."permissionId" = p.id
    ORDER BY r.name, p.name
  `);
  
  console.log('Fetching users...');
  const usersRes = await pool.query('SELECT id, name, email, password, role, "roleId" FROM "User" ORDER BY email');

  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalRoles: rolesRes.rows.length,
      totalPermissions: permsRes.rows.length,
      totalRolePermissions: rpRes.rows.length,
      totalUsers: usersRes.rows.length,
    },
    roles: rolesRes.rows,
    permissions: permsRes.rows,
    rolePermissions: rpRes.rows.map(rp => ({
      roleName: rp.role_name,
      permissionName: rp.perm_name,
      roleId: rp.roleId,
      permissionId: rp.permissionId
    })),
    users: usersRes.rows
  };

  const gatepassOutPath = path.join('d:/Aspino-GatePass/aspino-main-backend/prisma', 'production-rbac-data.json');
  fs.writeFileSync(gatepassOutPath, JSON.stringify(exportPayload, null, 2), 'utf-8');
  console.log(`Saved export to ${gatepassOutPath}`);

  const hrmsPrismaDir = 'd:/Aspino-Hrms/nestjs-aspino-hrms/prisma';
  if (!fs.existsSync(hrmsPrismaDir)) {
    fs.mkdirSync(hrmsPrismaDir, { recursive: true });
  }
  const hrmsOutPath = path.join(hrmsPrismaDir, 'production-rbac-data.json');
  fs.writeFileSync(hrmsOutPath, JSON.stringify(exportPayload, null, 2), 'utf-8');
  console.log(`Saved export to ${hrmsOutPath}`);
}

exportData().catch(console.error).finally(() => pool.end());
