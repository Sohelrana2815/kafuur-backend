export const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
            next(err);
        });
    };
};
