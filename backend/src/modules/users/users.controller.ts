import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as usersService from './users.service';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'employee']),
});

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    const user = await usersService.updateUserRole(req.params.id, role);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
