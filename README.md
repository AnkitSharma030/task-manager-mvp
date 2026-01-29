# Task Manager MVP

A task management system with template creation and automatic task assignment capabilities, built with Next.js 16, MongoDB, and JWT authentication.

## Features

- **User Management**: Create and manage users with Admin/Member roles
- **Template Creation**: Create reusable task templates with ordered task lists
- **Instance Creation**: Generate project instances from templates with automatic task generation
- **Task Assignment**: Assign all tasks to a selected user (doer) during instance creation
- **JWT Authentication**: Secure admin-only access with httpOnly cookies
- **Modern UI**: Dark theme with glassmorphism effects and smooth animations

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS v4 |
| Backend | Next.js API Routes |
| Database | MongoDB (native driver) |
| Authentication | JWT (jose library), bcryptjs |

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd task-manager-mvp
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your-secret-key-at-least-32-characters
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Seed Admin User

Open your browser and make a POST request to seed the admin user:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or simply visit the login page - the seed endpoint will create:
- **Email**: admin@taskmanager.com
- **Password**: admin123

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) and login with admin credentials.

## User Flow

### 1. Login as Admin
Navigate to `/login` and enter admin credentials.

### 2. Create Users
Go to **Users** → Click "Add User" → Enter name, email, and role.

### 3. Create a Template
Go to **Templates** → Click "Create Template" → Add template name and task list.

Example:
- Name: "Website Launch Checklist"
- Tasks: Design homepage, Develop frontend, Backend integration, QA testing, Deploy

### 4. Create an Instance
Go to **Instances** → Click "Create Instance":
- Enter instance name (e.g., "Company Website v1")
- Select a template
- Select a doer (user to assign tasks)
- Submit → All tasks are automatically created and assigned!

### 5. View Tasks
Go to **Tasks** to see all tasks grouped by instance or user.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seed` | Create default admin user |
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create template |
| GET | `/api/instances` | List instances with tasks |
| POST | `/api/instances` | Create instance (auto-generates tasks) |
| GET | `/api/tasks` | List all tasks |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── layout.js         # Dashboard layout with sidebar
│   │   ├── page.js           # Dashboard home
│   │   ├── users/page.js     # User management
│   │   ├── templates/page.js # Template management
│   │   ├── instances/page.js # Instance creation
│   │   └── tasks/page.js     # Task viewing
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication
│   │   ├── users/            # User CRUD
│   │   ├── templates/        # Template CRUD
│   │   ├── instances/        # Instance creation
│   │   ├── tasks/            # Task viewing
│   │   └── seed/             # Database seeding
│   ├── login/page.js         # Login page
│   ├── globals.css           # Global styles
│   └── layout.js             # Root layout
├── components/
│   └── Sidebar.js            # Navigation sidebar
├── lib/
│   ├── auth.js               # JWT utilities
│   └── mongodb.js            # Database connection
└── middleware.js             # Route protection
```

## License

MIT
