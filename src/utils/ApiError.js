class ApiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };
