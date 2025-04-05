import { Activity } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { Activity as ActivityIcon, Volleyball, Weight, Zap, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running':
      case 'cycling':
      case 'swimming':
        return <BarChart2 className="h-6 w-6" />;
      case 'yoga':
        return <Volleyball className="h-6 w-6" />;
      case 'weighttraining':
      case 'weight training':
        return <Weight className="h-6 w-6" />;
      case 'hiit':
        return <Zap className="h-6 w-6" />;
      default:
        return <ActivityIcon className="h-6 w-6" />;
    }
  };

  // Function to get the appropriate background color based on activity type
  const getActivityBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running':
      case 'cycling':
      case 'swimming':
        return 'bg-blue-100 text-primary';
      case 'yoga':
        return 'bg-purple-100 text-purple-600';
      case 'weighttraining':
      case 'weight training':
        return 'bg-orange-100 text-orange-600';
      case 'hiit':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  // Function to format the activity date
  const formatActivityDate = (date: Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    
    // If it's today
    if (activityDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show relative time (e.g., "2 days ago")
    return formatDistanceToNow(activityDate, { addSuffix: true });
  };

  // Capitalize the first letter of each word
  const formatTitle = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityBgColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium text-gray-800">{formatTitle(activity.type)}</h3>
            <span className="text-sm text-gray-500">{formatActivityDate(activity.date)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {activity.duration} minutes
            {activity.notes && ` - ${activity.notes}`}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
              Completed
            </Badge>
            {activity.streakDay && (
              <span className="ml-2 text-gray-500">Streak day {activity.streakDay}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
