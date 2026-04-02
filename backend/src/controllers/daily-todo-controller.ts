import { Request, Response, NextFunction } from 'express';
import * as dailyTodoService from '../services/daily-todo-service';

export async function getDailyTodos(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dailyTodos = await dailyTodoService.getDailyTodos((req as any).user.userId);
    res.status(200).json({ success: true, data: dailyTodos });
  } catch (err) {
    next(err);
  }
}

export async function createDailyTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dailyTodo = await dailyTodoService.createDailyTodo(
      (req as any).user.userId,
      req.body,
    );
    res.status(201).json({ success: true, data: dailyTodo });
  } catch (err) {
    next(err);
  }
}

export async function completeDailyTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dailyTodo = await dailyTodoService.completeDailyTodo(
      (req as any).user.userId,
      req.params['id'] as string,
    );
    res.status(200).json({ success: true, data: dailyTodo });
  } catch (err) {
    next(err);
  }
}

export async function incompleteDailyTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dailyTodo = await dailyTodoService.incompleteDailyTodo(
      (req as any).user.userId,
      req.params['id'] as string,
    );
    res.status(200).json({ success: true, data: dailyTodo });
  } catch (err) {
    next(err);
  }
}

export async function deleteDailyTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await dailyTodoService.deleteDailyTodo(
      (req as any).user.userId,
      req.params['id'] as string,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
