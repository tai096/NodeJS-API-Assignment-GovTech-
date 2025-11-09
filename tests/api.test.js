import request from "supertest";
import app from "../src/app.js";
import { sequelize, createDatabaseIfNotExists } from "../src/config/index.js";
import { Teacher, Student, Registration } from "../src/models/index.js";

describe("Teacher-Student API Tests", () => {
  beforeAll(async () => {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();

    // Sync database for tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await Registration.destroy({ where: {}, force: true });
    await Student.destroy({ where: {}, force: true });
    await Teacher.destroy({ where: {}, force: true });
  });

  describe("POST /api/register", () => {
    test("should register students to a teacher successfully", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          teacher: "teacherken@gmail.com",
          students: ["studentjon@gmail.com", "studenthon@gmail.com"],
        })
        .expect(204);

      // Verify registration in database
      const teacher = await Teacher.findOne({ where: { email: "teacherken@gmail.com" } });
      expect(teacher).not.toBeNull();

      const students = await Student.findAll({
        where: { email: ["studentjon@gmail.com", "studenthon@gmail.com"] },
      });
      expect(students.length).toBe(2);

      const registrations = await Registration.findAll({
        where: { teacherId: teacher.id },
      });
      expect(registrations.length).toBe(2);
    });

    test("should handle duplicate registrations", async () => {
      // First registration
      await request(app)
        .post("/api/register")
        .send({
          teacher: "teacherken@gmail.com",
          students: ["studentjon@gmail.com"],
        })
        .expect(204);

      // Duplicate registration
      await request(app)
        .post("/api/register")
        .send({
          teacher: "teacherken@gmail.com",
          students: ["studentjon@gmail.com"],
        })
        .expect(204);

      // Should still have only one registration
      const teacher = await Teacher.findOne({ where: { email: "teacherken@gmail.com" } });
      const registrations = await Registration.findAll({
        where: { teacherId: teacher.id },
      });
      expect(registrations.length).toBe(1);
    });

    test("should return 400 for missing teacher", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          students: ["studentjon@gmail.com"],
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should return 400 for missing students", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          teacher: "teacherken@gmail.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          teacher: "invalid-email",
          students: ["studentjon@gmail.com"],
        })
        .expect(400);

      expect(response.body.message).toContain("email");
    });
  });

  describe("GET /api/commonstudents", () => {
    beforeEach(async () => {
      // Setup test data
      const teacher1 = await Teacher.create({ email: "teacherken@gmail.com" });
      const teacher2 = await Teacher.create({ email: "teacherjoe@gmail.com" });

      const student1 = await Student.create({ email: "commonstudent1@gmail.com" });
      const student2 = await Student.create({ email: "commonstudent2@gmail.com" });
      const student3 = await Student.create({ email: "student_only_under_teacher_ken@gmail.com" });

      // Register students
      await Registration.create({ teacherId: teacher1.id, studentId: student1.id });
      await Registration.create({ teacherId: teacher1.id, studentId: student2.id });
      await Registration.create({ teacherId: teacher1.id, studentId: student3.id });
      await Registration.create({ teacherId: teacher2.id, studentId: student1.id });
      await Registration.create({ teacherId: teacher2.id, studentId: student2.id });
    });

    test("should return students for a single teacher", async () => {
      const response = await request(app).get("/api/commonstudents?teacher=teacherken%40gmail.com").expect(200);

      expect(response.body.students).toEqual(
        expect.arrayContaining([
          "commonstudent1@gmail.com",
          "commonstudent2@gmail.com",
          "student_only_under_teacher_ken@gmail.com",
        ])
      );
      expect(response.body.students.length).toBe(3);
    });

    test("should return common students for multiple teachers", async () => {
      const response = await request(app)
        .get("/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com")
        .expect(200);

      expect(response.body.students).toEqual(expect.arrayContaining(["commonstudent1@gmail.com", "commonstudent2@gmail.com"]));
      expect(response.body.students.length).toBe(2);
    });

    test("should return 400 for missing teacher parameter", async () => {
      const response = await request(app).get("/api/commonstudents").expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should return 404 for non-existent teacher", async () => {
      const response = await request(app).get("/api/commonstudents?teacher=nonexistent%40gmail.com").expect(404);

      expect(response.body.message).toContain("not found");
    });
  });

  describe("POST /api/suspend", () => {
    beforeEach(async () => {
      await Student.create({ email: "studentmary@gmail.com", isSuspended: false });
    });

    test("should suspend a student successfully", async () => {
      await request(app)
        .post("/api/suspend")
        .send({
          student: "studentmary@gmail.com",
        })
        .expect(204);

      const student = await Student.findOne({ where: { email: "studentmary@gmail.com" } });
      expect(student.isSuspended).toBe(true);
    });

    test("should return 400 for missing student", async () => {
      const response = await request(app).post("/api/suspend").send({}).expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should return 404 for non-existent student", async () => {
      const response = await request(app)
        .post("/api/suspend")
        .send({
          student: "nonexistent@gmail.com",
        })
        .expect(404);

      expect(response.body.message).toContain("not found");
    });

    test("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/suspend")
        .send({
          student: "invalid-email",
        })
        .expect(400);

      expect(response.body.message).toContain("email");
    });
  });

  describe("POST /api/retrievefornotifications", () => {
    beforeEach(async () => {
      const teacher = await Teacher.create({ email: "teacherken@gmail.com" });

      const student1 = await Student.create({ email: "studentbob@gmail.com", isSuspended: false });
      const student2 = await Student.create({ email: "studentagnes@gmail.com", isSuspended: false });
      const student3 = await Student.create({ email: "studentmiche@gmail.com", isSuspended: false });
      const student4 = await Student.create({ email: "suspendedstudent@gmail.com", isSuspended: true });

      await Registration.create({ teacherId: teacher.id, studentId: student1.id });
      await Registration.create({ teacherId: teacher.id, studentId: student4.id });
    });

    test("should return registered students and mentioned students", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
          notification: "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com",
        })
        .expect(200);

      expect(response.body.recipients).toEqual(
        expect.arrayContaining(["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"])
      );
      expect(response.body.recipients.length).toBe(3);
    });

    test("should return only registered students when no mentions", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
          notification: "Hey everybody",
        })
        .expect(200);

      expect(response.body.recipients).toEqual(["studentbob@gmail.com"]);
    });

    test("should exclude suspended students", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
          notification: "Hello @suspendedstudent@gmail.com",
        })
        .expect(200);

      expect(response.body.recipients).toEqual(["studentbob@gmail.com"]);
      expect(response.body.recipients).not.toContain("suspendedstudent@gmail.com");
    });

    test("should not include mentioned students not in database", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
          notification: "Hello @newstudent@gmail.com",
        })
        .expect(200);

      // Only registered students should be returned (newstudent is not in DB)
      expect(response.body.recipients).toEqual(["studentbob@gmail.com"]);
      expect(response.body.recipients).not.toContain("newstudent@gmail.com");
    });

    test("should return 400 for missing teacher", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          notification: "Hello",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should return 400 for missing notification", async () => {
      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    test("should not return duplicate students", async () => {
      // Register studentagnes to teacher
      const teacher = await Teacher.findOne({ where: { email: "teacherken@gmail.com" } });
      const student = await Student.findOne({ where: { email: "studentagnes@gmail.com" } });
      await Registration.create({ teacherId: teacher.id, studentId: student.id });

      const response = await request(app)
        .post("/api/retrievefornotifications")
        .send({
          teacher: "teacherken@gmail.com",
          notification: "Hello @studentagnes@gmail.com",
        })
        .expect(200);

      const agnesCount = response.body.recipients.filter((email) => email === "studentagnes@gmail.com").length;
      expect(agnesCount).toBe(1);
    });
  });

  describe("Health Check", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("404 Not Found", () => {
    test("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/api/unknown").expect(404);

      expect(response.body).toHaveProperty("message");
    });
  });
});
