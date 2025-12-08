import z from 'zod';
import { IsActive, Role } from './user.interface';

// Create Schema
export const userZodSchema = z.object({
  fullName: z
    .string({ error: 'Name must be string type!' })
    .min(3, 'Name must be at least 3 characters!')
    .max(100, 'Name must be maximum 100 characters! '),
  email: z.string().email(),
  phone: z.
        string({message: 'Phone number must be string type!'})
        .regex(/^\+[1-9]\d{7,14}$/, {error: "Invalid phone number format!"})
        .optional(),
  password: z
    .string({ error: 'Password shuld be string type!' })
    .min(6, 'Password length shuld be at least 6!')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, {
      message:
        'Password must be at least 1 uppercase character, 1 special charater, 1 number!',
    })
    .optional(),
  avatar: z.string({ error: 'Image should be string' }).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

// Update Schema
export const userUpdateZodSchema = z.object({
  fullName: z
    .string({ error: 'Name must be string type!' })
    .min(3, 'Name must be at least 3 characters!')
    .max(100, 'Name must be maximum 100 characters! '),
  phone: z.string({message: 'Phone number must be string type!'}).optional(),
  avatar: z.string({ error: 'Image should be string' }).optional(),
  gender: z.enum(['male', 'female', 'other']),
  role: z.enum([Role.USER, Role.ADMIN, Role.ORGANIZER]),
  interests: z.array(z.string()).optional(),
  isActive: z.enum([IsActive.ACTIVE, IsActive.INACTIVE, IsActive.BLOCKED]).optional(),
  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  coord: z.object({
    lat: z.number(),
    long: z.number(),
  }).optional()
});

export const passwordZodSchema = z.object({
  newPassword: z
    .string({ error: 'Password shuld be string type!' })
    .min(6, 'Password length shuld be at least 6!')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, {
      message:
        'Password must be at least 1 uppercase character, 1 special charater, 1 number!',
    })
})

 