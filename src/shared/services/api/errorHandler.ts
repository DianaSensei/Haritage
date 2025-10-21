import { ApiError } from './client';

export class ApiErrorHandler {
  /**
   * Handle API errors with proper categorization and user-friendly messages
   */
  static handleError(error: ApiError): {
    message: string;
    shouldRetry: boolean;
    userAction: string;
    technicalDetails?: any;
  } {
    // Network/Timeout errors
    if (error.isNetworkError || error.isTimeoutError) {
      return {
        message: error.isTimeoutError 
          ? 'Request timed out. Please check your connection and try again.'
          : 'Network error. Please check your internet connection.',
        shouldRetry: true,
        userAction: 'Check your internet connection and try again.',
        technicalDetails: {
          code: error.code,
          isTimeout: error.isTimeoutError,
          isNetwork: error.isNetworkError,
        },
      };
    }

    // Client errors (4xx)
    if (error.isClientError) {
      return this.handleClientError(error);
    }

    // Server errors (5xx)
    if (error.isServerError) {
      return {
        message: 'Server error occurred. Please try again later.',
        shouldRetry: true,
        userAction: 'Please try again in a few moments.',
        technicalDetails: {
          status: error.status,
          code: error.code,
          payload: error.payload,
        },
      };
    }

    // Unknown errors
    return {
      message: error.message || 'An unexpected error occurred.',
      shouldRetry: false,
      userAction: 'Please contact support if the problem persists.',
      technicalDetails: {
        status: error.status,
        code: error.code,
        payload: error.payload,
      },
    };
  }

  private static handleClientError(error: ApiError): {
    message: string;
    shouldRetry: boolean;
    userAction: string;
    technicalDetails?: any;
  } {
    const status = error.status || 0;
    const payload = error.payload;

    switch (status) {
      case 400:
        return {
          message: payload?.message || 'Invalid request. Please check your input.',
          shouldRetry: false,
          userAction: 'Please review your input and try again.',
          technicalDetails: {
            validationErrors: payload?.errors || payload?.validation_errors,
            payload,
          },
        };

      case 401:
        return {
          message: 'Authentication required. Please log in again.',
          shouldRetry: false,
          userAction: 'Please log in again.',
          technicalDetails: { payload },
        };

      case 403:
        return {
          message: 'Access denied. You don\'t have permission to perform this action.',
          shouldRetry: false,
          userAction: 'Contact support if you believe this is an error.',
          technicalDetails: { payload },
        };

      case 404:
        return {
          message: 'The requested resource was not found.',
          shouldRetry: false,
          userAction: 'Please check the URL or try again later.',
          technicalDetails: { payload },
        };

      case 409:
        return {
          message: 'Conflict detected. The resource may have been modified.',
          shouldRetry: true,
          userAction: 'Please refresh and try again.',
          technicalDetails: { payload },
        };

      case 422:
        return {
          message: payload?.message || 'Validation failed. Please check your input.',
          shouldRetry: false,
          userAction: 'Please correct the errors and try again.',
          technicalDetails: {
            validationErrors: payload?.errors || payload?.validation_errors,
            payload,
          },
        };

      case 429:
        return {
          message: 'Too many requests. Please slow down.',
          shouldRetry: true,
          userAction: 'Please wait a moment before trying again.',
          technicalDetails: {
            retryAfter: payload?.retry_after,
            payload,
          },
        };

      default:
        return {
          message: payload?.message || `Client error (${status}). Please try again.`,
          shouldRetry: false,
          userAction: 'Please try again or contact support.',
          technicalDetails: { status, payload },
        };
    }
  }

  /**
   * Extract validation errors from API response
   */
  static extractValidationErrors(error: ApiError): Record<string, string[]> {
    const payload = error.payload;
    if (!payload) return {};

    // Common validation error patterns
    const errors = payload.errors || payload.validation_errors || payload.details?.errors;
    if (errors && typeof errors === 'object') {
      return errors;
    }

    return {};
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: ApiError): boolean {
    if (error.isNetworkError || error.isTimeoutError) return true;
    if (error.isServerError && (error.status || 0) >= 500) return true;
    if (error.status === 409) return true; // Conflict - might be resolved on retry
    if (error.status === 429) return true; // Rate limited - should retry after delay
    
    return false;
  }

  /**
   * Get retry delay for rate limited requests
   */
  static getRetryDelay(error: ApiError): number {
    if (error.status === 429) {
      const payload = error.payload;
      const retryAfter = payload?.retry_after || payload?.retryAfter;
      if (retryAfter) {
        return parseInt(retryAfter) * 1000; // Convert to milliseconds
      }
      return 5000; // Default 5 seconds for rate limiting
    }
    
    if (error.isTimeoutError) {
      return 2000; // 2 seconds for timeout
    }
    
    if (error.isServerError) {
      return 5000; // 5 seconds for server errors
    }
    
    return 1000; // 1 second default
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: ApiError): string {
    const parts = [
      `Status: ${error.status || 'unknown'}`,
      `Code: ${error.code || 'unknown'}`,
      `Message: ${error.message}`,
    ];

    if (error.payload) {
      parts.push(`Payload: ${JSON.stringify(error.payload)}`);
    }

    if (error.isClientError) parts.push('Type: Client Error');
    if (error.isServerError) parts.push('Type: Server Error');
    if (error.isNetworkError) parts.push('Type: Network Error');
    if (error.isTimeoutError) parts.push('Type: Timeout Error');

    return parts.join(' | ');
  }
}
