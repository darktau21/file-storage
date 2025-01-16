import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+7|8)?\d{10}$/;

export const SignupDto = z.object({
    id: z.string().refine(
        (id) => {
            return emailRegex.test(id) || phoneRegex.test(id);
        },
        {
            message: 'ID must be a valid email or phone number',
        }
    ),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(20, {
            message: 'Password must be no more than 20 characters long',
        })
        .refine(
            (password) => {
                const hasNumber = /\d/.test(password);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                return hasNumber && hasSpecialChar;
            },
            {
                message:
                    'Password must include a number and a special character',
            }
        ),
});

export type SignupPayload = z.infer<typeof SignupDto>;
