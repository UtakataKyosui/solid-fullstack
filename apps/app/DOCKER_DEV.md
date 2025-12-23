# Development Quick Start Guide

## Prerequisites
- Docker & Docker Compose
- Bun (for frontend development outside Docker)

## Quick Start

### 1. Start all services with Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up
```

This will start:
- PostgreSQL on port 5433
- Backend (Rust) on port 8000 with hot reload
- Frontend (SolidJS) on port 3000

### 2. Run migrations (first time only)
```bash
# In another terminal
docker-compose -f docker-compose.dev.yml exec backend cargo loco db migrate
```

### 3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- PostgreSQL: localhost:5433

## Development Workflow

### Backend Development
```bash
# Watch logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Run tests
docker-compose -f docker-compose.dev.yml exec backend cargo test

# Check compilation
docker-compose -f docker-compose.dev.yml exec backend cargo check
```

### Frontend Development
```bash
# Option 1: Run inside Docker (already running with docker-compose up)
docker-compose -f docker-compose.dev.yml logs -f frontend

# Option 2: Run locally for faster  iteration
cd frontend
bun install
bun dev
```

### Database Management
```bash
# Access PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d app_development

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend cargo loco db migrate

# Reset database
docker-compose -f docker-compose.dev.yml exec backend cargo loco db reset
```

## Stopping Services
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v
```

## Troubleshooting

### Port already in use
```bash
# Check what's using the port
sudo lsof -i :8000
sudo lsof -i :3000
sudo lsof -i :5433

# Kill the process
sudo kill -9 <PID>
```

### Rebuild containers
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Clear all Docker resources
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

## Notes

- Backend auto-reloads on file changes (cargo-watch)
- Frontend auto-reloads on file changes (Rsbuild HMR)
- Database data persists in Docker volumes
- Cargo dependencies are cached for faster builds
