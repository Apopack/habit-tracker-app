import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Fetch all habits
  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habits'],
  });

  // Fetch completions for the current month
  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  
  const { data: completions, isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['/api/completions', { startDate, endDate }],
    queryFn: async () => {
      const res = await fetch(`/api/completions?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error('Failed to fetch completions');
      return res.json();
    },
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  // Generate days for the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate weeks (7 days per row)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add days from previous month to start on Sunday
  const firstDayOfMonth = monthStart.getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDay = new Date(monthStart);
    prevMonthDay.setDate(prevMonthDay.getDate() - (firstDayOfMonth - i));
    currentWeek.push(prevMonthDay);
  }
  
  // Add all days of current month
  daysInMonth.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  // Add days from next month to complete the last week
  if (currentWeek.length > 0) {
    for (let i = currentWeek.length; i < 7; i++) {
      const nextMonthDay = new Date(monthEnd);
      nextMonthDay.setDate(nextMonthDay.getDate() + (i - currentWeek.length + 1));
      currentWeek.push(nextMonthDay);
    }
    weeks.push(currentWeek);
  }

  // Get completions for a specific day
  const getDayCompletions = (day: Date) => {
    if (!completions) return [];
    
    const dayStr = format(day, 'yyyy-MM-dd');
    return completions.filter((completion: any) => completion.completionDate === dayStr);
  };

  // Calculate completion stats for a specific day
  const getDayStats = (day: Date) => {
    const dayCompletions = getDayCompletions(day);
    const total = dayCompletions.length;
    const completed = dayCompletions.filter((c: any) => c.completed).length;
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // Determine color intensity based on completion percentage
  const getDayColorStyle = (day: Date) => {
    const stats = getDayStats(day);
    
    if (stats.total === 0) return {};
    
    // Color based on percentage
    const opacity = Math.max(0.3, Math.min(0.9, stats.percentage / 100 + 0.2));
    
    return {
      backgroundColor: `rgba(16, 185, 129, ${opacity})`,
    };
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-md font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button
              variant="outline" 
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Habit Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHabits || isLoadingCompletions ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((week) => (
                  <div key={week} className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <Skeleton key={`${week}-${day}`} className="h-20 w-full rounded-md" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Calendar Header - Days of Week */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Cells */}
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
                      {week.map((day, dayIdx) => {
                        const dayStats = getDayStats(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <TooltipProvider key={`${weekIdx}-${dayIdx}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`
                                    p-1 min-h-[5rem] rounded-md border transition-all
                                    ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                                    ${isToday ? "ring-2 ring-primary ring-opacity-50" : ""}
                                    hover:shadow-md
                                  `}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className={`text-sm ${isCurrentMonth ? "font-medium" : "text-gray-400"}`}>
                                      {format(day, 'd')}
                                    </span>
                                    {dayStats.total > 0 && (
                                      <Badge variant={isCurrentMonth ? "default" : "outline"} className="text-xs">
                                        {dayStats.completed}/{dayStats.total}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {dayStats.total > 0 && (
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-primary h-1.5 rounded-full"
                                        style={{ width: `${dayStats.percentage}%` }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Activity indicator boxes */}
                                  {dayStats.total > 0 && (
                                    <div className="mt-1 grid grid-cols-4 gap-0.5">
                                      {Array(Math.min(8, dayStats.total)).fill(0).map((_, i) => {
                                        const completion = getDayCompletions(day)[i];
                                        const habit = habits?.find((h: any) => h.id === completion?.habitId);
                                        
                                        return (
                                          <div
                                            key={i}
                                            className={`h-2 w-2 rounded-sm ${completion?.completed ? 'bg-green-500' : 'bg-red-300'}`}
                                            title={habit?.name || ""}
                                          />
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p className="font-medium">{format(day, 'EEEE, MMMM d, yyyy')}</p>
                                  {dayStats.total > 0 ? (
                                    <>
                                      <p className="mt-1">{dayStats.completed} of {dayStats.total} habits completed</p>
                                      <div className="mt-1 max-h-32 overflow-y-auto">
                                        {getDayCompletions(day).map((completion: any) => {
                                          const habit = habits?.find((h: any) => h.id === completion.habitId);
                                          return (
                                            <div key={completion.id} className="flex items-center mt-1">
                                              <div className={`h-2 w-2 mr-1 rounded-full ${completion.completed ? 'bg-green-500' : 'bg-red-400'}`} />
                                              <span>{habit?.name || "Unknown habit"}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  ) : (
                                    <p className="mt-1 text-gray-500">No habits tracked</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habit List for the Selected Month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Habits for {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHabits ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {habits?.map((habit: any) => {
                  // Filter completions for this habit in the current month
                  const habitCompletions = completions?.filter((c: any) => 
                    c.habitId === habit.id
                  ) || [];
                  
                  const totalDays = habitCompletions.length;
                  const completedDays = habitCompletions.filter((c: any) => c.completed).length;
                  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
                  
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{habit.name}</h3>
                        <div className="text-sm text-gray-500">
                          {totalDays > 0 ? (
                            <span>Completed {completedDays} of {totalDays} days ({percentage}%)</span>
                          ) : (
                            <span>No data for this month</span>
                          )}
                        </div>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#10b981"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 26}
                            strokeDashoffset={2 * Math.PI * 26 * (1 - percentage / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}

                {habits?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No habits found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
