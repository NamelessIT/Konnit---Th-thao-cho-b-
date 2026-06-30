import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().max(200).optional(),
  roleKeys: z.array(z.string().min(1)).min(1),
});

export const updateUserSchema = z.object({
  fullName: z.string().max(200).optional(),
  roleKeys: z.array(z.string().min(1)).optional(),
});

export const createRoleSchema = z.object({
  key: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Chỉ chữ thường, số, gạch dưới'),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  permissionKeys: z.array(z.string()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
});

export const setRolePermsSchema = z.object({
  permissionKeys: z.array(z.string()),
});