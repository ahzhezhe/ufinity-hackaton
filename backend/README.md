# Hot Desk Booking API

Backend API for the Hot Desk Booking System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env` or create your own):
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Get current user

### Users (Admin)
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Update user role

### Seats
- `GET /api/seats` - List all seats
- `GET /api/seats/:id` - Get seat by ID
- `POST /api/seats` - Create seat (admin)
- `PATCH /api/seats/:id` - Update seat (admin)
- `DELETE /api/seats/:id` - Delete seat (admin)
- `PATCH /api/seats/:id/block` - Block/unblock seat (admin)

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/my` - Get my bookings
- `GET /api/bookings/availability` - Get availability
- `POST /api/bookings` - Create booking(s)
- `DELETE /api/bookings/:id` - Cancel booking

### Floor Plans (Admin)
- `GET /api/floor-plans/active` - Get active floor plan
- `GET /api/floor-plans` - List all floor plans
- `POST /api/floor-plans` - Upload floor plan
- `PATCH /api/floor-plans/:id/activate` - Set active
- `DELETE /api/floor-plans/:id` - Delete floor plan
