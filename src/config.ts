import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const fileExists = (filePath: string) => {
    const absPath = path.resolve(__dirname, filePath);
    return fs.existsSync(absPath);
};

const transformAbsPath = (filePath: string) =>
    path.resolve(__dirname, filePath);

const EnvSchema = z.object({
    ACCESS_PRIVATE_KEY_PATH: z
        .string()
        .refine(fileExists, {
            message: 'ACCESS_PRIVATE_KEY_PATH must point to an existing file',
        })
        .transform(transformAbsPath),
    ACCESS_PUBLIC_KEY_PATH: z
        .string()
        .refine(fileExists, {
            message: 'ACCESS_PUBLIC_KEY_PATH must point to an existing file',
        })
        .transform(transformAbsPath),
    ACCESS_TOKEN_EXP_TIME: z
        .string()
        .transform(Number)
        .refine((exp) => exp > 0, {
            message: 'ACCESS_TOKEN_EXP_TIME must be a positive number',
        }),
    APP_PORT: z
        .string()
        .transform(Number)
        .refine((port) => port > 0, {
            message: 'APP_PORT must be a positive number',
        }),
    DB_HOST: z.string(),
    DB_NAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z
        .string()
        .transform(Number)
        .refine((port) => port > 0, {
            message: 'DB_PORT must be a positive number',
        }),
    DB_URL: z.string(),
    DB_USER: z.string(),
    FILE_SIZE_LIMIT: z
        .string()
        .transform(Number)
        .refine((exp) => exp > 0, {
            message: 'FILE_SIZE_LIMIT must be a positive number',
        }),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    REFRESH_TOKEN_EXP_TIME: z
        .string()
        .transform(Number)
        .refine((exp) => exp > 0, {
            message: 'ACCESS_TOKEN_EXP_TIME must be a positive number',
        }),
    S3_HOST: z.string(),
    S3_PASSWORD: z.string(),
    S3_PORT: z
        .string()
        .transform(Number)
        .refine((port) => port > 0, {
            message: 'S3_PORT must be a positive number',
        }),
    S3_USER: z.string(),
});

export const Env = EnvSchema.parse(process.env);
