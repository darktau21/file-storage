import type { SQL } from 'drizzle-orm';
import type { MySqlColumn, MySqlSelect } from 'drizzle-orm/mysql-core';

import { z } from 'zod';

export function PaginatedResponseDto(key: string, schema: z.Schema) {
    return z.object({
        [key]: z.array(schema),
        limit: z.number(),
        page: z.number(),
    });
}

export const PaginateParamsDto = z.object({
    list_size: z
        .string()
        .transform(Number)
        .refine((val) => val > 0, { message: 'limit should be 1 or greater' })
        .optional(),
    page: z
        .string()
        .transform(Number)
        .refine((val) => val > 0, { message: 'limit should be 1 or greater' })
        .optional(),
});

export type PaginateParams = z.infer<typeof PaginateParamsDto>;

export function withPagination<T extends MySqlSelect>(
    qb: T,
    orderByColumn: MySqlColumn | SQL | SQL.Aliased,
    page = 1,
    pageSize = 10
) {
    return qb
        .orderBy(orderByColumn)
        .limit(pageSize)
        .offset((page - 1) * pageSize);
}
