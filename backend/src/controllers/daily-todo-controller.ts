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

export async function getCalendarData(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const year = Number(req.query['year']);
    const month = Number(req.query['month']);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      res.status(400).json({ success: false, error: 'year는 2000~2100 사이의 정수여야 합니다.' });
      return;
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      res.status(400).json({ success: false, error: 'month는 1~12 사이의 정수여야 합니다.' });
      return;
    }

    const dailyTodos = await dailyTodoService.getCalendarData(
      (req as any).user.userId,
      year,
      month,
    );
    res.status(200).json({ success: true, data: dailyTodos });
  } catch (err) {
    next(err);
  }
}
