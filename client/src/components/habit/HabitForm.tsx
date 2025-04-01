import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { habitFormSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface HabitFormProps {
  habitId?: number | null;
  onSuccess?: () => void;
}

export default function HabitForm({ habitId, onSuccess }: HabitFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch habit data if editing
  const { data: habitData, isLoading: isLoadingHabit } = useQuery({
    queryKey: habitId ? [`/api/habits/${habitId}`] : null,
    enabled: !!habitId,
  });
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      reminderTime: "",
      activeDays: "[1,2,3,4,5]", // Default to weekdays (Mon-Fri)
    },
  });
  
  // Update form values when habit data is loaded
  useEffect(() => {
    if (habitData) {
      form.reset({
        name: habitData.name,
        description: habitData.description || "",
        frequency: habitData.frequency,
        reminderTime: habitData.reminderTime || "",
        activeDays: habitData.activeDays,
      });
    }
  }, [habitData, form]);
  
  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/habits', data);
    },
    onSuccess: async () => {
      // Invalidate queries to update UI
      await queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully!",
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error creating habit:", error);
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/habits/${habitId}`, data);
    },
    onSuccess: async () => {
      // Invalidate queries to update UI
      await queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/habits/${habitId}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully!",
      });
      
      // Call onSuccess callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error updating habit:", error);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    
    // Ensure activeDays is a string representation of an array
    const activeDaysArray = typeof data.activeDays === 'object' 
      ? data.activeDays 
      : (data.activeDays ? JSON.parse(data.activeDays) : [1, 2, 3, 4, 5]);
    
    const habitData = {
      ...data,
      activeDays: JSON.stringify(activeDaysArray),
    };
    
    if (habitId) {
      updateHabitMutation.mutate(habitData);
    } else {
      createHabitMutation.mutate(habitData);
    }
  };
  
  // Define weekday options
  const weekdays = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 0, label: "Sunday" },
  ];
  
  // Parse active days for checkbox display
  const getActiveDays = () => {
    try {
      const activeDaysValue = form.watch("activeDays");
      
      if (typeof activeDaysValue === 'string') {
        return JSON.parse(activeDaysValue);
      }
      
      return activeDaysValue || [1, 2, 3, 4, 5];
    } catch (e) {
      return [1, 2, 3, 4, 5]; // Default to weekdays
    }
  };
  
  // Update the active days array
  const handleDayToggle = (day: number, checked: boolean) => {
    const currentDays = getActiveDays();
    
    let newDays;
    if (checked) {
      // Add day if not present
      newDays = currentDays.includes(day) ? currentDays : [...currentDays, day];
    } else {
      // Remove day if present
      newDays = currentDays.filter((d: number) => d !== day);
    }
    
    // Sort days for consistency
    newDays.sort((a: number, b: number) => {
      // Sort with Sunday (0) at the end
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });
    
    form.setValue("activeDays", JSON.stringify(newDays));
  };
  
  const activeDays = getActiveDays();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Morning Meditation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about your habit"
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="activeDays"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Active Days</FormLabel>
                <FormDescription>
                  Select the days when you want to perform this habit
                </FormDescription>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {weekdays.map((day) => (
                    <FormItem
                      key={day.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={activeDays.includes(day.value)}
                          onCheckedChange={(checked) => handleDayToggle(day.value, !!checked)}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {day.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Separator />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? habitId ? "Updating..." : "Creating..."
              : habitId ? "Update Habit" : "Create Habit"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
