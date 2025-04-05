import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ClerkProvider } from "@clerk/clerk-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Stats from "@/pages/stats";
import Insights from "@/pages/insights";
import Settings from "@/pages/settings";
import { AuthScreen } from "@/components/auth/auth-screen";
import { useAuth } from "@/hooks/use-auth";
import BottomNav from "@/components/layout/bottom-nav";
import Header from "@/components/layout/header";

// Initialize Clerk with your publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="flex-1 flex flex-col pb-16">
      <Header />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/stats" component={Stats} />
        <Route path="/insights" component={Insights} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <div id="app" className="min-h-screen flex flex-col">
          <AppRoutes />
        </div>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
