# ⚡ Quick Start - Get Running in 30 Minutes

After pushing to GitHub, follow these exact steps to have a working backend and database.

---

## Option 1: Using Docker (Recommended - Fastest)

### Prerequisites
- Docker Desktop installed and running

### Steps
```powershell
# 1. Navigate to project
cd d:\odoo

# 2. Start all services (PostgreSQL + Redis + Backend placeholder)
docker-compose up -d

# 3. Wait 10 seconds for PostgreSQL to be ready
Start-Sleep -Seconds 10

# 4. Initialize database with schema
docker exec -i odoo-postgres-1 psql -U coreinventory -d coreinventory < database/schema.sql

# 5. Verify database
docker exec -i odoo-postgres-1 psql -U coreinventory -d coreinventory -c "\dt"
```

You should see all 10 tables listed.

**Result:** PostgreSQL running on localhost:5432, Redis on localhost:6379 ✅

---

## Option 2: Local PostgreSQL Setup (If Docker Not Available)

### Prerequisites
- PostgreSQL 14+ installed locally
- PostgreSQL running as service

### Steps
```powershell
# 1. Navigate to project
cd d:\odoo

# 2. Create database user
# Open PostgreSQL psql terminal as administrator and run:
CREATE USER coreinventory WITH PASSWORD 'coreinventory_secure_pwd_123';
ALTER USER coreinventory WITH CREATEDB;

# 3. Create database
CREATE DATABASE coreinventory OWNER coreinventory;

# 4. Execute schema
# Exit psql, then run this PowerShell command:
psql -U coreinventory -d coreinventory -f "database/schema.sql"

# 5. Verify
psql -U coreinventory -d coreinventory -c "\dt"
```

You should see all 10 tables.

---

## Backend Setup (After Database is Ready)

```powershell
# 1. Navigate to backend
cd d:\odoo\backend

# 2. Install dependencies
npm install

# 3. Create .env file from template
Copy-Item .env.example .env

# 4. Update .env with your database credentials
# Edit the following in .env:
# DATABASE_URL=postgresql://coreinventory:coreinventory_secure_pwd_123@localhost:5432/coreinventory
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# NODE_ENV=development
# REDIS_HOST=localhost

# 5. Test database connection
npm test  # (if tests are set up)
# OR simply start the server:
npm start
```

**Expected Output:**
```
Server running on http://localhost:5000
Database connected successfully
Redis connected
```

---

## Frontend Setup (Optional for Week 1)

```powershell
# 1. Navigate to frontend (in new terminal)
cd d:\odoo\frontend

# 2. Install dependencies
npm install

# 3. Create .env file
Copy-Item .env.example .env

# 4. Start development server
npm start
```

**Expected:** Browser opens to http://localhost:3000

---

## 🔍 Quick Verification Checklist

- [ ] PostgreSQL running (docker or local)
- [ ] All database tables created (`\dt` shows 10 tables)
- [ ] Backend npm install successful
- [ ] .env file created with correct credentials
- [ ] Backend server starts without errors
- [ ] Can connect to https://localhost:5000 (shows running)

---

## ❌ Troubleshooting

### "Database connection refused"
```powershell
# Check PostgreSQL is running
# Docker: docker ps | grep postgres
# Should show running container

# If not, start Docker Desktop and rerun:
docker-compose up -d
```

### "psql command not found"
```powershell
# Add PostgreSQL to PATH
# PostgreSQL typically installed at: C:\Program Files\PostgreSQL\14\bin
# Add that path to Windows Environment Variables

# Or use full path:
"C:\Program Files\PostgreSQL\14\bin\psql" -U coreinventory -d coreinventory -c "\dt"
```

### "npm command not found"
```powershell
# Install Node.js from https://nodejs.org (LTS version)
# Restart PowerShell after installation
# Verify: node --version
```

### "Port 5000/3000 already in use"
```powershell
# Find process using port
netstat -ano | grep 5000

# Kill process (replace PID with actual process ID)
taskkill /PID 12345 /F
```

### "EACCES permission denied"
```powershell
# If using Docker, ensure Docker Desktop has permission
# Restart Docker Desktop
# On Windows, Docker Desktop usually has admin privileges automatically
```

---

## 📊 API Health Check

Once backend is running, open browser and verify:

```
GET http://localhost:5000/health
Expected: { "status": "ok" }

GET http://localhost:5000/api/health  
Expected: { "status": "ok", "database": "connected" }
```

---

## 🎯 Next Immediate Tasks

1. **Week 1 Day 1:** Create Express app.js and health endpoint
2. **Week 1 Day 2:** Implement authentication controllers
3. **Week 1 Day 3:** Build dashboard KPI endpoints
4. **Week 1 Day 4-5:** Frontend Auth pages + Dashboard

Reference: See WORKFLOW.md for complete 4-week schedule.

---

## 💡 Pro Tips

- **Keep docker-compose running** during development: `docker-compose up` (without -d)
- **Watch logs in real-time**: `docker-compose logs -f backend`
- **Reset database**: `docker-compose down` then `docker-compose up -d`
- **Debug queries**: Use DBeaver or pgAdmin to connect to PostgreSQL directly
- **API testing**: Use Postman or Insomnia to test endpoints before frontend builds them

---

**Estimated Time to First Success:** 30 minutes  
**Blockers:** Docker Desktop or PostgreSQL installation  
**Support:** Refer to SETUP.md for more detailed instructions
