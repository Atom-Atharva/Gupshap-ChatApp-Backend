import { ApiError } from "./ApiError.js";

const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // If the error is an instance of ApiError, send a structured JSON response
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    } else {
        // For other types of errors, handle them as needed
        console.error(err); // Log the error for debugging purposes
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [],
        });
    }
};

export default ErrorHandler;
