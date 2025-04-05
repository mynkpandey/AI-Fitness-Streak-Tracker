import { Request, Response, NextFunction } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import session from 'express-session';

// Extend session type definitions
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const scryptAsync = promisify(scrypt);

// Development mode flag for easy testing
const DEV_MODE = process.env.NODE_ENV !== 'production';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: any;
    }
  }
}

/**
 * Hashes a password for secure storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compares a supplied plain text password to a stored hashed password
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Gets the user ID from the request object
 */
export const getUserId = (req: Request): number => {
  if (DEV_MODE && !req.userId) {
    // Return a development user ID for testing
    return 1;
  }
  
  if (!req.userId) {
    throw new Error('Unauthorized: User not authenticated');
  }
  
  return req.userId;
};

/**
 * Middleware to check if the user is authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated via session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Add user ID to request for later use
  req.userId = req.session.userId;
  
  next();
};
