import { QueryResult } from 'pg';
import { pool } from '../config/db';
import { Todo, TodoFilterOptions, TodoSortBy } from '../types/todo-types';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

interface TodoRow {
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

function mapRowToTodo(row: TodoRow): Todo {
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

/**
 * 상태 필터에 대응하는 WHERE 조건 문자열을 반환한다.
 * 도메인 정의서 §5 상태 정의 기반:
 *   pending:     is_completed = false AND CURRENT_DATE < start_date
 *   in_progress: is_completed = false AND start_date <= CURRENT_DATE AND CURRENT_DATE <= due_date
 *   overdue:     is_completed = false AND CURRENT_DATE > due_date
 *   completed:   is_completed = true
 *   closed:      (is_completed = false AND CURRENT_DATE > due_date) OR is_completed = true
 */
function buildStatusCondition(status: NonNullable<TodoFilterOptions['status']>): string {
  switch (status) {
    case 'pending':
      return 'is_completed = false AND CURRENT_DATE < start_date';
    case 'in_progress':
      return 'is_completed = false AND start_date <= CURRENT_DATE AND CURRENT_DATE <= due_date';
    case 'overdue':
      return 'is_completed = false AND CURRENT_DATE > due_date';
    case 'completed':
      return 'is_completed = true';
    case 'closed':
      return '((is_completed = false AND CURRENT_DATE > due_date) OR is_completed = true)';
  }
}

function buildSortColumn(sortBy: TodoSortBy): string {
  const ALLOWED_COLUMNS: Record<TodoSortBy, string> = {
    start_date: 'start_date',
    due_date: 'due_date',
    created_at: 'created_at',
  };
  return ALLOWED_COLUMNS[sortBy];
}

export async function create(
  userId: string,
  title: string,
  description: string | null | undefined,
  startDate: string,
  dueDate: string,
): Promise<Todo> {
  const sql = `
    INSERT INTO todos (user_id, title, description, start_date, due_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result: QueryResult<TodoRow> = await pool.query(sql, [
    userId,
    title,
    description ?? null,
    startDate,
    dueDate,
  ]);

  const row = result.rows[0];
  if (!row) {
    throw new Error('할일 생성에 실패했습니다.');
  }

  return mapRowToTodo(row);
}

export async function findById(id: string): Promise<Todo | null> {
  const sql = `
    SELECT *
    FROM todos
    WHERE id = $1
  `;

  const result: QueryResult<TodoRow> = await pool.query(sql, [id]);

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapRowToTodo(row);
}

export async function findByUserId(
  userId: string,
  options: TodoFilterOptions = {},
): Promise<Todo[]> {
  const params: unknown[] = [userId];
  const conditions: string[] = ['user_id = $1'];

  if (options.status) {
    conditions.push(buildStatusCondition(options.status));
  }

  const whereClause = conditions.join(' AND ');

  const sortColumn = buildSortColumn(options.sortBy ?? 'created_at');
  const sortOrder = options.sortOrder === 'DESC' ? 'DESC' : 'ASC';

  const size = Math.min(options.size ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const page = Math.max(options.page ?? 1, 1);
  const offset = (page - 1) * size;

  params.push(size);
  const limitParam = `$${params.length}`;

  params.push(offset);
  const offsetParam = `$${params.length}`;

  const sql = `
    SELECT *
    FROM todos
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result: QueryResult<TodoRow> = await pool.query(sql, params);

  return result.rows.map(mapRowToTodo);
}

export async function countByUserId(
  userId: string,
  options: TodoFilterOptions = {},
): Promise<number> {
  const params: unknown[] = [userId];
  const conditions: string[] = ['user_id = $1'];

  if (options.status) {
    conditions.push(buildStatusCondition(options.status));
  }

  const whereClause = conditions.join(' AND ');

  const sql = `
    SELECT COUNT(*) AS total
    FROM todos
    WHERE ${whereClause}
  `;

  const result: QueryResult<{ total: string }> = await pool.query(sql, params);

  return parseInt(result.rows[0]?.total ?? '0', 10);
}

export async function update(
  id: string,
  title: string,
  description: string | null | undefined,
  startDate: string,
  dueDate: string,
): Promise<Todo> {
  const sql = `
    UPDATE todos
    SET
      title = $2,
      description = $3,
      start_date = $4,
      due_date = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const result: QueryResult<TodoRow> = await pool.query(sql, [
    id,
    title,
    description ?? null,
    startDate,
    dueDate,
  ]);

  const row = result.rows[0];
  if (!row) {
    throw new Error('할일을 찾을 수 없습니다.');
  }

  return mapRowToTodo(row);
}

export async function updateCompletionStatus(
  id: string,
  isCompleted: boolean,
): Promise<Todo> {
  const sql = `
    UPDATE todos
    SET
      is_completed = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const result: QueryResult<TodoRow> = await pool.query(sql, [id, isCompleted]);

  const row = result.rows[0];
  if (!row) {
    throw new Error('할일을 찾을 수 없습니다.');
  }

  return mapRowToTodo(row);
}

export async function deleteById(id: string): Promise<boolean> {
  const sql = `
    DELETE FROM todos
    WHERE id = $1
  `;

  const result = await pool.query(sql, [id]);

  return (result.rowCount ?? 0) > 0;
}
