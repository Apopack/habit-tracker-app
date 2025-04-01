import { Link } from "wouter";
import { BarChart3, Calendar, Home, Settings } from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className="bg-white shadow lg:w-64 lg:flex-shrink-0 lg:flex lg:flex-col lg:fixed lg:inset-y-0 hidden lg:block">
      <div className="flex-1 flex flex-col py-6 px-4 overflow-y-auto">
        <div className="flex items-center px-4 mb-8">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L15 11M12 4V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="ml-2 text-xl font-bold">HabitTrack</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/">
            <a className={`flex items-center px-4 py-3 ${currentPath === '/' ? 'text-primary font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}>
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          <Link href="/calendar">
            <a className={`flex items-center px-4 py-3 ${currentPath === '/calendar' ? 'text-primary font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}>
              <Calendar className="h-5 w-5 mr-3 text-gray-500" />
              Calendar
            </a>
          </Link>
          <Link href="/stats">
            <a className={`flex items-center px-4 py-3 ${currentPath === '/stats' ? 'text-primary font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}>
              <BarChart3 className="h-5 w-5 mr-3 text-gray-500" />
              Stats
            </a>
          </Link>
          <Link href="/settings">
            <a className={`flex items-center px-4 py-3 ${currentPath === '/settings' ? 'text-primary font-medium bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}>
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              Settings
            </a>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
