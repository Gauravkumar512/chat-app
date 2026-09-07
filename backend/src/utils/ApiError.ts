class ApiError extends Error {
    statusCode: number;
    message: string;
    error: any[];
    errors: any[];
    success: boolean;

    constructor(statusCode: number, message: string, error=[]) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.errors = error;
        this.success = false;
    }
}

export default ApiError;