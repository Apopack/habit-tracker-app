import { HabitWithStats } from "@shared/schema";
import { format } from "date-fns";
import { parseActiveDays } from "./date-utils";

/**
 * Determines if a habit should be active today
 * @param habit The habit to check
 * @returns boolean indicating if the habit is active today
 */
export function isHabitActiveToday(habit: HabitWithStats): boolean {
  // Get today's weekday (0-6, where 0 is Sunday)
  const today = new Date();
  const todayWeekday = today.getDay();
  
  // Parse active days
  const activeDays = parseActiveDays(habit.activeDays);
  
  // Check if today is an active day for this habit
  return activeDays.includes(todayWeekday);
}

/**
 * Gets the color for a streak
 * @param streak The current streak count
 * @returns A color based on streak length
 */
export function getStreakColor(streak: number): string {
  if (streak === 0) return "text-gray-400";
  if (streak < 3) return "text-blue-400";
  if (streak < 7) return "text-green-400";
  if (streak < 14) return "text-yellow-400";
  return "text-orange-400";
}

/**
 * Creates a descriptive status for a habit
 */
export function getHabitStatus(habit: HabitWithStats): string {
  if (habit.isCompletedToday) {
    return "Completed today";
  }
  
  if (habit.streak === 0) {
    return "Not started";
  }
  
  return `${habit.streak} day streak`;
}

/**
 * Calculates a priority score for sorting habits
 * Higher score means higher priority
 */
export function calculateHabitPriority(habit: HabitWithStats): number {
  let score = 0;
  
  // Active habits get priority
  if (isHabitActiveToday(habit)) score += 10;
  
  // Not completed today gets priority
  if (!habit.isCompletedToday) score += 5;
  
  // Longer streaks get priority to maintain them
  score += Math.min(habit.streak, 10);
  
  // Lower completion rate gets more priority
  score += Math.max(0, 100 - habit.completionRate) / 10;
  
  return score;
}

/**
 * Sorts habits by priority
 */
export function sortHabitsByPriority(habits: HabitWithStats[]): HabitWithStats[] {
  return [...habits].sort((a, b) => {
    // Always put completed habits after non-completed ones
    if (a.isCompletedToday && !b.isCompletedToday) return 1;
    if (!a.isCompletedToday && b.isCompletedToday) return -1;
    
    // Then sort by priority score
    return calculateHabitPriority(b) - calculateHabitPriority(a);
  });
}

/**
 * Formats active days for display
 */
export function formatActiveDays(activeDaysStr: string): string {
  const activeDays = parseActiveDays(activeDaysStr);
  
  // Check if every day is active
  if (activeDays.length === 7) return "Every day";
  
  // Check if weekdays only
  if (activeDays.length === 5 && 
      activeDays.includes(1) && 
      activeDays.includes(2) && 
      activeDays.includes(3) && 
      activeDays.includes(4) && 
      activeDays.includes(5)) {
    return "Weekdays";
  }
  
  // Check if weekends only
  if (activeDays.length === 2 && 
      activeDays.includes(0) && 
      activeDays.includes(6)) {
    return "Weekends";
  }
  
  // Otherwise, list the days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return activeDays.map(day => dayNames[day]).join(", ");
}

/**
 * Gets a color for the completion rate
 */
export function getCompletionRateColor(rate: number): string {
  if (rate < 30) return "text-red-500";
  if (rate < 60) return "text-yellow-500";
  if (rate < 80) return "text-blue-500";
  return "text-green-500";
}
