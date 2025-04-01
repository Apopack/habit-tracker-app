import { useState } from "react";
import { HabitWithStats } from "@shared/schema";
import HabitItem from "./HabitItem";
import { Separator } from "@/components/ui/separator";

interface HabitListProps {
  habits: HabitWithStats[];
}

export default function HabitList({ habits }: HabitListProps) {
  // Group habits by completion status to display completed habits first
  const completedHabits = habits.filter(habit => habit.isCompletedToday);
  const pendingHabits = habits.filter(habit => !habit.isCompletedToday);
  
  // Combine them with completed habits shown first
  const sortedHabits = [...completedHabits, ...pendingHabits];

  return (
    <ul className="divide-y divide-gray-200">
      {sortedHabits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </ul>
  );
}
