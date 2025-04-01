import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { habitFormSchema, insertHabitCompletionSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habit routes
  app.get("/api/habits", async (_req: Request, res: Response) => {
    try {
      const habits = await storage.getAllHabitsWithStats();
      return res.json(habits);
    } catch (error) {
      console.error("Error getting habits:", error);
      return res.status(500).json({ message: "Failed to get habits" });
    }
  });

  app.get("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const habit = await storage.getHabitWithStats(id);
      if (!habit) return res.status(404).json({ message: "Habit not found" });
      
      return res.json(habit);
    } catch (error) {
      console.error("Error getting habit:", error);
      return res.status(500).json({ message: "Failed to get habit" });
    }
  });

  app.post("/api/habits", async (req: Request, res: Response) => {
    try {
      const validatedData = habitFormSchema.parse(req.body);
      
      // Convert activeDays back to string if it's not already
      const habitData = {
        ...validatedData,
        activeDays: typeof validatedData.activeDays === 'object' 
          ? JSON.stringify(validatedData.activeDays) 
          : validatedData.activeDays
      };
      
      const habit = await storage.createHabit(habitData);
      return res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating habit:", error);
      return res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.patch("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const validatedData = habitFormSchema.partial().parse(req.body);
      
      // Convert activeDays back to string if it's provided and not already a string
      const habitData = {
        ...validatedData,
        activeDays: validatedData.activeDays && typeof validatedData.activeDays === 'object'
          ? JSON.stringify(validatedData.activeDays)
          : validatedData.activeDays
      };
      
      const updatedHabit = await storage.updateHabit(id, habitData);
      if (!updatedHabit) return res.status(404).json({ message: "Habit not found" });
      
      return res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating habit:", error);
      return res.status(500).json({ message: "Failed to update habit" });
    }
  });

  app.delete("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const success = await storage.deleteHabit(id);
      if (!success) return res.status(404).json({ message: "Habit not found" });
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting habit:", error);
      return res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  app.patch("/api/habits/:id/archive", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const habit = await storage.getHabit(id);
      if (!habit) return res.status(404).json({ message: "Habit not found" });
      
      const updatedHabit = await storage.archiveHabit(id);
      
      const action = updatedHabit?.isArchived ? "archived" : "unarchived";
      return res.json(updatedHabit);
    } catch (error) {
      console.error("Error updating habit archive status:", error);
      return res.status(500).json({ message: "Failed to update habit archive status" });
    }
  });

  // Habit completion routes
  app.get("/api/habits/:id/completions", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const completions = await storage.getHabitCompletions(id);
      return res.json(completions);
    } catch (error) {
      console.error("Error getting habit completions:", error);
      return res.status(500).json({ message: "Failed to get habit completions" });
    }
  });

  app.post("/api/habits/:id/completions", async (req: Request, res: Response) => {
    try {
      const habitId = Number(req.params.id);
      if (isNaN(habitId)) return res.status(400).json({ message: "Invalid habit ID" });
      
      const { date, completed } = req.body;
      
      const validatedData = insertHabitCompletionSchema.parse({
        habitId,
        completionDate: date || format(new Date(), 'yyyy-MM-dd'),
        completed: completed !== undefined ? completed : true
      });
      
      const completion = await storage.toggleHabitCompletion(
        validatedData.habitId,
        validatedData.completionDate,
        validatedData.completed
      );
      
      return res.status(201).json(completion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error toggling habit completion:", error);
      return res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  app.get("/api/completions", async (req: Request, res: Response) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      if (date) {
        // Get completions for a specific date
        const completions = await storage.getCompletionsForDate(date as string);
        return res.json(completions);
      } else if (startDate && endDate) {
        // Get completions for a date range
        const completions = await storage.getCompletionsByDateRange(
          startDate as string,
          endDate as string
        );
        return res.json(completions);
      } else {
        // Invalid query parameters
        return res.status(400).json({
          message: "Please provide either 'date' or both 'startDate' and 'endDate'"
        });
      }
    } catch (error) {
      console.error("Error getting completions:", error);
      return res.status(500).json({ message: "Failed to get completions" });
    }
  });

  // Dashboard statistics
  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const habits = await storage.getAllHabitsWithStats();
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayCompletions = await storage.getCompletionsForDate(today);
      
      const stats = {
        totalHabits: habits.length,
        completedToday: habits.filter(h => h.isCompletedToday).length,
        maxStreak: Math.max(...habits.map(h => h.streak), 0),
        needsAttention: habits.filter(h => h.completionRate < 50).length,
        habits, // Include habits with stats for detailed info
        todayCompletions // Include all completions for today
      };
      
      return res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      return res.status(500).json({ message: "Failed to get dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
