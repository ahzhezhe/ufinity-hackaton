# 🪑 Hot Desk Booking System

A modern hot desk booking and administration system that digitizes the process of booking and managing office hot desks. Built with React, Node.js, TypeScript, and MySQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Features

### Employee Portal
- 📅 **View Seat Availability** - Check desk availability for any date (AM/PM slots)
- 🎯 **Book Desks** - Reserve individual seats with ease
- 📦 **Bulk Booking** - Book multiple seats across multiple days in one go
- 📋 **My Bookings** - View and cancel upcoming reservations
- 👥 **Who Booked What** - See colleague bookings for any given day
- 🗺️ **Floor Plan View** - Visual reference of office layout

### Admin Portal
- 📊 **Dashboard** - Overview with booking statistics
- 🪑 **Seat Management** - Add, edit, delete seats with metadata (type, tags)
- 🚫 **Block/Unblock Seats** - Mark seats unavailable for booking
- 🖼️ **Floor Plan Upload** - Upload and manage office floor plan images
- 📈 **Booking Viewer** - View all bookings with date filtering

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript, Sequelize ORM |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (JSON Web Tokens) |
| **State Management** | TanStack Query (React Query) |
| **Testing** | Jest (backend), Playwright (E2E) |

## 📁 Project Structure

```
ufinity-hackaton/
├── backend/          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Database & environment config
│   │   ├── middleware/   # Auth, error handling
│   │   ├── models/       # Sequelize models
│   │   ├── modules/      # Feature modules (auth, seats, bookings, etc.)
│   │   └── index.ts      # App entry point
│   └── uploads/          # Floor plan images
├── frontend/         # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
├── e2e/              # Playwright E2E tests
├── PLAN.md           # Architecture documentation
├── TECHSTACK.md      # Technology stack details
└── TESTPLAN.md       # Test documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MySQL** v8.0+ ([Download](https://dev.mysql.com/downloads/))
- **npm** (comes with Node.js)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotdesk
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### 3. Initialize Database

```bash
cd backend
npm run db:reset
```

This creates the database, tables, and seeds sample data.

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run start:local
```

### 5. Access the App

Open **http://localhost:5173** in your browser.

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hotdesk.com | admin123 |
| **Employee** | john@hotdesk.com | user123 |
| **Employee** | jane@hotdesk.com | user123 |
| **Employee** | bob@hotdesk.com | user123 |

## 🧪 Running Tests

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
npm test
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats` | List all seats |
| GET | `/api/seats/availability?date=YYYY-MM-DD` | Get availability |
| POST | `/api/seats` | Create seat (admin) |
| PATCH | `/api/seats/:id` | Update seat (admin) |
| DELETE | `/api/seats/:id` | Delete seat (admin) |
| PATCH | `/api/seats/:id/block` | Block/unblock seat (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings |
| GET | `/api/bookings/my` | Get my bookings |
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/bulk` | Bulk create bookings |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Floor Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/floor-plans` | List floor plans (admin) |
| GET | `/api/floor-plans/active` | Get active floor plan |
| POST | `/api/floor-plans` | Upload floor plan (admin) |
| PATCH | `/api/floor-plans/:id/activate` | Set active (admin) |
| DELETE | `/api/floor-plans/:id` | Delete floor plan (admin) |

## 🔧 Troubleshooting

### MySQL Connection Error
```
Error: Unknown database 'hotdesk'
```
**Solution:** Run `npm run db:reset` to create the database automatically.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
lsof -ti:3000 | xargs kill -9
```

### MySQL Access Denied
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Verify MySQL credentials in `.env` file.

## 📚 Documentation

- [PLAN.md](./PLAN.md) - Architecture and design decisions
- [TECHSTACK.md](./TECHSTACK.md) - Technology stack details
- [TESTPLAN.md](./TESTPLAN.md) - Testing documentation

## 📄 License

This project is for demonstration purposes.
