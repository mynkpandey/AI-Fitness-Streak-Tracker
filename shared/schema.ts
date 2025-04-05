import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (extends Clerk's user data)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // this will be the Clerk user ID
  username: text("username").notNull(),
  bestStreak: integer("best_streak").default(0),
  currentStreak: integer("current_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
  lastWorkoutDate: timestamp("last_workout_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = Omit<User, "createdAt">;

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // e.g., running, cycling, yoga, etc.
  duration: integer("duration").notNull(), // in minutes
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
  streakDay: integer("streak_day"),
  completed: boolean("completed").default(true),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = Omit<Activity, "id">;

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// AI Suggestion schema
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
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
