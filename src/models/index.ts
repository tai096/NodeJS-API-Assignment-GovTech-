import { Teacher } from "./Teacher.js";
import { Student } from "./Student.js";
import { Registration } from "./Registration.js";

// Define associations
Teacher.belongsToMany(Student, {
    through: Registration,
    foreignKey: "teacherId",
    as: "students",
});

Student.belongsToMany(Teacher, {
    through: Registration,
    foreignKey: "studentId",
    as: "teachers",
});

Registration.belongsTo(Teacher, {
    foreignKey: "teacherId",
    as: "teacher",
});

Registration.belongsTo(Student, {
    foreignKey: "studentId",
    as: "student",
});

Teacher.hasMany(Registration, {
    foreignKey: "teacherId",
    as: "registrations",
});

Student.hasMany(Registration, {
    foreignKey: "studentId",
    as: "registrations",
});

export { Teacher, Student, Registration };
