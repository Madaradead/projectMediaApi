import { type Response } from "express";
import { type AuthRequest } from "../../middlewares/auth.middleware.js";
export declare const uploadMedia: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllMedia: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyMedia: (req: AuthRequest, res: Response) => Promise<void>;
export declare const streamFile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateMetadata: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteMedia: (req: AuthRequest, res: Response) => Promise<void>;
export declare const searchMedia: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=media.controller.d.ts.map