import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = 'admin@aspino.com';
  const plainPassword = 'admin123';
  const role = 'ADMIN';
  const name = 'Admin User';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      role,
      name,
    },
  });

  console.log('Admin user created/updated:', user);

  await prisma.$disconnect();
  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
