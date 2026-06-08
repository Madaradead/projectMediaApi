import {} from 'express';
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    console.error(`[ERROR] ${statusCode} - ${err.message}`);
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal error',
    });
};
//# sourceMappingURL=error.middleware.js.map