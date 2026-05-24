# Multi-Service Docker Compose Guide

## 🐳 Understanding the Architecture

Your application now consists of **three services**:

```
docker-compose.yml
├── postgres    (Database)  :5432
├── backend     (FastAPI)   :8000
└── frontend    (React+Vite) :5173
```

All running in **Docker containers** on the same **Docker network**.

## 🚀 Quick Start

### Start Everything

```bash
cd notes-devops/backend

# Build images and start all services
docker-compose up --build

# First time? This takes 2-3 minutes:
# 1. Download base images (python:3.12-slim, node:20-alpine, postgres:16)
# 2. Install Python dependencies (fastapi, sqlalchemy, etc)
# 3. Install Node dependencies (react, vite, axios, etc)
# 4. Start services
```

### Expected Output

```
notes-postgres   | CREATE DATABASE
postgres_1       | database system is ready to accept connections
                 |
notes-backend    | Application startup complete
notes-backend    | Uvicorn running on http://0.0.0.0:8000
                 |
notes-frontend   | > notes-frontend@1.0.0 dev
notes-frontend   | > vite
notes-frontend   |
notes-frontend   | ➜  Local:   http://localhost:5173/
notes-frontend   | ➜  press h to show help
```

### Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **Database:** localhost:5432 (use pgAdmin or psql)

## 🔄 Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs (live)
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 frontend
```

### Execute Commands in Containers

```bash
# Run bash in backend container
docker-compose exec backend bash

# Run bash in frontend container
docker-compose exec frontend bash

# Run Python in backend
docker-compose exec backend python -c "import fastapi; print(fastapi.__version__)"

# Run npm in frontend
docker-compose exec frontend npm list
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build backend
```

### Stop and Clean Up

```bash
# Stop all services (keeps volumes)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including data
docker-compose down -v

# Clean up everything (images, containers, volumes)
docker system prune -a --volumes
```

---

## 🐛 Debugging Common Issues

### Issue: "Cannot connect to backend" (Frontend error)

**Check 1: Backend is running**
```bash
docker-compose logs backend
# Look for errors or confirmation that it started
```

**Check 2: CORS is configured**
```bash
# In docker container
docker-compose exec backend cat app/main.py | grep -A 5 "CORSMiddleware"
# Should show CORS middleware configured
```

**Check 3: Network connectivity**
```bash
# From frontend container, try to reach backend
docker-compose exec frontend curl -s http://backend:8000/docs | head
# Should show HTML (Swagger docs)
```

**Check 4: Environment variable**
```bash
# Check frontend env
docker-compose exec frontend env | grep VITE_API_BASE_URL
# Should show: VITE_API_BASE_URL=http://backend:8000
```

### Issue: "Database connection refused" (Backend can't reach postgres)

**Check 1: Postgres is running**
```bash
docker-compose logs postgres
# Look for: "database system is ready"
```

**Check 2: Backend waits for postgres**
```bash
# docker-compose.yml should have:
# depends_on:
#   postgres:
#     condition: service_healthy

docker-compose logs postgres | grep "ready"
```

**Check 3: Database credentials match**
```bash
# In docker-compose.yml (postgres service):
# POSTGRES_USER: admin
# POSTGRES_PASSWORD: admin123
# POSTGRES_DB: notes_db

# In backend/.env:
# DATABASE_URL=postgresql://admin:admin123@postgres:5432/notes_db
#                            ↑ must match
```

### Issue: "Module not found" (Python imports failing)

**Check 1: Requirements installed**
```bash
docker-compose exec backend pip list | grep fastapi
# Should list: fastapi, uvicorn, sqlalchemy, etc
```

**Check 2: Rebuild to install new packages**
```bash
# After adding to requirements.txt:
docker-compose up --build backend
```

### Issue: "Module not found" (Node imports failing)

**Check 1: Dependencies installed**
```bash
docker-compose exec frontend npm list | head
# Should show: react, react-dom, react-router-dom, axios, etc
```

**Check 2: Rebuild to install new packages**
```bash
# After adding to package.json:
docker-compose up --build frontend
```

---

## 📊 Networking (How Services Talk)

### Service Names as Hostnames

Inside Docker network, use **service name** as hostname:

```
Frontend → http://backend:8000    ✅ Works
Frontend → http://localhost:8000  ❌ Doesn't work (localhost = frontend container)
Frontend → http://127.0.0.1:8000  ❌ Doesn't work (localhost = frontend container)
```

**Why?** Docker's internal DNS resolves service names to their IP addresses.

### Port Mapping

```
Host Machine          Docker Network        Container
localhost:5173   ←→  frontend:5173    ←→  :5173 (Vite server)
localhost:8000   ←→  backend:8000     ←→  :8000 (FastAPI server)
localhost:5432   ←→  postgres:5432    ←→  :5432 (PostgreSQL)
```

**Access from host:** Use `localhost:port`  
**Access from container:** Use `service_name:port`

---

## 📁 Volumes Explained

### Hot Reload (Development)

```yaml
# frontend service
volumes:
  - ../frontend:/app              # Mount source code
  - /app/node_modules             # Don't override node_modules
```

**Why this setup?**
- Changes to `../frontend/src/**` are immediately reflected in container
- Vite dev server detects changes → HMR (Hot Module Replacement)
- `node_modules` stays inside container (not synced from host)

**Result:** Edit code → Save → Browser auto-refreshes ✨

### Database Persistence

```yaml
# postgres service
volumes:
  - postgres_data:/var/lib/postgresql/data
```

**Why?** When postgres container restarts, data isn't lost.

```bash
# Data persists in named volume
docker volume ls | grep postgres_data

# Remove volume to reset database
docker-compose down -v
```

---

## 🔍 Inspecting Services

### View Containers Running

```bash
docker-compose ps
```

Output:
```
NAME                COMMAND                STATUS          PORTS
notes-postgres      docker-entrypoint.sh   Up 2 minutes    5432/tcp
notes-backend       ./entrypoint.sh        Up 2 minutes    0.0.0.0:8000->8000/tcp
notes-frontend      npm run dev            Up 2 minutes    0.0.0.0:5173->5173/tcp
```

### Get Container ID

```bash
# For a specific service
CONTAINER_ID=$(docker-compose ps -q backend)

# Inspect container
docker inspect $CONTAINER_ID
```

### Network

```bash
# See Docker network
docker network ls

# Inspect network
docker network inspect notes-devops_default
# Shows all containers connected and their IPs
```

### Database Access from Host

```bash
# Using psql (if installed)
psql -h localhost -U admin -d notes_db
# Password: admin123

# Or use docker
docker-compose exec postgres psql -U admin notes_db

# List tables
\dt
```

---

## 📈 Performance Tips

### Reduce Build Time

```bash
# Use BuildKit (faster, better caching)
DOCKER_BUILDKIT=1 docker-compose build

# Use --no-cache only when necessary
docker-compose build --no-cache frontend
```

### Reduce Image Size

```dockerfile
# Backend Dockerfile already uses slim image
FROM python:3.12-slim     # 180MB instead of 1GB

# Frontend uses alpine
FROM node:20-alpine       # 40MB instead of 900MB
```

### Monitor Resource Usage

```bash
# See CPU, Memory usage
docker stats

# Specific service
docker stats notes-backend
```

---

## 🔐 Security Notes

### Never Commit Secrets

```bash
# Don't commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Set secrets in production via:
# - Environment variables
# - Secret management tools (AWS Secrets Manager, Vault)
# - Docker secrets (for Swarm)
```

### Limit Container Privileges

```yaml
# In production, add:
backend:
  # ... other config
  user: "nobody"           # Run as non-root user
  read_only: true          # Filesystem read-only
  cap_drop:
    - ALL                   # Drop all capabilities
```

---

## 📚 Docker Compose Reference

### Structure

```yaml
services:
  service_name:
    build: ./path              # Build from Dockerfile
    # OR
    image: image:tag           # Use existing image
    
    container_name: name       # Name the container
    
    ports:
      - "host:container"       # Port mapping
    
    volumes:
      - path:/container/path   # Mount path
      - name_volume:/path      # Mount named volume
    
    environment:
      - KEY=value              # Environment variables
    
    env_file:
      - .env                   # Load from file
    
    depends_on:
      - service2               # Wait for service
    
    restart: always            # Restart policy

volumes:
  volume_name:                 # Define named volume
```

---

## ✅ Checklist: Everything Working?

- [ ] `docker-compose up` completes without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] Can register a new account
- [ ] Can login with registered account
- [ ] Can create a note
- [ ] Can see note in list
- [ ] Can edit note
- [ ] Can delete note
- [ ] Token persists after page refresh
- [ ] Logout clears token
- [ ] Cannot access /notes without login

If any fail, check logs: `docker-compose logs <service>`

---

## 🎓 What You Learned

✅ Multi-service Docker orchestration  
✅ Service communication via network  
✅ Volume mounting for development  
✅ Port mapping and forwarding  
✅ Health checks and dependencies  
✅ Debugging container issues  
✅ Docker Compose commands  
✅ Networking in containers  

**Next:** Deploy to production (AWS, Heroku, DigitalOcean)! 🚀
