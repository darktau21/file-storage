import { relations } from 'drizzle-orm';
import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { users } from './users';

export const files = mysqlTable('files', {
    ext: varchar({ length: 16 }).notNull(),
    id: varchar({ length: 36 }).unique().notNull(),
    mimeType: varchar({ length: 32 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    ownerId: varchar({ length: 254 }).references(() => users.id, {
        onDelete: 'set null',
    }),
    size: int().notNull(),
    uploadedAt: timestamp().notNull().defaultNow(),
});

export const filesRelations = relations(files, ({ one }) => ({
    owner: one(users, {
        fields: [files.ownerId],
        references: [users.id],
    }),
}));

export type InsertFile = typeof files.$inferInsert;
export type SelectFile = typeof files.$inferSelect;
