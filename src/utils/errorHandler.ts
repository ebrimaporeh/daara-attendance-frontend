export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
}

export const extractApiError = (error: any): ApiError => {
  // Default error
  const defaultError: ApiError = {
    message: 'An unexpected error occurred. Please try again.',
  };

  if (!error) return defaultError;

  // Get status if available
  if (error.response?.status) {
    defaultError.status = error.response.status;
  }

  // Get error data
  const errorData = error.response?.data;
  
  if (errorData) {
    // Handle DRF non_field_errors
    if (errorData.non_field_errors) {
      defaultError.message = Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors[0] 
        : errorData.non_field_errors;
      return defaultError;
    }

    // Handle field-specific errors
    if (typeof errorData === 'object') {
      const fieldErrors: Record<string, string[]> = {};
      
      for (const [key, value] of Object.entries(errorData)) {
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value.map(v => String(v));
          // Set first error as main message if not already set
          if (!defaultError.message || defaultError.message === defaultError.message) {
            defaultError.message = `${key}: ${value[0]}`;
          }
        } else if (typeof value === 'string') {
          fieldErrors[key] = [value];
          if (!defaultError.message || defaultError.message === defaultError.message) {
            defaultError.message = `${key}: ${value}`;
          }
        }
      }
      
      if (Object.keys(fieldErrors).length > 0) {
        defaultError.fieldErrors = fieldErrors;
        return defaultError;
      }
    }

    // Handle detail field
    if (errorData.detail) {
      defaultError.message = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : (Array.isArray(errorData.detail) ? errorData.detail[0] : JSON.stringify(errorData.detail));
      return defaultError;
    }

    // Handle message field
    if (errorData.message) {
      defaultError.message = errorData.message;
      return defaultError;
    }

    // Handle string response
    if (typeof errorData === 'string') {
      defaultError.message = errorData;
      return defaultError;
    }
  }

  // Handle error message from Error object
  if (error.message) {
    defaultError.message = error.message;
  }

  return defaultError;
};