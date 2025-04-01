import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CalendarView from "@/pages/CalendarView";
import Stats from "@/pages/Stats";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import TopBar from "@/components/layout/TopBar";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar currentPath={location} />
      <MobileNav currentPath={location} />
      
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <TopBar />
        
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/calendar" component={CalendarView} />
          <Route path="/stats" component={Stats} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
