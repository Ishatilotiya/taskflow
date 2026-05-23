# TaskFlow — Corporate Team Task Manager

A full-stack enterprise team collaboration platform with role-based access, JWT authentication, analytics dashboard, and cloud deployment.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT
- **Deployment**: Railway (backend) + Vercel (frontend)

## Features
- Workspace-based architecture (Workspaces → Projects → Tasks)
- JWT Authentication (Signup/Login)
- Role-Based Access Control (Admin / Member)
- Task Kanban Board (To Do / In Progress / Done)
- Task priorities: Low / Medium / High / Critical
- Due dates with overdue detection
- Activity log for every workspace action
- Dashboard analytics (completion rate, overdue tasks, per-member stats)

## Setup

### Backend
```bash
cd backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL
npm run dev
```

## Deployment
- Backend → Railway
- Frontend → Vercel

Set environment variables in both platforms before deploying.
