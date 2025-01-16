import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dbCredentials: {
        url: process.env.DB_URL!,
    },
    dialect: 'mysql',
    out: './src/db/migrations',
    schema: './src/db/entities/*.ts',
});
