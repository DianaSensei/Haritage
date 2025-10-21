import { ApiError, http } from './client';
import { ApiErrorHandler } from './errorHandler';

export class ErrorHandlingExamples {
    /**
     * Example: Basic error handling with categorization
     */
    static async handleApiCall() {
        try {
            const result = await http.get('/api/data');
            return result;
        } catch (error) {
            const apiError = error as ApiError;
            const errorInfo = ApiErrorHandler.handleError(apiError);

            console.log('Error Message:', errorInfo.message);
            console.log('Should Retry:', errorInfo.shouldRetry);
            console.log('User Action:', errorInfo.userAction);

            // Handle different error types
            if (apiError.isClientError) {
                console.log('Client Error - Status:', apiError.status);
                console.log('Validation Errors:', ApiErrorHandler.extractValidationErrors(apiError));
            } else if (apiError.isServerError) {
                console.log('Server Error - Status:', apiError.status);
            } else if (apiError.isNetworkError) {
                console.log('Network Error - Code:', apiError.code);
            } else if (apiError.isTimeoutError) {
                console.log('Timeout Error');
            }

            throw error; // Re-throw if needed
        }
    }

    /**
     * Example: Retry logic with exponential backoff
     */
    static async apiCallWithRetry<T>(
        apiCall: () => Promise<T>,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError: ApiError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                lastError = error as ApiError;

                // Check if error is retryable
                if (!ApiErrorHandler.isRetryable(lastError) || attempt === maxRetries) {
                    throw lastError;
                }

                // Calculate delay
                const delay = ApiErrorHandler.getRetryDelay(lastError) * attempt;
                console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError!;
    }

    /**
     * Example: Handle specific HTTP status codes
     */
    static async handleSpecificErrors() {
        try {
            await http.postJson('/api/login', { email: 'user@example.com', password: 'wrong' });
        } catch (error) {
            const apiError = error as ApiError;

            switch (apiError.status) {
                case 401:
                    console.log('Authentication failed - redirect to login');
                    // Redirect to login screen
                    break;

                case 403:
                    console.log('Access denied - show permission error');
                    // Show permission denied message
                    break;

                case 422:
                    console.log('Validation errors:', ApiErrorHandler.extractValidationErrors(apiError));
                    // Show form validation errors
                    break;

                case 429:
                    const retryDelay = ApiErrorHandler.getRetryDelay(apiError);
                    console.log(`Rate limited - retry after ${retryDelay}ms`);
                    // Show rate limit message
                    break;

                default:
                    console.log('Unexpected error:', ApiErrorHandler.formatForLogging(apiError));
            }
        }
    }

    /**
     * Example: File upload with error handling
     */
    static async uploadFileWithErrorHandling(file: any) {
        try {
            const result = await http.postForm('/api/upload', {
                files: { file },
                fields: { type: 'image' }
            });
            return result;
        } catch (error) {
            const apiError = error as ApiError;

            if (apiError.isClientError && apiError.status === 413) {
                console.log('File too large - show size limit message');
                return { success: false, error: 'File size exceeds limit' };
            }

            if (apiError.isClientError && apiError.status === 415) {
                console.log('Unsupported file type');
                return { success: false, error: 'Unsupported file type' };
            }

            // Log error for debugging
            console.error('Upload failed:', ApiErrorHandler.formatForLogging(apiError));
            throw error;
        }
    }

    /**
     * Example: Global error handler for the app
     */
    static setupGlobalErrorHandler() {
        // This would typically be set up in your app's main component
        const originalConsoleError = console.error;

        console.error = (...args) => {
            // Check if it's an API error
            const error = args[0];
            if (error && typeof error === 'object' && 'isClientError' in error) {
                const apiError = error as ApiError;
                const errorInfo = ApiErrorHandler.handleError(apiError);

                // Log structured error information
                console.log('API Error Details:', {
                    message: errorInfo.message,
                    status: apiError.status,
                    code: apiError.code,
                    isRetryable: ApiErrorHandler.isRetryable(apiError),
                    userAction: errorInfo.userAction,
                });

                // You could also send to crash reporting service here
                // crashlytics.recordError(apiError);
            }

            // Call original console.error
            originalConsoleError.apply(console, args);
        };
    }
}

// Usage examples:

/*
// Basic error handling
try {
  const data = await ErrorHandlingExamples.handleApiCall();
  console.log('Success:', data);
} catch (error) {
  const apiError = error as ApiError;
  if (apiError.isClientError) {
    // Handle client errors (4xx)
    console.log('Client error:', apiError.message);
  } else if (apiError.isServerError) {
    // Handle server errors (5xx)
    console.log('Server error:', apiError.message);
  }
}

// Retry with exponential backoff
const result = await ErrorHandlingExamples.apiCallWithRetry(
  () => http.get('/api/unreliable-endpoint'),
  3 // max 3 retries
);

// Handle specific errors
await ErrorHandlingExamples.handleSpecificErrors();

// File upload with error handling
const uploadResult = await ErrorHandlingExamples.uploadFileWithErrorHandling({
  uri: 'file://path/to/image.jpg',
  name: 'image.jpg',
  type: 'image/jpeg'
});

// Set up global error handling
ErrorHandlingExamples.setupGlobalErrorHandler();
*/
