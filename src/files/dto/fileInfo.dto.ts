import { z } from 'zod';

export const FileInfoDto = z.object({
    ext: z.string(),
    id: z.string(),
    mimeType: z.string(),
    name: z.string(),
    size: z.number(),
    uploadedAt: z.date().transform((date) => date.toISOString()),
});
