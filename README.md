# Task Management System

A full-stack, Trello-inspired Task Management System built with a **Node.js/Express/TypeScript** backend and a **React/Vite/Tailwind CSS** frontend. The system provides secure JWT authentication, multi-tenant project boards, customizable lists, and Kanban task management with strict ownership validation.

---

## 1. Project Overview

Task Management System allows individuals and teams to organize complex workflows into visual boards, lists, and tasks. The architecture cleanly separates concerns into an independent RESTful backend API and a modern single-page application (SPA) client.

### Key Capabilities
- **Authentication**: User registration and login with bcrypt password hashing and stateless JWT bearer tokens.
- **Hierarchical Access Control**: Strict multi-tenant security verifying the complete ownership chain (`User → Board → List → Task`).
- **Board Management**: Create, view, update, and delete project boards with automatic cascade cleanup.
- **Kanban Lists**: Organize workflow stages (e.g., *To Do*, *In Progress*, *Done*) with in-place renaming and deletion.
- **Task Management**: Create, edit, and delete task cards with title, description, due date, status tracking, and user assignment.
- **Input Validation**: Runtime validation across all requests powered by Zod schemas.

---

## 2. Tech Stack

### Backend
- **Runtime & Framework**: Node.js & Express
- **Language**: TypeScript (Strict Mode)
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Validation**: Zod
- **Testing**: Automated end-to-end integration and security test suite

### Frontend
- **Framework & Build Tool**: React 18 & Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & PostCSS
- **Routing**: React Router v6 with protected route guards
- **HTTP Client**: Axios with centralized request/response interceptors
- **Icons**: Lucide React

---

## 3. Project Structure

```text
Task-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & database connection
│   │   ├── controllers/     # Route handlers for auth, boards, lists, tasks
│   │   ├── middleware/      # Auth (JWT), validation (Zod), and error handlers
│   │   ├── models/          # Mongoose models (User, Board, List, Task)
│   │   ├── routes/          # RESTful endpoint definitions
│   │   ├── services/        # Business logic & relational ownership checks
│   │   ├── types/           # Shared TypeScript interfaces & declarations
│   │   ├── utils/           # Custom AppError helpers
│   │   ├── validations/     # Zod validation schemas
│   │   ├── app.ts           # Express setup & middleware
│   │   └── server.ts        # Server entry point & lifecycle
│   ├── scripts/
│   │   └── test-suite.ts    # 43/43 automated API & security smoke tests
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Centralized Axios client & modular API services
│   │   ├── components/      # Reusable UI, modals, layout, boards, lists, tasks
│   │   ├── context/         # AuthContext for session management
│   │   ├── hooks/           # useAuth custom hook
│   │   ├── pages/           # Login, Register, Dashboard, BoardPage, NotFound
│   │   ├── routes/          # Public and protected routing rules
│   │   ├── types/           # Strict frontend models matching API contracts
│   │   ├── utils/           # Date formatting and helpers
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 4. Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Required variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

Required variables:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 5. Running the Project

### Prerequisites
- **Node.js** (v18+ or v20+)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection URI

### Step 1: Start the Backend
```bash
cd backend
npm install
npm run build
npm start
```
* **API Server**: [http://localhost:3000](http://localhost:3000)
* **Root Endpoint**: [http://localhost:3000/](http://localhost:3000/)
* **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### Step 2: Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)

---

## 6. API & Authentication

All protected endpoints require an `Authorization` header with a valid JWT bearer token:
```http
Authorization: Bearer <token>
```

### Main REST Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Health check endpoint |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| **Boards** | `GET` | `/api/boards` | Get all boards owned by user |
| **Boards** | `POST` | `/api/boards` | Create a new board |
| **Boards** | `GET` | `/api/boards/:boardId` | Get a specific board |
| **Boards** | `PATCH` | `/api/boards/:boardId` | Partial update of board |
| **Boards** | `DELETE` | `/api/boards/:boardId` | Delete board (cascade deletes lists/tasks) |
| **Lists** | `GET` | `/api/boards/:boardId/lists` | Get all lists for a board |
| **Lists** | `POST` | `/api/boards/:boardId/lists` | Create a list in a board |
| **Lists** | `GET` | `/api/boards/:boardId/lists/:listId` | Get a specific list |
| **Lists** | `PATCH` | `/api/boards/:boardId/lists/:listId` | Update list title |
| **Lists** | `DELETE` | `/api/boards/:boardId/lists/:listId` | Delete list (cascade deletes tasks) |
| **Tasks** | `GET` | `/api/boards/:boardId/lists/:listId/tasks` | Get all tasks in a list |
| **Tasks** | `POST` | `/api/boards/:boardId/lists/:listId/tasks` | Create task with status and assignee |
| **Tasks** | `GET` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Get a specific task |
| **Tasks** | `PATCH` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Partial update (status, assignee, title) |
| **Tasks** | `DELETE` | `/api/boards/:boardId/lists/:listId/tasks/:taskId` | Delete a task |

Allowed task statuses: `To Do`, `In Progress`, `Done`.

---

## 7. Testing & Verification

### Backend Automated Test Suite
The backend contains a comprehensive automated integration and security test suite verifying root/health endpoints, registration, login, JWT validation, full CRUD across Boards, Lists, and Tasks, ownership isolation (`403 Forbidden` checks), mismatched relational hierarchy checks, and cascade deletions.

```bash
cd backend
npm test
```

**Current Verification Result**:
```text
========================================
TEST SUITE SUMMARY:
  Passed: 43
  Failed: 0
========================================
```

### Frontend Build Verification
The frontend TypeScript build compiles cleanly with zero errors:

```bash
cd frontend
npm run build
```

**Result**: `PASS` (zero TypeScript or bundle errors).
