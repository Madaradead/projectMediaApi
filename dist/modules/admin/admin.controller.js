import {} from 'express';
import { prisma } from "../../lib/prisma.js";
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                creatnmedAt: true,
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