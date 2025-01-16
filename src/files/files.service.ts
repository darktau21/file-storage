import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { and, desc, eq } from 'drizzle-orm';

import { Env } from '../config';
import { db } from '../db';
import { files } from '../db/entities/files';
import { withPagination } from '../lib/paginate';

class FilesService {
    private readonly bucketName = 'files';
    private readonly s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            credentials: {
                accessKeyId: Env.S3_USER,
                secretAccessKey: Env.S3_PASSWORD,
            },
            endpoint: `http://${Env.S3_HOST}:${Env.S3_PORT}`,
            forcePathStyle: true,
            region: 'ru',
        });
    }

    async deleteFile(fileId: string, ownerId: string) {
        const fileInfo = await this.getFileInfo(fileId, ownerId);

        if (!fileInfo) {
            return null;
        }

        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileId,
            })
        );

        await db
            .delete(files)
            .where(and(eq(files.id, fileId), eq(files.ownerId, ownerId)));
        return fileInfo;
    }

    async getFileById(fileId: string, ownerId: string) {
        const fileInfo = await this.getFileInfo(fileId, ownerId);

        if (!fileInfo) {
            return null;
        }

        try {
            const data = await this.s3.send(
                new GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileId,
                })
            );

            if (!data.Body) {
                return null;
            }

            return {
                ...fileInfo,
                body: data.Body,
            };
        } catch {
            return null;
        }
    }

    async getFileInfo(fileId: string, ownerId: string) {
        const [fileInfo] = await db
            .selectDistinct()
            .from(files)
            .where(and(eq(files.id, fileId), eq(files.ownerId, ownerId)));

        return fileInfo;
    }

    async getUserFiles(userId: string, page = 1, limit = 10) {
        const query = db.select().from(files).where(eq(files.ownerId, userId));

        const result = await withPagination(
            query.$dynamic(),
            desc(files.uploadedAt),
            page,
            limit
        );

        return {
            files: result,
            limit,
            page,
        };
    }

    async init() {
        try {
            await this.s3.send(
                new HeadBucketCommand({ Bucket: this.bucketName })
            );
            console.info(`Bucket "${this.bucketName}" already exists.`);
        } catch (error) {
            if ((error as Error).name === 'NotFound') {
                await this.s3.send(
                    new CreateBucketCommand({ Bucket: this.bucketName })
                );
                console.info(`Bucket "${this.bucketName}" created.`);
            } else {
                console.error(
                    `Error checking bucket: ${(error as Error).message}`
                );
            }
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        ownerId: string,
        id: string = crypto.randomUUID()
    ) {
        const params = {
            Body: file.buffer,
            Bucket: this.bucketName,
            ContentType: file.mimetype,
            Key: id,
        };

        try {
            await this.s3.send(new PutObjectCommand(params));
            await db.insert(files).values({
                ext: file.originalname.split('.').at(-1) as string,
                id: id,
                mimeType: file.mimetype,
                name: file.originalname,
                ownerId,
                size: file.size,
            });

            const [uploadedFileInfo] = await db
                .selectDistinct()
                .from(files)
                .where(eq(files.id, id));

            return uploadedFileInfo;
        } catch {
            return null;
        }
    }
}

export const filesService = new FilesService();
