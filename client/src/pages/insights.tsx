import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { BarChart as BarChartIcon, TrendingUp, Award, Calendar, Lightbulb, Send, MessageCircle, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { getHealthAdvice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Activity, User } from "@shared/schema";
import { ACHIEVEMENTS } from '@shared/achievements';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line
} from "recharts";
import { AchievementsGrid } from '@/components/achievements/achievements-grid';

// Message type for chat
type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Health Advice Chatbot Component
function HealthChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your fitness and health AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Health advice mutation
  const adviceMutation = useMutation({
    mutationFn: getHealthAdvice,
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get advice",
        variant: "destructive"
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I couldn't generate advice at the moment. Please try again later.",
          timestamp: new Date()
        }
      ]);
    }
  });

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Request advice from AI
    adviceMutation.mutate(userMessage.content);
    
    // Clear input
    setInputValue('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-primary" />
          Health Advice Chatbot
        </CardTitle>
        <CardDescription>Ask me anything about fitness, health, or nutrition</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={chatContainerRef}
          className="h-72 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-md"
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block max-w-[85%] px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p>{message.content}</p>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {adviceMutation.isPending && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Thinking...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Input
            placeholder="Ask a health or fitness question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={adviceMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={adviceMutation.isPending || !inputValue.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default function Insights() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Helper function to calculate average duration
  const getAverageDuration = () => {
    if (!activities || activities.length === 0) return 0;
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    return Math.round(totalDuration / activities.length);
  };

  // Helper function to find most consistent day
  const getMostConsistentDay = () => {
    if (!activities || activities.length === 0) return "N/A";
    
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    activities.forEach(activity => {
      const date = new Date(activity.date || new Date());
      const day = date.getDay();
      dayCount[day]++;
    });
    
    const maxCount = Math.max(...dayCount);
    const maxDay = dayCount.indexOf(maxCount);
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return maxCount > 0 ? days[maxDay] : "N/A";
  };
  
  // Prepare activity data for charts
  const getActivityChartData = () => {
    if (!activities || activities.length === 0) return [];
    
    // Create a map of the last 7 days
    const last7Days: {[key: string]: any} = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days[dateStr] = { day: dateStr, count: 0, duration: 0 };
    }
    
    // Populate with activity data
    activities.forEach(activity => {
      const activityDate = new Date(activity.date || new Date());
      // Only include activities from the last 7 days
      const diffTime = Math.abs(today.getTime() - activityDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        const dateStr = activityDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (last7Days[dateStr]) {
          last7Days[dateStr].count += 1;
          last7Days[dateStr].duration += activity.duration;
        }
      }
    });
    
    // Convert to array for chart
    return Object.values(last7Days);
  };

  // Helper function to calculate total points from achievements
  const getTotalPoints = () => {
    if (!activities || activities.length === 0) return 0;
    
    let totalPoints = 0;
    const completedAchievements = new Set();
    
    // Calculate streak achievements
    const currentStreak = user?.currentStreak || 0;
    if (currentStreak >= 3) {
      totalPoints += 100; // 3-Day Streak
      completedAchievements.add('streak-3');
    }
    if (currentStreak >= 7) {
      totalPoints += 250; // Weekly Warrior
      completedAchievements.add('streak-7');
    }
    if (currentStreak >= 30) {
      totalPoints += 1000; // Monthly Master
      completedAchievements.add('streak-30');
    }
    
    // Calculate total workout achievements
    const totalWorkouts = user?.totalWorkouts || 0;
    if (totalWorkouts >= 10) {
      totalPoints += 100; // Getting Started
      completedAchievements.add('workouts-10');
    }
    if (totalWorkouts >= 50) {
      totalPoints += 500; // Fitness Enthusiast
      completedAchievements.add('workouts-50');
    }
    
    // Calculate duration achievements
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    if (totalDuration >= 1000) {
      totalPoints += 1000; // Thousand Minutes
      completedAchievements.add('duration-1000');
    }
    
    // Calculate workout type achievements
    const workoutTypes: Record<string, number> = {};
    activities.forEach(activity => {
      workoutTypes[activity.type] = (workoutTypes[activity.type] || 0) + 1;
    });
    
    Object.entries(workoutTypes).forEach(([type, count]) => {
      if (count >= 10) {
        totalPoints += 200; // Type-specific achievements
        completedAchievements.add(`type-${type.toLowerCase()}-10`);
      }
    });
    
    // Calculate time of day achievements
    const timeOfDayCounts: Record<string, number> = {
      morning: 0,
      night: 0,
      lunch: 0
    };
    
    activities.forEach(activity => {
      const hour = new Date(activity.date).getHours();
      if (hour >= 5 && hour < 9) timeOfDayCounts.morning++;
      if (hour >= 20 && hour < 23) timeOfDayCounts.night++;
      if (hour >= 12 && hour < 14) timeOfDayCounts.lunch++;
    });
    
    Object.entries(timeOfDayCounts).forEach(([time, count]) => {
      if (count >= 10) {
        totalPoints += 200;
        completedAchievements.add(`time-${time}-10`);
      }
    });
    
    // Calculate milestone achievements
    if (totalWorkouts >= 1) {
      totalPoints += 50; // First Step
      completedAchievements.add('milestone-first');
    }
    
    // Calculate challenge achievements
    const has60MinWorkout = activities.some(a => a.duration >= 60);
    if (has60MinWorkout) {
      totalPoints += 200; // Hour Power
      completedAchievements.add('duration-60');
    }
    
    return totalPoints;
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Insights</h1>
      
      <div className="mb-6">
        <AISuggestionCard />
      </div>
      
      <HealthChatbot />
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievement Points
                </CardTitle>
                <CardDescription>Your total achievement score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${getTotalPoints()} points`
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Average Workout
                </CardTitle>
                <CardDescription>Your typical workout duration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${getAverageDuration()} minutes`
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Most Consistent Day
                </CardTitle>
                <CardDescription>The day you work out most often</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    getMostConsistentDay()
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-600" />
                  Current Streak
                </CardTitle>
                <CardDescription>Your current consecutive days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `${user?.currentStreak || 0} days`
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Insights
                </CardTitle>
                <CardDescription>Patterns in your fitness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    activities && activities.length > 0 ? (
                      user?.currentStreak && user.currentStreak > 3 ? (
                        <p>You're building a great streak! Consistency is key to long-term fitness success.</p>
                      ) : (
                        <p>Try to schedule your workouts at the same time each day to build consistency.</p>
                      )
                    ) : (
                      <p>Start tracking your workouts to get personalized insights!</p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Weekly Activity Count
                </CardTitle>
                <CardDescription>Number of workouts per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : activities && activities.length > 0 ? (
                  <ChartContainer config={{ workout: { color: "hsl(var(--primary))" } }} className="h-64">
                    <BarChart data={getActivityChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent 
                            labelKey="day"
                            label="Workouts"
                          />
                        } 
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        name="workout"
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No activities recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Weekly Duration Trend
                </CardTitle>
                <CardDescription>Minutes spent on workouts per day</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : activities && activities.length > 0 ? (
                  <ChartContainer config={{ duration: { color: "#22c55e" } }} className="h-64">
                    <LineChart data={getActivityChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent 
                            labelKey="day"
                            label="Duration"
                          />
                        } 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="duration"
                        dot={{ fill: "#22c55e", r: 4 }}
                        activeDot={{ r: 6, fill: "#22c55e" }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No activities recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          <AchievementsGrid />
        </TabsContent>
      </Tabs>
    </main>
  );
}
