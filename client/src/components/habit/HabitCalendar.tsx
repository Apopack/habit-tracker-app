import { useMemo } from "react";
import { format, subDays, isToday } from "date-fns";
import { HabitWithStats } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitCalendarProps {
  habits: HabitWithStats[];
  days?: number;
}

export default function HabitCalendar({ habits, days = 28 }: HabitCalendarProps) {
  // Generate dates for the calendar (last N days)
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      result.push(subDays(today, i));
    }
    
    return result;
  }, [days]);

  // Calculate activity level for each day
  const getActivityLevel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Count completed habits for this day
    let completedCount = 0;
    let totalHabits = 0;
    
    habits.forEach(habit => {
      // Check if the habit existed on this date
      const habitCreatedAt = new Date(habit.createdAt);
      if (habitCreatedAt <= date) {
        totalHabits++;
        
        // Check if the habit was completed on this date
        // This is a simplified approach since we don't have the actual completion data
        // In a real implementation, you would check the completions array
        if (isToday(date) && habit.isCompletedToday) {
          completedCount++;
        } else if (habit.lastCompletedDate === dateStr) {
          completedCount++;
        }
      }
    });
    
    // Calculate activity level (0-4)
    if (totalHabits === 0) return 0;
    const completionRate = completedCount / totalHabits;
    
    if (completionRate === 0) return 0;
    if (completionRate <= 0.25) return 1;
    if (completionRate <= 0.5) return 2;
    if (completionRate <= 0.75) return 3;
    return 4;
  };

  // Get opacity based on activity level
  const getOpacityForLevel = (level: number) => {
    switch (level) {
      case 0: return 0; // No activity
      case 1: return 0.3;
      case 2: return 0.5;
      case 3: return 0.7;
      case 4: return 0.9;
      default: return 0;
    }
  };

  // Get color style for a calendar cell
  const getCellStyle = (date: Date) => {
    const level = getActivityLevel(date);
    const opacity = getOpacityForLevel(level);
    
    return {
      backgroundColor: level > 0 ? `rgba(16, 185, 129, ${opacity})` : undefined,
    };
  };

  // Format the date for display in tooltip
  const formatDateForTooltip = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-md leading-6 font-medium text-gray-900">Habit Activity</h3>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {/* Calendar headers */}
        <div className="text-xs text-gray-500">M</div>
        <div className="text-xs text-gray-500">T</div>
        <div className="text-xs text-gray-500">W</div>
        <div className="text-xs text-gray-500">T</div>
        <div className="text-xs text-gray-500">F</div>
        <div className="text-xs text-gray-500">S</div>
        <div className="text-xs text-gray-500">S</div>
        
        {/* Calendar grid with colored cells based on activity */}
        {dates.map((date, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="calendar-cell w-6 h-6 rounded-sm transition-transform hover:scale-110" 
                  style={getCellStyle(date)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{formatDateForTooltip(date)}</p>
                <p className="text-xs mt-1">
                  {getActivityLevel(date) === 0 
                    ? "No habit activity" 
                    : `Activity level: ${getActivityLevel(date)}/4`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981", opacity: 0.3 }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981", opacity: 0.5 }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981", opacity: 0.7 }}></div>
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981", opacity: 0.9 }}></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
