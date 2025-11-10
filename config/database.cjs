require("dotenv").config();

module.exports = {
  development: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB_NAME || "teacher_student_db",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB_NAME || "teacher_student_db_test",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB_NAME || "teacher_student_db",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};
