import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bell, User, Shield, HelpCircle } from "lucide-react";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Account
            </CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Profile Information</h3>
                <p className="text-sm text-gray-500">Update your account details</p>
              </div>
              <Button variant="outline">
                Edit
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Email</h3>
                <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress || "Not set"}</p>
              </div>
              <Button variant="outline">
                Change
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Password</h3>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
              <Button variant="outline">
                Change
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive push notifications for activity reminders</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive emails for streak milestones</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Weekly Summary</h3>
                <p className="text-sm text-gray-500">Receive a weekly summary of your activities</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Manage your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Data Analytics</h3>
                <p className="text-sm text-gray-500">Allow anonymous usage data to improve the app</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Share Progress</h3>
                <p className="text-sm text-gray-500">Allow sharing your progress with friends</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Delete Account Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              Help & Support
            </CardTitle>
            <CardDescription>Get help using FitStreak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>About FitStreak</AlertTitle>
              <AlertDescription>
                FitStreak v1.0.0 - AI-powered fitness streak tracking application
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              <Button variant="outline" className="w-full">
                FAQs
              </Button>
              <Button variant="outline" className="w-full">
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full">
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
