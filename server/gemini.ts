import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model with safety settings
const modelConfig = {
  model: "gemini-1.0-pro",
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

// TEMPORARY: Development mode flag
const DEV_MODE = true;

// Function to generate fitness suggestions based on user data
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
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
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
    console.error('Error generating fitness suggestion:', error);
    throw new Error('Failed to generate fitness suggestion');
  }
}
