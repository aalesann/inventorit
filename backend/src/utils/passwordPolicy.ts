import { PasswordValidationResult } from '../types';

const MIN_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
    const errors: string[] = [];

    if (!password || password.length < MIN_LENGTH) {
        errors.push(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
    }

    if (!UPPERCASE_REGEX.test(password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!LOWERCASE_REGEX.test(password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!NUMBER_REGEX.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }

    if (!SPECIAL_CHAR_REGEX.test(password)) {
        errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

export const getPasswordRequirements = (): string[] => {
    return [
        `Mínimo ${MIN_LENGTH} caracteres`,
        'Al menos una letra mayúscula',
        'Al menos una letra minúscula',
        'Al menos un número',
        'Al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?)'
    ];
};
