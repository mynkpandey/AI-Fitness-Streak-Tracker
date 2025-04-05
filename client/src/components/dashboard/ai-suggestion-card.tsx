import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

export function AISuggestionCard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: suggestion, isLoading } = useQuery({
    queryKey: ["/api/suggestions"],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      setIsRefreshing(true);
      const response = await apiRequest("POST", "/api/suggestions/refresh");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      setIsRefreshing(false);
    },
    onError: () => {
      setIsRefreshing(false);
    }
  });

  const useSuggestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/suggestions/${id}/use`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Suggestion</h2>
          <div className="flex items-center text-primary">
            <Zap className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>
        <Skeleton className="h-24 w-full mb-4" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Today's Suggestion</h2>
        <div className="flex items-center text-primary">
          <Zap className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">AI Powered</span>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-gray-700">{suggestion?.suggestion || "Try a new workout today!"}</p>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="default" 
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
          onClick={() => {
            // First mark the suggestion as used
            if (suggestion && suggestion.id) {
              useSuggestionMutation.mutate(suggestion.id);
            }
            
            // Trigger the add activity modal by clicking the button from the navigation bar
            const addActivityButton = document.querySelector('.add-activity-button');
            if (addActivityButton) {
              (addActivityButton as HTMLButtonElement).click();
            }
          }}
          disabled={useSuggestionMutation.isPending}
        >
          Get Workout
        </Button>
        <Button 
          variant="outline"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {suggestion?.goals && suggestion.goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Goals</h3>
          <ul className="space-y-2 text-sm">
            {suggestion.goals.map((goal, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
