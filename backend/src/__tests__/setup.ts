import { sequelize, User, Seat, Booking, FloorPlan } from '../models';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

beforeAll(async () => {
  // Sync database before all tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection after all tests
  await sequelize.close();
});

beforeEach(async () => {
  // Clear all tables before each test in correct order (respecting foreign keys)
  try {
    await Booking.destroy({ where: {}, force: true, truncate: true });
    await Seat.destroy({ where: {}, force: true, truncate: true });
    await FloorPlan.destroy({ where: {}, force: true, truncate: true });
    await User.destroy({ where: {}, force: true, truncate: true });
  } catch (error) {
    // Ignore errors during cleanup
  }
});
