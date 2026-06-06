import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const admin = await prisma.user.create({
        data: {
            email: 'madaradead22@gmail.com',
            username: 'madara',
            passwordHash: 'madara_hash_123',
            role: "ADMIN"

        }
    });
    const user = await prisma.user.create({
        data:{
            email:'pro100nekit1184@gmail.com',
            username:'nikita',
            passwordHash:'nikita_hash_12345',
            role:"USER"
        }
    });

    console.log('User has been created', user.username);

    console.log('Administrator has been created', admin.username);



}



main()
    .catch((e) => {
        console.error("Error creating user", e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });
