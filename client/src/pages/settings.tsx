import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, Bell, User, Shield, HelpCircle, Loader2, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  async function handleDeleteAccount() {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      // In MongoDB, we can just use the authenticated session, so pass the user.id
      // The server will use the session userId to perform the action
      await apiRequest("DELETE", `/api/users/${user.id}`);
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      setDeleteDialogOpen(false);
      
      // Logout the user after data deletion
      logoutMutation.mutate();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <div className="flex items-center">
          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary font-semibold mr-2">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="text-sm font-medium">{user?.username || "User"}</div>
        </div>
      </div>
      
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
                <p className="text-sm text-gray-500">{user?.email || "Not set"}</p>
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
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Signing out...
                  </>
                ) : "Sign out"}
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
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-destructive flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently delete your account and all your data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-500">
                    Your account and all associated data will be completely removed from our system.
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
