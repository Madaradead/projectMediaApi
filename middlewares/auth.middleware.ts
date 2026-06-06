import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Not authorized' });
            return; // Обязательно выходим из функции
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized' });
    }
};