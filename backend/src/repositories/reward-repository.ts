import { QueryResult } from 'pg';
import { pool } from '../config/db';
import { Reward } from '../types/reward-types';

interface RewardRow {
  id: string;
  user_id: string;
  milestone: number;
  tier: string;
  title: string;
  description: string | null;
  is_achieved: boolean;
  achieved_at: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRowToReward(row: RewardRow): Reward {
  return {
    id: row.id,
    userId: row.user_id,
    milestone: row.milestone,
    tier: row.tier as Reward['tier'],
    title: row.title,
    description: row.description,
    isAchieved: row.is_achieved,
    achievedAt: row.achieved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findByUserId(userId: string): Promise<Reward[]> {
  const sql = `
    SELECT *
    FROM rewards
    WHERE user_id = $1
    ORDER BY milestone ASC
  `;
  const result: QueryResult<RewardRow> = await pool.query(sql, [userId]);
  return result.rows.map(mapRowToReward);
}

export async function findByUserIdAndMilestone(
  userId: string,
  milestone: number,
): Promise<Reward | null> {
  const sql = `
    SELECT *
    FROM rewards
    WHERE user_id = $1 AND milestone = $2
  `;
  const result: QueryResult<RewardRow> = await pool.query(sql, [userId, milestone]);
  const row = result.rows[0];
  return row ? mapRowToReward(row) : null;
}

export async function create(
  userId: string,
  milestone: number,
  tier: string,
  title: string,
  description: string | null | undefined,
): Promise<Reward> {
  const sql = `
    INSERT INTO rewards (user_id, milestone, tier, title, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result: QueryResult<RewardRow> = await pool.query(sql, [
    userId,
    milestone,
    tier,
    title,
    description ?? null,
  ]);
  const row = result.rows[0];
  if (!row) {
    throw new Error('보상 생성에 실패했습니다.');
  }
  return mapRowToReward(row);
}

export async function update(
  id: string,
  title: string | undefined,
  description: string | null | undefined,
): Promise<Reward> {
  const sql = `
    UPDATE rewards
    SET
      title = COALESCE($2, title),
      description = CASE WHEN $3::boolean THEN $4 ELSE description END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  // description이 명시적으로 전달된 경우에만 업데이트
  const hasDescription = description !== undefined;
  const result: QueryResult<RewardRow> = await pool.query(sql, [
    id,
    title ?? null,
    hasDescription,
    hasDescription ? description : null,
  ]);
  const row = result.rows[0];
  if (!row) {
    throw new Error('보상을 찾을 수 없습니다.');
  }
  return mapRowToReward(row);
}

export async function markAchieved(id: string): Promise<Reward> {
  const sql = `
    UPDATE rewards
    SET
      is_achieved = true,
      achieved_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result: QueryResult<RewardRow> = await pool.query(sql, [id]);
  const row = result.rows[0];
  if (!row) {
    throw new Error('보상을 찾을 수 없습니다.');
  }
  return mapRowToReward(row);
}

export async function getCompletedCount(userId: string): Promise<number> {
  const sql = `
    SELECT COUNT(*) AS total
    FROM todos
    WHERE user_id = $1 AND is_completed = true
  `;
  const result: QueryResult<{ total: string }> = await pool.query(sql, [userId]);
  return parseInt(result.rows[0]?.total ?? '0', 10);
}
