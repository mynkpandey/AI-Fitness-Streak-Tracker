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
  secretKey: "sk_test_bAhcFlAlcmx5ugSFZsA3r3xg5inrxZlnrK7zmsSZgr",
  onError: (err, req, res) => {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  }
});
