import { sql } from 'drizzle-orm';
import { db } from './db';
import { habits, habitCompletions, users } from '../shared/schema';
import { DBStorage } from './dbStorage';

async function createSchema() {
  try {
    console.log('Creating database schema directly...');
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created.');
    
    // Create habits table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        frequency TEXT NOT NULL DEFAULT 'daily',
        reminder_time TEXT,
        active_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
        is_archived BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER
      );
    `);
    console.log('Habits table created.');
    
    // Create habit_completions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completion_date DATE NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completion_date)
      );
    `);
    console.log('Habit completions table created.');
    
    console.log('Schema creation complete!');
    
    // Seed database with sample data
    console.log('Seeding database...');
    const storage = new DBStorage();
    await storage.seedDatabase();
    console.log('Database seeding completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('Schema creation failed:', error);
    process.exit(1);
  }
}

createSchema();