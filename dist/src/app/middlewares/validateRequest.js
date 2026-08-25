const validateRequest = (zodSchema) => {
    return async (req, res, next) => {
        try {
            // Now TS knows 'parsed' will at least match IValidationShape
            if (req.body?.data && typeof req.body.data === "string") {
                req.body = JSON.parse(req.body.data);
            }
            const parsed = await zodSchema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
                cookies: req.cookies,
            });
            // Overwrite req.body with the cleaned/validated version
            if (parsed.body) {
                req.body = parsed.body;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export default validateRequest;
