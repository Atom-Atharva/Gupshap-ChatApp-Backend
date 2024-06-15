const asyncHandler = (incomingRequestFunction) => {
    return (req, res, next) => {
        Promise.resolve(incomingRequestFunction(req, res, next)).catch(
            (err) => {
                next(err);
            }
        );
    };
};

export { asyncHandler };
