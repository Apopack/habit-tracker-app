import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Edit, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import HabitForm from "@/components/habit/HabitForm";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogHabitId, setDeleteDialogHabitId] = useState<number | null>(null);

  // Fetch all habits (including archived ones)
  const { data: habits, isLoading } = useQuery({
    queryKey: ['/api/habits'],
  });

  // Archive/delete mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      await apiRequest('DELETE', `/api/habits/${habitId}`);
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
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting habit:", error);
    },
  });

  const archiveHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      await apiRequest('PATCH', `/api/habits/${habitId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Habit archived",
        description: "The habit has been archived and won't appear in your dashboard.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to archive habit. Please try again.",
        variant: "destructive",
      });
      console.error("Error archiving habit:", error);
    },
  });

  const handleEditHabit = (habitId: number) => {
    setEditingHabitId(habitId);
    setIsEditDialogOpen(true);
  };

  const handleDeleteHabit = (habitId: number) => {
    setDeleteDialogHabitId(habitId);
  };

  const confirmDeleteHabit = () => {
    if (deleteDialogHabitId !== null) {
      deleteHabitMutation.mutate(deleteDialogHabitId);
      setDeleteDialogHabitId(null);
    }
  };

  const handleArchiveHabit = (habitId: number) => {
    archiveHabitMutation.mutate(habitId);
  };

  const activeHabits = habits?.filter((habit: any) => !habit.isArchived) || [];
  const archivedHabits = habits?.filter((habit: any) => habit.isArchived) || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Habits</CardTitle>
                <CardDescription>
                  Edit, archive or delete your habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Active Habits</h3>
                    {activeHabits.length > 0 ? (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {activeHabits.map((habit: any) => (
                            <div 
                              key={habit.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">{habit.name}</h4>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {habit.description || "No description"}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditHabit(habit.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleArchiveHabit(habit.id)}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                  <span className="sr-only">Archive</span>
                                </Button>
                                <AlertDialog open={deleteDialogHabitId === habit.id} onOpenChange={() => setDeleteDialogHabitId(null)}>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteHabit(habit.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the habit and all of its tracking data.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={confirmDeleteHabit}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No active habits</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="archived">
                        <AccordionTrigger>
                          <h3 className="text-md font-medium">Archived Habits ({archivedHabits.length})</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                          {archivedHabits.length > 0 ? (
                            <ScrollArea className="h-[200px] mt-2">
                              <div className="space-y-3">
                                {archivedHabits.map((habit: any) => (
                                  <div 
                                    key={habit.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <h4 className="font-medium text-gray-900">{habit.name}</h4>
                                      <p className="text-sm text-gray-500 truncate max-w-xs">
                                        {habit.description || "No description"}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          // Unarchive logic would go here
                                          toast({
                                            title: "Feature not implemented",
                                            description: "Unarchiving habits is not yet implemented.",
                                          });
                                        }}
                                      >
                                        <ChevronUp className="h-4 w-4" />
                                        <span className="sr-only">Unarchive</span>
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will permanently delete the habit and all of its tracking data.
                                              This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => {
                                                deleteHabitMutation.mutate(habit.id);
                                              }}
                                              className="bg-red-500 hover:bg-red-600"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-center p-6 bg-gray-50 rounded-lg mt-2">
                              <p className="text-gray-500">No archived habits</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your data and export options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full sm:w-auto" disabled>
                    Export Data (Coming Soon)
                  </Button>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-2">Danger Zone</h3>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">Delete All Data</h4>
                          <p className="text-sm text-gray-500 mb-3">
                            This will permanently delete all your habits and tracking data. This action cannot be undone.
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">Delete All Data</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all your habits and tracking data.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => {
                                    // This would typically clear all data, but we'll just show a toast for now
                                    toast({
                                      title: "Feature not implemented",
                                      description: "Data deletion is not yet implemented.",
                                    });
                                  }}
                                >
                                  Delete All Data
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-gray-500">Receive reminders for your habits</p>
                    </div>
                    <Switch id="notifications" disabled />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                    </div>
                    <Switch id="darkMode" disabled />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekStart">Week Starts On</Label>
                      <p className="text-sm text-gray-500">Set the first day of the week</p>
                    </div>
                    <select 
                      id="weekStart" 
                      className="text-sm rounded-md border-gray-300"
                      disabled
                    >
                      <option>Monday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <strong>HabitTrack</strong> - Version 1.0.0
                  </p>
                  <p className="text-sm text-gray-500">
                    A habit tracking application to help you build and maintain healthy routines.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details and schedule
            </DialogDescription>
          </DialogHeader>
          <HabitForm 
            habitId={editingHabitId} 
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setEditingHabitId(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
