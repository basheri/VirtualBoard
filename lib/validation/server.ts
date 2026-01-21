import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Server-side validation utility
 * Priority 1 - GAP-002
 */

export interface ValidationSuccess<T> {
    success: true;
    data: T;
}

export interface ValidationError {
    success: false;
    error: NextResponse;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validates request data against a Zod schema
 * Returns either validated data or a NextResponse error
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: error.issues.map((e: z.ZodIssue) => ({
                            path: e.path.join('.'),
                            message: e.message,
                            code: e.code,
                        })),
                    },
                    { status: 400 }
                ),
            };
        }
        return {
            success: false,
            error: NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            ),
        };
    }
}

/**
 * Validates FormData fields
 */
export function validateFormData<T>(
    formData: FormData,
    schema: z.ZodSchema<T>
): ValidationResult<T> {
    const data: Record<string, string | File> = {};

    formData.forEach((value, key) => {
        // Don't include File objects in validation (handle separately)
        if (!(value instanceof File)) {
            data[key] = value as string;
        }
    });

    return validateRequest(schema, data);
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
    uuid: z.string().uuid('Invalid UUID format'),
    positiveInt: z.number().int().positive('Must be a positive integer'),
    nonEmptyString: z.string().min(1, 'Cannot be empty'),
    email: z.string().email('Invalid email format'),
};
