import { jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import validate from "../../../src/middleware/validate.js";

describe("Middleware - Validate", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {},
            query: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any,
        };
        mockNext = jest.fn() as any;
    });

    describe("Body Validation", () => {
        it("should call next() when body data is valid", () => {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                name: Joi.string().required(),
            });

            mockRequest.body = {
                email: "test@example.com",
                name: "Test User",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it("should return 400 error when body data is invalid", () => {
            const schema = Joi.object({
                email: Joi.string().email().required(),
            });

            mockRequest.body = {
                email: "invalid-email",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Validation error",
                errors: expect.any(Array),
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should return all validation errors when abortEarly is false", () => {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                name: Joi.string().required(),
                age: Joi.number().required(),
            });

            mockRequest.body = {};

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            const jsonCall = (mockResponse.json as any).mock.calls[0][0];
            expect(jsonCall.errors.length).toBeGreaterThan(1);
        });

        it("should strip unknown properties from body", () => {
            const schema = Joi.object({
                email: Joi.string().email().required(),
            });

            mockRequest.body = {
                email: "test@example.com",
                unknownField: "should be removed",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockRequest.body).toEqual({
                email: "test@example.com",
            });
            expect(mockNext).toHaveBeenCalled();
        });

        it("should update request body with validated value", () => {
            const schema = Joi.object({
                email: Joi.string().email().lowercase().required(),
            });

            mockRequest.body = {
                email: "TEST@EXAMPLE.COM",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockRequest.body.email).toBe("test@example.com");
            expect(mockNext).toHaveBeenCalled();
        });

        it("should handle complex nested objects", () => {
            const schema = Joi.object({
                user: Joi.object({
                    email: Joi.string().email().required(),
                    profile: Joi.object({
                        name: Joi.string().required(),
                    }),
                }).required(),
            });

            mockRequest.body = {
                user: {
                    email: "test@example.com",
                    profile: {
                        name: "Test User",
                    },
                },
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it("should handle arrays in validation", () => {
            const schema = Joi.object({
                students: Joi.array().items(Joi.string().email()).required(),
            });

            mockRequest.body = {
                students: ["student1@example.com", "student2@example.com"],
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe("Query Validation", () => {
        it("should call next() when query data is valid", () => {
            const schema = Joi.object({
                teacher: Joi.string().email().required(),
            });

            mockRequest.query = {
                teacher: "teacher@example.com",
            };

            const middleware = validate(schema, "query");
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it("should return 400 error when query data is invalid", () => {
            const schema = Joi.object({
                teacher: Joi.string().email().required(),
            });

            mockRequest.query = {
                teacher: "invalid-email",
            };

            const middleware = validate(schema, "query");
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Validation error",
                errors: expect.any(Array),
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should validate query parameters", () => {
            const schema = Joi.object({
                page: Joi.number().integer().min(1),
                limit: Joi.number().integer().min(1).max(100),
            });

            mockRequest.query = {
                page: "1",
                limit: "10",
            };

            const middleware = validate(schema, "query");
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it("should handle missing required query parameters", () => {
            const schema = Joi.object({
                teacher: Joi.string().required(),
            });

            mockRequest.query = {};

            const middleware = validate(schema, "query");
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle array query parameters", () => {
            const schema = Joi.object({
                teacher: Joi.alternatives().try(
                    Joi.string(),
                    Joi.array().items(Joi.string())
                ),
            });

            mockRequest.query = {
                teacher: ["teacher1@example.com", "teacher2@example.com"],
            };

            const middleware = validate(schema, "query");
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe("Default Property", () => {
        it("should default to body validation when property not specified", () => {
            const schema = Joi.object({
                field: Joi.string().required(),
            });

            mockRequest.body = {
                field: "value",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe("Error Messages", () => {
        it("should include descriptive error messages", () => {
            const schema = Joi.object({
                email: Joi.string().email().required().messages({
                    "string.email": "Must be a valid email",
                    "any.required": "Email is required",
                }),
            });

            mockRequest.body = {};

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            const jsonCall = (mockResponse.json as any).mock.calls[0][0];
            expect(jsonCall.errors[0]).toContain("Email is required");
        });

        it("should return multiple error messages for multiple fields", () => {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required(),
            });

            mockRequest.body = {
                email: "invalid",
                password: "short",
            };

            const middleware = validate(schema);
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            const jsonCall = (mockResponse.json as any).mock.calls[0][0];
            expect(jsonCall.errors.length).toBe(2);
        });
    });
});
