import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { Seat } from '../../models/Seat';
import { Booking } from '../../models/Booking';
import { FloorPlan } from '../../models/FloorPlan';
import { generateToken } from '../../utils/jwt';

export const createTestUser = async (data?: Partial<{
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'employee';
}>) => {
  const password = data?.password || 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email: data?.email || `test-${Date.now()}@example.com`,
    passwordHash,
    name: data?.name || 'Test User',
    role: data?.role || 'employee',
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token, password };
};

export const createTestAdmin = async (data?: Partial<{
  email: string;
  password: string;
  name: string;
}>) => {
  return createTestUser({ ...data, role: 'admin' });
};

export const createTestSeat = async (data?: Partial<{
  name: string;
  type: 'regular' | 'standing';
  tags: Record<string, string>;
  isBlocked: boolean;
  floorPlanId: string | null;
}>) => {
  const seat = await Seat.create({
    name: data?.name || `Seat-${Date.now()}`,
    type: data?.type || 'regular',
    tags: data?.tags || {},
    isBlocked: data?.isBlocked || false,
    floorPlanId: data?.floorPlanId || null,
  });

  return seat;
};

export const createTestBooking = async (data: {
  userId: string;
  seatId: string;
  date: string;
  slot: 'AM' | 'PM';
}) => {
  const booking = await Booking.create(data);
  return booking;
};

export const createTestFloorPlan = async (data?: Partial<{
  name: string;
  imageUrl: string;
  isActive: boolean;
}>) => {
  const floorPlan = await FloorPlan.create({
    name: data?.name || 'Test Floor Plan',
    imageUrl: data?.imageUrl || '/uploads/test-floor-plan.png',
    isActive: data?.isActive ?? true,
  });

  return floorPlan;
};

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getFutureDate = (daysFromNow: number = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const getPastDate = (daysAgo: number = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};
