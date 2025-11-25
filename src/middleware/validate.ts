import { Request, Response, NextFunction } from "express";
import Joi from "joi";

/**
 * Validation middleware factory
 * Validates request body or query against Joi schema
 */
const validate = (schema: Joi.ObjectSchema, property: "body" | "query" | "params" = "body") => {
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

        // For body, make sure the data is cleaned and set to request body
        if (property === "body") {
            req.body = value;
        }

        next();
    };
};

export default validate;
