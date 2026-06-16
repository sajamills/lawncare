import { db } from './db';

export interface User {
  id: number;
  clerk_user_id: string;
  email: string | null;
  subscription_status: string;
  stripe_customer_id: string | null;
  created_at: Date;
}

export async function getOrCreateUser(clerkUserId: string, email: string): Promise<User> {
  const result = await db.query(
    `INSERT INTO users (clerk_user_id, email)
     VALUES ($1, $2)
     ON CONFLICT (clerk_user_id)
     DO UPDATE SET email = EXCLUDED.email
     RETURNING *`,
    [clerkUserId, email]
  );
  return result.rows[0] as User;
}
