import { QueryResult } from 'pg';
import { pool } from '../config/db';
import { DailyTodo } from '../types/daily-todo-types';

interface DailyTodoRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  due_date: string;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapRowToDailyTodo(row: DailyTodoRow): DailyTodo {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(
  userId: string,
  title: string,
  description: string | null | undefined,
  startDate: string,
  dueDate: string,
): Promise<DailyTodo> {
  const sql = `
    INSERT INTO daily_todos (user_id, title, description, start_date, due_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result: QueryResult<DailyTodoRow> = await pool.query(sql, [
    userId,
    title,
    description ?? null,
    startDate,
    dueDate,
  ]);
  const row = result.rows[0];
  if (!row) {
    throw new Error('오늘의 할일 생성에 실패했습니다.');
  }
  return mapRowToDailyTodo(row);
}

export async function findDailyByUserId(userId: string): Promise<DailyTodo[]> {
  const sql = `
    SELECT *
    FROM daily_todos
    WHERE user_id = $1
      AND start_date <= CURRENT_DATE
      AND due_date >= CURRENT_DATE
    ORDER BY due_date ASC
  `;
  const result: QueryResult<DailyTodoRow> = await pool.query(sql, [userId]);
  return result.rows.map(mapRowToDailyTodo);
}

export async function findById(id: string): Promise<DailyTodo | null> {
  const sql = `SELECT * FROM daily_todos WHERE id = $1`;
  const result: QueryResult<DailyTodoRow> = await pool.query(sql, [id]);
  const row = result.rows[0];
  return row ? mapRowToDailyTodo(row) : null;
}

export async function updateCompletionStatus(
  id: string,
  isCompleted: boolean,
): Promise<DailyTodo> {
  const sql = `
    UPDATE daily_todos
    SET is_completed = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result: QueryResult<DailyTodoRow> = await pool.query(sql, [id, isCompleted]);
  const row = result.rows[0];
  if (!row) {
    throw new Error('오늘의 할일을 찾을 수 없습니다.');
  }
  return mapRowToDailyTodo(row);
}

export async function deleteById(id: string): Promise<boolean> {
  const sql = `DELETE FROM daily_todos WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getCompletedCount(userId: string): Promise<number> {
  const sql = `
    SELECT COUNT(*) AS total
    FROM daily_todos
    WHERE user_id = $1 AND is_completed = true
  `;
  const result: QueryResult<{ total: string }> = await pool.query(sql, [userId]);
  return parseInt(result.rows[0]?.total ?? '0', 10);
}
