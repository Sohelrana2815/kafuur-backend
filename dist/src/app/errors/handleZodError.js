export const handleZodError = (err) => {
    const statusCode = 400;
    const errorSource = err.issues.map((issue) => {
        return {
            // Use .toString() or String() to convert numbers/symbols to strings
            path: issue.path[issue.path.length - 1].toString(),
            message: issue.message,
        };
    });
    return {
        statusCode,
        message: errorSource.map((issue) => issue.message)[0],
        errorSource,
    };
};
