import { QueryResult } from 'pg';
import { pool } from '../config/db';
import { User, UserWithPassword } from '../types/auth-types';

interface UserRow {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

interface UserWithPasswordRow extends UserRow {
  password: string;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

function mapRowToUserWithPassword(row: UserWithPasswordRow): UserWithPassword {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    password: row.password,
    createdAt: row.created_at,
  };
}

export async function createUser(
  email: string,
  hashedPassword: string,
  name: string,
): Promise<User> {
  const sql = `
    INSERT INTO users (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
  `;

  const result: QueryResult<UserRow> = await pool.query(sql, [email, hashedPassword, name]);

  const row = result.rows[0];
  if (!row) {
    throw new Error('사용자 생성에 실패했습니다.');
  }

  return mapRowToUser(row);
}

export async function findByEmail(email: string): Promise<UserWithPassword | null> {
  const sql = `
    SELECT id, email, password, name, created_at
    FROM users
    WHERE email = $1
  `;

  const result: QueryResult<UserWithPasswordRow> = await pool.query(sql, [email]);

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapRowToUserWithPassword(row);
}

export async function findById(id: string): Promise<User | null> {
  const sql = `
    SELECT id, email, name, created_at
    FROM users
    WHERE id = $1
  `;

  const result: QueryResult<UserRow> = await pool.query(sql, [id]);

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapRowToUser(row);
}
