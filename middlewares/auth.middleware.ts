import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Env } from "../config/env.js";

export interface JWTPayload {
    userId: string;
    role: 'USER' | 'ADMIN';
}

declare global {
    namespace Express {
        interface Request {
            user: JWTPayload;
        }
    }
}

export type AuthRequest = Request;

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const secret = Env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret);

        if (
            !decoded ||
            typeof decoded !== 'object' ||
            typeof (decoded as any).userId !== 'string' ||
            !['USER', 'ADMIN'].includes((decoded as any).role)
        ) {
            res.status(401).json({ message: 'Not authorized: Invalid token structure' });
            return;
        }

        const verifiedPayload = decoded as JWTPayload;

        req.user = {
            userId: verifiedPayload.userId,
            role: verifiedPayload.role,
        };

        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized' });
    }
};