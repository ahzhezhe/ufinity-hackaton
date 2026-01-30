import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { FloorPlan } from './FloorPlan';

export type SeatType = 'regular' | 'standing';

export interface SeatAttributes {
  id: string;
  name: string;
  type: SeatType;
  tags: Record<string, string>;
  isBlocked: boolean;
  floorPlanId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SeatCreationAttributes extends Optional<SeatAttributes, 'id' | 'type' | 'tags' | 'isBlocked' | 'floorPlanId' | 'createdAt' | 'updatedAt'> {}

export class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
  public id!: string;
  public name!: string;
  public type!: SeatType;
  public tags!: Record<string, string>;
  public isBlocked!: boolean;
  public floorPlanId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly floorPlan?: FloorPlan;
}

Seat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('regular', 'standing'),
      allowNull: false,
      defaultValue: 'regular',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_blocked',
    },
    floorPlanId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'floor_plan_id',
      references: {
        model: 'floor_plans',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'seats',
    underscored: true,
    timestamps: true,
  }
);
