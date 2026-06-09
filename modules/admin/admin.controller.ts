import {type Request,type  Response} from 'express';
import {prisma} from "../../lib/prisma.js";




export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
try{
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
catch(err){
    console.error("Admin get users error", err);
    res.status(500).json({error: "Internal Server Error"});
}

}
