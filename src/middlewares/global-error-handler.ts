import { Request, Response, NextFunction } from 'express';
import { StatusCodes, getStatusMessage } from 'http-status-toolkit';
import { isCustomAPIError } from 'express-error-toolkit';
import { CustomAPIError } from 'express-error-toolkit';

// Internal config object (optional override)
let errorOptions = {
  showStack: process.env.SHOW_STACK !== 'false',
  logError: process.env.LOG_ERROR !== 'false',
};

export function setErrorOptions(options: Partial<typeof errorOptions>) {
  errorOptions = {
    ...errorOptions,
    ...options,
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorDetails?: string | object | null;
  stack?: string | string[];
}



export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = getStatusMessage(StatusCodes.INTERNAL_SERVER_ERROR);
  let errorDetails: string | object | null | undefined;
  let stack: string | undefined;

  

  if (err instanceof Error) {
    if (isCustomAPIError(err)) {
      const customErr = err as CustomAPIError;
      statusCode = customErr.statusCode || statusCode;
      message = customErr.message.trim() || message;
      errorDetails = customErr.errorDetails;
    } else {
      message = err.message || message;
    }
    stack = err.stack;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
  };

  if (errorDetails) {
    errorResponse.errorDetails = errorDetails;
  }

  if (stack && ( errorOptions.showStack)) {
    errorResponse.stack = stack.split('\n').map(line => line.trim());
  }


  if (errorOptions.logError) { 
    console.error(`Error Message: ${errorResponse.message}`);
    if(errorResponse.errorDetails) {
      console.error('Error Details:', errorResponse.errorDetails);
    }
    if (errorResponse.stack) {
      console.error('Stack Trace:', errorResponse.stack);
    }
  }


  res.status(statusCode).json(errorResponse);
  next();
};
