import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";

export function WeeklyProgressCard() {
  const { data: weekData, isLoading } = useQuery({
    queryKey: ["/api/activities/weekly"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week</h2>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const completedDays = weekData?.completedDays || 0;
  const targetDays = 5; // Target is 5 days per week
  const progressPercentage = Math.min(100, (completedDays / targetDays) * 100);
  
  // Day abbreviations
  const dayAbbr = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week</h2>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm text-gray-500">Progress</span>
        <span className="text-sm font-medium text-gray-700">{completedDays}/{targetDays} days</span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Daily Activity</h3>
        <div className="flex justify-between">
          {weekData?.activities.map((activity, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{dayAbbr[index]}</div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                activity ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {activity ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
