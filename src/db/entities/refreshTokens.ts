import { relations } from 'drizzle-orm';
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { users } from './users';

export const refreshTokens = mysqlTable('refresh_tokens', {
    createdAt: timestamp().defaultNow().notNull(),
    token: varchar({ length: 36 }).primaryKey(),
    userId: varchar({ length: 254 })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type SelectRefreshToken = typeof refreshTokens.$inferSelect;
