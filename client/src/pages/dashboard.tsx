import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakCard } from "@/components/dashboard/streak-card";
import { WeeklyProgressCard } from "@/components/dashboard/weekly-progress-card";
import { AISuggestionCard } from "@/components/dashboard/ai-suggestion-card";
import { ActivityCard } from "@/components/activity/activity-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: activities, isLoading: isActivitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      {/* Dashboard Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <StreakCard />
          
          {/* Weekly Progress */}
          <WeeklyProgressCard />
          
          {/* AI Suggestions */}
          <AISuggestionCard />
        </div>
      </section>
      
      {/* Recent Activities */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
          <Link href="/stats">
            <Button variant="link" className="text-primary hover:text-blue-700 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {isActivitiesLoading ? (
            // Display loading skeletons
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-6 w-24 mt-2" />
                  </div>
                </div>
              </div>
            ))
          ) : activities && activities.length > 0 ? (
            // Display actual activities
            activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            // No activities state
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600">No activities recorded yet. Start your fitness journey today!</p>
              <Button 
                variant="default" 
                className="mt-4 bg-primary hover:bg-blue-600 text-white"
                onClick={() => {
                  // Import these at the top of the file
                  const bottomNav = document.querySelector('.add-activity-button');
                  if (bottomNav) {
                    (bottomNav as HTMLButtonElement).click();
                  }
                }}
              >
                Add Your First Activity
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
