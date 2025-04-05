import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema with custom authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  bestStreak: integer("best_streak").default(0),
  currentStreak: integer("current_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
  lastWorkoutDate: timestamp("last_workout_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
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
export const insertUserSchema = createInsertSchema(users)
  .omit({ createdAt: true })
  .extend({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
    email: z.string().email().optional(),
  });

// Create a login schema
export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // e.g., running, cycling, yoga, etc.
  duration: integer("duration").notNull(), // in minutes
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
  streakDay: integer("streak_day"),
  completed: boolean("completed").default(true),
});

export type Activity = typeof activities.$inferSelect;
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
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  suggestion: text("suggestion").notNull(),
  goals: jsonb("goals").$type<string[]>(),
  date: timestamp("date").defaultNow(),
  used: boolean("used").default(false),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = Omit<Suggestion, "id">;

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
});
