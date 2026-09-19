# PULSE | Enterprise Role-Based Project & Task Management System

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20TailwindCSS-indigo?style=for-the-badge)
![Aesthetics](https://img.shields.io/badge/Design-UI%2FUX%20Pro%20Max-violet?style=for-the-badge)
![Security](https://img.shields.io/badge/Auth-JWT%20%2B%20RBAC-blue?style=for-the-badge)

A high-fidelity, role-based project and task management system built according to enterprise product specifications. Pulse was engineered to feel like a modern, production-ready internal tool rather than a generic CRUD tutorial, featuring deep role-based access control (RBAC), interactive Kanban workflows, real-time status transitions, audit telemetry, dynamic progress metrics, and strict adherence to the **UI/UX Pro Max** design guidelines (8pt spatial rhythm and 60-30-10 color theory).

---

## Submission Summary Table

| Requirement Field | Submission Details |
| :--- | :--- |
| **GitHub Repository** | `https://github.com/HunzilaRajput746/Task-Management-System.git` (Branch: `hunzila`) |
| **Project ZIP (Google Drive)** | `<paste Drive link to ZIP>` |
| **Demonstration Video (Google Drive)** | `<paste Drive link to video>` |
| **Documentation** | `README.md` inside repository root |

---

## 1. System Architecture

Pulse utilizes a modular, decoupled full-stack architecture:

```mermaid
graph TD
    User([End User / Reviewer]) -->|HTTPS / REST API| Client[React + Vite Frontend\nUI/UX Pro Max 8pt Design System]
    
    subgraph Frontend Layer
        Client --> Context[AuthContext & Global State]
        Context --> Router[React Router v7 Protected Routes]
        Router --> Views[Dashboard | Projects | Tasks Hub | Team Directory]
    end

    subgraph Backend Layer
        Views -->|Bearer JWT Header| API[Express API Server]
        API --> AuthMW[JWT & RBAC Authorization Middleware]
        AuthMW --> Controllers[Resource Controllers\nAuth | Project | Task | User | Dashboard]
    end

    subgraph Data Persistence Layer
        Controllers --> Mongoose[Mongoose ODM]
        Mongoose --> MongoDB[(MongoDB / In-Memory Server Fallback)]
    end
```

### Key Architectural Highlights
1. **Zero-Config Database Resilience**: Configured with dual-mode MongoDB connection. Automatically connects to `MONGODB_URI` (local or MongoDB Atlas), with an embedded in-memory database (`mongodb-memory-server`) fallback. Reviewers can run the project on fresh machines without needing a pre-installed MongoDB daemon!
2. **Strict Server-Side Authorization**: Routes and database mutations are validated on both client and server. Non-permitted operations return standard HTTP 403 Forbidden responses.
3. **Optimistic UI with Synchronized State**: Kanban boards and task tables update instantaneously for smooth user experience, backed by error recovery.

---

## 2. Roles & Permissions Matrix

Pulse enforces granular permissions across three distinct corporate roles:

| Feature / Action | Administrator (`admin`) | Project Manager (`manager`) | Team Member (`member`) |
| :--- | :---: | :---: | :---: |
| **View Dashboard & Metrics** | Full Workspace Analytics | Assigned & Active Projects | Personal Workload & General |
| **View Projects & Tasks** | Unrestricted Access | Unrestricted Access | Assigned & Public Roadmaps |
| **Create New Projects** | Allowed | Allowed | Restricted (Disabled) |
| **Edit Project Details** | All Projects | Projects Managed by User | Restricted (Read-Only) |
| **Delete Projects** | Allowed | Restricted (Forbidden) | Restricted (Forbidden) |
| **Create New Tasks** | Allowed | Allowed | Restricted (Disabled) |
| **Assign Tasks to Users** | Allowed | Allowed | Restricted (Disabled) |
| **Update Task Status** | Any Task | Any Task | Tasks Assigned to User |
| **Update Sub-Task Checklists**| Allowed | Allowed | Tasks Assigned to User |
| **Post Comments & Discussion**| Allowed | Allowed | Allowed |
| **Elevate / Reassign User Roles**| Allowed | Restricted (Forbidden) | Restricted (Forbidden) |

---

## 3. Demo Accounts & 1-Click Role Testing

To make reviewing effortless, Pulse features a **1-Click Instant Demo Role Switcher** in the top navigation bar and on the login page:

| Role | Email | Password | Representative Persona |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pulse.io` | `Password123!` | **Alexander Vance** (Chief Technology Officer) |
| **Manager** | `manager@pulse.io` | `Password123!` | **Sarah Jenkins** (Staff Product Architect) |
| **Member** | `member@pulse.io` | `Password123!` | **David Chen** (Senior Full-Stack Engineer) |

> [!TIP]
> You can click any role button on the login screen or use the **"Test Role"** switcher at the top right of the application header to instantaneously change roles without re-logging in.

---

## 4. Database Schema & Data Models

### `User`
- `_id`: ObjectId (Primary Key)
- `name`: String (e.g. Alexander Vance)
- `email`: String (Unique index, lowercase)
- `password`: String (Hashed with bcrypt salt rounds = 10, select: false)
- `role`: String enum (`admin`, `manager`, `member`)
- `title`: String (e.g. Chief Technology Officer)
- `department`: String (e.g. Executive Engineering, Product, Design)
- `avatar`: String (High-resolution avatar URL)
- `status`: String enum (`active`, `away`, `offline`)

### `Project`
- `_id`: ObjectId (Primary Key)
- `title`: String (e.g. Cloud Infrastructure & Zero-Trust Migration)
- `key`: String (Unique uppercase 3-6 letter identifier, e.g. `INFRA`)
- `description`: String (Strategic requirements and scope)
- `category`: String enum (`Engineering`, `Design`, `DevOps`, `Security`, `Marketing`, `Operations`)
- `status`: String enum (`planning`, `in_progress`, `on_hold`, `completed`)
- `priority`: String enum (`low`, `medium`, `high`, `urgent`)
- `manager`: ObjectId (Reference -> User)
- `members`: [ObjectId] (Array of references -> User)
- `startDate`: Date
- `dueDate`: Date
- `budget`: Number
- `tags`: [String] (e.g. `['Kubernetes', 'Terraform', 'Vault']`)

### `Task`
- `_id`: ObjectId (Primary Key)
- `taskCode`: String (e.g. `INFRA-102`)
- `title`: String
- `description`: String
- `project`: ObjectId (Reference -> Project)
- `assignee`: ObjectId (Reference -> User)
- `creator`: ObjectId (Reference -> User)
- `status`: String enum (`backlog`, `todo`, `in_progress`, `in_review`, `completed`)
- `priority`: String enum (`low`, `medium`, `high`, `urgent`)
- `dueDate`: Date
- `estimatedHours`: Number
- `actualHours`: Number
- `tags`: [String]
- `checklists`: Array of `{ title: String, completed: Boolean, completedAt: Date }`
- `comments`: Array of `{ user: ObjectId -> User, text: String, createdAt: Date }`

### `ActivityLog`
- `_id`: ObjectId (Primary Key)
- `user`: ObjectId (Reference -> User)
- `action`: String enum (`created_project`, `updated_project`, `deleted_project`, `created_task`, `updated_task`, `status_changed`, `added_comment`, `completed_task`, `updated_checklist`)
- `entityType`: String enum (`Project`, `Task`, `User`)
- `entityId`: ObjectId
- `entityTitle`: String
- `details`: String
- `createdAt`: Date

---

## 5. UI/UX Pro Max Design Principles

Adheres strictly to the guidelines specified in `.agents/skills/ui_ux_pro_max/skills.md`:

1. **The 8pt Grid System**: All margins, paddings, gaps, and component elevations strictly scale as multiples of 8px (`p-2` [8px], `p-4` [16px], `p-6` [24px], `p-8` [32px], `gap-4` [16px]).
2. **60-30-10 Color Theory**:
   - **60% Dominant Canvas**: Deep dark background (`#0B0F17`).
   - **30% Structural**: Card surfaces (`#111827`), borders (`#1F2937`), and subtle glassmorphic headers (`backdrop-blur-md`).
   - **10% High-Contrast Accent**: Electric Indigo (`#6366F1`) for primary actions, Emerald (`#10B981`) for completed tasks, Amber (`#F59E0B`) for reviews, and Rose (`#EF4444`) for urgent items.
3. **Typography**: Clean type scale using Google Fonts `Inter` with tight headings and readable relaxed line heights.
4. **Micro-Interactions**:
   - Buttons: `hover:scale-[1.02] active:scale-[0.98] transition-transform`
   - Cards: Subtle hover borders and elevation transforms.
   - Interactive status dropdowns directly on task rows and Kanban cards.

---

## 6. Primary Workflows

### 1. Project Creation & Team Allocation
1. An **Admin** or **Project Manager** clicks `+ New Project`.
2. Specifies project title, unique project key (e.g. `PULSE`), strategic category, and target delivery date.
3. Allocates cross-functional squad members via multi-select.
4. The project is created and an audit log event is recorded in the live stream.

### 2. Task Progression & Kanban Lifecycle
1. Task is created under a project with designated priority and assignee.
2. The team member views their assigned work on the **Interactive Kanban Board** or **Tasks Command Hub**.
3. Status moves sequentially: `Backlog` -> `To Do` -> `In Progress` -> `In Review` -> `Completed`.
4. Team members check off acceptance checklist items as criteria are met.
5. Teammates collaborate via threaded comments with timestamps.

### 3. Analytics & Operational Visibility
1. The **Dashboard** aggregates real-time metrics:
   - Completion Rate (%)
   - Task count by status (Interactive Pie / Donut Chart)
   - Priority severity distribution (Bar Chart)
   - Project delivery velocity against target dates
   - Live activity stream of recent actions

---

## 7. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & return JWT token
- `GET /api/auth/me` - Retrieve current user session profile (Protected)
- `PUT /api/auth/updatedetails` - Update user profile fields (Protected)

### Projects (`/api/projects`)
- `GET /api/projects` - List all projects with search & multi-filters (Protected)
- `GET /api/projects/:id` - Fetch project details, members and associated tasks (Protected)
- `POST /api/projects` - Create project (Admin & Manager)
- `PUT /api/projects/:id` - Update project details (Admin & Manager)
- `DELETE /api/projects/:id` - Remove project and associated tasks (Admin only)

### Tasks (`/api/tasks`)
- `GET /api/tasks` - List tasks with multi-filters (by project, assignee, status, priority, search) (Protected)
- `GET /api/tasks/:id` - Fetch single task with discussion and checklist (Protected)
- `POST /api/tasks` - Create task with project relation and assignee (Admin & Manager)
- `PUT /api/tasks/:id` - Update task details (Admin, Manager, or Assigned Member)
- `PATCH /api/tasks/:id/status` - Fast status transition endpoint (Protected)
- `POST /api/tasks/:id/comments` - Append comment to discussion thread (Protected)
- `PUT /api/tasks/:id/checklist` - Toggle or add sub-task checklist items (Protected)
- `DELETE /api/tasks/:id` - Delete task (Admin & Manager)

### Dashboard & Telemetry (`/api/dashboard`)
- `GET /api/dashboard/stats` - Fetch aggregated KPIs, status breakdown, and priority metrics (Protected)
- `GET /api/dashboard/activity` - Fetch chronological audit activity stream (Protected)

### Users & Personnel (`/api/users`)
- `GET /api/users` - Directory of team members with active/completed workload counts (Protected)
- `GET /api/users/:id` - Single user details (Protected)
- `PUT /api/users/:id/role` - Elevate or reassign security role (Admin only)

---

## 8. Installation & Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher; tested on Node.js v24)
- **npm** (v9 or higher)
- *Optional*: Local MongoDB or MongoDB Atlas URI (if omitted, the app automatically spins up an in-memory database).

### Step 1: Clone Repository
```bash
git clone https://github.com/HunzilaRajput746/Task-Management-System.git
cd Task-Management-System
git checkout hunzila
```

### Step 2: Install Dependencies
You can install all dependencies across root, server, and client with one command:
```bash
npm run install-all
```
*(Or install individually: `npm install`, `npm install --prefix server`, and `npm install --prefix client`)*

### Step 3: Configure Environment
Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```
*(Default values work out-of-the-box with zero modification needed).*

### Step 4: Seed Realistic Demo Data (Optional)
The server auto-seeds realistic enterprise data on first boot if empty. You can also re-seed anytime via:
```bash
npm run seed
```

### Step 5: Start Development Servers
Run both backend API (Port 5000) and frontend client (Port 3000) concurrently:
```bash
npm run dev
```

Open your browser to:
**`http://localhost:3000`**

---

## 9. Project Structure

```
Task-Management-System/
├── .agents/
│   └── skills/
│       └── ui_ux_pro_max/
│           └── skills.md            # UI/UX Pro Max Grounding Rules
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # UI Components
│   │   │   ├── KanbanBoard.jsx      # Interactive status board
│   │   │   ├── Modal.jsx            # Accessible dialog component
│   │   │   ├── Navbar.jsx           # Top navigation with role switcher
│   │   │   ├── ProjectModal.jsx     # Project creation & settings
│   │   │   ├── ProtectedRoute.jsx   # Client-side RBAC guard
│   │   │   ├── Sidebar.jsx          # Left menu & telemetry
│   │   │   └── TaskModal.jsx        # Task detail, comments & checklists
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & RBAC context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Analytics, charts, & audit feed
│   │   │   ├── Login.jsx            # Sign-in with 1-click demo accounts
│   │   │   ├── ProjectDetail.jsx    # Kanban & Table project view
│   │   │   ├── Projects.jsx         # Project catalog & search
│   │   │   ├── Register.jsx         # Sign-up page
│   │   │   ├── Tasks.jsx            # Central task management hub
│   │   │   └── Team.jsx             # Directory & admin role management
│   │   ├── services/
│   │   │   └── api.js               # Axios client with JWT interceptor
│   │   ├── App.jsx                  # Main router and layout
│   │   ├── index.css                # Tailwind directives & design tokens
│   │   └── main.jsx                 # React root render
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js           # 8pt rhythm & 60-30-10 palette
│   └── vite.config.js               # Vite config with API proxy
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # Dual-mode DB connection with in-memory fallback
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth & sessions
│   │   │   ├── dashboardController.js # Analytics & KPIs
│   │   │   ├── projectController.js # Project operations & progress
│   │   │   ├── taskController.js    # Task lifecycle & discussions
│   │   │   └── userController.js    # Team management & role elevation
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT & RBAC authorization
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── models/
│   │   │   ├── ActivityLog.js       # Audit trail schema
│   │   │   ├── Project.js           # Project entity schema
│   │   │   ├── Task.js              # Task, checklist & comment schema
│   │   │   └── User.js              # User & role schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   └── seeder.js            # Enterprise realistic dataset
│   │   └── server.js                # Express app entry point
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json                     # Root orchestrator
└── README.md                        # Master documentation
```

---

## 10. Known Limitations & Roadmap

1. **WebSockets / Push Notifications**: Activity feed currently refreshes on navigation and mutation events. A future phase will introduce real-time Socket.io push broadcasts.
2. **File Attachments**: Tasks support external link references and rich descriptions. S3 / Cloudflare R2 bucket integration for direct file drag-and-drop is scheduled for v2.0.
3. **Advanced Gantt Timelines**: Project progress and due dates are visually tracked through Kanban and status tables; full interactive Gantt charts are on the Q4 roadmap.

---

## 11. Verification & Quality Assurance

- **Client Build Test**: Successfully verified with `vite build` (`0 errors, 2593 modules transformed`).
- **Authorization Guard Test**: Verified server-side and client-side access prevention for non-permitted roles.
- **Input Validation**: Mongoose schema and client forms validate mandatory fields, email regex, string lengths, and role enum consistency.
- **Zero Placeholder Data**: Populated with realistic enterprise technical tasks (Istio mTLS, Kubernetes sidecars, SOC2 compliance, Kafka load benchmarking) instead of placeholder 'Task 1' records.

---

*Authored by Hunzila Rajput for Enliven AI Software House.*
