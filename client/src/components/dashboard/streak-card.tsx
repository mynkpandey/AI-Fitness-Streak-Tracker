import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function StreakCard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Streak</h2>
        <div className="flex items-center">
          <Skeleton className="h-[100px] w-[100px] rounded-full" />
          <div className="ml-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = user?.currentStreak || 0;
  const bestStreak = user?.bestStreak || 0;
  const totalWorkouts = user?.totalWorkouts || 0;
  
  // Calculate progress percentage for streak ring
  const progressPercentage = Math.min(100, (currentStreak / (bestStreak > 0 ? bestStreak : 10)) * 100);
  const dashOffset = 283 - (283 * progressPercentage) / 100;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Streak</h2>
      <div className="flex items-center">
        <div className="streak-ring relative w-[100px] h-[100px]">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle className="fill-transparent stroke-[#e5e7eb] stroke-[8]" cx="50" cy="50" r="45" style={{ 
              strokeLinecap: "round",
              transform: "rotate(-90deg)",
              transformOrigin: "center"
            }}></circle>
            <circle className="fill-transparent stroke-primary stroke-[8]" cx="50" cy="50" r="45" style={{ 
              strokeLinecap: "round",
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              strokeDasharray: 283,
              strokeDashoffset: dashOffset
            }}></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-800">{currentStreak}</span>
            <span className="text-sm text-gray-500">days</span>
          </div>
        </div>
        <div className="ml-6">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Best Streak</span>
            <p className="font-semibold text-gray-800">{bestStreak} days</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">This Month</span>
            <p className="font-semibold text-gray-800">{totalWorkouts} workouts</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          {currentStreak > 0 ? (
            <span>
              <span className="text-secondary font-medium">Great job!</span> 
              {currentStreak >= bestStreak * 0.7 && bestStreak > 0
                ? " You're on track to beat your best streak."
                : " Keep going to build your streak."}
            </span>
          ) : (
            <span>Start your streak today by adding an activity!</span>
          )}
        </p>
      </div>
    </div>
  );
}
