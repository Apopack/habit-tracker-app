import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, sub, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Stats() {
  const [timeRange, setTimeRange] = useState("30");
  const [chartTab, setChartTab] = useState("completion");
  
  // Calculate date range based on selected time range
  const endDate = new Date();
  const startDate = sub(endDate, { days: parseInt(timeRange) });
  
  // Format dates for API
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
  // Fetch all habits
  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habits'],
  });
  
  // Fetch completions for the selected date range
  const { data: completions, isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['/api/completions', { startDate: formattedStartDate, endDate: formattedEndDate }],
    queryFn: async () => {
      const res = await fetch(`/api/completions?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      if (!res.ok) throw new Error('Failed to fetch completions');
      return res.json();
    },
  });
  
  // Prepare data for charts
  const prepareCompletionRateData = () => {
    if (!habits || !completions) return [];
    
    // Group completions by date
    const completionsByDate = completions.reduce((acc: any, completion: any) => {
      const date = completion.completionDate;
      if (!acc[date]) {
        acc[date] = { total: 0, completed: 0 };
      }
      acc[date].total++;
      if (completion.completed) {
        acc[date].completed++;
      }
      return acc;
    }, {});
    
    // Create chart data
    return Object.entries(completionsByDate).map(([date, stats]: [string, any]) => ({
      date,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      displayDate: format(new Date(date), 'MMM d')
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const prepareHabitCompletionData = () => {
    if (!habits || !completions) return [];
    
    return habits.map((habit: any) => {
      const habitCompletions = completions.filter((c: any) => c.habitId === habit.id);
      const total = habitCompletions.length;
      const completed = habitCompletions.filter((c: any) => c.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: habit.name,
        completionRate: rate,
        completedDays: completed,
        totalDays: total
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  };
  
  const prepareStreakData = () => {
    if (!habits) return [];
    
    return habits
      .filter((habit: any) => habit.streak > 0)
      .sort((a: any, b: any) => b.streak - a.streak)
      .map((habit: any) => ({
        name: habit.name,
        streak: habit.streak
      }));
  };
  
  const prepareYearlyData = () => {
    if (!habits || !completions) return [];
    
    const currentYear = new Date().getFullYear();
    const start = startOfYear(new Date(currentYear, 0, 1));
    const end = endOfYear(new Date(currentYear, 0, 1));
    const months = eachMonthOfInterval({ start, end });
    
    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthCompletions = completions.filter((c: any) => 
        c.completionDate.startsWith(monthStr)
      );
      
      const total = monthCompletions.length;
      const completed = monthCompletions.filter((c: any) => c.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        month: format(month, 'MMM'),
        completionRate: rate,
        completedCount: completed,
        totalCount: total
      };
    });
  };
  
  const completionRateData = prepareCompletionRateData();
  const habitCompletionData = prepareHabitCompletionData();
  const streakData = prepareStreakData();
  const yearlyData = prepareYearlyData();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stats &amp; Analysis</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoadingHabits || isLoadingCompletions ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-10 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500">Total Habits</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">{habits?.length || 0}</h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500">Average Completion Rate</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">
                    {habitCompletionData.length > 0 
                      ? Math.round(habitCompletionData.reduce((sum, item) => sum + item.completionRate, 0) / habitCompletionData.length)
                      : 0}%
                  </h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500">Best Streak</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">
                    {streakData.length > 0 ? streakData[0].streak : 0} days
                  </h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500">Most Consistent Habit</p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1 truncate">
                    {habitCompletionData.length > 0 
                      ? habitCompletionData[0].name 
                      : "None"}
                  </h2>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <Tabs value={chartTab} onValueChange={setChartTab} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="completion">Completion Rates</TabsTrigger>
              <TabsTrigger value="streak">Streaks</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Overview</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <CardTitle>Daily Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCompletions ? (
                  <Skeleton className="h-64 w-full" />
                ) : completionRateData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={completionRateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="displayDate" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#4F46E5" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No data available for the selected time range</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Habit Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHabits ? (
                  <Skeleton className="h-64 w-full" />
                ) : habitCompletionData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={habitCompletionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                        <Bar dataKey="completionRate" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No habits found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="streak">
            <Card>
              <CardHeader>
                <CardTitle>Current Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHabits ? (
                  <Skeleton className="h-64 w-full" />
                ) : streakData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={streakData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => [`${value} days`, 'Current Streak']} />
                        <Bar dataKey="streak" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No active streaks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yearly">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Overview ({new Date().getFullYear()})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCompletions ? (
                  <Skeleton className="h-64 w-full" />
                ) : yearlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value}%`} />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="completionRate" name="Completion Rate (%)" fill="#4F46E5" />
                        <Bar yAxisId="right" dataKey="completedCount" name="Completed Count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No data available for this year</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detailed Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Habit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHabits ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : habits?.length > 0 ? (
              <div className="space-y-6">
                {habits.map((habit: any) => {
                  // Filter completions for this habit in the selected time range
                  const habitCompletions = completions?.filter((c: any) => c.habitId === habit.id) || [];
                  const total = habitCompletions.length;
                  const completed = habitCompletions.filter((c: any) => c.completed).length;
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <div key={habit.id}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
                          <p className="text-sm text-gray-500">{habit.description || "No description"}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-4 items-center">
                          <div className="text-sm">
                            <p className="text-gray-500">Completion</p>
                            <p className="font-medium text-gray-900">{completed}/{total} days ({rate}%)</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-500">Current Streak</p>
                            <p className="font-medium text-gray-900">{habit.streak} days</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No habits found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
