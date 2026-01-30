# Hot Desk Booking System - Setup Guide

This guide will walk you through setting up the Hot Desk Booking System locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

## Project Structure

```
ufinity-hackaton/
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # React + Vite + TypeScript SPA
├── e2e/              # Playwright E2E tests
├── PLAN.md           # Architecture documentation
├── TECHSTACK.md      # Technology stack documentation
├── TESTPLAN.md       # Test documentation
└── SETUP_GUIDE.md    # This file
```

---

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
cd ufinity-hackaton

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Set Up MySQL Database

### Option A: Using MySQL Command Line

```bash
# Connect to MySQL as root
mysql -u root -p

# Create the database (optional - the seed script will create it automatically)
CREATE DATABASE hotdesk;

# Exit MySQL
exit
```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Create a new schema named `hotdesk`

> **Note:** The seed script will automatically create the database if it doesn't exist.

---

## Step 3: Configure Backend Environment

```bash
cd backend

# Copy the example environment file
cp .env.example .env

# Edit .env with your MySQL credentials
```

Edit the `.env` file with your database settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotdesk
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

> **Important:** Replace `your_mysql_password` with your actual MySQL password.

---

## Step 4: Initialize Database with Seed Data

Run the database reset script to create tables and seed initial data:

```bash
cd backend

# Using npm script
npm run db:reset

# OR using shell script
./scripts/reset-db.sh
```

This will:
- Create the `hotdesk` database if it doesn't exist
- Create all required tables
- Seed initial users and sample data

### Seeded Users

| Role     | Email              | Password  |
|----------|-------------------|-----------|
| Admin    | admin@hotdesk.com | admin123  |
| Employee | john@hotdesk.com  | user123   |
| Employee | jane@hotdesk.com  | user123   |
| Employee | bob@hotdesk.com   | user123   |

---

## Step 5: Start the Backend Server

```bash
cd backend

# Start in development mode (with hot reload)
npm run dev
```

The API will be available at: **http://localhost:3000**

### Verify Backend is Running

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

---

## Step 6: Start the Frontend Application

Open a new terminal:

```bash
cd frontend

# Start in development mode
npm run dev
```

The application will be available at: **http://localhost:5173**

---

## Step 7: Access the Application

Open your browser and navigate to: **http://localhost:5173**

### Login as Admin
- Email: `admin@hotdesk.com`
- Password: `admin123`

Admin features:
- Dashboard with statistics
- Manage seats (create, edit, block, delete)
- View all bookings
- Upload floor plans

### Login as Employee
- Email: `john@hotdesk.com`
- Password: `user123`

Employee features:
- View seat availability
- Book desks (AM/PM slots)
- View and cancel own bookings
- See who booked what

---

## Running Tests

### Backend Unit Tests

```bash
cd backend
npm test
```

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npx playwright install chromium

# Run tests (requires backend and frontend running)
npm test

# Run with visible browser
npm run test:headed

# Run with Playwright UI
npm run test:ui
```

---

## Quick Start (All-in-One)

For convenience, run everything in separate terminal tabs:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 3 - Reset Database (one-time):**
```bash
cd backend && npm run db:reset
```

---

## Troubleshooting

### MySQL Connection Error

```
Error: Unknown database 'hotdesk'
```

**Solution:** Run `npm run db:reset` which will create the database automatically.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Kill the process using the port:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### MySQL Access Denied

```
Error: Access denied for user 'root'@'localhost'
```

**Solution:** Verify your MySQL credentials in the `.env` file.

### Frontend Cannot Connect to Backend

Ensure:
1. Backend is running on port 3000
2. Frontend's API URL is configured correctly (check `frontend/src/lib/api.ts`)

---

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Seats
- `GET /api/seats` - List all seats
- `GET /api/seats/availability?date=YYYY-MM-DD` - Get availability
- `POST /api/seats` - Create seat (admin)
- `PATCH /api/seats/:id` - Update seat (admin)
- `DELETE /api/seats/:id` - Delete seat (admin)

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/:id` - Cancel booking

### Floor Plans
- `GET /api/floor-plans` - List floor plans
- `POST /api/floor-plans` - Upload floor plan (admin)
- `DELETE /api/floor-plans/:id` - Delete floor plan (admin)

---

## Need Help?

Check the following documentation:
- [PLAN.md](./PLAN.md) - Architecture and design decisions
- [TECHSTACK.md](./TECHSTACK.md) - Technology stack details
- [TESTPLAN.md](./TESTPLAN.md) - Testing documentation
