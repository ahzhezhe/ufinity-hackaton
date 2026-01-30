import { sequelize } from '../config/database';
import { User } from './User';
import { Seat } from './Seat';
import { Booking } from './Booking';
import { FloorPlan } from './FloorPlan';

// Define associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Seat.hasMany(Booking, { foreignKey: 'seatId', as: 'bookings' });
Booking.belongsTo(Seat, { foreignKey: 'seatId', as: 'seat' });

FloorPlan.hasMany(Seat, { foreignKey: 'floorPlanId', as: 'seats' });
Seat.belongsTo(FloorPlan, { foreignKey: 'floorPlanId', as: 'floorPlan' });

// Sync database
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export { sequelize, User, Seat, Booking, FloorPlan };
