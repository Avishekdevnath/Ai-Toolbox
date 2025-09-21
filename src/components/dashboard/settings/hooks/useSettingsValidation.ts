'use client';

import { useState, useCallback } from 'react';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

interface UseSettingsValidationReturn {
  errors: ValidationError[];
  validateField: (field: string, value: any, rules: any) => string | null;
  validateForm: (data: any, rules: ValidationRules) => ValidationError[];
  clearErrors: () => void;
  hasErrors: boolean;
}

export function useSettingsValidation(): UseSettingsValidationReturn {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateField = useCallback((field: string, value: any, rules: any): string | null => {
    // Required validation
    if (rules.required && (!value || value === '')) {
      return `${field} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || value === '') {
      return null;
    }

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `${field} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${field} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, []);

  const validateForm = useCallback((data: any, rules: ValidationRules): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];
      const error = validateField(field, value, fieldRules);
      
      if (error) {
        newErrors.push({ field, message: error });
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    hasErrors: errors.length > 0,
  };
}

// Predefined validation rules for common settings fields
export const settingsValidationRules = {
  profile: {
    displayName: {
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      custom: (value: string) => {
        if (value && value.trim().length === 0) {
          return 'Display name cannot be empty';
        }
        return null;
      }
    },
    bio: {
      maxLength: 500
    },
    timezone: {
      required: true
    },
    language: {
      required: true,
      pattern: /^(en|es|fr|de|zh|ja|ko)$/
    },
    dateFormat: {
      required: true,
      pattern: /^(MM\/DD\/YYYY|DD\/MM\/YYYY|YYYY-MM-DD)$/
    }
  },
  application: {
    resultsPerPage: {
      custom: (value: number) => {
        if (value < 5 || value > 100) {
          return 'Results per page must be between 5 and 100';
        }
        return null;
      }
    }
  },
  security: {
    sessionTimeout: {
      custom: (value: number) => {
        if (value < 1 || value > 168) {
          return 'Session timeout must be between 1 and 168 hours';
        }
        return null;
      }
    }
  },
  dataManagement: {
    retentionPeriod: {
      custom: (value: number) => {
        if (value < 30 || value > 2555) {
          return 'Retention period must be between 30 and 2555 days';
        }
        return null;
      }
    }
  }
}; 