import bcrypt from 'bcrypt';
import { User, UserCreationAttributes } from '../../models/User';
import { generateToken, JwtPayload } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';

const SALT_ROUNDS = 10;

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError(401, 'Invalid email or password');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

export const register = async (
  data: Omit<UserCreationAttributes, 'passwordHash'> & { password: string }
): Promise<LoginResult> => {
  const existingUser = await User.findOne({ where: { email: data.email } });

  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await User.create({
    email: data.email,
    passwordHash,
    name: data.name,
    role: data.role || 'employee',
  });

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'name', 'role', 'createdAt'],
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};
