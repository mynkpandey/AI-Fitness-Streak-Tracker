import { apiRequest } from "@/lib/queryClient";

// Helper function to use a suggestion
export async function useSuggestion(suggestionId: number) {
  try {
    const response = await apiRequest("POST", `/api/suggestions/${suggestionId}/use`);
    return response.json();
  } catch (error) {
    console.error("Error using suggestion:", error);
    throw error;
  }
}

// Helper function to get a new suggestion
export async function getNewSuggestion() {
  try {
    const response = await apiRequest("POST", "/api/suggestions/refresh");
    return response.json();
  } catch (error) {
    console.error("Error getting new suggestion:", error);
    throw error;
  }
}
