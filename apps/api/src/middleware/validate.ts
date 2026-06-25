import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', {
          issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        });
      }
      next(err);
    }
  };
}
