import { Link } from "wouter";
import { BarChart3, Calendar, Home, Settings } from "lucide-react";

interface MobileNavProps {
  currentPath: string;
}

export default function MobileNav({ currentPath }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-4 h-16">
        <Link href="/">
          <a className={`flex flex-col justify-center items-center ${currentPath === '/' ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/calendar">
          <a className={`flex flex-col justify-center items-center ${currentPath === '/calendar' ? 'text-primary' : 'text-gray-500'}`}>
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Calendar</span>
          </a>
        </Link>
        <Link href="/stats">
          <a className={`flex flex-col justify-center items-center ${currentPath === '/stats' ? 'text-primary' : 'text-gray-500'}`}>
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex flex-col justify-center items-center ${currentPath === '/settings' ? 'text-primary' : 'text-gray-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
