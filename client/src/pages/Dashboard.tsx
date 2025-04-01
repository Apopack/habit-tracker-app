import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HabitForm from "@/components/habit/HabitForm";
import HabitList from "@/components/habit/HabitList";
import HabitStats from "@/components/habit/HabitStats";
import HabitCalendar from "@/components/habit/HabitCalendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  // Fetch all habits
  const { data: habits, isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habits'],
  });

  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Filter and sort habits
  const filteredHabits = habits?.filter(habit => {
    // Apply search filter
    const matchesSearch = habit.name.toLowerCase().includes(search.toLowerCase()) || 
                          (habit.description && habit.description.toLowerCase().includes(search.toLowerCase()));
    
    // Apply category filter
    if (filter === "all") return matchesSearch;
    if (filter === "completed") return matchesSearch && habit.isCompletedToday;
    if (filter === "pending") return matchesSearch && !habit.isCompletedToday;
    if (filter === "streak") return matchesSearch && habit.streak > 0;
    
    return matchesSearch;
  }) || [];

  // Sort habits
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "completion") return b.completionRate - a.completionRate;
    return 0;
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center">
                  <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Habit</DialogTitle>
                  <DialogDescription>
                    Create a new habit to track in your daily routine
                  </DialogDescription>
                </DialogHeader>
                <HabitForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoadingStats ? (
            // Skeleton loaders for stats
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-md bg-gray-200 mr-4"></div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <HabitStats stats={stats} />
          )}
        </div>

        {/* Filter Controls */}
        <div className="mt-8 bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Search habits..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habits</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="streak">With Streak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="completion">Completion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Current Progress
          </h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <HabitCalendar habits={habits || []} />
          </div>
        </div>

        {/* Habits List */}
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Your Habits
          </h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoadingHabits ? (
              <div className="p-4">
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 rounded-full mr-3" />
                        <div>
                          <Skeleton className="h-4 w-40 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : sortedHabits.length > 0 ? (
              <HabitList habits={sortedHabits} />
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No habits found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || filter !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding a new habit to track"}
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    variant="outline"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Habit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
