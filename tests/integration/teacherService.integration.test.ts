import { jest } from "@jest/globals";
import teacherService from "../../src/services/teacherService.js";
import { Teacher, Student, Registration } from "../../src/models/index.js";
import { sequelize } from "../../src/config/index.js";

describe("Integration Tests - Teacher Service", () => {
    // Clean up database before each test
    beforeEach(async () => {
        await Registration.destroy({ where: {}, force: true });
        await Student.destroy({ where: {}, force: true });
        await Teacher.destroy({ where: {}, force: true });
    });

    // Close database connection after all tests
    afterAll(async () => {
        await sequelize.close();
    });

    describe("registerStudents", () => {
        it("should register students to a teacher", async () => {
            const teacherEmail = "teacher@example.com";
            const studentEmails = ["student1@example.com", "student2@example.com"];

            await teacherService.registerStudents(teacherEmail, studentEmails);

            // Verify teacher was created
            const teacher = await Teacher.findOne({ where: { email: teacherEmail } });
            expect(teacher).toBeDefined();
            expect(teacher?.email).toBe(teacherEmail);

            // Verify students were created
            const students = await Student.findAll({
                where: { email: studentEmails },
            });
            expect(students).toHaveLength(2);

            // Verify registrations were created
            const registrations = await Registration.findAll({
                where: { teacherId: teacher?.id },
            });
            expect(registrations).toHaveLength(2);
        });

        it("should not create duplicate registrations", async () => {
            const teacherEmail = "teacher@example.com";
            const studentEmails = ["student@example.com"];

            // Register once
            await teacherService.registerStudents(teacherEmail, studentEmails);

            // Register again with same data
            await teacherService.registerStudents(teacherEmail, studentEmails);

            // Should still have only 1 registration
            const teacher = await Teacher.findOne({ where: { email: teacherEmail } });
            const registrations = await Registration.findAll({
                where: { teacherId: teacher?.id },
            });
            expect(registrations).toHaveLength(1);
        });

        it("should handle uppercase emails by converting to lowercase", async () => {
            const teacherEmail = "Teacher@Example.COM";
            const studentEmails = ["Student@Example.COM"];

            await teacherService.registerStudents(teacherEmail, studentEmails);

            const teacher = await Teacher.findOne({ where: { email: "teacher@example.com" } });
            const student = await Student.findOne({ where: { email: "student@example.com" } });

            expect(teacher).toBeDefined();
            expect(student).toBeDefined();
        });

        it("should register multiple students in single transaction", async () => {
            const teacherEmail = "teacher@example.com";
            const studentEmails = [
                "student1@example.com",
                "student2@example.com",
                "student3@example.com",
            ];

            await teacherService.registerStudents(teacherEmail, studentEmails);

            const teacher = await Teacher.findOne({ where: { email: teacherEmail } });
            const registrations = await Registration.findAll({
                where: { teacherId: teacher?.id },
            });

            expect(registrations).toHaveLength(3);
        });

        it("should create new teacher if not exists", async () => {
            const teacherEmail = "newteacher@example.com";
            const studentEmails = ["student@example.com"];

            const countBefore = await Teacher.count();

            await teacherService.registerStudents(teacherEmail, studentEmails);

            const countAfter = await Teacher.count();
            expect(countAfter).toBe(countBefore + 1);
        });

        it("should create new students if not exist", async () => {
            const teacherEmail = "teacher@example.com";
            const studentEmails = ["newstudent1@example.com", "newstudent2@example.com"];

            const countBefore = await Student.count();

            await teacherService.registerStudents(teacherEmail, studentEmails);

            const countAfter = await Student.count();
            expect(countAfter).toBe(countBefore + 2);
        });

        it("should reuse existing teacher", async () => {
            const teacherEmail = "teacher@example.com";

            // Create teacher first
            await Teacher.create({ email: teacherEmail });

            const countBefore = await Teacher.count();

            await teacherService.registerStudents(teacherEmail, ["student@example.com"]);

            const countAfter = await Teacher.count();
            expect(countAfter).toBe(countBefore); // No new teacher created
        });
    });

    describe("getCommonStudents", () => {
        beforeEach(async () => {
            // Setup test data
            const teacher1 = await Teacher.create({ email: "teacher1@example.com" });
            const teacher2 = await Teacher.create({ email: "teacher2@example.com" });

            const student1 = await Student.create({
                email: "student1@example.com",
                isSuspended: false,
            });
            const student2 = await Student.create({
                email: "student2@example.com",
                isSuspended: false,
            });
            const student3 = await Student.create({
                email: "student3@example.com",
                isSuspended: false,
            });

            // student1 is registered to both teachers (common)
            await Registration.create({ teacherId: teacher1.id, studentId: student1.id });
            await Registration.create({ teacherId: teacher2.id, studentId: student1.id });

            // student2 is only registered to teacher1
            await Registration.create({ teacherId: teacher1.id, studentId: student2.id });

            // student3 is only registered to teacher2
            await Registration.create({ teacherId: teacher2.id, studentId: student3.id });
        });

        it("should return students common to all teachers", async () => {
            const result = await teacherService.getCommonStudents([
                "teacher1@example.com",
                "teacher2@example.com",
            ]);

            expect(result).toEqual(["student1@example.com"]);
        });

        it("should return all students for single teacher", async () => {
            const result = await teacherService.getCommonStudents("teacher1@example.com");

            expect(result).toHaveLength(2);
            expect(result).toContain("student1@example.com");
            expect(result).toContain("student2@example.com");
        });

        it("should return sorted results", async () => {
            const result = await teacherService.getCommonStudents("teacher1@example.com");

            expect(result[0]).toBe("student1@example.com");
            expect(result[1]).toBe("student2@example.com");
        });

        it("should throw error if teacher not found", async () => {
            await expect(
                teacherService.getCommonStudents("nonexistent@example.com")
            ).rejects.toThrow("Teachers not found: nonexistent@example.com");
        });

        it("should throw error if any teacher in list not found", async () => {
            await expect(
                teacherService.getCommonStudents([
                    "teacher1@example.com",
                    "nonexistent@example.com",
                ])
            ).rejects.toThrow("Teachers not found: nonexistent@example.com");
        });

        it("should handle empty result when no common students", async () => {
            const teacher3 = await Teacher.create({ email: "teacher3@example.com" });
            const student4 = await Student.create({
                email: "student4@example.com",
                isSuspended: false,
            });
            await Registration.create({ teacherId: teacher3.id, studentId: student4.id });

            const result = await teacherService.getCommonStudents([
                "teacher1@example.com",
                "teacher3@example.com",
            ]);

            expect(result).toEqual([]);
        });

        it("should handle case-insensitive teacher emails", async () => {
            const result = await teacherService.getCommonStudents("Teacher1@Example.COM");

            expect(result).toHaveLength(2);
        });

        it("should accept string or array parameter", async () => {
            const result1 = await teacherService.getCommonStudents("teacher1@example.com");
            const result2 = await teacherService.getCommonStudents(["teacher1@example.com"]);

            expect(result1).toEqual(result2);
        });
    });

    describe("suspendStudent", () => {
        beforeEach(async () => {
            await Student.create({ email: "student@example.com", isSuspended: false });
        });

        it("should suspend a student", async () => {
            await teacherService.suspendStudent("student@example.com");

            const student = await Student.findOne({ where: { email: "student@example.com" } });
            expect(student?.isSuspended).toBe(true);
        });

        it("should throw error if student not found", async () => {
            await expect(
                teacherService.suspendStudent("nonexistent@example.com")
            ).rejects.toThrow("Student not found");
        });

        it("should handle case-insensitive email", async () => {
            await teacherService.suspendStudent("Student@Example.COM");

            const student = await Student.findOne({ where: { email: "student@example.com" } });
            expect(student?.isSuspended).toBe(true);
        });

        it("should persist suspension to database", async () => {
            await teacherService.suspendStudent("student@example.com");

            // Query again to verify it was saved
            const student = await Student.findOne({
                where: { email: "student@example.com" },
                raw: true,
            });
            // MySQL returns 1 for true, 0 for false when using raw: true
            expect(student?.isSuspended).toBeTruthy();
        });

        it("should allow suspending already suspended student", async () => {
            // Suspend once
            await teacherService.suspendStudent("student@example.com");

            // Suspend again (should not error)
            await teacherService.suspendStudent("student@example.com");

            const student = await Student.findOne({ where: { email: "student@example.com" } });
            expect(student?.isSuspended).toBe(true);
        });
    });

    describe("retrieveForNotifications", () => {
        beforeEach(async () => {
            const teacher = await Teacher.create({ email: "teacher@example.com" });

            // Create registered students
            const student1 = await Student.create({
                email: "registered1@example.com",
                isSuspended: false,
            });
            const student2 = await Student.create({
                email: "registered2@example.com",
                isSuspended: false,
            });
            const suspendedStudent = await Student.create({
                email: "suspended@example.com",
                isSuspended: true,
            });

            // Create unregistered student for mentions
            await Student.create({ email: "mentioned@example.com", isSuspended: false });

            // Register students to teacher
            await Registration.create({ teacherId: teacher.id, studentId: student1.id });
            await Registration.create({ teacherId: teacher.id, studentId: student2.id });
            await Registration.create({ teacherId: teacher.id, studentId: suspendedStudent.id });
        });

        it("should return registered non-suspended students", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello students!"
            );

            expect(result).toHaveLength(2);
            expect(result).toContain("registered1@example.com");
            expect(result).toContain("registered2@example.com");
            expect(result).not.toContain("suspended@example.com");
        });

        it("should include mentioned students", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @mentioned@example.com"
            );

            expect(result).toContain("mentioned@example.com");
        });

        it("should not include suspended students even if mentioned", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @suspended@example.com"
            );

            expect(result).not.toContain("suspended@example.com");
        });

        it("should not duplicate students", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @registered1@example.com"
            );

            const count = result.filter((email) => email === "registered1@example.com").length;
            expect(count).toBe(1);
        });

        it("should return sorted results", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @mentioned@example.com"
            );

            expect(result).toEqual([...result].sort());
        });

        it("should return empty array if teacher not found and no mentions", async () => {
            const result = await teacherService.retrieveForNotifications(
                "nonexistent@example.com",
                "Hello students!"
            );

            expect(result).toEqual([]);
        });

        it("should return mentioned students even if teacher not found", async () => {
            const result = await teacherService.retrieveForNotifications(
                "nonexistent@example.com",
                "Hello @mentioned@example.com"
            );

            expect(result).toEqual(["mentioned@example.com"]);
        });

        it("should handle case-insensitive teacher email", async () => {
            const result = await teacherService.retrieveForNotifications(
                "Teacher@Example.COM",
                "Hello"
            );

            expect(result).toHaveLength(2);
        });

        it("should handle multiple mentions", async () => {
            await Student.create({ email: "mentioned2@example.com", isSuspended: false });

            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @mentioned@example.com and @mentioned2@example.com"
            );

            expect(result).toContain("mentioned@example.com");
            expect(result).toContain("mentioned2@example.com");
        });

        it("should exclude mentioned students that do not exist in database", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @nonexistent@example.com"
            );

            expect(result).not.toContain("nonexistent@example.com");
        });

        it("should combine registered and mentioned students", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello @mentioned@example.com"
            );

            expect(result).toHaveLength(3); // 2 registered + 1 mentioned
            expect(result).toContain("registered1@example.com");
            expect(result).toContain("registered2@example.com");
            expect(result).toContain("mentioned@example.com");
        });

        it("should handle notification with no mentions", async () => {
            const result = await teacherService.retrieveForNotifications(
                "teacher@example.com",
                "Hello everyone, no mentions here!"
            );

            expect(result).toHaveLength(2); // Only registered students
        });
    });
});
