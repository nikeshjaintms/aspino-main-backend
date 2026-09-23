const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/Aspino-GatePass/aspino-main-backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query(`
    SELECT id, name, action, module, application
    FROM permissions
    ORDER BY module, action, name
  `);
  console.log(`Total permissions in DB: ${res.rows.length}`);
  
  const byModule = {};
  for (const r of res.rows) {
    if (!byModule[r.module]) byModule[r.module] = [];
    byModule[r.module].push(`${r.action} (${r.name})`);
  }
  console.log(JSON.stringify(byModule, null, 2));

  const rolesRes = await pool.query(`
    SELECT r.id, r.name, r."displayName", COUNT(rp."permissionId") as perm_count
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp."roleId"
    GROUP BY r.id, r.name, r."displayName"
    ORDER BY r.name
  `);
  console.log('\n--- ROLES IN DB ---');
  console.table(rolesRes.rows);
}

check().finally(() => pool.end());
