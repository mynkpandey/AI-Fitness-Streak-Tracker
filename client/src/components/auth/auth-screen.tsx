import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

export function AuthScreen() {
  return (
    <div className="auth-screen min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary to-blue-400">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FitStreak</h1>
          <p className="mt-2 text-gray-600">Track your fitness journey with AI-powered insights</p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-blue-600 text-white",
              footerAction: "text-primary",
              dividerLine: "bg-gray-300",
              dividerText: "text-gray-500",
              socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50"
            }
          }}
          redirectUrl="/"
        />
      </div>
    </div>
  );
}
