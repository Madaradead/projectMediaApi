import {} from 'express';
import jwt from 'jsonwebtoken';
import { Env } from "../config/env.js";
export const authMiddleware = (req, res, next) => {
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
        const secret = Env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        if (!decoded ||
            typeof decoded !== 'object' ||
            typeof decoded.userId !== 'string' ||
            !['USER', 'ADMIN'].includes(decoded.role)) {
            res.status(401).json({ message: 'Not authorized: Invalid token structure' });
            return;
        }
        const verifiedPayload = decoded;
        req.user = {
            userId: verifiedPayload.userId,
            role: verifiedPayload.role,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Not authorized' });
    }
};
//# sourceMappingURL=auth.middleware.js.map