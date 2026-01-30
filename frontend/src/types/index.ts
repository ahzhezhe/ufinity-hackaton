// User types
export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Seat types
export type SeatType = 'regular' | 'standing';

export interface Seat {
  id: string;
  name: string;
  type: SeatType;
  tags: Record<string, string>;
  isBlocked: boolean;
  floorPlanId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  availability?: {
    am: boolean;
    pm: boolean;
  };
}

export interface CreateSeatData {
  name: string;
  type?: SeatType;
  tags?: Record<string, string>;
  floorPlanId?: string | null;
}

export interface UpdateSeatData {
  name?: string;
  type?: SeatType;
  tags?: Record<string, string>;
}

// Booking types
export type BookingSlot = 'AM' | 'PM';

export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  date: string;
  slot: BookingSlot;
  createdAt?: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  seat?: Pick<Seat, 'id' | 'name' | 'type'>;
}

export interface CreateBookingData {
  seatId: string;
  date: string;
  slot: BookingSlot;
}

export interface BulkBookingData {
  seatIds: string[];
  dates: string[];
  slots: BookingSlot[];
}

export interface BookingFilter {
  date?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  seatId?: string;
}

export interface SeatAvailability {
  id: string;
  name: string;
  type: SeatType;
  am: boolean;
  pm: boolean;
}

export interface DateAvailability {
  date: string;
  seats: SeatAvailability[];
}

// Floor Plan types
export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  uploadedAt?: string;
}

// API Response types
export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
