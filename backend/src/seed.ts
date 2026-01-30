import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { sequelize, User, Seat, Booking, FloorPlan } from './models';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { env } from './config/env';

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\``);
  console.log(`✅ Database '${env.db.name}' ready`);
  await connection.end();
}

async function seed() {
  console.log('🔄 Resetting database...');

  // Create database if it doesn't exist
  await createDatabaseIfNotExists();

  // Sync database with force to drop and recreate tables
  await sequelize.sync({ force: true });
  console.log('✅ Database reset complete');

  console.log('🌱 Seeding initial data...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@hotdesk.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
  });
  console.log(`✅ Created admin: ${admin.email} (password: admin123)`);

  // Create employee users
  const employeePasswordHash = await bcrypt.hash('user123', 10);

  const user1 = await User.create({
    name: 'John Smith',
    email: 'john@hotdesk.com',
    passwordHash: employeePasswordHash,
    role: 'employee',
  });
  console.log(`✅ Created employee: ${user1.email} (password: user123)`);

  const user2 = await User.create({
    name: 'Jane Doe',
    email: 'jane@hotdesk.com',
    passwordHash: employeePasswordHash,
    role: 'employee',
  });
  console.log(`✅ Created employee: ${user2.email} (password: user123)`);

  const user3 = await User.create({
    name: 'Bob Wilson',
    email: 'bob@hotdesk.com',
    passwordHash: employeePasswordHash,
    role: 'employee',
  });
  console.log(`✅ Created employee: ${user3.email} (password: user123)`);

  // Create some sample seats
  const seats = await Seat.bulkCreate([
    { name: 'Desk A1', type: 'regular', isBlocked: false },
    { name: 'Desk A2', type: 'regular', isBlocked: false },
    { name: 'Desk A3', type: 'regular', isBlocked: false },
    { name: 'Desk B1', type: 'standing', isBlocked: false },
    { name: 'Desk B2', type: 'standing', isBlocked: false },
    { name: 'Desk C1', type: 'regular', isBlocked: true },
  ]);
  console.log(`✅ Created ${seats.length} seats`);

  // Create some sample bookings for today
  const today = new Date().toISOString().split('T')[0];

  await Booking.create({
    userId: user1.id,
    seatId: seats[0].id,
    date: today,
    slot: 'AM',
  });

  await Booking.create({
    userId: user2.id,
    seatId: seats[1].id,
    date: today,
    slot: 'PM',
  });

  console.log('✅ Created sample bookings');

  console.log('\n🎉 Database seeding complete!\n');
  console.log('='.repeat(50));
  console.log('Login Credentials:');
  console.log('='.repeat(50));
  console.log('Admin:    admin@hotdesk.com / admin123');
  console.log('Employee: john@hotdesk.com  / user123');
  console.log('Employee: jane@hotdesk.com  / user123');
  console.log('Employee: bob@hotdesk.com   / user123');
  console.log('='.repeat(50));

  await sequelize.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
