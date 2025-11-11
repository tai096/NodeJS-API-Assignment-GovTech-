import { Teacher, Student, Registration } from "../models/index.js";
import { sequelize } from "../config/index.js";
import { Op, Transaction } from "sequelize";
import { extractMentions } from "../utils/helpers.js";
import createError from "http-errors";

/**
 * Teacher Service Layer
 * Contains all business logic for teacher-student operations
 */
class TeacherService {
    /**
     * Register students to a teacher
     */
    async registerStudents(teacherEmail: string, studentEmails: string[]): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            // Find or create teacher
            const [teacherRecord] = await Teacher.findOrCreate({
                where: { email: teacherEmail.toLowerCase() },
                defaults: { email: teacherEmail.toLowerCase() },
                transaction,
            });

            // Find or create students and register them
            for (const studentEmail of studentEmails) {
                const [studentRecord] = await Student.findOrCreate({
                    where: { email: studentEmail.toLowerCase() },
                    defaults: { email: studentEmail.toLowerCase(), isSuspended: false },
                    transaction,
                });

                // Create registration (ignore if already exists)
                await Registration.findOrCreate({
                    where: {
                        teacherId: teacherRecord.id,
                        studentId: studentRecord.id,
                    },
                    defaults: {
                        teacherId: teacherRecord.id,
                        studentId: studentRecord.id,
                    },
                    transaction,
                });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get students common to all given teachers
     */
    async getCommonStudents(teacherEmails: string | string[]): Promise<string[]> {
        // Normalize to array and lowercase
        const emails = (Array.isArray(teacherEmails) ? teacherEmails : [teacherEmails]).map((e) =>
            e.toLowerCase()
        );

        // Find all teachers
        const teachers = await Teacher.findAll({
            where: { email: { [Op.in]: emails } },
        });

        if (teachers.length !== emails.length) {
            const foundEmails = teachers.map((t) => t.email);
            const notFound = emails.filter((e) => !foundEmails.includes(e));
            throw createError(404, `Teachers not found: ${notFound.join(", ")}`);
        }

        const teacherIds = teachers.map((t) => t.id);

        // Find students registered to ALL teachers
        const students = (await Student.findAll({
            include: [
                {
                    model: Registration,
                    as: "registrations",
                    where: { teacherId: { [Op.in]: teacherIds } },
                    attributes: [],
                },
            ],
            attributes: ["email"],
            group: ["Student.id", "Student.email"],
            having: sequelize.literal(`COUNT(DISTINCT registrations.teacher_id) = ${teacherIds.length}`),
            raw: true,
        })) as unknown as { email: string }[];

        return students.map((s) => s.email).sort();
    }

    /**
     * Suspend a student
     */
    async suspendStudent(studentEmail: string): Promise<void> {
        const studentRecord = await Student.findOne({
            where: { email: studentEmail.toLowerCase() },
        });

        if (!studentRecord) {
            throw createError(404, "Student not found");
        }

        studentRecord.isSuspended = true;
        await studentRecord.save();
    }

    /**
     * Retrieve students who can receive notifications
     */
    async retrieveForNotifications(
        teacherEmail: string,
        notificationText: string
    ): Promise<string[]> {
        const recipientEmails = new Set<string>();

        // Find teacher
        const teacherRecord = await Teacher.findOne({
            where: { email: teacherEmail.toLowerCase() },
        });

        // Get registered students (non-suspended)
        if (teacherRecord) {
            const registeredStudents = await Student.findAll({
                include: [
                    {
                        model: Registration,
                        as: "registrations",
                        where: { teacherId: teacherRecord.id },
                        attributes: [],
                    },
                ],
                where: { isSuspended: false },
                attributes: ["email"],
            });

            registeredStudents.forEach((student) => {
                recipientEmails.add(student.email);
            });
        }

        // Extract mentioned students from notification
        const mentions = extractMentions(notificationText).map((e) => e.toLowerCase());

        // Get mentioned students (non-suspended)
        if (mentions.length > 0) {
            const mentionedStudents = await Student.findAll({
                where: {
                    email: { [Op.in]: mentions },
                    isSuspended: false,
                },
                attributes: ["email"],
            });

            mentionedStudents.forEach((student) => {
                recipientEmails.add(student.email);
            });
        }

        return Array.from(recipientEmails).sort();
    }
}

export default new TeacherService();
