import Joi from "joi";

/**
 * Validation schemas for teacher-student API
 */

// Reusable email schema
const emailValidation = Joi.string().email().lowercase();

// Reusable schemas with custom messages
const teacherEmailValidation = emailValidation.required().messages({
    "string.email": "Teacher must be a valid email address",
    "any.required": "Teacher email is required",
});

const studentEmailValidation = emailValidation.required().messages({
    "string.email": "Student must be a valid email address",
    "any.required": "Student email is required",
});

export const registerStudentsValidation = Joi.object({
    teacher: teacherEmailValidation,
    students: Joi.array().items(studentEmailValidation).min(1).required().messages({
        "array.min": "At least one student email is required",
        "any.required": "Students array is required",
        "string.email": "All students must be valid email addresses",
    }),
});

export const getCommonStudentsValidation = Joi.object({
    teacher: Joi.alternatives()
        .try(teacherEmailValidation, Joi.array().items(teacherEmailValidation).min(1))
        .required()
        .messages({
            "any.required": "At least one teacher email is required",
            "string.email": "Teacher must be a valid email address",
        }),
});

export const suspendStudentValidation = Joi.object({
    student: studentEmailValidation,
});

export const retrieveForNotificationsValidation = Joi.object({
    teacher: teacherEmailValidation,
    notification: Joi.string().min(1).required().messages({
        "any.required": "Notification text is required",
        "string.min": "Notification cannot be empty",
    }),
});
