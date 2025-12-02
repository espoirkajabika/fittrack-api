# FitTrack API

A comprehensive fitness tracking REST API built with Node.js, TypeScript, Express, and Firebase.

## Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [API Request Examples](#api-request-examples)
- [Scheduled Jobs](#scheduled-jobs-node-cron)
- [Security Features](#security-features)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/fittrack-api.git
cd fittrack-api
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase

   - Go to Firebase Console: https://console.firebase.google.com/
   - Create a new project or use an existing one
   - Enable Firestore Database and Authentication
   - Go to Project Settings, then Service Accounts, then Generate New Private Key
   - Save the downloaded file as `config/serviceAccount.json`

4. Create environment file
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=3000
NODE_ENV=development
TIMEZONE=America/Winnipeg
```

5. Start the server
```bash
npm run dev
```

6. Access the API

   - API Base URL: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

---

## Authentication

### Getting a Firebase Auth Token

1. Create a user in Firebase Console under Authentication, then Users, then Add User.

2. Set user role using the setup endpoint:
```
POST http://localhost:3000/api/v1/setup/set-role
Content-Type: application/json

{
  "email": "your@email.com",
  "role": "admin",
  "secretKey": "fittrack-setup-2024"
}
```

3. Get auth token via Firebase REST API:
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_API_KEY
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "your-password",
  "returnSecureToken": true
}
```

4. Use the `idToken` from the response as a Bearer token in subsequent requests:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### User Roles

| Role    | Permissions                                |
|---------|--------------------------------------------|
| user    | Create own workouts, goals, progress       |
| trainer | Create exercises, workout plans            |
| coach   | View other users data                      |
| admin   | Full access including scheduled jobs       |

---

## API Endpoints

### Exercises

| Method | Endpoint                | Description              | Auth Required |
|--------|-------------------------|--------------------------|---------------|
| GET    | /api/v1/exercises       | Get all exercises        | No            |
| GET    | /api/v1/exercises/:id   | Get single exercise      | No            |
| POST   | /api/v1/exercises       | Create exercise          | trainer/admin |
| PUT    | /api/v1/exercises/:id   | Update exercise          | trainer/admin |
| DELETE | /api/v1/exercises/:id   | Delete exercise          | admin         |

### Goals

| Method | Endpoint                | Description              | Auth Required |
|--------|-------------------------|--------------------------|---------------|
| GET    | /api/v1/goals/me        | Get my goals             | Yes           |
| GET    | /api/v1/goals/:id       | Get single goal          | Yes           |
| POST   | /api/v1/goals           | Create goal              | Yes           |
| PUT    | /api/v1/goals/:id       | Update goal              | Yes           |
| DELETE | /api/v1/goals/:id       | Delete goal              | Yes           |

### Progress

| Method | Endpoint                         | Description              | Auth Required |
|--------|----------------------------------|--------------------------|---------------|
| POST   | /api/v1/progress/body-metrics    | Log body metrics         | Yes           |
| GET    | /api/v1/progress/body-metrics/me | Get my body metrics      | Yes           |
| POST   | /api/v1/progress/workouts        | Complete a workout       | Yes           |
| GET    | /api/v1/progress/statistics/me   | Get my statistics        | Yes           |

### Scheduled Jobs (Admin Only)

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/v1/jobs                      | List all scheduled jobs  |
| POST   | /api/v1/jobs/:jobName/trigger     | Trigger job manually     |
| GET    | /api/v1/jobs/logs                 | Get job execution logs   |
| GET    | /api/v1/jobs/:jobName/logs        | Get logs for specific job|
| POST   | /api/v1/jobs/:jobName/stop        | Stop a scheduled job     |
| POST   | /api/v1/jobs/:jobName/start       | Start a scheduled job    |

---

## API Request Examples

### Create Exercise
```http
POST http://localhost:3000/api/v1/exercises
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Barbell Bench Press",
  "description": "Compound chest exercise for building strength",
  "category": "strength",
  "muscleGroup": "chest",
  "equipment": "barbell",
  "difficulty": "intermediate"
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Barbell Bench Press",
    "description": "Compound chest exercise for building strength",
    "category": "strength",
    "muscleGroup": "chest",
    "equipment": "barbell",
    "difficulty": "intermediate",
    "createdAt": "2025-11-27T09:16:27.086Z",
    "updatedAt": "2025-11-27T09:16:27.086Z"
  }
}
```

### Create Goal
```http
POST http://localhost:3000/api/v1/goals
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "weight",
  "title": "Lose 10 pounds",
  "description": "Get to target weight by summer",
  "targetWeight": 165,
  "startValue": 175,
  "deadline": "2026-06-01"
}
```

### Trigger Scheduled Job
```http
POST http://localhost:3000/api/v1/jobs/update-goal-progress/trigger
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Response:
```json
{
  "success": true,
  "message": "Job update-goal-progress executed successfully",
  "data": {
    "jobName": "update-goal-progress",
    "status": "success",
    "duration": 234,
    "itemsProcessed": 5
  }
}
```

---

## Scheduled Jobs (Node-cron)

FitTrack includes automated background jobs using the node-cron library. These jobs run on a schedule to maintain data integrity and automate repetitive tasks.

### Available Jobs

| Job Name              | Schedule           | Description                          |
|-----------------------|--------------------|------------------------------------- |
| expire-goals          | Daily at midnight  | Marks goals past deadline as expired |
| update-goal-progress  | Every 6 hours      | Updates goal progress from metrics   |
| cleanup-old-logs      | Weekly (Sunday 2AM)| Removes job logs older than 90 days  |

### Cron Schedule Format
```
 ┌───────────── minute (0-59)
 │ ┌───────────── hour (0-23)
 │ │ ┌───────────── day of month (1-31)
 │ │ │ ┌───────────── month (1-12)
 │ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
 │ │ │ │ │
 * * * * *
```

Schedule Examples:

- `0 0 * * *` - Runs daily at midnight
- `0 */6 * * *` - Runs every 6 hours
- `0 2 * * 0` - Runs every Sunday at 2 AM

### How Jobs Work

1. Jobs are defined in the `src/jobs/` directory
2. The JobScheduler initializes all jobs when the server starts
3. Each job execution is logged to Firestore for auditing
4. Admins can manually trigger jobs via the API
5. Jobs can be stopped and started without restarting the server

---

## Security Features

### Helmet.js

Sets secure HTTP headers to protect against common vulnerabilities:

- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

### CORS

Cross-Origin Resource Sharing configured for API security with environment-based settings.

### Firebase Authentication

- JWT token validation on protected routes
- Custom claims for role-based access control
- Token expiration handling

### Role-Based Access Control

Granular permissions based on user roles (user, trainer, coach, admin).

---

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Current test coverage: 84%+ with 140 passing tests.

---

## Project Structure
```
fittrack-api/
├── src/
│   ├── api/v1/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # TypeScript interfaces
│   │   ├── repositories/    # Database operations
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── validations/     # Joi schemas
│   ├── config/              # App configuration
│   ├── jobs/                # Scheduled job definitions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── helpers/             # Test utilities
├── scripts/                 # Utility scripts
├── config/
│   └── serviceAccount.json  # Firebase credentials (gitignored)
├── docs/                    # Generated documentation
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
└── package.json
```

---

## Tech Stack

| Category        | Technology        |
|-----------------|-------------------|
| Runtime         | Node.js           |
| Language        | TypeScript        |
| Framework       | Express           |
| Database        | Firebase Firestore|
| Authentication  | Firebase Auth     |
| Documentation   | Swagger/OpenAPI   |
| Testing         | Jest              |
| Scheduling      | node-cron         |
| Security        | Helmet.js, CORS   |

---

## Scripts

| Command              | Description                          |
|----------------------|--------------------------------------|
| npm run dev          | Start development server with nodemon|
| npm run build        | Compile TypeScript to JavaScript     |
| npm start            | Start production server              |
| npm test             | Run tests                            |
| npm run generate-docs| Generate OpenAPI documentation       |

---

## Author

Espoir Kajabika
