import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FloorPlanAttributes {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  uploadedAt?: Date;
}

export interface FloorPlanCreationAttributes extends Optional<FloorPlanAttributes, 'id' | 'isActive' | 'uploadedAt'> {}

export class FloorPlan extends Model<FloorPlanAttributes, FloorPlanCreationAttributes> implements FloorPlanAttributes {
  public id!: string;
  public name!: string;
  public imageUrl!: string;
  public isActive!: boolean;
  public readonly uploadedAt!: Date;
}

FloorPlan.init(
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
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'image_url',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_active',
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'uploaded_at',
    },
  },
  {
    sequelize,
    tableName: 'floor_plans',
    underscored: true,
    timestamps: false,
  }
);
