import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

import { catchAsync } from '../lib/catchAsync';
import { HttpException } from '../lib/httpException';
import { HttpStatus } from '../lib/httpStatus';

export function validateQuery(schema: ZodSchema) {
    return catchAsync(async (req: Request, _: Response, next: NextFunction) => {
        try {
            schema.parse(req.query);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const flattenedErrors = error.flatten().fieldErrors;
                throw new HttpException(
                    HttpStatus.BAD_REQUEST,
                    'Validation error',
                    flattenedErrors
                );
            }
            return next(error);
        }
    });
}
