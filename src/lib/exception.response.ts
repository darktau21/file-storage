import type { ExceptionStatus } from './httpException';

export class ExceptionResponse {
    constructor(
        public readonly status: ExceptionStatus,
        public readonly message: string,
        public readonly data?: Record<number | string | symbol, unknown>
    ) {}
}
