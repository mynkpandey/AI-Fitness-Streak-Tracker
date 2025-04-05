import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Helper function to extract user ID from Clerk auth
export const getUserId = (req: any): string => {
  if (!req.auth || !req.auth.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }
  return req.auth.userId;
};

// Middleware to require authentication
export const requireAuth = ClerkExpressRequireAuth({
  // Function to handle unauthorized requests
  onError: (err) => {
    console.error('Authentication error:', err);
    return {
      status: 401,
      message: 'Authentication required'
    };
  }
});
