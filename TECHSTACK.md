# Technology Stack

## Backend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Framework | Express.js | 4.x | Web framework |
| ORM | Sequelize | 6.x | Database ORM |
| Authentication | JWT | - | Token-based auth |
| Password Hashing | bcrypt | - | Secure password storage |
| Validation | Zod | 3.x | Schema validation |
| File Upload | Multer | - | Multipart form handling |
| Testing | Jest | 29.x | Unit testing framework |
| Testing | Supertest | - | HTTP assertion library |

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Database & environment config
│   ├── middleware/      # Auth, role guard, error handler
│   ├── models/          # Sequelize models (User, Seat, Booking, FloorPlan)
│   ├── modules/         # Feature modules (auth, users, seats, bookings, floor-plans)
│   ├── utils/           # JWT utilities
│   └── index.ts         # Express app entry point
└── package.json
```

---

## Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Framework | React | 18.x | UI library |
| Build Tool | Vite | 5.x | Fast dev server & bundler |
| Routing | React Router | 6.x | Client-side routing |
| State Management | TanStack Query | 5.x | Server state & caching |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Components | shadcn/ui | - | Radix-based components |
| HTTP Client | Axios | 1.x | API requests |
| Icons | Lucide React | - | Icon library |

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/          # shadcn/ui style components
│   ├── hooks/           # TanStack Query hooks (useAuth, useSeats, useBookings)
│   ├── lib/             # API client, utilities
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin portal pages
│   │   └── public/      # Employee portal pages
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx          # Root component with routing
│   └── main.tsx         # Entry point
└── package.json
```

---

## Database

| Category | Technology | Purpose |
|----------|------------|---------|
| Database | SQLite | Lightweight file-based database |
| ORM | Sequelize | Object-relational mapping |

### Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │    seats    │     │ floor_plans │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (UUID)   │     │ id (UUID)   │     │ id (UUID)   │
│ email       │     │ name        │     │ name        │
│ password    │     │ type        │     │ imageUrl    │
│ name        │     │ tags (JSON) │     │ isActive    │
│ role        │     │ isBlocked   │     │ uploadedAt  │
│ createdAt   │     │ floorPlanId │───→ │             │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │    ┌──────────────┴──────────────┐
       │    │          bookings           │
       │    ├─────────────────────────────┤
       └───→│ id (UUID)                   │
            │ userId ──────────────────────┘
            │ seatId ──────────────────────┘
            │ date                         │
            │ slot (AM/PM)                 │
            │ createdAt                    │
            └─────────────────────────────┘
```

### Models

- **User**: Stores user accounts with roles (admin/employee)
- **Seat**: Hot desk seats with type (regular/standing) and optional floor plan
- **Booking**: Links users to seats for specific date + slot (AM/PM)
- **FloorPlan**: Office floor plan images

---

## Development Tools

| Tool | Purpose |
|------|---------|
| npm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Testing |
| ts-node | TypeScript execution |
| nodemon | Dev server hot reload |

---

## API Communication

- **Protocol**: REST over HTTP
- **Format**: JSON
- **Authentication**: Bearer token (JWT)
- **Validation**: Zod schemas on both client and server
- **Error Handling**: Standardized error responses with status codes

```
Frontend (Vite :5173) ──proxy──→ Backend (Express :3000) ──→ SQLite
```
