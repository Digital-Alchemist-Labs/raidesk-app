/**
 * Custom error classes for API operations
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ApiConnectionError extends ApiError {
  constructor(message: string = 'Failed to connect to the server') {
    super(message, 0);
    this.name = 'ApiConnectionError';
    Object.setPrototypeOf(this, ApiConnectionError.prototype);
  }
}

export class ApiValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ApiValidationError';
    Object.setPrototypeOf(this, ApiValidationError.prototype);
  }
}

export class ApiServerError extends ApiError {
  constructor(message: string = 'Internal server error', statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'ApiServerError';
    Object.setPrototypeOf(this, ApiServerError.prototype);
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 408);
    this.name = 'ApiTimeoutError';
    Object.setPrototypeOf(this, ApiTimeoutError.prototype);
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'ApiNotFoundError';
    Object.setPrototypeOf(this, ApiNotFoundError.prototype);
  }
}

/**
 * Parse error from axios error object
 */
export function parseApiError(error: any): ApiError {
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    return new ApiConnectionError('Cannot connect to server. Please check if the server is running.');
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiTimeoutError('Request took too long. Please try again.');
  }

  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.error || error.message;
    const details = error.response.data;

    switch (status) {
      case 400:
        return new ApiValidationError(message, details);
      case 404:
        return new ApiNotFoundError(message);
      case 408:
        return new ApiTimeoutError(message);
      case 500:
      case 502:
      case 503:
        return new ApiServerError(message, status);
      default:
        return new ApiError(message, status, details);
    }
  }

  return new ApiError(error.message || 'An unexpected error occurred');
}

