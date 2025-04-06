import { z } from "zod";

// User schema with custom authentication
export type User = {
  id: number;
  username: string;
  password: string;
  email?: string | null;
  bestStreak?: number;
  currentStreak?: number;
  totalWorkouts?: number;
  lastWorkoutDate?: Date;
  createdAt: Date;
};

export type InsertUser = {
  username: string;
  password: string;
  email?: string | null;
  bestStreak?: number | null;
  currentStreak?: number | null;
  totalWorkouts?: number | null;
  lastWorkoutDate?: Date | null;
  id?: number;
};

// Add validation for user registration
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional(),
  bestStreak: z.number().optional().nullable(),
  currentStreak: z.number().optional().nullable(),
  totalWorkouts: z.number().optional().nullable(),
  lastWorkoutDate: z.date().optional().nullable(),
});

// Create a login schema
export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Activity schema
export type Activity = {
  id: number;
  userId: number;
  type: string;
  duration: number;
  notes?: string | null;
  date: Date;
  streakDay?: number;
  completed: boolean;
};

export type InsertActivity = {
  userId: number;
  type: string;
  duration: number;
  notes?: string | null;
  date?: Date | null;
  streakDay?: number | null;
  completed?: boolean | null;
};

export const insertActivitySchema = z.object({
  userId: z.number(),
  type: z.string(),
  duration: z.number(),
  notes: z.string().nullable().optional(),
  date: z.date().nullable().optional(),
  streakDay: z.number().nullable().optional(),
  completed: z.boolean().nullable().optional(),
});

// AI Suggestion schema
export type Suggestion = {
  id: number;
  userId: number;
  suggestion: string;
  goals?: string[];
  date: Date;
  used: boolean;
};

export type InsertSuggestion = Omit<Suggestion, "id">;

export const insertSuggestionSchema = z.object({
  userId: z.number(),
  suggestion: z.string(),
  goals: z.array(z.string()).optional(),
  date: z.date().optional(),
  used: z.boolean().optional(),
});
