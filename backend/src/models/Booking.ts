import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Seat } from './Seat';

export type BookingSlot = 'AM' | 'PM';

export interface BookingAttributes {
  id: string;
  userId: string;
  seatId: string;
  date: string; // DATEONLY format: 'YYYY-MM-DD'
  slot: BookingSlot;
  createdAt?: Date;
}

export interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'createdAt'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public userId!: string;
  public seatId!: string;
  public date!: string;
  public slot!: BookingSlot;
  public readonly createdAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly seat?: Seat;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    seatId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'seat_id',
      references: {
        model: 'seats',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    slot: {
      type: DataTypes.ENUM('AM', 'PM'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['seat_id', 'date', 'slot'],
        name: 'bookings_seat_date_slot_unique',
      },
    ],
  }
);
