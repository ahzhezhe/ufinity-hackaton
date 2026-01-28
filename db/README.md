# Database Setup Guide

This directory contains all database-related files for the Seat Booking System.

## Directory Structure

```
db/
├── init/                    # Database initialization scripts
│   ├── 000_init_database.sql
│   ├── 001_create_users_table.sql
│   ├── 002_create_seats_table.sql
│   ├── 003_create_bookings_table.sql
│   └── 004_create_floor_plans_table.sql
├── seeds/                   # Seed data scripts
│   ├── 001_users.sql
│   ├── 002_seats.sql
│   ├── 003_bookings.sql
│   └── 004_floor_plans.sql
├── run-migrations.sh        # Migration runner script
├── run-seeds.sh            # Seed data runner script
├── requirements            # Project requirements file
└── README.md              # This file
```

## Prerequisites

### Required
- **MySQL Server** 5.7+ (or compatible)
- **Bash shell** (for running scripts)
- **mysql-client** command-line tool

### Installation

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mysql-server
sudo service mysql start
```

**Windows:**
- Download from [MySQL Official Site](https://dev.mysql.com/downloads/mysql/)
- Or use WSL with Linux instructions

### Verify Installation
```bash
mysql --version
mysql -u root -p -e "SELECT 1"
```

## Environment Configuration

Create or update `.env` file in the `api/` directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=seat_booking
```

**Important:** Update `DATABASE_PASSWORD` with your actual MySQL root password.

## Database Setup Steps

### Step 1: Create Database and Tables

Run the migration script to initialize the database:

```bash
# From the db directory
cd db
bash run-migrations.sh
```

This will:
1. Create the `seat_booking` database
2. Create all required tables with proper constraints and indexes
3. Set up relationships between tables

### Step 2: Seed Sample Data (Optional)

Populate the database with sample data for testing:

```bash
# From db directory
cd db
bash run-seeds.sh
```

This will insert:
- 5 users (1 admin, 4 employees)
- 15 seats with metadata
- Sample bookings for upcoming days
- Floor plan references

### Step 3: Verify Setup

Connect to the database and check:

```bash
mysql -u root -p seat_booking

# List tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check seats
SELECT * FROM seats;
```

## Database Schema Overview

### Users Table
- Email/password authentication
- Two roles: `employee` and `admin`
- Timestamps for creation/updates

### Seats Table
- Seat identification and type (regular/standing)
- Block status for unavailable seats
- Linked to metadata for flexible attributes

### Seat Metadata Table
- Key-value pairs for seat attributes
- Examples: location, floor, capacity, etc.

### Bookings Table
- User seat reservations
- Half-day slots (AM/PM)
- Date-based booking with status tracking
- Unique constraint prevents double-booking

### Floor Plans Table
- Upload references for floor plan images
- Track active floor plan
- Admin can manage multiple plans

## Seed Data Details

### Users (from `seeds/001_users.sql`)
All users have password: `12345678` (bcrypt hashed)

| Email | Role | Name |
|-------|------|------|
| admin@example.com | admin | Admin User |
| john.doe@example.com | employee | John Doe |
| jane.smith@example.com | employee | Jane Smith |
| mike.wilson@example.com | employee | Mike Wilson |
| sarah.johnson@example.com | employee | Sarah Johnson |

### Seats (from `seeds/002_seats.sql`)
- 15 seats labeled A1-A5, B1-B5, C1-C5
- Mix of regular and standing desks
- Metadata tags: location (Window Side, Center, Corner, etc.), floor
- Seat A5 is pre-blocked as example

### Bookings (from `seeds/003_bookings.sql`)
- Sample bookings for next 3 days
- Various time slots and seat combinations
- Demonstrates typical usage patterns

### Floor Plans (from `seeds/004_floor_plans.sql`)
- 2 sample floor plans
- Floor 1 set as active

## Running Scripts Individually

If you need to run specific migrations or seeds:

```bash
# Run single migration
mysql -u root -p -D seat_booking < db/init/001_create_users_table.sql

# Run single seed
mysql -u root -p -D seat_booking < db/seeds/001_users.sql
```

## Resetting the Database

**Warning:** This will delete all data!

```bash
# Drop the database
mysql -u root -p -e "DROP DATABASE seat_booking;"

# Re-run migrations
cd db && bash run-migrations.sh

# Re-seed data (optional)
bash run-seeds.sh
```

## Troubleshooting

### Connection Refused
- Verify MySQL is running: `mysql -u root -p`
- Check `DATABASE_HOST` and `DATABASE_PORT` in `.env`

### "Access Denied"
- Verify `DATABASE_USER` and `DATABASE_PASSWORD` in `.env`
- Reset MySQL root password if forgotten

### "Database Does Not Exist"
- Run migrations first: `npm run db:migrate`

### Foreign Key Constraint Issues
- Ensure tables are created in order (migrations handle this)
- Check `sql_mode` setting: `SELECT @@sql_mode;`

## Backup and Restore

### Backup Database
```bash
mysqldump -u root -p seat_booking > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p seat_booking < backup_20260128.sql
```

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQL Best Practices](https://www.w3schools.com/sql/)
- Project requirements: [requirements](requirements)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review MySQL error logs
3. Verify `.env` configuration
4. Check file permissions on scripts
