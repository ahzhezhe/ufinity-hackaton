import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });
};
