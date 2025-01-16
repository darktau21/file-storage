import { z } from 'zod';

export const TokensDto = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});
