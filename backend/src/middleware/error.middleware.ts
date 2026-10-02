import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors !== undefined ? { errors: err.errors } : {})
    });
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId passed to a query)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid format for field: ${err.path}`
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: messages[0] || 'Database validation failed',
      errors: messages
    });
    return;
  }

  // Handle MongoDB duplicate key error (code 11000)
  if ('code' in err && (err as { code: number }).code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
    return;
  }

  // Generic internal server error (do not leak stack trace)
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
