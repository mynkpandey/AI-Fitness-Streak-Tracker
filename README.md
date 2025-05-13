# AI Fitness Streak 🏋️‍♂️

A modern fitness tracking application powered by AI to help you maintain your workout streak and achieve your fitness goals.

## Features ✨

- **AI-Powered Workout Suggestions**: Get personalized workout recommendations using Google's Gemini AI
- **Streak Tracking**: Track your workout streaks and maintain consistency
- **Activity Logging**: Log your workouts and track your progress
- **User Authentication**: Secure login and registration system
- **Real-time Updates**: Hot Module Replacement for seamless development
- **Modern UI**: Built with React, TailwindCSS, and Shadcn UI components

## Tech Stack 🛠️

- **Frontend**: 
  - React
  - TypeScript
  - TailwindCSS
  - Shadcn UI
  - Wouter (Routing)
  - React Query (Data Fetching)

- **Backend**:
  - Node.js
  - Express
  - MongoDB
  - Express Session with MongoDB Store
  - TypeScript

- **AI Integration**:
  - Google Gemini API

## Prerequisites 📋

- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-fitness-streak.git
cd ai-fitness-streak
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Session Configuration
SESSION_SECRET=your_strong_secret_here
```

## Development 🛠️

1. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## Available Scripts 📜

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run check`: Run TypeScript type checking

## Project Structure 📁

```
ai-fitness-streak/
├── client/           # Frontend React application
│   ├── src/         # Source files
│   └── index.html   # Entry HTML file
├── server/          # Backend Express server
│   ├── auth.ts      # Authentication logic
│   ├── gemini.ts    # AI integration
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API routes
│   ├── storage.ts   # Database operations
│   └── vite.ts      # Vite development server
├── shared/          # Shared types and utilities
└── attached_assets/ # Static assets
```

## API Endpoints 🌐

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User
- `GET /api/user` - Get current user data
- `PUT /api/user` - Update user data

### Activities
- `GET /api/activities` - Get user activities
- `POST /api/activities` - Create new activity
- `GET /api/activities/range` - Get activities by date range

### Suggestions
- `GET /api/suggestions` - Get workout suggestions
- `POST /api/suggestions` - Create new suggestion
- `PUT /api/suggestions/:id/use` - Mark suggestion as used

## Database Schema 📊

### Users
- `id`: Number (auto-increment)
- `username`: String (unique)
- `email`: String (optional)
- `currentStreak`: Number
- `bestStreak`: Number
- `totalWorkouts`: Number
- `lastWorkoutDate`: Date
- `createdAt`: Date

### Activities
- `id`: Number (auto-increment)
- `userId`: Number
- `date`: Date
- `notes`: String (optional)
- `streakDay`: Number
- `completed`: Boolean

### Suggestions
- `id`: Number (auto-increment)
- `userId`: Number
- `date`: Date
- `used`: Boolean

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Google Gemini AI](https://ai.google.dev/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Shadcn UI](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
