import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping from the existing template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Habit schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull().default("daily"),
  reminderTime: text("reminder_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id"), // Optional for future user integration
  // JSON array of weekday numbers (0-6 for Sunday-Saturday)
  activeDays: text("active_days").notNull().default("[1,2,3,4,5]"),
  isArchived: boolean("is_archived").notNull().default(false),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  frequency: true,
  reminderTime: true,
  activeDays: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit completions schema
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  completionDate: date("completion_date").notNull(),
  completed: boolean("completed").notNull().default(true),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).pick({
  habitId: true,
  completionDate: true,
  completed: true,
});

export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// Form validation schemas
export const habitFormSchema = insertHabitSchema.extend({
  name: z.string().min(1, "Habit name is required").max(100, "Habit name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  reminderTime: z.string().optional().or(z.literal("")),
  activeDays: z.string().default("[1,2,3,4,5]").transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      return [1, 2, 3, 4, 5]; // Default to weekdays if parsing fails
    }
  }),
});

// Extended type for frontend use
export interface HabitWithStats extends Habit {
  streak: number;
  completionRate: number;
  isCompletedToday: boolean;
  lastCompletedDate?: string;
}
