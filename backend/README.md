# Task Management System — Trello-like Backend API

An individual final assignment backend API for a collaborative, Trello-style Task Management System built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Mongoose**. Features robust **JWT-based authentication**, **password hashing with bcrypt**, request validation with **Zod**, and strict multi-tenant ownership validation across nested board, list, and task hierarchies.

---

## 1. Technologies Used

- **Node.js** & **Express** — Fast, lightweight backend framework
- **TypeScript** (Strict Mode) — Strongly typed codebase without `any` or loose types
- **MongoDB** & **Mongoose** — Document-oriented database and object data modeling
- **JSON Web Tokens (jsonwebtoken)** — Stateless authentication mechanism
- **bcryptjs** — Secure password hashing with salts
- **Zod** — Schema-based runtime validation for bodies and path parameters
- **CORS** & **dotenv** — Cross-origin requests and environment variable configuration

---

## 2. Architecture & Directory Structure

```text
Task-Management-System-Final/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── dist/                      # Compiled JavaScript files (generated on build)
└── src/
    ├── config/                # Environment and database connection configurations
    │   ├── db.ts
    │   └── env.ts
    ├── controllers/           # Express request handlers
    │   ├── auth.controller.ts
    │   ├── board.controller.ts
    │   ├── list.controller.ts
    │   └── task.controller.ts
    ├── middleware/            # Auth, validation, and error middlewares
    │   ├── auth.middleware.ts
    │   ├── error.middleware.ts
    │   └── validate.middleware.ts
    ├── models/                # Mongoose schemas and data models
    │   ├── board.model.ts
    │   ├── list.model.ts
    │   ├── task.model.ts
    │   └── user.model.ts
    ├── routes/                # REST API route declarations
    │   ├── auth.routes.ts
    │   ├── board.routes.ts
    │   ├── index.ts
    │   ├── list.routes.ts
    │   └── task.routes.ts
    ├── services/              # Business logic and ownership verification
    │   ├── auth.service.ts
    │   ├── board.service.ts
    │   ├── list.service.ts
    │   └── task.service.ts
    ├── types/                 # Shared TypeScript interfaces & Express augmentation
    │   ├── express.d.ts
    │   └── index.ts
    ├── utils/                 # Custom error utilities
    │   └── appError.ts
    ├── validations/           # Zod validation schemas
    │   ├── auth.validation.ts
    │   ├── board.validation.ts
    │   ├── common.validation.ts
    │   ├── list.validation.ts
    │   └── task.validation.ts
    ├── app.ts                 # Express application setup
    └── server.ts              # Entry point and server lifecycle
```

---

## 3. Security & Ownership Model

The system strictly enforces a hierarchical ownership and relational access control model:

```text
User  ──(owns)──>  Board  ──(contains)──>  List  ──(contains)──>  Task
```

- **Board Isolation**: A user can only view, edit, or delete boards that they created. Attempting to access another user's board returns `403 Forbidden` (or `404 Not Found`).
- **Relational Integrity**:
  - Accessing `/api/boards/:boardId/lists/:listId` validates that the user owns `:boardId` **AND** that `:listId` actually belongs to `:boardId`.
  - Accessing `/api/boards/:boardId/lists/:listId/tasks/:taskId` validates that the user owns `:boardId`, `:listId` belongs to `:boardId`, **AND** `:taskId` belongs to `:listId`.
- **Task Assignment**: Tasks can be assigned to valid registered users by verifying the assigned user's ID exists in the database.
- **Cascade Deletions**: Deleting a board automatically removes all associated lists and their nested tasks. Deleting a list automatically removes all its tasks.

---

## 4. Installation & Setup

### Prerequisites

- **Node.js** (v18.x or v20.x or higher)
- **MongoDB** running locally (e.g. `mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection URI

### Steps

1. Clone or navigate into the project directory:
   ```bash
   cd c:\Users\mahmoud\OneDrive\Desktop\Task-Management-System-Final
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to match your local setup:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Build the TypeScript project:
   ```bash
   npm run build
   ```

5. Run the application:
   - **Production Mode**:
     ```bash
     npm start
     ```
   - **Development Mode** (with hot reload):
     ```bash
     npm run dev
     ```
   - **Automated Smoke & Security Tests**:
     ```bash
     npm test
     ```

---

## 5. API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root endpoint / API welcome message |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |

### Protected Endpoints (Requires `Authorization: Bearer <token>`)

#### Boards (`/api/boards`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/boards` | Create a new board |
| `GET` | `/api/boards` | Get all boards owned by the authenticated user |
| `GET` | `/api/boards/:boardId` | Get a specific board by ID |
| `PATCH` | `/api/boards/:boardId` | Update a board (partial update) |
| `DELETE` | `/api/boards/:boardId` | Delete a board (cascades to lists & tasks) |

#### Lists (`/api/boards/:boardId/lists`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/boards/:boardId/lists` | Create a list in a board |
| `GET` | `/api/boards/:boardId/lists` | Get all lists for a board |
| `GET` | `/api/boards/:boardId/lists/:listId` | Get a specific list |
| `PATCH` | `/api/boards/:boardId/lists/:listId` | Update list title |
| `DELETE` | `/api/boards/:boardId/lists/:listId` | Delete a list (cascades to tasks) |

#### Tasks (`/api/boards/:boardId/lists/:listId/tasks`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/boards/:boardId/lists/:listId/tasks` | Create a task in a list |
| `GET` | `/api/boards/:boardId/lists/:listId/tasks` | Get all tasks in a list |
| `GET` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Get a specific task |
| `PATCH` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Update a task (status, assign, details) |
| `DELETE` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Delete a task |

---

## 6. Request & Response Examples

### 1. Register User
**`POST /api/auth/register`**

Request:
```json
{
  "name": "Mahmoud",
  "email": "mahmoud@example.com",
  "password": "password123"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "673f34567890abcdef123456",
      "name": "Mahmoud",
      "email": "mahmoud@example.com",
      "createdAt": "2026-10-02T11:00:00.000Z",
      "updatedAt": "2026-10-02T11:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User
**`POST /api/auth/login`**

Request:
```json
{
  "email": "mahmoud@example.com",
  "password": "password123"
}
```

Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "673f34567890abcdef123456",
      "name": "Mahmoud",
      "email": "mahmoud@example.com",
      "createdAt": "2026-10-02T11:00:00.000Z",
      "updatedAt": "2026-10-02T11:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Create Board
**`POST /api/boards`**
*Headers*: `Authorization: Bearer <token>`

Request:
```json
{
  "title": "Project Roadmap",
  "description": "Backend API development board"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "Board created successfully",
  "data": {
    "board": {
      "_id": "673f40007890abcdef123456",
      "title": "Project Roadmap",
      "description": "Backend API development board",
      "owner": "673f34567890abcdef123456",
      "createdAt": "2026-10-02T11:05:00.000Z",
      "updatedAt": "2026-10-02T11:05:00.000Z"
    }
  }
}
```

### 4. Create List
**`POST /api/boards/:boardId/lists`**
*Headers*: `Authorization: Bearer <token>`

Request:
```json
{
  "title": "In Progress"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "List created successfully",
  "data": {
    "list": {
      "_id": "673f41007890abcdef123456",
      "title": "In Progress",
      "board": "673f40007890abcdef123456",
      "createdAt": "2026-10-02T11:10:00.000Z",
      "updatedAt": "2026-10-02T11:10:00.000Z"
    }
  }
}
```

### 5. Create Task
**`POST /api/boards/:boardId/lists/:listId/tasks`**
*Headers*: `Authorization: Bearer <token>`

Request:
```json
{
  "title": "Implement authentication",
  "description": "Create JWT authentication and middleware",
  "status": "In Progress",
  "assignedTo": "673f34567890abcdef123456"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "673f42007890abcdef123456",
      "title": "Implement authentication",
      "description": "Create JWT authentication and middleware",
      "status": "In Progress",
      "list": "673f41007890abcdef123456",
      "assignedTo": {
        "_id": "673f34567890abcdef123456",
        "name": "Mahmoud",
        "email": "mahmoud@example.com"
      },
      "dueDate": null,
      "createdAt": "2026-10-02T11:15:00.000Z",
      "updatedAt": "2026-10-02T11:15:00.000Z"
    }
  }
}
```

### 6. Update Task (Partial Update / Status Change)
**`PATCH /api/boards/:boardId/lists/:listId/tasks/:taskId`**
*Headers*: `Authorization: Bearer <token>`

Request:
```json
{
  "status": "Done"
}
```

Response (`200 OK`):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "673f42007890abcdef123456",
      "title": "Implement authentication",
      "description": "Create JWT authentication and middleware",
      "status": "Done",
      "list": "673f41007890abcdef123456",
      "assignedTo": {
        "_id": "673f34567890abcdef123456",
        "name": "Mahmoud",
        "email": "mahmoud@example.com"
      },
      "dueDate": null,
      "createdAt": "2026-10-02T11:15:00.000Z",
      "updatedAt": "2026-10-02T11:20:00.000Z"
    }
  }
}
```

---

## 7. Status Codes and Error Responses

Standard HTTP status codes are used consistently:

- `200 OK` — Successful GET / PATCH / DELETE request
- `201 Created` — Successful resource creation (POST)
- `400 Bad Request` — Validation error, invalid task status, non-existent assigned user, or mismatched hierarchy
- `401 Unauthorized` — Missing, invalid, or expired JWT token
- `403 Forbidden` — Attempting to access another user's board or nested resources
- `404 Not Found` — Resource or route does not exist
- `500 Internal Server Error` — Unhandled server error (stack traces hidden from clients)

Example error response:
```json
{
  "success": false,
  "message": "Access denied. You do not own this board"
}
```
