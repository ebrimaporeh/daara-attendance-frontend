import * as z from 'zod';

export const phoneSchema = z.string()
  .regex(/^[245679]\d{6}$/, 'Phone number must be 7 digits starting with 2,4,5,6,7, or 9');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  fathers_first_name: z.string().min(2, "Father's name is required"),
  phone: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  user_type: z.enum(['student', 'admin']).default('student'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export const attendanceSchema = z.object({
  student: z.number(),
  status: z.enum(['present', 'absent', 'excused', 'late', 'sick']),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(6, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ['confirm_new_password'],
});