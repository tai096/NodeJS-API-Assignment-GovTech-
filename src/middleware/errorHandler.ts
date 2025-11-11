import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";

/**
 * Custom error interface for Sequelize errors
 */
interface CustomError extends Error {
    statusCode?: number;
    errors?: Array<{ message: string }>;
}

/**
 * Error handling middleware
 * Catches all errors and returns appropriate response
 */
export const errorHandler = (
    err: CustomError | HttpError,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    console.error("Error:", err);

    // Handle http-errors (from service layer)
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Handle Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            message: "Validation error",
            errors: (err as CustomError).errors?.map((e: { message: string }) => e.message) || [],
        });
    }

    // Handle Sequelize unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            message: "Resource already exists",
        });
    }

    // Handle Sequelize database errors
    if (err.name === "SequelizeDatabaseError") {
        return res.status(500).json({
            message: "Database error occurred",
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    return res.status(statusCode).json({ message });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
    return res.status(404).json({
        message: `Route ${req.method} ${req.url} not found`,
    });
};
