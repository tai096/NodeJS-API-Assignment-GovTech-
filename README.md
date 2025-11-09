# Teacher-Student Management API

A RESTful API for teachers to manage students. Built with Node.js, Express, MySQL, and Sequelize ORM.

## Features

- Register students to teachers
- Get common students across multiple teachers
- Suspend students
- Retrieve notification recipients (registered + @mentioned students)
- Auto-creates database and tables on startup
- Comprehensive test suite with Jest

## Prerequisites

- Node.js v18+
- MySQL v5.7+
- npm or yarn

## Quick Start

1. **Clone and install:**

   ```bash
   git clone <your-repository-url>
   cd NodeJS-API-Assignment-GovTech-
   npm install / yarn
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your MySQL credentials:

   ```env
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=teacher_student_db
   ```

3. **Start the server:**

   ```bash
   npm run dev
   ```
   ```bash
   yarn dev
   ```

   The app will automatically:

   - Create the database if it doesn't exist
   - Create tables from models
   - Start on `http://localhost:5001`

## API Endpoints

### 1. Register Students

`POST /api/register`

Register students to a teacher.

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

**Response:** `204 No Content`

---

### 2. Get Common Students

`GET /api/commonstudents?teacher=teacherken@gmail.com`

Get students common to given teachers (supports multiple `teacher` params).

```json
{
  "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"]
}
```

---

### 3. Suspend Student

`POST /api/suspend`

Suspend a student.

```json
{
  "student": "studentmary@gmail.com"
}
```

**Response:** `204 No Content`

---

### 4. Retrieve Notification Recipients

`POST /api/retrievefornotifications`

Get students who can receive notifications (registered + @mentioned, excluding suspended).

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

**Response:**

```json
{
  "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"]
}
```

---

### Health Check

`GET /health`

Check API status.

## Testing
- Create a .env.test file before testing

```bash
# Run all tests
npm test / yarn test

# Run tests in watch mode
npm run test:watch
```

- Tests automatically use a separate `teacher_student_db_test` database to protect your development data.

## Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Business logic
├── models/          # Sequelize models (Teacher, Student, Registration)
├── routes/          # API routes
├── middleware/      # Error handling, request logging
├── utils/           # Helper functions
├── app.js           # Express app
└── server.js        # Entry point

tests/
└── api.test.js      # API tests
```

## Database Schema

**teachers**

- `id`, `email` (unique), `created_at`, `updated_at`

**students**

- `id`, `email` (unique), `is_suspended`, `created_at`, `updated_at`

**registrations**

- `id`, `teacher_id`, `student_id`, `created_at`, `updated_at`
- Unique constraint on (`teacher_id`, `student_id`)

## Environment Variables

| Variable    | Default            | Description       |
| ----------- | ------------------ | ----------------- |
| PORT        | 5001               | Server port       |
| NODE_ENV    | development        | Environment       |
| DB_HOST     | localhost          | MySQL host        |
| DB_PORT     | 3306               | MySQL port        |
| DB_NAME     | teacher_student_db | Database name     |
| DB_USER     | root               | Database user     |
| DB_PASSWORD | -                  | Database password |

## Technologies

- **Node.js** + **Express.js** - Backend framework
- **MySQL** + **Sequelize** - Database and ORM
- **Jest** + **Supertest** - Testing
- **dotenv** - Environment configuration
