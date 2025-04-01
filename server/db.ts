import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, habits, habitCompletions } from '../shared/schema';

// Create a postgres client
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

// Export all tables for convenience
export const tables = {
  users,
  habits,
  habitCompletions
};