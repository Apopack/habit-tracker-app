import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './db';
import * as fs from 'fs';
import * as path from 'path';
import { DBStorage } from './dbStorage';

// Main setup function
async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // 1. Run migrations
    console.log('Running migrations...');
    const migrationsDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('Migrations directory does not exist.');
      process.exit(1);
    }
    
    await migrate(db, { migrationsFolder: migrationsDir });
    console.log('Migrations completed successfully!');
    
    // 2. Seed the database
    console.log('Seeding database...');
    const storage = new DBStorage();
    await storage.seedDatabase();
    console.log('Database seeding completed!');
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();