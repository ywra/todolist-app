import { Request, Response, NextFunction } from 'express';
import * as todoService from '../services/todo-service';
import { TodoListQuery } from '../types/todo-types';

export async function createTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const todo = await todoService.createTodo((req as any).user.userId, req.body);
    res.status(201).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
}

export async function getTodos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: TodoListQuery = {
      page: req.query['page'] ? Number(req.query['page']) : undefined,
      size: req.query['size'] ? Number(req.query['size']) : undefined,
      status: req.query['status'] as TodoListQuery['status'],
      sortBy: req.query['sortBy'] as TodoListQuery['sortBy'],
      sortOrder: req.query['sortOrder'] as TodoListQuery['sortOrder'],
    };

    const { todos, pagination } = await todoService.getTodos((req as any).user.userId, query);
    res.status(200).json({ success: true, data: todos, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getTodoById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const todo = await todoService.getTodoById((req as any).user.userId, req.params['id'] as string);
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
}

export async function updateTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const todo = await todoService.updateTodo((req as any).user.userId, req.params['id'] as string, req.body);
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
}

export async function completeTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const todo = await todoService.completeTodo((req as any).user.userId, req.params['id'] as string);
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
}

export async function incompleteTodo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const todo = await todoService.incompleteTodo((req as any).user.userId, req.params['id'] as string);
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
}

export async function deleteTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await todoService.deleteTodo((req as any).user.userId, req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
