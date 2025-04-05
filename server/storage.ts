import { 
  users, type User, type InsertUser,
  activities, type Activity, type InsertActivity,
  suggestions, type Suggestion, type InsertSuggestion
} from "@shared/schema";
import { MongoClient, ObjectId } from "mongodb";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Activity operations
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Streak operations
  updateStreak(userId: string): Promise<{ currentStreak: number, bestStreak: number }>;
  
  // Suggestion operations
  getSuggestion(userId: string): Promise<Suggestion | undefined>;
  getLatestSuggestion(userId: string): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  markSuggestionAsUsed(id: number): Promise<Suggestion | undefined>;
}

// MongoDB implementation
export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  
  constructor(uri: string) {
    if (!uri) {
      throw new Error("MongoDB URI is required");
    }
    this.client = new MongoClient(uri);
    this.connect();
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
  async getUser(id: string): Promise<User | undefined> {
    const user = await this.db.collection("users").findOne({ id });
    return user || undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      createdAt: new Date()
    };
    await this.db.collection("users").insertOne(newUser);
    return newUser as User;
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.collection("users").findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }
  
  // Activity operations
  async getActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    return await this.db.collection("activities")
      .find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }
  
  async getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
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
      date: new Date()
    };
    
    await collection.insertOne(newActivity);
    
    // Update user's streak
    await this.updateStreak(activity.userId);
    
    return newActivity as Activity;
  }
  
  // Streak operations
  async updateStreak(userId: string): Promise<{ currentStreak: number, bestStreak: number }> {
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
  async getSuggestion(userId: string): Promise<Suggestion | undefined> {
    // Get the latest unused suggestion or create a new one
    const suggestion = await this.getLatestSuggestion(userId);
    return suggestion;
  }
  
  async getLatestSuggestion(userId: string): Promise<Suggestion | undefined> {
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
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<number, Activity>;
  private suggestions: Map<number, Suggestion>;
  private activityIdCounter: number;
  private suggestionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.suggestions = new Map();
    this.activityIdCounter = 1;
    this.suggestionIdCounter = 1;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Activity operations
  async getActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    
    return userActivities;
  }

  async getActivitiesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => 
        activity.userId === userId && 
        new Date(activity.date) >= startDate && 
        new Date(activity.date) <= endDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = {
      ...activity,
      id,
      date: new Date(),
    };
    
    this.activities.set(id, newActivity);
    
    // Update user's streak
    await this.updateStreak(activity.userId);
    
    return newActivity;
  }

  // Streak operations
  async updateStreak(userId: string): Promise<{ currentStreak: number, bestStreak: number }> {
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
  async getSuggestion(userId: string): Promise<Suggestion | undefined> {
    return this.getLatestSuggestion(userId);
  }

  async getLatestSuggestion(userId: string): Promise<Suggestion | undefined> {
    const userSuggestions = Array.from(this.suggestions.values())
      .filter(suggestion => suggestion.userId === userId && !suggestion.used)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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
const uri = process.env.MONGODB_URI;
export const storage = uri 
  ? new MongoStorage(uri) 
  : new MemStorage();
