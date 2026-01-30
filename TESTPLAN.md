# Backend Test Plan

## Overview

This document outlines the test plan for the Hot Desk Booking System backend API. Tests are written using **Jest** and **Supertest** for HTTP assertions.

## Test Configuration

| Setting | Value |
|---------|-------|
| Framework | Jest 29.x |
| HTTP Testing | Supertest |
| Database | SQLite (in-memory for tests) |
| Isolation | Sequential execution (maxWorkers: 1) |
| Coverage Target | > 90% |

### Running Tests

```bash
cd backend
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

---

## Test Modules

### 1. Authentication (`auth.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| Register new user | POST /api/auth/register | 201, returns token & user | ✅ |
| Register admin user | POST /api/auth/register | 201, role = admin | ✅ |
| Duplicate email | POST /api/auth/register | 409 Conflict | ✅ |
| Invalid email format | POST /api/auth/register | 400 Bad Request | ✅ |
| Password < 6 chars | POST /api/auth/register | 400 Bad Request | ✅ |
| Missing name | POST /api/auth/register | 400 Bad Request | ✅ |
| Login success | POST /api/auth/login | 200, returns token | ✅ |
| Login invalid email | POST /api/auth/login | 401 Unauthorized | ✅ |
| Login wrong password | POST /api/auth/login | 401 Unauthorized | ✅ |
| Login missing email | POST /api/auth/login | 400 Bad Request | ✅ |
| Login missing password | POST /api/auth/login | 400 Bad Request | ✅ |
| Get profile | GET /api/auth/me | 200, returns user | ✅ |
| Profile without auth | GET /api/auth/me | 401 Unauthorized | ✅ |
| Invalid JWT token | GET /api/auth/me | 401 Unauthorized | ✅ |

**Total: 14 tests**

---

### 2. Users (`users.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| List users (admin) | GET /api/users | 200, array of users | ✅ |
| List users (employee) | GET /api/users | 403 Forbidden | ✅ |
| List users (no auth) | GET /api/users | 401 Unauthorized | ✅ |
| Get user by ID (admin) | GET /api/users/:id | 200, user object | ✅ |
| Get non-existent user | GET /api/users/:id | 404 Not Found | ✅ |
| Get user (employee) | GET /api/users/:id | 403 Forbidden | ✅ |
| Update role (admin) | PATCH /api/users/:id/role | 200, updated user | ✅ |
| Demote admin | PATCH /api/users/:id/role | 200, role = employee | ✅ |
| Update role (employee) | PATCH /api/users/:id/role | 403 Forbidden | ✅ |
| Invalid role value | PATCH /api/users/:id/role | 400 Bad Request | ✅ |
| Update non-existent | PATCH /api/users/:id/role | 404 Not Found | ✅ |

**Total: 11 tests**

---

### 3. Seats (`seats.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| List all seats | GET /api/seats | 200, array of seats | ✅ |
| List with availability | GET /api/seats?date=X | 200, includes availability | ✅ |
| Blocked seat unavailable | GET /api/seats?date=X | availability = false | ✅ |
| List without auth | GET /api/seats | 401 Unauthorized | ✅ |
| Get seat by ID | GET /api/seats/:id | 200, seat object | ✅ |
| Get non-existent seat | GET /api/seats/:id | 404 Not Found | ✅ |
| Create seat (admin) | POST /api/seats | 201, new seat | ✅ |
| Create standing desk | POST /api/seats | 201, type = standing | ✅ |
| Create without name | POST /api/seats | 400 Bad Request | ✅ |
| Create (employee) | POST /api/seats | 403 Forbidden | ✅ |
| Update seat (admin) | PUT /api/seats/:id | 200, updated seat | ✅ |
| Update non-existent | PUT /api/seats/:id | 404 Not Found | ✅ |
| Update (employee) | PUT /api/seats/:id | 403 Forbidden | ✅ |
| Delete seat (admin) | DELETE /api/seats/:id | 204 No Content | ✅ |
| Delete non-existent | DELETE /api/seats/:id | 404 Not Found | ✅ |
| Delete (employee) | DELETE /api/seats/:id | 403 Forbidden | ✅ |
| Block seat (admin) | PATCH /api/seats/:id/block | 200, isBlocked = true | ✅ |
| Unblock seat (admin) | PATCH /api/seats/:id/block | 200, isBlocked = false | ✅ |
| Block (employee) | PATCH /api/seats/:id/block | 403 Forbidden | ✅ |
| Get availability | GET /api/seats/availability | 200, availability data | ✅ |
| Availability range | GET /api/seats/availability/range | 200, date range data | ✅ |
| Filter by type | GET /api/seats?type=standing | 200, filtered seats | ✅ |
| Filter by floor plan | GET /api/seats?floorPlanId=X | 200, filtered seats | ✅ |
| Seat with tags | POST /api/seats | 201, includes tags | ✅ |

**Total: 24 tests**

---

### 4. Bookings (`bookings.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| List all bookings | GET /api/bookings | 200, includes user/seat | ✅ |
| Filter by date | GET /api/bookings?date=X | 200, filtered results | ✅ |
| Filter by date range | GET /api/bookings?startDate&endDate | 200, filtered results | ✅ |
| Filter by userId | GET /api/bookings?userId=X | 200, user's bookings | ✅ |
| List without auth | GET /api/bookings | 401 Unauthorized | ✅ |
| Get my bookings | GET /api/bookings/my | 200, current user only | ✅ |
| My bookings excludes past | GET /api/bookings/my | only future bookings | ✅ |
| Get availability | GET /api/bookings/availability | 200, seat availability | ✅ |
| Create booking | POST /api/bookings | 201, new booking | ✅ |
| Create duplicate | POST /api/bookings | 409 Conflict | ✅ |
| Book blocked seat | POST /api/bookings | 400 Bad Request | ✅ |
| Book past date | POST /api/bookings | 400 Bad Request | ✅ |
| Book invalid seat | POST /api/bookings | 404 Not Found | ✅ |
| Create without auth | POST /api/bookings | 401 Unauthorized | ✅ |
| Bulk create | POST /api/bookings/bulk | 201, created array | ✅ |
| Bulk partial failure | POST /api/bookings/bulk | 201, created + failed | ✅ |
| Cancel own booking | DELETE /api/bookings/:id | 204 No Content | ✅ |
| Cancel other's (admin) | DELETE /api/bookings/:id | 204 No Content | ✅ |
| Cancel other's (employee) | DELETE /api/bookings/:id | 403 Forbidden | ✅ |
| Cancel non-existent | DELETE /api/bookings/:id | 404 Not Found | ✅ |
| Get booking by ID | GET /api/bookings/:id | 200, booking object | ✅ |

**Total: 21 tests**

---

### 5. Floor Plans (`floor-plans.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| Get active floor plan | GET /api/floor-plans/active | 200, active plan | ✅ |
| No active plan | GET /api/floor-plans/active | 200, null | ✅ |
| Active without auth | GET /api/floor-plans/active | 401 Unauthorized | ✅ |
| List all (admin) | GET /api/floor-plans | 200, array | ✅ |
| List all (employee) | GET /api/floor-plans | 403 Forbidden | ✅ |
| Upload floor plan | POST /api/floor-plans | 201, new plan | ✅ |
| Upload without image | POST /api/floor-plans | 400 Bad Request | ✅ |
| Upload without name | POST /api/floor-plans | 400 Bad Request | ✅ |
| Upload (employee) | POST /api/floor-plans | 403 Forbidden | ✅ |
| Set active | PATCH /api/floor-plans/:id/activate | 200, isActive = true | ✅ |
| Deactivates previous | PATCH /api/floor-plans/:id/activate | only one active | ✅ |
| Activate (employee) | PATCH /api/floor-plans/:id/activate | 403 Forbidden | ✅ |
| Delete floor plan | DELETE /api/floor-plans/:id | 204 No Content | ✅ |
| Delete non-existent | DELETE /api/floor-plans/:id | 404 Not Found | ✅ |
| Delete (employee) | DELETE /api/floor-plans/:id | 403 Forbidden | ✅ |
| Get by ID | GET /api/floor-plans/:id | 200, floor plan | ✅ |

**Total: 16 tests**

---

### 6. Health Check (`health.test.ts`)

| Test Case | Endpoint | Expected | Status |
|-----------|----------|----------|--------|
| Health check | GET /api/health | 200, { status: 'ok' } | ✅ |

**Total: 1 test**

---

## Test Summary

| Module | Tests | Coverage |
|--------|-------|----------|
| Auth | 14 | 100% |
| Users | 11 | 100% |
| Seats | 24 | 95% |
| Bookings | 21 | 92% |
| Floor Plans | 16 | 90% |
| Health | 1 | 100% |
| **Total** | **87** | **93.72%** |

---

## Test Helpers

### Test Data Factory (`testData.ts`)

```typescript
// Create test users
createTestUser({ email, password, name, role })
createTestAdmin({ email, password, name })

// Create test resources
createTestSeat({ name, type, tags, isBlocked, floorPlanId })
createTestBooking({ userId, seatId, date, slot })
createTestFloorPlan({ name, imageUrl, isActive })

// Utilities
getAuthHeader(token)  // Returns { Authorization: 'Bearer <token>' }
getFutureDate(days)   // Returns YYYY-MM-DD string
getPastDate(days)     // Returns YYYY-MM-DD string
```

### Test Setup (`setup.ts`)

- Syncs database before each test
- Clears all tables after each test
- Suppresses console.error in test environment

---

## Edge Cases Covered

### Authentication
- [x] Invalid JWT signature
- [x] Expired tokens
- [x] Malformed Authorization header

### Authorization
- [x] Employee accessing admin routes
- [x] User modifying other user's resources
- [x] Admin override for cancellations

### Validation
- [x] Missing required fields
- [x] Invalid email format
- [x] Invalid date format
- [x] Invalid UUID format
- [x] Invalid enum values (role, slot, type)

### Business Logic
- [x] Double booking same seat/date/slot
- [x] Booking blocked seat
- [x] Booking past date
- [x] Seat availability calculation
- [x] Bulk booking partial failures

---

## Running Specific Tests

```bash
# Run single test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Run with verbose output
npm test -- --verbose

# Watch mode for development
npm test -- --watch
```
