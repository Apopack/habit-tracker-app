import { eq, desc, and, between, sql } from 'drizzle-orm';
import { db, tables } from './db';
import { IStorage } from './storage';
import { InsertUser, User, Habit, InsertHabit, HabitCompletion, InsertHabitCompletion, HabitWithStats } from '@shared/schema';
import { format, subDays } from 'date-fns';

export class DBStorage implements IStorage {
  // User methods (keeping from the template)
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(tables.users).where(eq(tables.users.id, id));
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(tables.users).where(eq(tables.users.username, username));
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(tables.users).values(user).returning();
    return newUser;
  }

  // Habit methods
  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(tables.habits).where(eq(tables.habits.isArchived, false));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const habits = await db.select().from(tables.habits).where(eq(tables.habits.id, id));
    return habits[0];
  }

  async createHabit(habitData: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(tables.habits).values(habitData).returning();
    return newHabit;
  }

  async updateHabit(id: number, habitData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db
      .update(tables.habits)
      .set(habitData)
      .where(eq(tables.habits.id, id))
      .returning();
    
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    // First, delete associated completions
    await db
      .delete(tables.habitCompletions)
      .where(eq(tables.habitCompletions.habitId, id));
    
    // Then delete the habit
    const result = await db
      .delete(tables.habits)
      .where(eq(tables.habits.id, id))
      .returning();
    
    return result.length > 0;
  }

  async archiveHabit(id: number): Promise<Habit | undefined> {
    const habit = await this.getHabit(id);
    if (!habit) return undefined;
    
    // Toggle the archived status
    const [updatedHabit] = await db
      .update(tables.habits)
      .set({ isArchived: !habit.isArchived })
      .where(eq(tables.habits.id, id))
      .returning();
    
    return updatedHabit;
  }
  
  // Habit completions methods
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(tables.habitCompletions)
      .where(eq(tables.habitCompletions.habitId, habitId))
      .orderBy(desc(tables.habitCompletions.completionDate));
  }

  async getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(tables.habitCompletions)
      .where(eq(tables.habitCompletions.completionDate, date));
  }

  async getCompletionsByDateRange(startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(tables.habitCompletions)
      .where(
        between(
          tables.habitCompletions.completionDate,
          startDate,
          endDate
        )
      )
      .orderBy(desc(tables.habitCompletions.completionDate));
  }

  async toggleHabitCompletion(habitId: number, date: string, completed: boolean): Promise<HabitCompletion> {
    // Check if completion record already exists
    const existingCompletions = await db
      .select()
      .from(tables.habitCompletions)
      .where(
        and(
          eq(tables.habitCompletions.habitId, habitId),
          eq(tables.habitCompletions.completionDate, date)
        )
      );
    
    // If exists, update it
    if (existingCompletions.length > 0) {
      const [updatedCompletion] = await db
        .update(tables.habitCompletions)
        .set({ completed })
        .where(
          and(
            eq(tables.habitCompletions.habitId, habitId),
            eq(tables.habitCompletions.completionDate, date)
          )
        )
        .returning();
      
      return updatedCompletion;
    } else {
      // Otherwise create a new record
      const [newCompletion] = await db
        .insert(tables.habitCompletions)
        .values({
          habitId,
          completionDate: date,
          completed
        })
        .returning();
      
      return newCompletion;
    }
  }

  // Advanced queries
  async getHabitWithStats(id: number): Promise<HabitWithStats | undefined> {
    const habit = await this.getHabit(id);
    if (!habit) return undefined;
    
    return await this.calculateHabitStats(habit);
  }

  async getAllHabitsWithStats(): Promise<HabitWithStats[]> {
    const habits = await this.getAllHabits();
    return Promise.all(habits.map(habit => this.calculateHabitStats(habit)));
  }

  // Helper methods
  private async calculateHabitStats(habit: Habit): Promise<HabitWithStats> {
    const completions = await this.getHabitCompletions(habit.id);
    
    // Completion rate
    const totalDays = this.calculateTotalDays(habit);
    const completedDays = completions.filter(c => c.completed).length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    // Current streak
    const streak = await this.calculateStreak(habit.id);
    
    // Today's completion
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCompletedToday = completions.some(
      c => c.completionDate === today && c.completed
    );
    
    // Last completed date
    const completedCompletions = completions
      .filter(c => c.completed)
      .sort((a, b) => 
        new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
      );
    
    const lastCompletedDate = completedCompletions.length > 0 
      ? completedCompletions[0].completionDate 
      : undefined;
    
    return {
      ...habit,
      streak,
      completionRate,
      isCompletedToday,
      lastCompletedDate
    };
  }

  private calculateTotalDays(habit: Habit): number {
    if (!habit.createdAt) return 0;
    
    const creationDate = new Date(habit.createdAt);
    const today = new Date();
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays); // At least 1 day
  }

  private async calculateStreak(habitId: number): Promise<number> {
    const completions = await this.getHabitCompletions(habitId);
    const completedDates = completions
      .filter(c => c.completed)
      .map(c => c.completionDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (completedDates.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(completedDates[0]);
    
    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = subDays(new Date(currentDate), 1);
      const prevDateStr = format(prevDate, 'yyyy-MM-dd');
      
      if (prevDateStr === completedDates[i]) {
        streak++;
        currentDate = new Date(completedDates[i]);
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // Generate seed data for testing
  async seedDatabase(): Promise<void> {
    // Check if database is already seeded
    const existingHabits = await db.select().from(tables.habits);
    if (existingHabits.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    // Create sample habits
    const habits = [
      {
        name: "Morning Meditation",
        description: "10 minutes of mindfulness meditation",
        frequency: "daily",
        reminderTime: "07:00",
        activeDays: "[1,2,3,4,5,6,0]" // All days
      },
      {
        name: "Read 20 Pages",
        description: "Read at least 20 pages of a book",
        frequency: "daily",
        reminderTime: "20:00",
        activeDays: "[1,2,3,4,5]" // Weekdays
      },
      {
        name: "Drink Water",
        description: "Drink at least 8 glasses of water",
        frequency: "daily",
        reminderTime: "",
        activeDays: "[1,2,3,4,5,6,0]" // All days
      },
      {
        name: "Exercise",
        description: "30 minutes of exercise",
        frequency: "daily",
        reminderTime: "18:00",
        activeDays: "[1,3,5]" // Mon, Wed, Fri
      },
      {
        name: "Journal",
        description: "Write in journal before bed",
        frequency: "daily",
        reminderTime: "21:00",
        activeDays: "[1,2,3,4,5]" // Weekdays
      }
    ];
    
    for (const habitData of habits) {
      const [habit] = await db.insert(tables.habits).values({
        name: habitData.name,
        description: habitData.description,
        frequency: habitData.frequency as "daily" | "weekly" | "monthly" | "custom",
        reminderTime: habitData.reminderTime,
        activeDays: habitData.activeDays,
        isArchived: false
      }).returning();
      
      // Add some completions for each habit
      await this.addSampleCompletions(habit.id, habitData.activeDays);
    }
    
    console.log("Database seeded successfully");
  }
  
  private async addSampleCompletions(habitId: number, activeDaysStr: string): Promise<void> {
    const activeDays = JSON.parse(activeDaysStr);
    const today = new Date();
    
    // Add completions for the last 14 days
    for (let i = 0; i < 14; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay(); // 0-6, 0 is Sunday
      
      // Only add completions on active days
      if (!activeDays.includes(dayOfWeek)) {
        continue;
      }
      
      // Random completions with higher probability for more recent days
      const probability = i < 3 ? 0.8 : i < 7 ? 0.7 : 0.5;
      const completed = Math.random() < probability;
      
      await db.insert(tables.habitCompletions).values({
        habitId,
        completionDate: dateStr,
        completed
      });
    }
  }
}