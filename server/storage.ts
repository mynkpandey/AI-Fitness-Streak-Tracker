import { 
  users, type User, type InsertUser,
  activities, type Activity, type InsertActivity,
  suggestions, type Suggestion, type InsertSuggestion
} from "@shared/schema";
import { MongoClient, ObjectId } from "mongodb";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>; // New method to delete a user
  
  // Activity operations
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  getActivitiesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivitiesByUserId(userId: number): Promise<boolean>; // New method to delete user's activities
  
  // Streak operations
  updateStreak(userId: number): Promise<{ currentStreak: number, bestStreak: number }>;
  
  // Suggestion operations
  getSuggestion(userId: number): Promise<Suggestion | undefined>;
  getLatestSuggestion(userId: number): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  markSuggestionAsUsed(id: number): Promise<Suggestion | undefined>;
  deleteSuggestionsByUserId(userId: number): Promise<boolean>; // New method to delete user's suggestions
  
  // Authentication
  sessionStore: any;
}

// MongoDB implementation
import { MongoClient, ObjectId } from "mongodb";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

const MongoDBStore = connectMongo(session);

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  sessionStore: any;
  
  constructor(uri: string) {
    if (!uri) {
      throw new Error("MongoDB URI is required");
    }
    this.client = new MongoClient(uri);
    this.connect();
    
    // Setup session store
    this.sessionStore = new MongoDBStore({
      uri: uri,
      databaseName: "fitstreak",
      collection: "sessions"
    });
    
    this.sessionStore.on('error', (error: any) => {
      console.error('MongoDB session store error:', error);
    });
  }
  
  private async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db("fitstreak");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.db.collection("users").findOne({ id });
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.collection("users").findOne({ username });
    return user || undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const collection = this.db.collection("users");
    
    // Check if username already exists
    const existingUser = await this.getUserByUsername(user.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    // Get the next ID
    const lastUser = await collection
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    
    const newUser = {
      ...user,
      id: newId,
      createdAt: new Date()
    };
    
    await collection.insertOne(newUser);
    return newUser as User;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.collection("users").findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.collection("users").deleteOne({ id });
    return result.deletedCount > 0;
  }
  
  async deleteActivitiesByUserId(userId: number): Promise<boolean> {
    const result = await this.db.collection("activities").deleteMany({ userId });
    return result.deletedCount > 0;
  }
  
  async deleteSuggestionsByUserId(userId: number): Promise<boolean> {
    const result = await this.db.collection("suggestions").deleteMany({ userId });
    return result.deletedCount > 0;
  }
  
  // Activity operations
  async getActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    return await this.db.collection("activities")
      .find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }
  
  async getActivitiesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Activity[]> {
    return await this.db.collection("activities")
      .find({ 
        userId,
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: -1 })
      .toArray();
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    const activity = await this.db.collection("activities").findOne({ id });
    return activity || undefined;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const collection = this.db.collection("activities");
    const lastActivity = await collection
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const newId = lastActivity.length > 0 ? lastActivity[0].id + 1 : 1;
    
    const newActivity = {
      ...activity,
      id: newId,
      date: activity.date || new Date()
    };
    
    await collection.insertOne(newActivity);
    
    // Update user's streak
    await this.updateStreak(activity.userId);
    
    return newActivity as Activity;
  }
  
  // Streak operations
  async updateStreak(userId: number): Promise<{ currentStreak: number, bestStreak: number }> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get latest activity
    const activities = await this.getActivities(userId, 30);
    
    if (activities.length === 0) {
      return { currentStreak: 0, bestStreak: user.bestStreak || 0 };
    }
    
    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let currentStreak = 0;
    let streakBroken = false;
    let lastDate: Date | null = null;
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Check if the most recent activity is from today or yesterday
    const mostRecentDate = new Date(activities[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const isToday = mostRecentDate.getTime() === today.getTime();
    const isYesterday = mostRecentDate.getTime() === yesterday.getTime();
    
    if (!isToday && !isYesterday) {
      // Streak is broken if most recent activity is older than yesterday
      currentStreak = 0;
    } else {
      // Count consecutive days with activities
      for (let i = 0; i < activities.length; i++) {
        const activityDate = new Date(activities[i].date);
        activityDate.setHours(0, 0, 0, 0);
        
        if (!lastDate) {
          // First activity in the list
          currentStreak = 1;
          lastDate = activityDate;
          continue;
        }
        
        // Calculate gap between this activity and the last one
        const lastDateTime = lastDate.getTime();
        const activityDateTime = activityDate.getTime();
        const differenceInDays = Math.round((lastDateTime - activityDateTime) / (1000 * 60 * 60 * 24));
        
        if (differenceInDays === 1) {
          // Consecutive day
          currentStreak++;
          lastDate = activityDate;
        } else if (differenceInDays === 0) {
          // Same day, continue
          lastDate = activityDate;
        } else {
          // Streak is broken
          break;
        }
      }
    }
    
    // Update user's streak information
    const bestStreak = Math.max(currentStreak, user.bestStreak || 0);
    
    await this.db.collection("users").updateOne(
      { id: userId },
      { 
        $set: { 
          currentStreak,
          bestStreak,
          lastWorkoutDate: new Date(),
          totalWorkouts: (user.totalWorkouts || 0) + 1
        } 
      }
    );
    
    // Update streak day for the latest activity
    if (activities.length > 0) {
      await this.db.collection("activities").updateOne(
        { id: activities[0].id },
        { $set: { streakDay: currentStreak } }
      );
    }
    
    return { currentStreak, bestStreak };
  }
  
  // Suggestion operations
  async getSuggestion(userId: number): Promise<Suggestion | undefined> {
    // Get the latest unused suggestion or create a new one
    const suggestion = await this.getLatestSuggestion(userId);
    return suggestion;
  }
  
  async getLatestSuggestion(userId: number): Promise<Suggestion | undefined> {
    const suggestion = await this.db.collection("suggestions")
      .find({ userId, used: false })
      .sort({ date: -1 })
      .limit(1)
      .toArray();
    
    return suggestion.length > 0 ? suggestion[0] : undefined;
  }
  
  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    const collection = this.db.collection("suggestions");
    const lastSuggestion = await collection
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const newId = lastSuggestion.length > 0 ? lastSuggestion[0].id + 1 : 1;
    
    const newSuggestion = {
      ...suggestion,
      id: newId,
      date: new Date()
    };
    
    await collection.insertOne(newSuggestion);
    return newSuggestion as Suggestion;
  }
  
  async markSuggestionAsUsed(id: number): Promise<Suggestion | undefined> {
    const result = await this.db.collection("suggestions").findOneAndUpdate(
      { id },
      { $set: { used: true } },
      { returnDocument: 'after' }
    );
    
    return result || undefined;
  }
}

// Memory storage for development and testing
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usernameIndex: Map<string, number>;
  private activities: Map<number, Activity>;
  private suggestions: Map<number, Suggestion>;
  private activityIdCounter: number;
  private suggestionIdCounter: number;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.usernameIndex = new Map();
    this.activities = new Map();
    this.suggestions = new Map();
    this.activityIdCounter = 1;
    this.suggestionIdCounter = 1;
    
    // Setup in-memory session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = this.usernameIndex.get(username);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if username exists
    if (this.usernameIndex.has(insertUser.username)) {
      throw new Error("Username already exists");
    }
    
    const newId = this.users.size + 1;
    
    const user: User = {
      ...insertUser,
      id: newId,
      createdAt: new Date(),
    };
    
    this.users.set(newId, user);
    this.usernameIndex.set(user.username, newId);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // If username is being updated, update the index
    if (updates.username && updates.username !== user.username) {
      // Check if the new username is already taken
      if (this.usernameIndex.has(updates.username)) {
        throw new Error("Username already exists");
      }
      
      // Update username index
      this.usernameIndex.delete(user.username);
      this.usernameIndex.set(updates.username, id);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) return false;
    
    const user = this.users.get(id);
    if (user) {
      // Remove from username index
      this.usernameIndex.delete(user.username);
    }
    
    // Delete the user
    return this.users.delete(id);
  }
  
  async deleteActivitiesByUserId(userId: number): Promise<boolean> {
    let deleted = false;
    
    // Find all activities for the user
    for (const [activityId, activity] of this.activities.entries()) {
      if (activity.userId === userId) {
        this.activities.delete(activityId);
        deleted = true;
      }
    }
    
    return deleted;
  }
  
  async deleteSuggestionsByUserId(userId: number): Promise<boolean> {
    let deleted = false;
    
    // Find all suggestions for the user
    for (const [suggestionId, suggestion] of this.suggestions.entries()) {
      if (suggestion.userId === userId) {
        this.suggestions.delete(suggestionId);
        deleted = true;
      }
    }
    
    return deleted;
  }

  // Activity operations
  async getActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
    
    return userActivities;
  }

  async getActivitiesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => {
        const activityDate = activity.date instanceof Date ? activity.date : new Date(activity.date);
        return activity.userId === userId && 
               activityDate >= startDate && 
               activityDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      });
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = {
      ...activity,
      id,
      date: activity.date || new Date(),
    };
    
    this.activities.set(id, newActivity);
    
    // Update user's streak
    await this.updateStreak(activity.userId);
    
    return newActivity;
  }

  // Streak operations
  async updateStreak(userId: number): Promise<{ currentStreak: number, bestStreak: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const activities = await this.getActivities(userId, 30);
    
    if (activities.length === 0) {
      return { currentStreak: 0, bestStreak: user.bestStreak || 0 };
    }
    
    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    // Check if the most recent activity is from today or yesterday
    const mostRecentActivity = activities[0];
    const mostRecentDate = mostRecentActivity.date instanceof Date 
      ? mostRecentActivity.date 
      : new Date(mostRecentActivity.date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const isToday = mostRecentDate.getTime() === today.getTime();
    const isYesterday = mostRecentDate.getTime() === yesterday.getTime();
    
    if (!isToday && !isYesterday) {
      // Streak is broken if most recent activity is older than yesterday
      currentStreak = 0;
    } else {
      // Count consecutive days with activities
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const activityDate = activity.date instanceof Date 
          ? activity.date 
          : new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        
        if (!lastDate) {
          // First activity in the list
          currentStreak = 1;
          lastDate = activityDate;
          continue;
        }
        
        // Calculate gap between this activity and the last one
        const lastDateTime = lastDate.getTime();
        const activityDateTime = activityDate.getTime();
        const differenceInDays = Math.round((lastDateTime - activityDateTime) / (1000 * 60 * 60 * 24));
        
        if (differenceInDays === 1) {
          // Consecutive day
          currentStreak++;
          lastDate = activityDate;
        } else if (differenceInDays === 0) {
          // Same day, continue
          lastDate = activityDate;
        } else {
          // Streak is broken
          break;
        }
      }
    }
    
    // Update user's streak information
    const bestStreak = Math.max(currentStreak, user.bestStreak || 0);
    
    await this.updateUser(userId, {
      currentStreak,
      bestStreak,
      lastWorkoutDate: new Date(),
      totalWorkouts: (user.totalWorkouts || 0) + 1
    });
    
    // Update streak day for the latest activity
    if (activities.length > 0) {
      const latestActivity = activities[0];
      const updatedActivity = { ...latestActivity, streakDay: currentStreak };
      this.activities.set(latestActivity.id, updatedActivity);
    }
    
    return { currentStreak, bestStreak };
  }

  // Suggestion operations
  async getSuggestion(userId: number): Promise<Suggestion | undefined> {
    return this.getLatestSuggestion(userId);
  }

  async getLatestSuggestion(userId: number): Promise<Suggestion | undefined> {
    const userSuggestions = Array.from(this.suggestions.values())
      .filter(suggestion => suggestion.userId === userId && !suggestion.used)
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      });
    
    return userSuggestions.length > 0 ? userSuggestions[0] : undefined;
  }

  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.suggestionIdCounter++;
    const newSuggestion: Suggestion = {
      ...suggestion,
      id,
      date: new Date(),
    };
    
    this.suggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async markSuggestionAsUsed(id: number): Promise<Suggestion | undefined> {
    const suggestion = this.suggestions.get(id);
    if (!suggestion) return undefined;

    const updatedSuggestion = { ...suggestion, used: true };
    this.suggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
}

// Create and export storage instance
// Force use of in-memory storage for local development
const uri = process.env.MONGODB_URI;
console.log("MongoDB URI:", uri ? "Found" : "Not found");

// Use in-memory storage for easy local development
export const storage = new MemStorage();
