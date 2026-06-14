"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export interface ProfileData {
  session_id: string;
  zip_code: string;
  state: string;
  usda_zone: string;
  grass_type: string;
  square_footage?: number | null;
  has_pets: boolean;
  sun_exposure: string;
}

export async function saveProfile(data: ProfileData): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  try {
    await db.query(
      `INSERT INTO user_profiles (
        clerk_user_id, session_id, zip_code, state, usda_zone,
        grass_type, square_footage, has_pets, sun_exposure, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (session_id) DO UPDATE SET
        clerk_user_id = EXCLUDED.clerk_user_id,
        zip_code = EXCLUDED.zip_code,
        state = EXCLUDED.state,
        usda_zone = EXCLUDED.usda_zone,
        grass_type = EXCLUDED.grass_type,
        square_footage = EXCLUDED.square_footage,
        has_pets = EXCLUDED.has_pets,
        sun_exposure = EXCLUDED.sun_exposure,
        updated_at = NOW()`,
      [
        userId ?? null,
        data.session_id,
        data.zip_code,
        data.state,
        data.usda_zone,
        data.grass_type,
        data.square_footage ?? null,
        data.has_pets,
        data.sun_exposure,
      ]
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getProfile(sessionId: string): Promise<ProfileData | null> {
  const { userId } = await auth();

  try {
    let result;

    if (userId) {
      result = await db.query(
        `SELECT * FROM user_profiles
         WHERE clerk_user_id = $1 OR session_id = $2
         ORDER BY updated_at DESC LIMIT 1`,
        [userId, sessionId]
      );
    } else {
      result = await db.query(
        `SELECT * FROM user_profiles WHERE session_id = $1 LIMIT 1`,
        [sessionId]
      );
    }

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      session_id: row.session_id,
      zip_code: row.zip_code,
      state: row.state,
      usda_zone: row.usda_zone,
      grass_type: row.grass_type,
      square_footage: row.square_footage,
      has_pets: row.has_pets,
      sun_exposure: row.sun_exposure,
    };
  } catch {
    return null;
  }
}
