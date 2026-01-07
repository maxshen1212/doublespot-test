# Docker Setup Guide

This guide explains how to set up and run the entire application stack using Docker Compose.

## Overview

The project uses Docker Compose to orchestrate three services:

- **Database**: MySQL 8.0
- **Backend**: Express.js API server
- **Frontend**: React + Vite development server

## Prerequisites

- Docker Desktop installed (or Docker Engine + Docker Compose)
- Basic understanding of Docker concepts

## Project Structure

```
doublespot-test/
├── docker-compose.yml          # Orchestrates all services
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   └── .env                    # Backend environment variables
└── frontend/
    └── Dockerfile              # Frontend container configuration
```

## Docker Compose Configuration

The `docker-compose.yml` file defines all services and their relationships:

```yaml
services:
  database:
    image: mysql:8.0
    container_name: mysql_dev
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-my_app_db}
      MYSQL_USER: ${MYSQL_USER:-user}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-password}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-u",
          "root",
          "-prootpassword",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  backend:
    build: ./backend
    container_name: backend_dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - ./backend/.env
    depends_on:
      database:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: frontend_dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Service Details

#### Database Service

- **Image**: MySQL 8.0
- **Port**: 3306 (exposed to host)
- **Health Check**: Ensures database is ready before starting dependent services
- **Data Persistence**: Uses named volume `mysql_data` to persist data
- **Environment Variables**: Configurable via environment or defaults

#### Backend Service

- **Build Context**: `./backend` directory
- **Port**: 3000 (exposed to host)
- **Volume Mounts**:
  - Source code mounted for hot-reload
  - `node_modules` excluded to prevent host overwriting container modules
- **Environment**: Loads from `./backend/.env`
- **Dependencies**: Waits for database to be healthy

#### Frontend Service

- **Build Context**: `./frontend` directory
- **Port**: 5173 (Vite default)
- **Volume Mounts**:
  - Source code mounted for hot-reload
  - `node_modules` excluded
- **Environment Variables**:
  - `VITE_API_URL`: Points to backend service within Docker network
- **Dependencies**: Starts after backend is ready

## Backend Dockerfile

The backend Dockerfile creates a development container:

```dockerfile
# Use specific node version (matches your engines config)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the dev server (matches your 'scripts' in package.json)
CMD ["npm", "run", "dev"]
```

**Key Features:**

- Uses Node.js 20 Alpine (lightweight)
- Layer caching optimization (package.json copied first)
- Runs development server with hot-reload

## Frontend Dockerfile

The frontend Dockerfile creates a development container:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# IMPORTANT:
# We add '-- --host' to expose Vite to the Docker network.
# Without this, you cannot access the site from your browser.
CMD ["npm", "run", "dev", "--", "--host"]
```

**Key Features:**

- Uses Node.js 20 Alpine
- Exposes Vite dev server to Docker network with `--host` flag
- Enables access from host machine

## Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
PORT=3000

# Database Connection Info
DB_HOST=database
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password
DB_NAME=my_app_db
```

**Important**: Set `DB_HOST=database` (the Docker service name) instead of `localhost` when running in Docker.

### Frontend (Environment)

The frontend uses the `VITE_API_URL` environment variable set in `docker-compose.yml`:

```yaml
environment:
  - VITE_API_URL=http://backend:3000
```

This allows the frontend to communicate with the backend service within the Docker network.

## Getting Started

### 1. Prepare Environment Files

Ensure `backend/.env` exists with the correct database configuration:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and verify `DB_HOST=database` for Docker usage.

### 2. Build and Start Services

Start all services:

```bash
docker compose up
```

Or run in detached mode (background):

```bash
docker compose up -d
```

### 3. View Logs

View logs from all services:

```bash
docker compose logs -f
```

View logs from a specific service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

### 4. Stop Services

Stop all services:

```bash
docker compose down
```

Stop and remove volumes (clears database data):

```bash
docker compose down -v
```

## Common Commands

### Rebuild Containers

If you change Dockerfiles or need to rebuild:

```bash
docker compose build
docker compose up
```

## Development Workflow

1. **Start services**: `docker compose up -d`
2. **Make code changes**: Files are mounted, changes reflect immediately
3. **View logs**: `docker compose logs -f`
4. **Stop when done**: `docker compose down`

Hot-reload works automatically for both frontend and backend thanks to volume mounts and development servers.

## Production Considerations

**These Dockerfiles are for development only**

For production:

1. Use multi-stage builds
2. Minimize image size
3. Don't mount source code
4. Use production builds (e.g., `npm run build`)
5. Add proper security configurations
6. Use environment-specific configurations
