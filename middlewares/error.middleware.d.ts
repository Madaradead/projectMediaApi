import { type Request, type Response, type NextFunction } from 'express';
export interface CustomError extends Error {
    status?: number;
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map