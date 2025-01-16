import { z } from 'zod';

export const RefreshDto = z.object({
    refreshToken: z.string(),
});

export type RefreshPayload = z.infer<typeof RefreshDto>;
