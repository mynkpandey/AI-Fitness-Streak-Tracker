import { apiRequest } from "@/lib/queryClient";
import { Activity, InsertActivity } from "@shared/schema";

// Activity API functions
export async function fetchActivities(): Promise<Activity[]> {
  const response = await apiRequest("GET", "/api/activities");
  return response.json();
}

export async function fetchWeeklyActivities() {
  const response = await apiRequest("GET", "/api/activities/weekly");
  return response.json();
}

export async function createActivity(activity: Omit<InsertActivity, "userId">): Promise<Activity> {
  const response = await apiRequest("POST", "/api/activities", activity);
  return response.json();
}

// User API functions
export async function fetchUserData() {
  const response = await apiRequest("GET", "/api/user");
  return response.json();
}

// Suggestion API functions
export async function fetchSuggestion() {
  const response = await apiRequest("GET", "/api/suggestions");
  return response.json();
}

export async function refreshSuggestion() {
  const response = await apiRequest("POST", "/api/suggestions/refresh");
  return response.json();
}

export async function markSuggestionAsUsed(id: number) {
  const response = await apiRequest("POST", `/api/suggestions/${id}/use`);
  return response.json();
}

// Health advice chatbot API function
export async function getHealthAdvice(question: string) {
  const response = await apiRequest("POST", "/api/health/advice", { question });
  return response.json();
}
