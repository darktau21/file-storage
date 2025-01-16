import { z } from 'zod';

export const UserDto = z.object({
    createdAt: z.date().transform((date) => date.toISOString()),
    id: z.string(),
});
