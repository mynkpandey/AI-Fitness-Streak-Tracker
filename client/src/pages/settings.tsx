import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, Bell, User, Shield, HelpCircle, Loader2, Trash2, LogOut, FileText, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ProfileEditor } from "@/components/settings/profile-editor";

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  async function handleDeleteAccount() {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/users/${user.id}`);
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });
      
      setDeleteDialogOpen(false);
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

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              <ProfileEditor />
            </div>
            
            <div className="pt-2">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                Logout
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
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Streak Reminders</h3>
                <p className="text-sm text-gray-500">Get reminders to maintain your streak</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
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
            <CardDescription>Get help and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/legal/faqs">
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQs
              </Button>
            </Link>
            
            <Link href="/legal/contact">
              <Button variant="ghost" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </Link>
            
            <Link href="/legal/privacy-policy">
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </Link>
            
            <Link href="/legal/terms">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
              All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
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
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
