import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('⚠️ GEMINI_API_KEY is not set. AI features will not work properly!');
}
const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model with safety settings
const modelConfig = {
  model: "gemini-2.0-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
};

// Development mode flag - ensure it's false to use the real API
const DEV_MODE = false;

// Function to handle chat-based health advice
export async function generateHealthAdvice(userQuestion: string, userProfile?: { 
  activities?: Array<{type: string, duration: number, date: Date | null}>,
  currentStreak?: number,
  totalWorkouts?: number 
}) {
  if (DEV_MODE || !apiKey) {
    console.log('Using mock health advice for development mode');
    return {
      response: "It's recommended to drink at least 8 glasses of water daily to stay properly hydrated. This helps with energy levels, digestion, and overall health. Try carrying a water bottle with you throughout the day as a reminder."
    };
  }

  const model = genAI.getGenerativeModel(modelConfig);
  
  // Create a context-aware prompt with user profile if available
  let contextPrompt = '';
  if (userProfile) {
    contextPrompt = `
    User Profile:
    ${userProfile.activities && userProfile.activities.length > 0 ? 
      `Recent Activities: ${userProfile.activities.slice(0, 3).map(a => {
        const dateStr = a.date ? new Date(a.date).toLocaleDateString() : 'recently';
        return `${a.type} (${a.duration} minutes) on ${dateStr}`;
      }).join(', ')}` : 'No recent activities recorded.'
    }
    Current Streak: ${userProfile.currentStreak || 0} days
    Total Workouts: ${userProfile.totalWorkouts || 0}
    `;
  }
  
  const prompt = `
  You are a helpful, friendly fitness and health assistant. A user is asking for health advice.
  
  ${contextPrompt}
  
  User question: "${userQuestion}"
  
  Please provide a helpful, accurate, and concise response. Focus on evidence-based information.
  Keep your response under 150 words and make it conversational but informative.
  DO NOT include any headers, disclaimers, or notes about being an AI.
  `;
  
  try {
    console.log('Attempting to generate health advice with Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Successfully generated health advice from Gemini API');
    
    return {
      response: text.trim()
    };
  } catch (error) {
    console.error('Error generating health advice with Gemini API:', error);
    console.error('This could be due to an invalid API key or network connectivity issues');
    // Return a more helpful error message that doesn't use mock data
    return {
      response: "I couldn't process your request due to a technical issue. Please try again later or contact support if the problem persists."
    };
  }
}

export async function generateFitnessSuggestion(
  recentActivities: Array<{type: string, duration: number, date: Date | null}>,
  currentStreak: number,
  totalWorkouts: number
) {
  // In dev mode, return mock suggestions
  if (DEV_MODE || !apiKey) {
    console.log('Using mock suggestions for development mode');
    return {
      suggestion: "Try a 30-minute HIIT workout today to boost your metabolism and build endurance.",
      goals: [
        "Complete 3 HIIT workouts this week",
        "Increase workout duration by 5 minutes each session"
      ]
    };
  }

  const model = genAI.getGenerativeModel(modelConfig);
  
  // Create a prompt with user fitness data
  const prompt = `
  Based on the following user fitness data, provide a personalized workout suggestion for today.
  Include a brief explanation of why this workout is beneficial and list 2 specific fitness goals
  that would be appropriate for this user.

  Recent Activities:
  ${recentActivities.map(a => {
    const dateStr = a.date ? new Date(a.date).toLocaleDateString() : 'today';
    return `- ${a.type} (${a.duration} minutes) on ${dateStr}`;
  }).join('\n')}

  Current Streak: ${currentStreak} days
  Total Workouts: ${totalWorkouts}

  Format your response with:
  1. A concise workout suggestion (1-2 sentences)
  2. A brief explanation (1-2 sentences)
  3. Two specific, achievable fitness goals

  Keep your response under 150 words total. DO NOT include any headers, introductions, or conclusions.
  `;

  try {
    console.log('Attempting to generate fitness suggestion with Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Successfully generated fitness suggestion from Gemini API');
    
    // Parse the response to extract suggestions and goals
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let suggestion = '';
    let goals: string[] = [];
    
    if (lines.length >= 3) {
      suggestion = lines[0];
      
      // Extract goals (usually the last two lines)
      for (let i = Math.max(1, lines.length - 2); i < lines.length; i++) {
        // Remove leading numbers or bullet points
        let goal = lines[i].replace(/^\d+\.\s*|^-\s*/, '').trim();
        goals.push(goal);
      }
    } else {
      // Fallback if format isn't as expected
      suggestion = lines.join(' ');
    }
    
    return {
      suggestion,
      goals
    };
  } catch (error) {
    console.error('Error generating fitness suggestion with Gemini API:', error);
    console.error('This could be due to an invalid API key or network connectivity issues');
    
    // Return a user-friendly error message
    return {
      suggestion: "Unable to generate a personalized suggestion at this time. Please try again later.",
      goals: ["Check your network connection", "Try refreshing the page"]
    };
  }
}
