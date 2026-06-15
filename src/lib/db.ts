import { createPool } from '@vercel/postgres';

// Lazy init — prevents crash at module load when POSTGRES_URL is not set in dev.
let _pool: ReturnType<typeof createPool> | null = null;

function getPool() {
  if (!_pool) _pool = createPool();
  return _pool;
}

export const db = {
  query(text: string, values?: unknown[]) {
    return getPool().query(text, values as never[]);
  },
};
