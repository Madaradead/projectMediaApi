import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt  from 'bcrypt';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting database seeding...');

    const adminEmail = process.env.ADMIN_EMAIL || 'madaradead22@gmail.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'madaradead22_123';

    const userEmail = process.env.USER_EMAIL || 'pro100nekit1184@gmail.com';
    const userPass = process.env.USER_PASSWORD || 'user_password_234';

    console.log('Hashing passwords...');
    const adminHash = await bcrypt.hash(adminPass, 10);
    const userHash = await bcrypt.hash(userPass, 10);

    const admin = await prisma.user.upsert({
        where: {email: adminEmail},
        update: {
            passwordHash: adminHash,
        },
        create: {
            email: adminEmail,
            username: 'madara',
            passwordHash: adminHash,
            role: "ADMIN"
        }
    });
    console.log(`Administrator successfully seeded: ${admin.username} (${admin.email})`);

    const user = await prisma.user.upsert({
        where: {email: userEmail},
        update: {
            passwordHash: userHash,
        },
        create: {
            email: userEmail,
            username: 'nikita',
            passwordHash: userHash,
            role: "USER"
        }
    });
    console.log(`User successfully seeded: ${user.username} (${user.email})`);
}

main()
    .catch((e) => {
        console.error("Error during database seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });