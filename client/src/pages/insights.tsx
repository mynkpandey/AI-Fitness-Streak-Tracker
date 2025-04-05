import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { BarChart, TrendingUp, Award, Calendar, Lightbulb } from "lucide-react";

export default function Insights() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: user } = useQuery({
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
      const date = new Date(activity.date);
      const day = date.getDay();
      dayCount[day]++;
    });
    
    const maxCount = Math.max(...dayCount);
    const maxDay = dayCount.indexOf(maxCount);
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return maxCount > 0 ? days[maxDay] : "N/A";
  };

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Insights</h1>
      
      <div className="mb-6">
        <AISuggestionCard />
      </div>
      
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
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>How your activities have changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : activities && activities.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Activity trends will appear here as you add more workouts.</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">No activities recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`border-l-4 ${user?.currentStreak && user.currentStreak >= 3 ? 'border-l-green-500' : 'border-l-gray-300'}`}>
              <CardHeader>
                <CardTitle className="text-base">3-Day Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Complete activities for 3 consecutive days</p>
                {user?.currentStreak && user.currentStreak >= 3 ? (
                  <div className="mt-2 text-green-600 font-medium">Achieved!</div>
                ) : (
                  <div className="mt-2 text-gray-500">
                    {user?.currentStreak ? `Progress: ${user.currentStreak}/3 days` : 'Not started'}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className={`border-l-4 ${user?.currentStreak && user.currentStreak >= 7 ? 'border-l-green-500' : 'border-l-gray-300'}`}>
              <CardHeader>
                <CardTitle className="text-base">Weekly Warrior</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Complete activities for 7 consecutive days</p>
                {user?.currentStreak && user.currentStreak >= 7 ? (
                  <div className="mt-2 text-green-600 font-medium">Achieved!</div>
                ) : (
                  <div className="mt-2 text-gray-500">
                    {user?.currentStreak ? `Progress: ${user.currentStreak}/7 days` : 'Not started'}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className={`border-l-4 ${user?.totalWorkouts && user.totalWorkouts >= 10 ? 'border-l-green-500' : 'border-l-gray-300'}`}>
              <CardHeader>
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Complete 10 total workouts</p>
                {user?.totalWorkouts && user.totalWorkouts >= 10 ? (
                  <div className="mt-2 text-green-600 font-medium">Achieved!</div>
                ) : (
                  <div className="mt-2 text-gray-500">
                    {user?.totalWorkouts ? `Progress: ${user.totalWorkouts}/10 workouts` : 'Not started'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
