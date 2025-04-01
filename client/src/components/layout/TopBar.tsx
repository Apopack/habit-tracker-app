import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md focus:outline-none">
                  <Menu className="h-6 w-6 text-gray-700" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex items-center mb-8 mt-4">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L15 11M12 4V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h1 className="ml-2 text-xl font-bold">HabitTrack</h1>
                </div>
                <nav className="flex flex-col space-y-1">
                  <Link href="/">
                    <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <Home className="h-5 w-5 mr-3" />
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/calendar">
                    <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                      Calendar
                    </a>
                  </Link>
                  <Link href="/stats">
                    <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <BarChart3 className="h-5 w-5 mr-3 text-gray-500" />
                      Stats
                    </a>
                  </Link>
                  <Link href="/settings">
                    <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="h-5 w-5 mr-3 text-gray-500" />
                      Settings
                    </a>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="ml-2 text-xl font-bold">HabitTrack</h1>
          </div>
          <div className="ml-auto flex items-center">
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
              <button className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary"></span>
              </button>
              <div className="ml-4 relative">
                <div>
                  <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" id="user-menu" aria-expanded="false">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import icons for mobile menu
import { Home, Calendar, BarChart3, Settings } from "lucide-react";
