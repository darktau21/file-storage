import { z } from 'zod';

export const FILE_ID_PARAM = 'fileId';
export const FileIdDto = z.object({ [FILE_ID_PARAM]: z.string().uuid() });
export type FileIdParam = z.infer<typeof FileIdDto>;
