const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/Aspino-GatePass/aspino-main-backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  const constraints = await pool.query(`
    SELECT conname, contype, conrelid::regclass AS table_name, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    WHERE conrelid::regclass::text IN ('permissions', 'roles', 'role_permissions', '"User"')
  `);
  console.log('Constraints:', constraints.rows);

  const indexes = await pool.query(`
    SELECT indexname, tablename, indexdef
    FROM pg_indexes
    WHERE tablename IN ('permissions', 'roles', 'role_permissions', 'User')
  `);
  console.log('Indexes:', indexes.rows);
}

inspect().catch(console.error).finally(() => pool.end());
