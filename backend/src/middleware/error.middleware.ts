import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AllFreeProvidersExhaustedError } from '../ai/llm-adapter';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.errors
    });
  }

  if (err instanceof AllFreeProvidersExhaustedError) {
    return res.status(429).json({
      error: 'Free AI Quota Paused',
      message: err.message,
      isQuotaExhausted: true
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    statusCode
  });
}
