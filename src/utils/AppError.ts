export class AppError extends Error {
    status: number;
    codeError: string;

    constructor(codeError: string, message: string, status: number) {
        super(message);
        this.status = status;
        this.codeError = codeError;
    }
}