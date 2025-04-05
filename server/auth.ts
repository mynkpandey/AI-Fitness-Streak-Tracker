import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction } from 'express';

// TEMPORARY: Development mode flag to bypass Clerk authentication
const DEV_MODE = true;
const DEV_USER_ID = "user_dev123456";

// Helper function to extract user ID from Clerk auth
export const getUserId = (req: any): string => {
  if (DEV_MODE) {
    return DEV_USER_ID;
  }
  
  if (!req.auth || !req.auth.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }
  return req.auth.userId;
};

// Development mode middleware to bypass authentication
const devModeAuth = (req: Request, res: Response, next: NextFunction) => {
  // Add mock auth data to the request
  (req as any).auth = {
    userId: DEV_USER_ID,
    sessionId: 'session_dev',
    getToken: () => 'dev_token'
  };
  next();
};

// Middleware to require authentication
export const requireAuth = DEV_MODE 
  ? devModeAuth 
  : ClerkExpressRequireAuth({
      // Function to handle unauthorized requests
      onError: (err) => {
        console.error('Authentication error:', err);
        return {
          status: 401,
          message: 'Authentication required'
        };
      }
    });
