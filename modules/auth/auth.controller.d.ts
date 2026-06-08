import { type Request, type Response } from "express";
import { type AuthRequest } from "../../middlewares/auth.middleware.js";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map