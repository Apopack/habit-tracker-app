import { format, isToday, isYesterday, isTomorrow, addDays, subDays, eachDayOfInterval, isSameDay, differenceInDays, startOfDay } from "date-fns";

/**
 * Formats a date as a readable string relative to today (e.g. Today, Yesterday, Tomorrow, or date)
 */
export function formatRelativeDate(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(parsedDate)) {
    return "Today";
  } else if (isYesterday(parsedDate)) {
    return "Yesterday";
  } else if (isTomorrow(parsedDate)) {
    return "Tomorrow";
  } else {
    return format(parsedDate, "MMM d, yyyy");
  }
}

/**
 * Formats a time string (HH:MM) to 12-hour format with AM/PM
 */
export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return "All day";
  
  try {
    // Create a date object with the time
    const date = new Date(`2000-01-01T${timeString}`);
    return format(date, "h:mm a");
  } catch (error) {
    console.error("Invalid time format:", error);
    return "All day";
  }
}

/**
 * Generates an array of dates for the last N days
 */
export function getLast30Days(days: number = 30): Date[] {
  const today = startOfDay(new Date());
  const start = subDays(today, days - 1);
  
  return eachDayOfInterval({ start, end: today });
}

/**
 * Calculates streak based on array of completion dates
 * @param completionDates Array of date strings (YYYY-MM-DD) when habit was completed
 * @returns Current streak count
 */
export function calculateStreak(completionDates: string[]): number {
  if (!completionDates.length) return 0;
  
  // Sort dates in descending order (newest first)
  const sortedDates = [...completionDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Start with the latest date
  let currentDate = new Date(sortedDates[0]);
  let streak = 1;
  
  // Check for consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = subDays(currentDate, 1);
    const completionDate = new Date(sortedDates[i]);
    
    // If the dates are consecutive, increase streak
    if (isSameDay(prevDate, completionDate)) {
      streak++;
      currentDate = completionDate;
    } else {
      // Break in streak
      break;
    }
  }
  
  return streak;
}

/**
 * Determines if two dates are consecutive
 */
export function areConsecutiveDays(date1: Date, date2: Date): boolean {
  const diffDays = Math.abs(differenceInDays(date1, date2));
  return diffDays === 1;
}

/**
 * Parses active days JSON string to array of weekday numbers
 */
export function parseActiveDays(activeDaysStr: string): number[] {
  try {
    return JSON.parse(activeDaysStr);
  } catch (e) {
    console.error("Error parsing active days:", e);
    return [1, 2, 3, 4, 5]; // Default to weekdays
  }
}

/**
 * Converts weekday number to name
 */
export function weekdayToName(weekday: number): string {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[weekday];
}
