import { type Response, type NextFunction } from "express";
import { type AuthRequest } from "./auth.middleware.js";
export declare const roleMiddleware: (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map