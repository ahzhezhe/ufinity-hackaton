import { FloorPlan } from '../../models/FloorPlan';
import { AppError } from '../../middleware/errorHandler';

export const getActiveFloorPlan = async () => {
  const floorPlan = await FloorPlan.findOne({
    where: { isActive: true },
  });

  return floorPlan;
};

export const getAllFloorPlans = async () => {
  const floorPlans = await FloorPlan.findAll({
    order: [['uploadedAt', 'DESC']],
  });

  return floorPlans;
};

export const uploadFloorPlan = async (name: string, imageUrl: string) => {
  // Deactivate all existing floor plans
  await FloorPlan.update({ isActive: false }, { where: {} });

  // Create new floor plan as active
  const floorPlan = await FloorPlan.create({
    name,
    imageUrl,
    isActive: true,
  });

  return floorPlan;
};

export const setActiveFloorPlan = async (id: string) => {
  const floorPlan = await FloorPlan.findByPk(id);

  if (!floorPlan) {
    throw new AppError(404, 'Floor plan not found');
  }

  // Deactivate all floor plans
  await FloorPlan.update({ isActive: false }, { where: {} });

  // Activate the selected one
  floorPlan.isActive = true;
  await floorPlan.save();

  return floorPlan;
};

export const deleteFloorPlan = async (id: string) => {
  const floorPlan = await FloorPlan.findByPk(id);

  if (!floorPlan) {
    throw new AppError(404, 'Floor plan not found');
  }

  await floorPlan.destroy();
};
