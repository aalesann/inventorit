import { z } from 'zod';

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial');

// Create user validation schema
export const createUserSchema = z.object({
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    email: z.string().email('Debe proporcionar un email válido'),
    password: passwordSchema,
    role: z.enum(['admin', 'user']).optional()
});

// Update user validation schema
export const updateUserSchema = z.object({
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').optional(),
    email: z.string().email('Debe proporcionar un email válido').optional(),
    password: passwordSchema.optional(),
    role: z.enum(['admin', 'user']).optional()
});

// Toggle active validation schema
export const toggleActiveSchema = z.object({
    is_active: z.boolean()
});
