import { Activity, CheckCheck, Zap, AlertTriangle } from "lucide-react";

interface HabitStatsProps {
  stats: {
    totalHabits: number;
    completedToday: number;
    maxStreak: number;
    needsAttention: number;
  };
}

export default function HabitStats({ stats }: HabitStatsProps) {
  return (
    <>
      {/* Active Habits */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Habits
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.totalHabits}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Today */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCheck className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Completed Today
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {stats.completedToday}/{stats.totalHabits}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Current Streak
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.maxStreak} days</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Needs Attention */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Needs Attention
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.needsAttention}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
