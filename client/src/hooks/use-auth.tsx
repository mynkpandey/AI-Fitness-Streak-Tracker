import { useEffect, useState } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  // Create or get user in our database when Clerk authentication state changes
  useEffect(() => {
    async function initUser() {
      if (isLoaded && isSignedIn && user) {
        try {
          // Fetch or create the user in our database
          await apiRequest("GET", "/api/user");
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to initialize user:", error);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsInitialized(true);
      }
    }

    initUser();
  }, [isLoaded, isSignedIn, user]);

  return {
    isAuthenticated: isLoaded && isSignedIn && isInitialized,
    isLoading: !isLoaded || (isSignedIn && !isInitialized),
    user: isSignedIn ? user : null,
  };
}
