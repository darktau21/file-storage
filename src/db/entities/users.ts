import { relations } from 'drizzle-orm';
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { files } from './files';
import { refreshTokens } from './refreshTokens';

export const users = mysqlTable('users', {
    createdAt: timestamp().defaultNow().notNull(),
    id: varchar({ length: 254 }).primaryKey(),
    password: varchar({ length: 60 }).notNull(),
});

export const usersRelations = relations(refreshTokens, ({ many }) => ({
    files: many(files),
    refreshTokens: many(refreshTokens),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
