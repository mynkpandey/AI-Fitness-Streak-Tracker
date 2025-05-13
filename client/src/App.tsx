import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Stats from "@/pages/stats";
import Insights from "@/pages/insights";
import Settings from "@/pages/settings";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import BottomNav from "@/components/layout/bottom-nav";
import Header from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";

// Auth page
import AuthPage from "@/pages/auth-page";
import FAQs from "@/pages/legal/faqs";
import PrivacyPolicy from "@/pages/legal/privacy-policy";
import TermsOfService from "@/pages/legal/terms";
import ContactSupport from "@/pages/legal/contact";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div id="app" className="min-h-screen flex flex-col">
          <AppRoutes />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {user && <Header />}
      <div className={`flex-1 flex flex-col ${user ? 'pb-16' : ''}`}>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/stats" component={Stats} />
          <ProtectedRoute path="/insights" component={Insights} />
          <ProtectedRoute path="/settings" component={Settings} />
          <ProtectedRoute path="/legal/faqs" component={FAQs} />
          <ProtectedRoute path="/legal/privacy-policy" component={PrivacyPolicy} />
          <ProtectedRoute path="/legal/terms" component={TermsOfService} />
          <ProtectedRoute path="/legal/contact" component={ContactSupport} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {user && <BottomNav />}
    </>
  );
}

export default App;
