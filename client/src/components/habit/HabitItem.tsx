import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Zap, Clock, Edit, Trash2 } from "lucide-react";
import { HabitWithStats } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import HabitForm from "./HabitForm";
import HabitProgressRing from "./HabitProgressRing";

interface HabitItemProps {
  habit: HabitWithStats;
}

export default function HabitItem({ habit }: HabitItemProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format reminder time
  const reminderTime = habit.reminderTime 
    ? format(new Date(`2000-01-01T${habit.reminderTime}`), 'h:mm a')
    : 'All day';

  // Toggle habit completion
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ completed }: { completed: boolean }) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      return await apiRequest('POST', `/api/habits/${habit.id}/completions`, {
        date: today,
        completed
      });
    },
    onSuccess: () => {
      // Invalidate habit queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      const message = habit.isCompletedToday 
        ? "Habit marked as incomplete"
        : "Habit marked as complete!";
      
      toast({
        title: "Habit updated",
        description: message,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update habit status. Please try again.",
      });
      console.error("Error toggling habit:", error);
    }
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/habits/${habit.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Habit deleted",
        description: "The habit has been permanently deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete habit. Please try again.",
      });
      console.error("Error deleting habit:", error);
    }
  });

  // Toggle habit completion status
  const handleToggleHabit = (checked: boolean) => {
    toggleHabitMutation.mutate({ completed: checked });
  };

  // Delete habit
  const handleDeleteHabit = () => {
    setIsDeleteDialogOpen(false);
    deleteHabitMutation.mutate();
  };

  return (
    <li>
      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative flex-shrink-0 mr-3">
            <Checkbox 
              checked={habit.isCompletedToday}
              onCheckedChange={handleToggleHabit}
              className="h-5 w-5"
            />
            {habit.isCompletedToday && (
              <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-800">{habit.name}</h3>
            <div className="mt-1 flex items-center">
              <span className="flex items-center text-sm text-gray-500">
                <Zap className="flex-shrink-0 mr-1.5 h-4 w-4 text-yellow-400" />
                {habit.streak > 0 
                  ? `${habit.streak} day streak`
                  : habit.streak === 0 && habit.isCompletedToday
                    ? "Streak started"
                    : "No streak"}
              </span>
              <span className="ml-2 flex items-center text-sm text-gray-500">
                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                {habit.frequency === 'daily' 
                  ? `Daily at ${reminderTime}`
                  : `${habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div>
            <HabitProgressRing 
              percentage={habit.completionRate} 
              size={48}
              strokeWidth={3} 
            />
          </div>
          <div className="mt-2 flex">
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500 mr-2"
              onClick={() => setIsEditDialogOpen(true)}
              aria-label="Edit habit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete habit"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details and schedule
            </DialogDescription>
          </DialogHeader>
          <HabitForm habitId={habit.id} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit and all its tracking data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteHabit}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
