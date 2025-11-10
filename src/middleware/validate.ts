import { Request, Response, NextFunction } from "express";
import Joi from "joi";

/**
 * Validation middleware factory
 * Validates request body or query against Joi schema
 */
const validate = (schema: Joi.ObjectSchema, property: "body" | "query" = "body") => {
    return (req: Request, res: Response, next: NextFunction): void | Response => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                message: "Validation error",
                errors,
            });
        }

        // For body, we can replace it. For query, we need to be more careful
        if (property === "body") {
            req.body = value;
        } else if (property === "query") {
            // For query params, just validate without replacing
            // The values are already parsed by Express
        }

        next();
    };
};

export default validate;
