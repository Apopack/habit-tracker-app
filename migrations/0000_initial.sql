-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  reminder_time TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER,
  active_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL,
  completion_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(habit_id, completion_date)
);

-- Add foreign key constraints
ALTER TABLE habit_completions 
ADD CONSTRAINT fk_habit_id 
FOREIGN KEY (habit_id) 
REFERENCES habits(id) 
ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_habits_archived ON habits(is_archived);