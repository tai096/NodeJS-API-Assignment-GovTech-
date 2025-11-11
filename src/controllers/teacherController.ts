import { Request, Response, NextFunction } from "express";
import teacherService from "../services/teacherService.js";

/**
 * Teacher Controller
 * Handles HTTP requests and delegates business logic to service layer
 */

/**
 * Register students to a teacher
 * POST /api/register
 */
export const registerStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { teacher, students } = req.body;
        await teacherService.registerStudents(teacher, students);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Get common students registered to all given teachers
 * GET /api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com
 */
export const getCommonStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { teacher } = req.query;
        const students = await teacherService.getCommonStudents(teacher as string | string[]);
        res.status(200).json({ students });
    } catch (error) {
        next(error);
    }
};

/**
 * Suspend a student
 * POST /api/suspend
 */
export const suspendStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { student } = req.body;
        await teacherService.suspendStudent(student);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieve students who can receive notifications
 * POST /api/retrievefornotifications
 */
export const retrieveForNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { teacher, notification } = req.body;
        const recipients = await teacherService.retrieveForNotifications(teacher, notification);
        res.status(200).json({ recipients });
    } catch (error) {
        next(error);
    }
};
