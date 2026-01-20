const errorHandler = (err, req, res, next) => {
    // Determine proper HTTP status code
    let statusCode = 500; // Default to server error

    // Use error's statusCode if available
    if (err.statusCode) {
        statusCode = err.statusCode;
    }
    // Check for specific error types
    else if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
    }
    else if (err.name === 'UnauthorizedError' || err.message.includes('Unauthorized') || err.message.includes('token')) {
        statusCode = 401; // Unauthorized
    }
    else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
        statusCode = 404; // Not Found
    }
    // If res.statusCode was already set to something other than 200, use it
    else if (res.statusCode && res.statusCode !== 200) {
        statusCode = res.statusCode;
    }

    console.error(`[Error ${statusCode}] ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Return proper HTTP status with consistent JSON format
    res.status(statusCode).json({
        success: false,
        data: null,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

module.exports = { errorHandler };
