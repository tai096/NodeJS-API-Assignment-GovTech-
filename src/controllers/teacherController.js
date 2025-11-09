import { Teacher, Student, Registration } from "../models/index.js";
import { sequelize } from "../config/index.js";
import { Op } from "sequelize";
import { isValidEmail, extractMentions } from "../utils/helpers.js";

/**
 * Register students to a teacher
 * POST /api/register
 */
const registerStudents = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { teacher, students } = req.body;

    // Validation
    if (!teacher || !students || !Array.isArray(students) || students.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Invalid request. Teacher email and student emails array are required.",
      });
    }

    // Validate email format
    if (!isValidEmail(teacher)) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid teacher email format." });
    }

    for (const studentEmail of students) {
      if (!emailRegex.test(studentEmail)) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Invalid student email format: ${studentEmail}`,
        });
      }
    }

    // Find or create teacher
    const [teacherRecord] = await Teacher.findOrCreate({
      where: { email: teacher },
      defaults: { email: teacher },
      transaction,
    });

    // Find or create students and register them
    for (const studentEmail of students) {
      const [studentRecord] = await Student.findOrCreate({
        where: { email: studentEmail },
        defaults: { email: studentEmail, isSuspended: false },
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
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error("Error in registerStudents:", error);
    res.status(500).json({ message: `An error occurred while registering students: ${error.message}` });
  }
};

/**
 * Get common students registered to all given teachers
 * GET /api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com
 */
const getCommonStudents = async (req, res) => {
  try {
    let { teacher } = req.query;

    // Handle single teacher or array of teachers
    if (!teacher) {
      return res.status(400).json({ message: "At least one teacher email is required." });
    }

    // Normalize to array
    const teacherEmails = Array.isArray(teacher) ? teacher : [teacher];

    if (teacherEmails.length === 0) {
      return res.status(400).json({ message: "At least one teacher email is required." });
    }

    // Validate email format
    for (const email of teacherEmails) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: `Invalid email format: ${email}` });
      }
    }

    // Find all teachers
    const teachers = await Teacher.findAll({
      where: { email: { [Op.in]: teacherEmails } },
    });

    if (teachers.length !== teacherEmails.length) {
      return res.status(404).json({ message: "One or more teachers not found." });
    }

    const teacherIds = teachers.map((t) => t.id);

    // Find students registered to ALL teachers
    const students = await Student.findAll({
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
    });

    const studentEmails = students.map((s) => s.email).sort();

    res.status(200).json({ students: studentEmails });
  } catch (error) {
    console.error("Error in getCommonStudents:", error);
    res.status(500).json({ message: "An error occurred while fetching common students." });
  }
};

/**
 * Suspend a student
 * POST /api/suspend
 */
const suspendStudent = async (req, res) => {
  try {
    const { student } = req.body;

    if (!student) {
      return res.status(400).json({ message: "Student email is required." });
    }

    // Validate email format
    if (!isValidEmail(student)) {
      return res.status(400).json({ message: "Invalid student email format." });
    }

    // Find student
    const studentRecord = await Student.findOne({ where: { email: student } });

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Suspend student
    studentRecord.isSuspended = true;
    await studentRecord.save();

    res.status(204).send();
  } catch (error) {
    console.error("Error in suspendStudent:", error);
    res.status(500).json({ message: "An error occurred while suspending the student." });
  }
};

/**
 * Retrieve students who can receive notifications
 * POST /api/retrievefornotifications
 */
const retrieveForNotifications = async (req, res) => {
  try {
    const { teacher, notification } = req.body;

    if (!teacher || !notification) {
      return res.status(400).json({
        message: "Teacher email and notification text are required.",
      });
    }

    // Validate email format
    if (!isValidEmail(teacher)) {
      return res.status(400).json({ message: "Invalid teacher email format." });
    }

    // Find teacher
    const teacherRecord = await Teacher.findOne({ where: { email: teacher } });

    // Extract mentioned students from notification
    const mentions = extractMentions(notification);

    const recipientEmails = new Set();

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

    const recipients = Array.from(recipientEmails).sort();

    res.status(200).json({ recipients });
  } catch (error) {
    console.error("Error in retrieveForNotifications:", error);
    res.status(500).json({
      message: "An error occurred while retrieving notification recipients.",
    });
  }
};

export { registerStudents, getCommonStudents, suspendStudent, retrieveForNotifications };
