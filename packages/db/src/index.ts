import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function createDb(env: DatabaseConfig) {
	const sql = neon(env.DATABASE_URL);
	return drizzle({ client: sql, relations });
}



export type Database = ReturnType<typeof createDb>;
