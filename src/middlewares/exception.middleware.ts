import type { NextFunction, Request, Response } from 'express';

import { MulterError } from 'multer';

import { ExceptionResponse } from '../lib/exception.response';
import { HttpException } from '../lib/httpException';
import { HttpStatus } from '../lib/httpStatus';

export function exceptionMiddleware(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof HttpException) {
        res.status(err.statusCode).json(
            new ExceptionResponse(err.status, err.message, err.data)
        );
        return;
    }
    if (err instanceof MulterError) {
        res.status(HttpStatus.BAD_REQUEST).json(
            new ExceptionResponse('fail', err.message)
        );
        return;
    }
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        new ExceptionResponse('error', 'Unknown server error')
    );
}
