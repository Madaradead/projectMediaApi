import { type Request, type Response, type NextFunction } from 'express';
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
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map