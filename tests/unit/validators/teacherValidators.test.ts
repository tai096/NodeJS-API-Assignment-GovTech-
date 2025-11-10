import {
    registerStudentsValidation,
    getCommonStudentsValidation,
    suspendStudentValidation,
    retrieveForNotificationsValidation,
} from "../../../src/validators/teacherValidators.js";

describe("Validators - Teacher Validators", () => {
    describe("registerStudentsValidation", () => {
        it("should validate correct registration data", () => {
            const validData = {
                teacher: "teacher@example.com",
                students: ["student1@example.com", "student2@example.com"],
            };

            const { error, value } = registerStudentsValidation.validate(validData);

            expect(error).toBeUndefined();
            expect(value).toEqual({
                teacher: "teacher@example.com",
                students: ["student1@example.com", "student2@example.com"],
            });
        });

        it("should lowercase email addresses", () => {
            const data = {
                teacher: "TEACHER@EXAMPLE.COM",
                students: ["STUDENT@EXAMPLE.COM"],
            };

            const { error, value } = registerStudentsValidation.validate(data);

            expect(error).toBeUndefined();
            expect(value.teacher).toBe("teacher@example.com");
            expect(value.students).toEqual(["student@example.com"]);
        });

        it("should fail when teacher email is missing", () => {
            const invalidData = {
                students: ["student@example.com"],
            };

            const { error } = registerStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("Teacher email is required");
        });

        it("should fail when teacher email is invalid", () => {
            const invalidData = {
                teacher: "invalid-email",
                students: ["student@example.com"],
            };

            const { error } = registerStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("valid email address");
        });

        it("should fail when students array is empty", () => {
            const invalidData = {
                teacher: "teacher@example.com",
                students: [],
            };

            const { error } = registerStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("required value");
        });

        it("should fail when students array is missing", () => {
            const invalidData = {
                teacher: "teacher@example.com",
            };

            const { error } = registerStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("Students array is required");
        });

        it("should fail when any student email is invalid", () => {
            const invalidData = {
                teacher: "teacher@example.com",
                students: ["valid@example.com", "invalid-email"],
            };

            const { error } = registerStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
        });

        it("should accept single student", () => {
            const validData = {
                teacher: "teacher@example.com",
                students: ["student@example.com"],
            };

            const { error } = registerStudentsValidation.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe("getCommonStudentsValidation", () => {
        it("should validate single teacher email", () => {
            const validData = {
                teacher: "teacher@example.com",
            };

            const { error, value } = getCommonStudentsValidation.validate(validData);

            expect(error).toBeUndefined();
            expect(value.teacher).toBe("teacher@example.com");
        });

        it("should validate array of teacher emails", () => {
            const validData = {
                teacher: ["teacher1@example.com", "teacher2@example.com"],
            };

            const { error, value } = getCommonStudentsValidation.validate(validData);

            expect(error).toBeUndefined();
            expect(value.teacher).toEqual(["teacher1@example.com", "teacher2@example.com"]);
        });

        it("should lowercase teacher emails", () => {
            const data = {
                teacher: "TEACHER@EXAMPLE.COM",
            };

            const { error, value } = getCommonStudentsValidation.validate(data);

            expect(error).toBeUndefined();
            expect(value.teacher).toBe("teacher@example.com");
        });

        it("should fail when teacher is missing", () => {
            const invalidData = {};

            const { error } = getCommonStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("At least one teacher");
        });

        it("should fail for invalid email in array", () => {
            const invalidData = {
                teacher: ["valid@example.com", "invalid-email"],
            };

            const { error } = getCommonStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
        });

        it("should fail for empty teacher array", () => {
            const invalidData = {
                teacher: [],
            };

            const { error } = getCommonStudentsValidation.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe("suspendStudentValidation", () => {
        it("should validate correct student email", () => {
            const validData = {
                student: "student@example.com",
            };

            const { error, value } = suspendStudentValidation.validate(validData);

            expect(error).toBeUndefined();
            expect(value.student).toBe("student@example.com");
        });

        it("should lowercase student email", () => {
            const data = {
                student: "STUDENT@EXAMPLE.COM",
            };

            const { error, value } = suspendStudentValidation.validate(data);

            expect(error).toBeUndefined();
            expect(value.student).toBe("student@example.com");
        });

        it("should fail when student email is missing", () => {
            const invalidData = {};

            const { error } = suspendStudentValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("Student email is required");
        });

        it("should fail when student email is invalid", () => {
            const invalidData = {
                student: "invalid-email",
            };

            const { error } = suspendStudentValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("valid email address");
        });
    });

    describe("retrieveForNotificationsValidation", () => {
        it("should validate correct notification data", () => {
            const validData = {
                teacher: "teacher@example.com",
                notification: "Hello students!",
            };

            const { error, value } =
                retrieveForNotificationsValidation.validate(validData);

            expect(error).toBeUndefined();
            expect(value).toEqual({
                teacher: "teacher@example.com",
                notification: "Hello students!",
            });
        });

        it("should validate notification with mentions", () => {
            const validData = {
                teacher: "teacher@example.com",
                notification: "Hello @student@example.com",
            };

            const { error } = retrieveForNotificationsValidation.validate(validData);

            expect(error).toBeUndefined();
        });

        it("should lowercase teacher email", () => {
            const data = {
                teacher: "TEACHER@EXAMPLE.COM",
                notification: "Test",
            };

            const { error, value } =
                retrieveForNotificationsValidation.validate(data);

            expect(error).toBeUndefined();
            expect(value.teacher).toBe("teacher@example.com");
        });

        it("should fail when teacher email is missing", () => {
            const invalidData = {
                notification: "Hello students!",
            };

            const { error } = retrieveForNotificationsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("Teacher email is required");
        });

        it("should fail when notification is missing", () => {
            const invalidData = {
                teacher: "teacher@example.com",
            };

            const { error } = retrieveForNotificationsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("Notification text is required");
        });

        it("should fail when notification is empty string", () => {
            const invalidData = {
                teacher: "teacher@example.com",
                notification: "",
            };

            const { error } = retrieveForNotificationsValidation.validate(invalidData);

            expect(error).toBeDefined();
            expect(error?.details[0].message).toContain("not allowed to be empty");
        });

        it("should fail when teacher email is invalid", () => {
            const invalidData = {
                teacher: "invalid-email",
                notification: "Hello",
            };

            const { error } = retrieveForNotificationsValidation.validate(invalidData);

            expect(error).toBeDefined();
        });
    });
});
