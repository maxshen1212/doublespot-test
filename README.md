# Vanilla full-stack project for Doublespot Co.

This repository contains a full-stack web application with a React frontend and a Node.js (Express) backend. It is set up for both local development and a containerized environment using Docker.

## Tech Stack

### Backend

- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL
- **Runtime**: Node.js
- **Dev Tools**: `tsx` for hot-reloading

### Frontend

- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite with SWC
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM

### Tooling & Environment

- **Containerization**: Docker & Docker Compose
- **Package Manager**: npm

## Project Structure

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   └── src/
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
```

## Getting Started

You can run this project either locally on your machine or using Docker.

### 1. Local Development Setup

#### Prerequisites

- Node.js (v20 or later recommended)
- npm
- A running MySQL instance

#### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by copying the example file:
    ```bash
    cp .env.example .env
    ```
4.  Update `.env` with your local database credentials. Set `DB_HOST=localhost`.
5.  Apply database migrations:
    ```bash
    npx prisma migrate dev
    ```
6.  Start the development server:
    `bash
    npm run dev
    `
    The backend will be running on `http://localhost:3000`.

#### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    `bash
    npm run dev
    `
    The frontend will be running on `http://localhost:5173`. It is configured to proxy API requests to the backend.

### 2. Docker Setup

#### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)

#### Instructions

1.  **Environment File**: Make sure you have a `.env` file inside the `backend` directory. You can copy it from the example:

    ```bash
    cp backend/.env.example backend/.env
    ```

    **Important**: Ensure `DB_HOST` is set to `database` in `backend/.env` for the container network.

2.  **Build and Start**: From the root directory, run:

    ```bash
    docker compose up --build
    ```

    To run in the background, use:

    ```bash
    docker compose up --build -d
    ```

3.  **Access Services**:

    - **Frontend**: `http://localhost:5173`
    - **Backend**: `http://localhost:3000`
    - **Database**: Connect via port `3306`

4.  **Stop Services**:
    ```bash
    docker compose down
    ```
    To remove the database volume as well, add the `-v` flag:
    ```bash
    docker compose down -v
    ```

## Available Scripts

### Backend (`backend/`)

- `npm run dev`: Starts the development server with hot-reload using `tsx`.
- `npm run build`: Compiles the TypeScript code to JavaScript.
- `npm run start`: Starts the application from the compiled code.
- `npx prisma migrate dev`: Applies database migrations.
- `npx prisma studio`: Opens the Prisma Studio to view and manage data.

### Frontend (`frontend/`)

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the codebase.
- `npm run preview`: Previews the production build locally.
