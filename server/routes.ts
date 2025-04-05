import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, getUserId, hashPassword, comparePasswords } from "./auth";
import { generateFitnessSuggestion, generateHealthAdvice } from "./gemini";
import { insertUserSchema, insertActivitySchema, loginUserSchema } from "@shared/schema";

// Development mode flag
const DEV_MODE = process.env.NODE_ENV !== "production";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Set up session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      if (error.message === "Username already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate request body
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Compare passwords
      const passwordMatch = await comparePasswords(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Set up session
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid login data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.sendStatus(200);
    });
  });
  
  // User routes
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      // Get user from storage
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
      
      // Add current date and user ID if none is provided
      const requestData = {
        ...req.body,
        userId,
        date: req.body.date || new Date(),
        notes: req.body.notes || null,
        streakDay: req.body.streakDay || null,
        completed: req.body.completed !== undefined ? req.body.completed : true
      };
      
      // Log what we're sending to the database
      console.log("Creating activity with data:", requestData);
      
      // Create the activity in the database directly
      // We're skipping Zod validation here since we're supplying all the required fields
      const activity = await storage.createActivity(requestData);
      res.status(201).json(activity);
    } catch (error: any) {
      console.error("Error creating activity:", error);
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
  
  // Health advice chatbot endpoint
  app.post("/api/health/advice", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }
      
      // Get user profile to personalize the response
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get recent activities for context
      const recentActivities = await storage.getActivities(userId, 3);
      
      // Generate health advice
      const advice = await generateHealthAdvice(question, {
        activities: recentActivities.map(a => ({
          type: a.type,
          duration: a.duration,
          date: a.date
        })),
        currentStreak: user.currentStreak || 0,
        totalWorkouts: user.totalWorkouts || 0
      });
      
      res.json(advice);
    } catch (error: any) {
      console.error("Error generating health advice:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete user account route
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const requestedId = req.params.id;
      
      // Get the authenticated user to compare properly
      const authenticatedUser = await storage.getUser(userId);
      
      if (!authenticatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // For MongoDB, log user info to help with debugging
      console.log(`User account deletion request - Session userId: ${userId}`);
      console.log(`Authenticated user:`, authenticatedUser);
      console.log(`Requested ID to delete: ${requestedId}`);
      
      // In MongoDB implementation we're using sessions, so only allow deletion of the logged-in user's account
      // Step 1: Delete all user activities
      await storage.deleteActivitiesByUserId(userId);
      console.log(`Deleted activities for user ${userId}`);
      
      // Step 2: Delete all user suggestions
      await storage.deleteSuggestionsByUserId(userId);
      console.log(`Deleted suggestions for user ${userId}`);
      
      // Step 3: Delete the user account itself
      const deleteResult = await storage.deleteUser(userId);
      console.log(`Deleted user account: ${deleteResult ? "Success" : "Failed"}`);
      
      if (!deleteResult) {
        return res.status(404).json({ error: "Failed to delete user account" });
      }
      
      // Return success response
      res.json({ 
        success: true, 
        message: "Account completely deleted" 
      });
    } catch (error: any) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
