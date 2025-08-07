import crypto from 'crypto';

/**
 * Parameter Hashing Utility for Duplicate Detection
 * 
 * This utility provides functions to normalize and hash analysis parameters
 * to detect duplicate analysis requests and prevent unnecessary regeneration.
 */

export interface NormalizedParameters {
  normalized: Record<string, any>;
  hash: string;
  original: Record<string, any>;
}

export interface ParameterComparison {
  isDuplicate: boolean;
  similarity: number;
  differences: string[];
  existingAnalysisId?: string;
}

/**
 * Normalize parameters for consistent hashing
 */
export function normalizeParameters(parameters: Record<string, any>): Record<string, any> {
  if (!parameters || typeof parameters !== 'object') {
    return {};
  }

  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(parameters)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Normalize different data types
    if (typeof value === 'string') {
      // Trim whitespace and normalize case for text fields
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        normalized[key] = trimmed.toLowerCase();
      }
    } else if (typeof value === 'number') {
      // Round numbers to 2 decimal places for consistency
      normalized[key] = Math.round(value * 100) / 100;
    } else if (typeof value === 'boolean') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      // Sort arrays and normalize each element
      const normalizedArray = value
        .map(item => normalizeValue(item))
        .filter(item => item !== undefined)
        .sort();
      if (normalizedArray.length > 0) {
        normalized[key] = normalizedArray;
      }
    } else if (typeof value === 'object') {
      // Recursively normalize nested objects
      const normalizedObject = normalizeParameters(value);
      if (Object.keys(normalizedObject).length > 0) {
        normalized[key] = normalizedObject;
      }
    }
  }

  return normalized;
}

/**
 * Normalize a single value
 */
function normalizeValue(value: any): any {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toLowerCase() : undefined;
  }

  if (typeof value === 'number') {
    return Math.round(value * 100) / 100;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map(item => normalizeValue(item))
      .filter(item => item !== undefined)
      .sort();
  }

  if (typeof value === 'object') {
    return normalizeParameters(value);
  }

  return value;
}

/**
 * Generate a hash from normalized parameters
 */
export function generateParameterHash(
  parameters: Record<string, any>,
  toolSlug: string,
  userId?: string
): string {
  const normalized = normalizeParameters(parameters);
  
  // Create a consistent string representation
  const parameterString = JSON.stringify(normalized, Object.keys(normalized).sort());
  
  // Include tool slug and user ID in hash for uniqueness
  const hashInput = `${toolSlug}:${userId || 'anonymous'}:${parameterString}`;
  
  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Compare two parameter sets and determine if they're duplicates
 */
export function compareParameters(
  params1: Record<string, any>,
  params2: Record<string, any>,
  toolSlug1: string,
  toolSlug2: string,
  userId1?: string,
  userId2?: string
): ParameterComparison {
  // Generate hashes for both parameter sets
  const hash1 = generateParameterHash(params1, toolSlug1, userId1);
  const hash2 = generateParameterHash(params2, toolSlug2, userId2);

  // Exact match
  if (hash1 === hash2) {
    return {
      isDuplicate: true,
      similarity: 1.0,
      differences: []
    };
  }

  // Calculate similarity for near-matches
  const similarity = calculateSimilarity(params1, params2);
  
  // Consider it a duplicate if similarity is very high (>95%)
  const isDuplicate = similarity > 0.95;
  
  // Find specific differences
  const differences = findParameterDifferences(params1, params2);

  return {
    isDuplicate,
    similarity,
    differences
  };
}

/**
 * Calculate similarity between two parameter sets
 */
function calculateSimilarity(params1: Record<string, any>, params2: Record<string, any>): number {
  const normalized1 = normalizeParameters(params1);
  const normalized2 = normalizeParameters(params2);

  const keys1 = Object.keys(normalized1);
  const keys2 = Object.keys(normalized2);

  if (keys1.length === 0 && keys2.length === 0) {
    return 1.0;
  }

  if (keys1.length === 0 || keys2.length === 0) {
    return 0.0;
  }

  const allKeys = new Set([...keys1, ...keys2]);
  let matchingKeys = 0;
  let totalComparisons = 0;

  for (const key of allKeys) {
    const value1 = normalized1[key];
    const value2 = normalized2[key];

    if (value1 === undefined || value2 === undefined) {
      totalComparisons++;
      continue;
    }

    totalComparisons++;
    if (JSON.stringify(value1) === JSON.stringify(value2)) {
      matchingKeys++;
    }
  }

  return totalComparisons > 0 ? matchingKeys / totalComparisons : 0;
}

/**
 * Find specific differences between parameter sets
 */
function findParameterDifferences(params1: Record<string, any>, params2: Record<string, any>): string[] {
  const normalized1 = normalizeParameters(params1);
  const normalized2 = normalizeParameters(params2);
  const differences: string[] = [];

  const allKeys = new Set([...Object.keys(normalized1), ...Object.keys(normalized2)]);

  for (const key of allKeys) {
    const value1 = normalized1[key];
    const value2 = normalized2[key];

    if (value1 === undefined && value2 !== undefined) {
      differences.push(`Missing parameter: ${key}`);
    } else if (value1 !== undefined && value2 === undefined) {
      differences.push(`Extra parameter: ${key}`);
    } else if (JSON.stringify(value1) !== JSON.stringify(value2)) {
      differences.push(`Different value for: ${key}`);
    }
  }

  return differences;
}

/**
 * Create a parameter hash object for database storage
 */
export function createParameterHashObject(
  parameters: Record<string, any>,
  toolSlug: string,
  userId: string,
  analysisId: string
) {
  const normalized = normalizeParameters(parameters);
  const hash = generateParameterHash(parameters, toolSlug, userId);

  return {
    hash,
    parameters: normalized,
    originalParameters: parameters,
    toolSlug,
    userId,
    analysisId,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    accessCount: 1
  };
}

/**
 * Check if parameters are similar enough to be considered duplicates
 */
export function isSimilarParameters(
  params1: Record<string, any>,
  params2: Record<string, any>,
  threshold: number = 0.9
): boolean {
  const similarity = calculateSimilarity(params1, params2);
  return similarity >= threshold;
}

/**
 * Extract key parameters for quick comparison
 */
export function extractKeyParameters(
  parameters: Record<string, any>,
  keyFields: string[]
): Record<string, any> {
  const keyParams: Record<string, any> = {};
  
  for (const field of keyFields) {
    if (parameters[field] !== undefined) {
      keyParams[field] = parameters[field];
    }
  }
  
  return keyParams;
}

/**
 * Validate parameter structure
 */
export function validateParameters(parameters: Record<string, any>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!parameters || typeof parameters !== 'object') {
    errors.push('Parameters must be an object');
    return { isValid: false, errors };
  }

  // Check for circular references
  try {
    JSON.stringify(parameters);
  } catch (error) {
    errors.push('Parameters contain circular references');
  }

  // Check for extremely large objects
  const size = JSON.stringify(parameters).length;
  if (size > 1000000) { // 1MB limit
    errors.push('Parameters are too large (max 1MB)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get parameter summary for display
 */
export function getParameterSummary(parameters: Record<string, any>): string {
  const normalized = normalizeParameters(parameters);
  const keys = Object.keys(normalized);
  
  if (keys.length === 0) {
    return 'No parameters';
  }

  const summary = keys.slice(0, 3).map(key => {
    const value = normalized[key];
    if (typeof value === 'string' && value.length > 20) {
      return `${key}: ${value.substring(0, 20)}...`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  }).join(', ');

  if (keys.length > 3) {
    return `${summary} (+${keys.length - 3} more)`;
  }

  return summary;
} 