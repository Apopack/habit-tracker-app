import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './db';
import * as fs from 'fs';
import * as path from 'path';

// Main migration function
async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Check if migrations directory exists
    const migrationsDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('Migrations directory does not exist.');
      process.exit(1);
    }
    
    // Run the migrations
    await migrate(db, { migrationsFolder: migrationsDir });
    console.log('Migrations completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();