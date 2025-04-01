import { habits, type Habit, type InsertHabit, habitCompletions, type HabitCompletion, type InsertHabitCompletion, type HabitWithStats } from "@shared/schema";

// Storage interface with CRUD methods for habits and completions
export interface IStorage {
  // User methods (keeping from the template)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Habit methods
  getAllHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  archiveHabit(id: number): Promise<Habit | undefined>;
  
  // Habit completions methods
  getHabitCompletions(habitId: number): Promise<HabitCompletion[]>;
  getCompletionsForDate(date: string): Promise<HabitCompletion[]>;
  getCompletionsByDateRange(startDate: string, endDate: string): Promise<HabitCompletion[]>;
  toggleHabitCompletion(habitId: number, date: string, completed: boolean): Promise<HabitCompletion>;
  
  // Advanced queries
  getHabitWithStats(id: number): Promise<HabitWithStats | undefined>;
  getAllHabitsWithStats(): Promise<HabitWithStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private habitsMap: Map<number, Habit>;
  private completionsMap: Map<number, HabitCompletion>;
  private userIdCounter: number;
  private habitIdCounter: number;
  private completionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.habitsMap = new Map();
    this.completionsMap = new Map();
    this.userIdCounter = 1;
    this.habitIdCounter = 1;
    this.completionIdCounter = 1;
    
    // Add some initial data for testing
    this.seedData();
  }

  // User methods (keeping from the template)
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Habit methods
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habitsMap.values()).filter(habit => !habit.isArchived);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habitsMap.get(id);
  }

  async createHabit(habitData: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const createdAt = new Date();
    
    const habit: Habit = {
      id,
      name: habitData.name,
      description: habitData.description || "",
      frequency: habitData.frequency,
      reminderTime: habitData.reminderTime || "",
      activeDays: habitData.activeDays || "[1,2,3,4,5]",
      createdAt,
      userId: null,
      isArchived: false
    };
    
    this.habitsMap.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, habitData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habitsMap.get(id);
    if (!habit) return undefined;
    
    const updatedHabit: Habit = {
      ...habit,
      ...habitData,
    };
    
    this.habitsMap.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const deleted = this.habitsMap.delete(id);
    
    // Delete associated completions
    Array.from(this.completionsMap.entries())
      .filter(([_, completion]) => completion.habitId === id)
      .forEach(([completionId, _]) => this.completionsMap.delete(completionId));
    
    return deleted;
  }

  async archiveHabit(id: number): Promise<Habit | undefined> {
    const habit = this.habitsMap.get(id);
    if (!habit) return undefined;
    
    // Toggle the archived status
    const updatedHabit: Habit = {
      ...habit,
      isArchived: !habit.isArchived
    };
    
    this.habitsMap.set(id, updatedHabit);
    return updatedHabit;
  }

  // Habit completion methods
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return Array.from(this.completionsMap.values())
      .filter(completion => completion.habitId === habitId);
  }

  async getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    return Array.from(this.completionsMap.values())
      .filter(completion => completion.completionDate === date);
  }

  async getCompletionsByDateRange(startDate: string, endDate: string): Promise<HabitCompletion[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.completionsMap.values())
      .filter(completion => {
        const completionDate = new Date(completion.completionDate);
        return completionDate >= start && completionDate <= end;
      });
  }

  async toggleHabitCompletion(habitId: number, date: string, completed: boolean): Promise<HabitCompletion> {
    // Check if we already have a completion for this habit and date
    const existingCompletion = Array.from(this.completionsMap.values()).find(
      c => c.habitId === habitId && c.completionDate === date
    );
    
    if (existingCompletion) {
      // Update existing completion
      const updatedCompletion: HabitCompletion = {
        ...existingCompletion,
        completed
      };
      this.completionsMap.set(existingCompletion.id, updatedCompletion);
      return updatedCompletion;
    } else {
      // Create new completion
      const id = this.completionIdCounter++;
      const completion: HabitCompletion = {
        id,
        habitId,
        completionDate: date,
        completed
      };
      this.completionsMap.set(id, completion);
      return completion;
    }
  }

  // Advanced queries
  async getHabitWithStats(id: number): Promise<HabitWithStats | undefined> {
    const habit = await this.getHabit(id);
    if (!habit) return undefined;
    
    return this.calculateHabitStats(habit);
  }

  async getAllHabitsWithStats(): Promise<HabitWithStats[]> {
    const habits = await this.getAllHabits();
    return Promise.all(habits.map(habit => this.calculateHabitStats(habit)));
  }

  // Helper methods
  private calculateHabitStats(habit: Habit): HabitWithStats {
    const completions = Array.from(this.completionsMap.values())
      .filter(completion => completion.habitId === habit.id);
    
    // Completion rate
    const totalDays = this.calculateTotalDays(habit);
    const completedDays = completions.filter(c => c.completed).length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    // Current streak
    const streak = this.calculateStreak(habit.id);
    
    // Today's completion
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = completions.some(
      c => c.completionDate === today && c.completed
    );
    
    // Last completed date
    const completedCompletions = completions
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
    
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

  private calculateStreak(habitId: number): number {
    const completions = Array.from(this.completionsMap.values())
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
    
    if (completions.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(completions[0].completionDate);
    
    for (let i = 1; i < completions.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      const completionDate = new Date(completions[i].completionDate);
      
      if (prevDate.toISOString().split('T')[0] === completions[i].completionDate) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Add some initial data for easier testing
  private seedData() {
    // Create habits
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

    habits.forEach((habitData) => {
      const id = this.habitIdCounter++;
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const habit: Habit = {
        id,
        name: habitData.name,
        description: habitData.description,
        frequency: habitData.frequency as "daily" | "weekly" | "monthly" | "custom",
        reminderTime: habitData.reminderTime,
        activeDays: habitData.activeDays,
        createdAt: twoWeeksAgo,
        userId: null,
        isArchived: false
      };
      
      this.habitsMap.set(id, habit);
      
      // Add completions for each habit
      this.addRandomCompletions(id);
    });
  }

  private addRandomCompletions(habitId: number) {
    const today = new Date();
    const habit = this.habitsMap.get(habitId);
    if (!habit) return;
    
    // Parse active days for this habit
    const activeDays = JSON.parse(habit.activeDays);
    
    // Add completions for the last 14 days with some randomness
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Check if this date should have a completion based on active days
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (!activeDays.includes(dayOfWeek)) continue;
      
      // Random completions with higher probability for more recent days
      const probability = i < 3 ? 0.8 : i < 7 ? 0.7 : 0.5;
      const completed = Math.random() < probability;
      
      // Add completion
      const id = this.completionIdCounter++;
      const completion: HabitCompletion = {
        id,
        habitId,
        completionDate: date.toISOString().split('T')[0],
        completed
      };
      
      this.completionsMap.set(id, completion);
    }
  }
}

export const storage = new MemStorage();
