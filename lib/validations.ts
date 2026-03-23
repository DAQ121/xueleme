import { z } from 'zod';

// Auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Cards
export const createCardSchema = z.object({
  content: z.string().min(1),
  categoryId: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  source: z.string().optional(),
});

export const updateCardSchema = createCardSchema.partial();

// Categories
export const createCategorySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  template: z.string().optional(),
  isScheduled: z.boolean().optional(),
  cronExpression: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Favorites
export const createFolderSchema = z.object({
  name: z.string().min(1),
  color: z.string(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

export const addCardToFolderSchema = z.object({
  cardId: z.number().int().positive(),
});

// Feedback
export const createFeedbackSchema = z.object({
  content: z.string().min(1),
});

export const updateFeedbackSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'RESOLVED']),
});

// Settings
export const updateSettingsSchema = z.object({
  selectedCategories: z.array(z.number()).optional(),
  categoryOrder: z.array(z.number()).optional(),
  theme: z.string().optional(),
});
