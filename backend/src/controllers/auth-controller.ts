import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth-service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  res.status(200).json({ success: true, data: { message: '로그아웃 성공' } });
}
