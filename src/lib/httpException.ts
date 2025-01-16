import type { HttpStatus } from './httpStatus';

export type ExceptionStatus = 'error' | 'fail';

export class HttpException extends Error {
    readonly status: ExceptionStatus;

    constructor(
        public statusCode: HttpStatus,
        public message: string,
        public data?: Record<number | string | symbol, unknown>
    ) {
        super(message);

        this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}
