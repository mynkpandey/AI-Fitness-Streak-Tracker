import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, getUserId } from "./auth";
import { generateFitnessSuggestion } from "./gemini";
import { insertUserSchema, insertActivitySchema } from "@shared/schema";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

// TEMPORARY: Development mode flag to bypass Clerk authentication
const DEV_MODE = true;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Clerk middleware (only if not in dev mode)
  if (!DEV_MODE) {
    const clerkMiddleware = ClerkExpressWithAuth();
    // Add Clerk authentication middleware to all API routes
    app.use("/api", clerkMiddleware);
  }
  
  // User routes
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Get user from storage
      let user = await storage.getUser(userId);
      
      // If user doesn't exist, create a new one
      if (!user) {
        // When in dev mode, use mock user data
        user = await storage.createUser({
          id: userId,
          username: DEV_MODE ? 'Dev User' : ((req as any).auth?.username || 'User'),
          bestStreak: 0,
          currentStreak: 0,
          totalWorkouts: 0,
          lastWorkoutDate: null
        });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Activity routes
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/activities/weekly", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Calculate start and end dates for the current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday of current week
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of current week
      endOfWeek.setHours(23, 59, 59, 999);
      
      const activities = await storage.getActivitiesByDateRange(userId, startOfWeek, endOfWeek);
      
      // Organize activities by day of the week
      const weeklyActivities = Array(7).fill(null);
      
      activities.forEach(activity => {
        if (activity.date) {
          const activityDate = new Date(activity.date);
          const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 6 = Saturday
          
          // If there's already an activity for this day, keep the first one
          if (!weeklyActivities[dayOfWeek]) {
            weeklyActivities[dayOfWeek] = activity;
          }
        }
      });
      
      res.json({
        startOfWeek,
        endOfWeek,
        activities: weeklyActivities,
        completedDays: weeklyActivities.filter(a => a !== null).length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Add current date if none is provided
      const requestData = {
        ...req.body,
        userId,
        date: req.body.date || new Date()
      };
      
      // Validate the request body
      const validatedData = insertActivitySchema.parse(requestData);
      
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid activity data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Suggestion routes
  app.get("/api/suggestions", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Check if there's an existing unused suggestion
      let suggestion = await storage.getLatestSuggestion(userId);
      
      if (!suggestion) {
        // Generate a new suggestion
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const recentActivities = await storage.getActivities(userId, 5);
        
        const aiSuggestion = await generateFitnessSuggestion(
          recentActivities.map(a => ({
            type: a.type,
            duration: a.duration,
            date: a.date
          })),
          user.currentStreak || 0,
          user.totalWorkouts || 0
        );
        
        suggestion = await storage.createSuggestion({
          userId,
          suggestion: aiSuggestion.suggestion,
          goals: aiSuggestion.goals,
          date: new Date(),
          used: false
        });
      }
      
      res.json(suggestion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/suggestions/refresh", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Generate a new suggestion regardless of whether there's an existing one
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const recentActivities = await storage.getActivities(userId, 5);
      
      const aiSuggestion = await generateFitnessSuggestion(
        recentActivities.map(a => ({
          type: a.type,
          duration: a.duration,
          date: a.date
        })),
        user.currentStreak || 0,
        user.totalWorkouts || 0
      );
      
      const suggestion = await storage.createSuggestion({
        userId,
        suggestion: aiSuggestion.suggestion,
        goals: aiSuggestion.goals,
        date: new Date(),
        used: false
      });
      
      res.json(suggestion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/suggestions/:id/use", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const suggestionId = parseInt(req.params.id);
      
      const updatedSuggestion = await storage.markSuggestionAsUsed(suggestionId);
      
      if (!updatedSuggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      
      res.json(updatedSuggestion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
