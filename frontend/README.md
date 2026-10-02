# Task Management System — Frontend Client

A responsive, modern Kanban-style task management web client built with **React**, **TypeScript**, **Vite**, **React Router**, **Axios**, and **Tailwind CSS**. It connects to the [Task Management System Backend API](http://localhost:3000/api) to provide project tracking, Kanban boards, lists, and task management.

---

## 1. Technologies Used

- **React 18** — Component-driven declarative UI
- **TypeScript** — Strictly typed interfaces and components without `any`
- **Vite** — Next-generation frontend build tool and dev server
- **Tailwind CSS** — Utility-first styling with custom responsive design tokens
- **React Router 6** — Client-side SPA routing with protected route guards
- **Axios** — Centralized HTTP client with automatic JWT token attachment and error interception
- **Lucide React** — Clean, accessible icon system

---

## 2. Architecture & Directory Structure

```text
Task-Management-System-Final-Frontend/
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── api/                   # Centralized Axios client & API service endpoints
    │   ├── auth.api.ts
    │   ├── boards.api.ts
    │   ├── client.ts
    │   ├── lists.api.ts
    │   └── tasks.api.ts
    ├── components/            # Modular React UI components
    │   ├── boards/
    │   │   ├── BoardCard.tsx
    │   │   └── BoardModal.tsx
    │   ├── common/
    │   │   ├── Alert.tsx
    │   │   ├── Button.tsx
    │   │   ├── ConfirmModal.tsx
    │   │   ├── Input.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── Modal.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── ProtectedLayout.tsx
    │   ├── lists/
    │   │   ├── ListColumn.tsx
    │   │   └── ListModal.tsx
    │   └── tasks/
    │       ├── TaskCard.tsx
    │       ├── TaskModal.tsx
    │       └── TaskStatusBadge.tsx
    ├── context/               # Global state via React Context
    │   └── AuthContext.tsx
    ├── hooks/                 # Custom React hooks
    │   └── useAuth.ts
    ├── pages/                 # Route page components
    │   ├── BoardPage.tsx
    │   ├── Dashboard.tsx
    │   ├── Login.tsx
    │   ├── NotFound.tsx
    │   └── Register.tsx
    ├── routes/                # Application routes with protected routes
    │   └── AppRoutes.tsx
    ├── types/                 # Shared TypeScript models and API types
    │   └── index.ts
    ├── utils/                 # Utility functions (date formatting, etc.)
    │   └── formatDate.ts
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

---

## 3. Backend Dependency

This frontend is designed to consume the **Task Management System Backend API**:
- **Backend URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`

Ensure the backend server is running before launching the frontend:
```bash
# In c:\Users\mahmoud\OneDrive\Desktop\Task-Management-System-Final
npm start
```

---

## 4. Installation & Setup

1. Open a terminal in the frontend directory:
   ```bash
   cd c:\Users\mahmoud\OneDrive\Desktop\Task-Management-System-Final-Frontend
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
   Contents of `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser to:
   ```text
   http://localhost:5173
   ```

---

## 5. Main User Flow & Features

1. **Authentication**:
   - **Register (`/register`)**: Create an account with Name, Email, Password, and Password Confirmation.
   - **Login (`/login`)**: Sign in with Email and Password; JWT token is securely stored and attached to subsequent API requests.
   - **Session Restoration**: Persisted authentication across browser refreshes.
   - **Logout**: Clears credentials and redirects to `/login`.
2. **Dashboard (`/dashboard`)**:
   - Welcome banner with active user information.
   - Search/filter boards in real time.
   - Create new boards with title and description.
   - Open, edit, or delete existing boards (with delete confirmation).
   - Empty state for new users.
3. **Board Workspace (`/boards/:boardId`)**:
   - Visual Kanban/Trello board layout with horizontal scrolling.
   - **List Management**: Add columns, rename column titles in place, or delete columns with confirmation.
   - **Task Management**:
     - Add tasks to specific columns with title, description, due date, and assignee.
     - Quick status changes directly from the card dropdown (`To Do`, `In Progress`, `Done`).
     - Task assignment via User ID or 1-click &ldquo;Assign to me&rdquo;.
     - Edit task details or delete tasks with confirmation.
     - Overdue due-date indicator.
4. **Security & Ownership**:
   - Enforces 401 unauthorized redirects.
   - Multi-tenant data isolation; access denied (`403`) handled gracefully with clean alerts.
