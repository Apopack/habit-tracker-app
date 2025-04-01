import { db } from './db';
import { habits, habitCompletions } from '../shared/schema';
import { format, subDays } from 'date-fns';

async function seedDatabase() {
  try {
    console.log('Checking if database needs seeding...');
    
    // Check if database is already seeded
    const existingHabits = await db.select().from(habits);
    if (existingHabits.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    console.log('Seeding database with sample data...');
    
    // Create sample habits
    const sampleHabits = [
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
    
    // Insert habits and their completions
    for (const habitData of sampleHabits) {
      const [habit] = await db.insert(habits).values(habitData).returning();
      console.log(`Created habit: ${habit.name}`);
      
      await addSampleCompletions(habit.id, habitData.activeDays);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

async function addSampleCompletions(habitId: number, activeDaysStr: string) {
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
    
    await db.insert(habitCompletions).values({
      habitId,
      completionDate: dateStr,
      completed
    });
  }
}

seedDatabase();