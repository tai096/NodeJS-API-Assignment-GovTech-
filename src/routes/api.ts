import express, { Router } from "express";
import {
    registerStudents,
    getCommonStudents,
    suspendStudent,
    retrieveForNotifications,
} from "../controllers/teacherController.js";
import validate from "../middleware/validate.js";
import {
    getCommonStudentsValidation,
    registerStudentsValidation,
    retrieveForNotificationsValidation,
    suspendStudentValidation,
} from "../validators/teacherValidators.js";

const router: Router = express.Router();

/**
 * @route   POST /api/register
 */
router.post("/register", validate(registerStudentsValidation), registerStudents);

/**
 * @route   GET /api/commonstudents
 */
router.get("/commonstudents", validate(getCommonStudentsValidation, "query"), getCommonStudents);

/**
 * @route   POST /api/suspend
 */
router.post("/suspend", validate(suspendStudentValidation), suspendStudent);

/**
 * @route   POST /api/retrievefornotifications
 */
router.post(
    "/retrievefornotifications",
    validate(retrieveForNotificationsValidation),
    retrieveForNotifications
);

export default router;
