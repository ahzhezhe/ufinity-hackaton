# The Project
Hot Desk Booking and Administration
We are looking for solutions that will digitise the process of booking and managing our office hot desks. The solution should allow employees to easily view and reserve desks, while providing administrative features such as login, roles, and permissions to support HR / Managers.

# Goal
To make a MVP hot desk booking system for HR to use ​

# Scope
Implementing a user portal and admin portal for hot desk booking app

# Additional features
Login, roles and permissions

# MVP Detailed Scope
## Backend API
- User management (simple email/password auth, basic JWT) ​
- Seat CRUD with flexible metadata (type: regular/standing,tags as key-value) ​
- Booking API: create, view, cancel bookings (half-day slots:AM/PM) ​
- Bulk booking support (multiple seats and/or multiple days inone request)

## Admin Portal
- Login as admin ​
- Manage seats: add, edit, delete seats with metadata ​
- Block/unblock seats (mark unavailable for booking) ​
- Upload floor plan image (display only, non-interactive) ​
- View all bookings (filterable by date)

## Public Portal
- Login as employee ​
- View floor plan image (static reference) ​
- View seat availability for selected date (list/grid showingAM/PM availability) ​
- Book seats: select date(s), slot(s), seat(s) - bulk booking flow ​
- View "who booked what" for a given day ​
- View own upcoming bookings with cancel option
