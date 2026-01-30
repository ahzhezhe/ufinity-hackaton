import { User, UserRole } from '../../models/User';
import { AppError } from '../../middleware/errorHandler';

export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: ['id', 'email', 'name', 'role', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
  return users;
};

export const getUserById = async (id: string) => {
  const user = await User.findByPk(id, {
    attributes: ['id', 'email', 'name', 'role', 'createdAt'],
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const updateUserRole = async (id: string, role: UserRole) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};
