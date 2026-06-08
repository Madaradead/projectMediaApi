import {} from 'express';
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            }
        });
        res.status(200).json(users);
    }
    catch (err) {
        console.error("Admin get users error", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//# sourceMappingURL=admin.controller.js.map