import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityCard } from "@/components/activity/activity-card";
import { BarChart, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { Activity } from "@shared/schema";

export default function Stats() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Group activities by type
  const getActivityCounts = (activities: Activity[] | undefined) => {
    if (!activities) return [];
    
    const counts: Record<string, number> = {};
    activities.forEach(activity => {
      const type = activity.type;
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  };

  const activityCounts = getActivityCounts(activities);

  // Calculate total duration
  const getTotalDuration = (activities: Activity[] | undefined) => {
    if (!activities) return 0;
    return activities.reduce((total, activity) => total + activity.duration, 0);
  };

  const totalDuration = getTotalDuration(activities);
  const totalHours = Math.floor(totalDuration / 60);
  const remainingMinutes = totalDuration % 60;

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Activities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : user?.totalWorkouts || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  `${totalHours}h ${remainingMinutes}m`
                )}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Best Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : `${user?.bestStreak || 0} days`}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Favorite Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Favorite Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Dumbbell className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold capitalize">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  activityCounts.length > 0 ? activityCounts[0].type : 'None'
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="yoga">Yoga</TabsTrigger>
          <TabsTrigger value="weightTraining">Weight Training</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))
            ) : activities && activities.length > 0 ? (
              // Display all activities
              activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">No activities recorded yet.</p>
            )}
          </div>
        </TabsContent>
        
        {/* Filtered tabs */}
        {['running', 'yoga', 'weightTraining'].map(type => (
          <TabsContent key={type} value={type} className="mt-4">
            <div className="space-y-4">
              {!isLoading && activities ? (
                activities
                  .filter(activity => activity.type.toLowerCase() === type.toLowerCase())
                  .map(activity => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
              
              {!isLoading && activities && 
               activities.filter(activity => activity.type.toLowerCase() === type.toLowerCase()).length === 0 && (
                <p className="text-center py-8 text-gray-500">No {type} activities recorded yet.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
