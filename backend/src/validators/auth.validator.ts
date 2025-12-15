import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida')
});

// Register validation schema
export const registerSchema = z.object({
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    email: z.string().email('Debe proporcionar un email válido'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial'),
    role: z.enum(['admin', 'user']).optional()
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'El token es requerido')
});
