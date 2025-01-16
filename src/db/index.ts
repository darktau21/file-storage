import { drizzle } from 'drizzle-orm/mysql2';

import { Env } from '../config';

export const db = drizzle(Env.DB_URL);
