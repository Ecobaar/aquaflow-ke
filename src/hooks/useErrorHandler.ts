
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  details?: unknown;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const handleError = useCallback((error: unknown, context?: string) => {
    const appError: AppError = {
      id: Date.now().toString(),
      message: (error instanceof Error ? error.message : (error as { message?: string })?.message) || 'An unexpected error occurred',
      type: 'error',
      timestamp: new Date(),
      details: { error, context }
    };

    setErrors(prev => [appError, ...prev.slice(0, 49)]); // Keep last 50 errors
    
    // Show user-friendly toast
    toast.error(appError.message, {
      description: context ? `Context: ${context}` : undefined,
      duration: 5000,
    });

    // Log to console for debugging
    console.error('App Error:', appError);
    
    return appError;
  }, []);

  const handleSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  }, []);

  const handleWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    handleError,
    handleSuccess,
    handleWarning,
    clearErrors
  };
};
