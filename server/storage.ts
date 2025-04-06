import { 
  type User, type InsertUser,
  type Activity, type InsertActivity,
  type Suggestion, type InsertSuggestion
} from "@shared/schema";
import { MongoClient } from "mongodb";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

const MongoDBStore = connectMongo(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Activity operations
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  getActivitiesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivitiesByUserId(userId: number): Promise<boolean>;
  
  // Streak operations
  updateStreak(userId: number): Promise<{ currentStreak: number, bestStreak: number }>;
  
  // Suggestion operations
  getSuggestion(userId: number): Promise<Suggestion | undefined>;
  getLatestSuggestion(userId: number): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  markSuggestionAsUsed(id: number): Promise<Suggestion | undefined>;
  deleteSuggestionsByUserId(userId: number): Promise<boolean>;
  
  // Authentication
  sessionStore: any;
}

// MongoDB implementation
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
      email: user.email || null,
      bestStreak: user.bestStreak || 0,
      currentStreak: user.currentStreak || 0,
      totalWorkouts: user.totalWorkouts || 0,
      lastWorkoutDate: user.lastWorkoutDate || null,
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
      date: activity.date || new Date(),
      notes: activity.notes || null,
      streakDay: activity.streakDay || 0,
      completed: activity.completed || true
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
    activities.sort((a, b) => {
      const dateA = new Date(a.date || new Date());
      const dateB = new Date(b.date || new Date());
      return dateB.getTime() - dateA.getTime();
    });
    
    // Check if the most recent activity is from today or yesterday
    const mostRecentDate = new Date(activities[0].date || new Date());
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const isToday = mostRecentDate.getTime() === today.getTime();
    const isYesterday = mostRecentDate.getTime() === yesterday.getTime();
    
    if (!isToday && !isYesterday) {
      // Streak is broken if most recent activity is older than yesterday
      currentStreak = 0;
    } else {
      // Count consecutive days with activities
      for (let i = 0; i < activities.length; i++) {
        const activityDate = new Date(activities[i].date || new Date());
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

// Check if MongoDB URI is available and use MongoDB storage
// Otherwise, throw an error as we only want to use MongoDB
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required for MongoDB connection");
}

console.log("MongoDB URI: Found");
export const storage = new MongoStorage(process.env.MONGODB_URI);
