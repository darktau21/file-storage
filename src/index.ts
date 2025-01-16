import 'dotenv/config';
import express from 'express';

import { getAuthRouter } from './auth/auth.router';
import { Env } from './config';
import { getFilesRouter } from './files/files.router';
import { filesService } from './files/files.service';
import { catchAsync } from './lib/catchAsync';
import { HttpException } from './lib/httpException';
import { HttpStatus } from './lib/httpStatus';
import { exceptionMiddleware } from './middlewares/exception.middleware';

async function init() {
    try {
        const handleError = (err: unknown) => {
            console.error('Unhandled server error:', err);
            process.exit(1);
        };

        process.on('uncaughtException', handleError);
        process.on('unhandledRejection', handleError);

        await filesService.init();

        const app = express();
        app.use(express.json(), getAuthRouter());
        app.use(getFilesRouter());
        app.use(
            '/*splat',
            catchAsync(async (_req, _res) => {
                throw new HttpException(
                    HttpStatus.NOT_FOUND,
                    `Route not found`
                );
            })
        );
        app.use(exceptionMiddleware);

        const server = app.listen(Env.APP_PORT, () => {
            console.log(`Server started at port ${Env.APP_PORT}`);
        });

        const handleShutdown = () => {
            server.close((err) => {
                if (err) {
                    console.error('Error closing server:', err);
                }

                console.log('Server stopped');
            });
        };
        process.on('SIGTERM', handleShutdown);
        process.on('SIGINT', handleShutdown);
    } catch (err) {
        console.error('Error on server startup:', err);
        process.exit(1);
    }
}

init();
