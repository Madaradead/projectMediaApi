import { type Request, type  Response, type NextFunction } from 'express'


export interface  CustomError  extends Error {
    status?: number;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    const statusCode = err.status || 500

    console.error(`[ERROR] ${statusCode} - ${err.message}`)

res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal error',
});

};