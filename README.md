# Doublespot Full-Stack Project

Full-stack web application with React frontend and Node.js backend, supporting both local and Docker development.

---

## 🛠️ Tech Stack

**Backend**: Express.js • TypeScript • Prisma • MySQL • tsx
**Frontend**: React • TypeScript • Vite • Tailwind CSS v4 • Zustand • TanStack Query • React Router
**DevOps**: Docker • Docker Compose

---

## 📁 Project Structure

```
.
├── docker-compose.yml
├── backend/          # Express API
│   ├── src/
│   └── prisma/
└── frontend/         # React SPA
    └── src/
```

---

## 🚀 Quick Start

### Prerequisites

- **Local**: Node.js 20+, npm, MySQL
- **Docker**: Docker Desktop

### Option 1: Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env          # Edit DB_HOST=localhost
npx prisma migrate dev
npm run dev                   # http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Option 2: Docker (Recommended)

```bash
cp backend/.env.example backend/.env  # Edit DB_HOST=database
docker compose up --build             # Add -d for background

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
# Database: localhost:3306

# Stop
docker compose down           # Add -v to remove volumes
```

---

## 📜 Available Scripts

### Backend

```bash
npm run dev          # Development with hot-reload
npm run build        # Compile TypeScript
npm start            # Run production build
npx prisma migrate dev    # Apply migrations
npx prisma studio    # Open Prisma Studio
```

### Frontend

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
npm run preview      # Preview production build
```

---

## 🧪 Testing & CI/CD

```bash
# Backend
npm test             # Run tests (Vitest)
npm run lint         # ESLint check

# Frontend
npm run lint         # ESLint check
npm run build        # Type check + build
```

**GitHub Actions**: Auto-validates on PR (lint, test, build)

---

## 📚 Documentation

- **Backend Convention**: [documents/backend-dev-convention.md](documents/backend-dev-convention.md)
- **Setup Guides**: [documents/](documents/)

---

## 🔧 Troubleshooting

**Database Connection Issues**:
- Local: Use `DB_HOST=localhost`
- Docker: Use `DB_HOST=database`

**Port Conflicts**:
- Backend: 3000
- Frontend: 5173
- MySQL: 3306

**Prisma Issues**:
```bash
npx prisma generate      # Regenerate client
npx prisma migrate reset # Reset database
```
