# Hot Desk Booking System - Implementation Plan

## Problem Summary

Build an MVP hot desk booking system with two portals:
- **Admin Portal**: For HR/Managers to manage seats, view bookings, and upload floor plans
- **Public Portal**: For employees to view availability, book desks, and manage their bookings

The system requires role-based authentication, flexible seat metadata, and support for bulk bookings with AM/PM time slots.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────┬───────────────────────────────────┤
│      Admin Portal           │         Public Portal             │
│   (localhost:5173/admin)    │      (localhost:5173/)            │
└─────────────────────────────┴───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js + Express)               │
│                       (localhost:3000/api)                      │
├─────────────────────────────────────────────────────────────────┤
│  Auth Middleware │ User API │ Seat API │ Booking API │ Upload   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL/SQLite)                 │
│         users │ seats │ bookings │ floor_plans                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, TypeScript |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | Sequelize + sequelize-typescript |
| **Auth** | bcrypt + jsonwebtoken |
| **Validation** | Zod |
| **Frontend** | React 18, Vite, TypeScript |
| **UI Library** | Tailwind CSS + shadcn/ui |
| **State** | TanStack Query (React Query) |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Zod |

---

## Component Breakdown

### Backend Components

| Component | Responsibility |
|-----------|---------------|
| **Auth Module** | JWT-based authentication, role validation middleware |
| **User Module** | User CRUD, password hashing, role assignment |
| **Seat Module** | Seat CRUD with metadata (type, tags), block/unblock |
| **Booking Module** | Create/cancel bookings, availability check, bulk operations |
| **Upload Module** | Floor plan image upload and retrieval |

### Frontend Components

| Component | Portal | Responsibility |
|-----------|--------|---------------|
| **LoginPage** | Shared | Email/password authentication |
| **Dashboard** | Admin | Overview stats, quick actions |
| **SeatManagement** | Admin | CRUD seats, metadata editor |
| **FloorPlanUpload** | Admin | Upload/display floor plan image |
| **BookingViewer** | Admin | View all bookings with date filter |
| **AvailabilityView** | Public | Grid/list of seats with AM/PM status |
| **BookingFlow** | Public | Multi-step bulk booking wizard |
| **MyBookings** | Public | User's upcoming bookings with cancel |
| **WhoBookedWhat** | Public | Daily booking overview |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Seats Table
```sql
CREATE TABLE seats (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('regular', 'standing') NOT NULL DEFAULT 'regular',
  tags JSONB DEFAULT '{}',
  is_blocked BOOLEAN DEFAULT FALSE,
  floor_plan_id UUID REFERENCES floor_plans(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  seat_id UUID NOT NULL REFERENCES seats(id),
  date DATE NOT NULL,
  slot ENUM('AM', 'PM') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seat_id, date, slot)
);
```

### Floor Plans Table
```sql
CREATE TABLE floor_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Sequelize Models

### User Model
```typescript
@Table({ tableName: 'users' })
class User extends Model {
  @PrimaryKey @Column(DataType.UUID)
  id: string;

  @Unique @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  passwordHash: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.ENUM('admin', 'employee'))
  role: 'admin' | 'employee';

  @HasMany(() => Booking)
  bookings: Booking[];
}
```

### Seat Model
```typescript
@Table({ tableName: 'seats' })
class Seat extends Model {
  @PrimaryKey @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.ENUM('regular', 'standing'))
  type: 'regular' | 'standing';

  @Column(DataType.JSONB)
  tags: Record<string, string>;

  @Default(false) @Column(DataType.BOOLEAN)
  isBlocked: boolean;

  @ForeignKey(() => FloorPlan) @Column(DataType.UUID)
  floorPlanId: string;

  @HasMany(() => Booking)
  bookings: Booking[];
}
```

### Booking Model
```typescript
@Table({
  tableName: 'bookings',
  indexes: [{ unique: true, fields: ['seat_id', 'date', 'slot'] }]
})
class Booking extends Model {
  @PrimaryKey @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User) @Column(DataType.UUID)
  userId: string;

  @ForeignKey(() => Seat) @Column(DataType.UUID)
  seatId: string;

  @Column(DataType.DATEONLY)
  date: string;

  @Column(DataType.ENUM('AM', 'PM'))
  slot: 'AM' | 'PM';

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Seat)
  seat: Seat;
}
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user (admin only) |
| GET | `/api/auth/me` | Get current user |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PATCH | `/api/users/:id/role` | Change user role |

### Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats` | List all seats (with availability for date) |
| POST | `/api/seats` | Create seat (admin) |
| PATCH | `/api/seats/:id` | Update seat (admin) |
| DELETE | `/api/seats/:id` | Delete seat (admin) |
| PATCH | `/api/seats/:id/block` | Block/unblock seat (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings (filterable by date, user) |
| POST | `/api/bookings` | Create booking(s) - supports bulk |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/bookings/availability` | Get availability for date range |
| GET | `/api/bookings/my` | Get current user's bookings |

### Floor Plans (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/floor-plans` | Upload floor plan image |
| GET | `/api/floor-plans/active` | Get active floor plan |

---

## Folder Structure

```
/backend
├── src/
│   ├── config/
│   │   ├── database.ts      # Sequelize connection config
│   │   └── env.ts           # Environment variables
│   ├── models/
│   │   ├── index.ts         # Model associations & exports
│   │   ├── User.ts
│   │   ├── Seat.ts
│   │   ├── Booking.ts
│   │   └── FloorPlan.ts
│   ├── middleware/
│   │   ├── auth.ts          # JWT validation
│   │   ├── roleGuard.ts     # Role-based access
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.routes.ts
│   │   ├── seats/
│   │   │   ├── seats.controller.ts
│   │   │   ├── seats.service.ts
│   │   │   └── seats.routes.ts
│   │   ├── bookings/
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   └── bookings.routes.ts
│   │   └── floor-plans/
│   │       ├── floor-plans.controller.ts
│   │       ├── floor-plans.service.ts
│   │       └── floor-plans.routes.ts
│   ├── utils/
│   │   └── jwt.ts
│   └── index.ts
├── migrations/              # Sequelize CLI migrations
├── seeders/                 # Seed data
├── uploads/                 # Floor plan images
└── package.json

/frontend
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SeatManagement.tsx
│   │   │   ├── BookingViewer.tsx
│   │   │   └── FloorPlanUpload.tsx
│   │   ├── public/
│   │   │   ├── Availability.tsx
│   │   │   ├── BookingFlow.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   └── WhoBookedWhat.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSeats.ts
│   │   └── useBookings.ts
│   ├── lib/
│   │   ├── api.ts           # Axios instance
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Race condition in bulk booking** | Use Sequelize transactions, check availability atomically |
| **Double booking same slot** | Unique constraint on (seat_id, date, slot) |
| **Booking blocked seat** | Validate seat status before booking |
| **Large file uploads** | Limit file size (5MB), validate image types |
| **JWT token expiry** | Implement refresh token or re-login flow |
| **Bulk booking partial failure** | All-or-nothing transaction, return clear errors |
| **Date timezone issues** | Store dates in UTC, convert on frontend |

---

## Implementation Steps

### Phase 1: Project Setup (Day 1)
- [ ] 1. Initialize monorepo structure (`/backend`, `/frontend`)
- [ ] 2. Set up Node.js + Express + TypeScript backend
- [ ] 3. Set up React + Vite + TypeScript frontend
- [ ] 4. Configure ESLint, Prettier
- [ ] 5. Set up Sequelize with SQLite for development
- [ ] 6. Create database migrations for all tables

### Phase 2: Backend Core (Days 2-3)
- [ ] 7. Implement User model and auth routes (register, login)
- [ ] 8. Implement JWT middleware with role checking
- [ ] 9. Implement Seat CRUD with metadata support
- [ ] 10. Implement seat block/unblock functionality
- [ ] 11. Implement Booking model with availability checks
- [ ] 12. Implement bulk booking with Sequelize transactions
- [ ] 13. Implement floor plan upload (multer + local storage)
- [ ] 14. Add API validation (Zod)
- [ ] 15. Add error handling middleware

### Phase 3: Admin Portal (Days 4-5)
- [ ] 16. Set up React Router with protected routes
- [ ] 17. Create admin login page
- [ ] 18. Build seat management UI (table + forms)
- [ ] 19. Build seat metadata editor (tags key-value)
- [ ] 20. Build floor plan upload component
- [ ] 21. Build booking viewer with date filter
- [ ] 22. Add block/unblock seat toggle

### Phase 4: Public Portal (Days 5-6)
- [ ] 23. Create employee login page
- [ ] 24. Build availability grid/list view (AM/PM columns)
- [ ] 25. Build bulk booking wizard (date → slot → seat selection)
- [ ] 26. Build "My Bookings" page with cancel option
- [ ] 27. Build "Who Booked What" daily view
- [ ] 28. Display floor plan image as reference

### Phase 5: Polish & Testing (Day 7)
- [ ] 29. Add loading states and error handling UI
- [ ] 30. Add form validations
- [ ] 31. Write integration tests for critical flows
- [ ] 32. Manual testing of all user journeys
- [ ] 33. Fix bugs and edge cases
- [ ] 34. Seed database with sample data

---

## Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.x",
    "sequelize": "^6.x",
    "sequelize-typescript": "^2.x",
    "pg": "^8.x",
    "pg-hstore": "^2.x",
    "sqlite3": "^5.x",
    "bcrypt": "^5.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x",
    "multer": "^1.x",
    "uuid": "^9.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/express": "^4.x",
    "@types/bcrypt": "^5.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/multer": "^1.x",
    "@types/cors": "^2.x",
    "@types/uuid": "^9.x",
    "sequelize-cli": "^6.x",
    "ts-node": "^10.x",
    "nodemon": "^3.x"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## Key Sequelize Patterns

### Bulk Booking with Transaction
```typescript
await sequelize.transaction(async (t) => {
  const bookings = [];
  for (const seatId of seatIds) {
    for (const date of dates) {
      for (const slot of slots) {
        bookings.push({ userId, seatId, date, slot });
      }
    }
  }
  await Booking.bulkCreate(bookings, { transaction: t });
});
```

### Get Availability with Eager Loading
```typescript
const seats = await Seat.findAll({
  where: { isBlocked: false },
  include: [{
    model: Booking,
    where: { date: targetDate },
    required: false
  }]
});
```

### Filter by JSONB Tags
```typescript
const seats = await Seat.findAll({
  where: {
    'tags.department': 'Engineering'
  }
});
```

---

## Commands

### Backend
```bash
# Install dependencies
cd backend && npm install

# Run migrations
npx sequelize-cli db:migrate

# Seed database
npx sequelize-cli db:seed:all

# Start development server
npm run dev
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev

# Build for production
npm run build
```
