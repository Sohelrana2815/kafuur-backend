/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * We define the shape we expect our validation schemas to have.
 */
interface IValidationShape {
  body?: any;
  query?: any;
  params?: any;
  cookies?: any;
}

const validateRequest = <T extends z.ZodType<IValidationShape>>(
  zodSchema: T,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;