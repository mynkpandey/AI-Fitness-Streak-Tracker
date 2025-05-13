export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'workout' | 'duration' | 'type' | 'time' | 'milestone' | 'challenge' | 'social' | 'nutrition' | 'special';
  requirement: {
    type: 'streak' | 'total' | 'duration' | 'specific' | 'combination';
    value: number;
    unit?: 'days' | 'workouts' | 'minutes' | 'hours' | 'calories' | 'friends' | 'locations' | 'steps';
    specificType?: string;
  };
  points: number;
  icon: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
};

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Complete activities for 3 consecutive days',
    category: 'streak',
    requirement: { type: 'streak', value: 3, unit: 'days' },
    points: 100,
    icon: '🔥',
    tier: 'bronze'
  },
  {
    id: 'streak-7',
    title: 'Weekly Warrior',
    description: 'Complete activities for 7 consecutive days',
    category: 'streak',
    requirement: { type: 'streak', value: 7, unit: 'days' },
    points: 250,
    icon: '⚔️',
    tier: 'silver'
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Complete activities for 30 consecutive days',
    category: 'streak',
    requirement: { type: 'streak', value: 30, unit: 'days' },
    points: 1000,
    icon: '👑',
    tier: 'gold'
  },
  {
    id: 'streak-90',
    title: 'Quarter Champion',
    description: 'Complete activities for 90 consecutive days',
    category: 'streak',
    requirement: { type: 'streak', value: 90, unit: 'days' },
    points: 2500,
    icon: '🏆',
    tier: 'platinum'
  },
  {
    id: 'streak-365',
    title: 'Year of Fitness',
    description: 'Complete activities for 365 consecutive days',
    category: 'streak',
    requirement: { type: 'streak', value: 365, unit: 'days' },
    points: 10000,
    icon: '🌟',
    tier: 'diamond'
  },

  // Workout Count Achievements
  {
    id: 'workouts-10',
    title: 'Getting Started',
    description: 'Complete 10 total workouts',
    category: 'workout',
    requirement: { type: 'total', value: 10, unit: 'workouts' },
    points: 100,
    icon: '🎯',
    tier: 'bronze'
  },
  {
    id: 'workouts-50',
    title: 'Fitness Enthusiast',
    description: 'Complete 50 total workouts',
    category: 'workout',
    requirement: { type: 'total', value: 50, unit: 'workouts' },
    points: 500,
    icon: '💪',
    tier: 'silver'
  },
  {
    id: 'workouts-100',
    title: 'Century Club',
    description: 'Complete 100 total workouts',
    category: 'workout',
    requirement: { type: 'total', value: 100, unit: 'workouts' },
    points: 1000,
    icon: '💯',
    tier: 'gold'
  },
  {
    id: 'workouts-500',
    title: 'Fitness Legend',
    description: 'Complete 500 total workouts',
    category: 'workout',
    requirement: { type: 'total', value: 500, unit: 'workouts' },
    points: 5000,
    icon: '🏅',
    tier: 'platinum'
  },
  {
    id: 'workouts-1000',
    title: 'Millennium Club',
    description: 'Complete 1000 total workouts',
    category: 'workout',
    requirement: { type: 'total', value: 1000, unit: 'workouts' },
    points: 10000,
    icon: '👑',
    tier: 'diamond'
  },

  // Duration Achievements
  {
    id: 'duration-60',
    title: 'Hour Power',
    description: 'Complete a 60-minute workout',
    category: 'duration',
    requirement: { type: 'duration', value: 60, unit: 'minutes' },
    points: 200,
    icon: '⏱️',
    tier: 'bronze'
  },
  {
    id: 'duration-120',
    title: 'Two-Hour Challenge',
    description: 'Complete a 120-minute workout',
    category: 'duration',
    requirement: { type: 'duration', value: 120, unit: 'minutes' },
    points: 500,
    icon: '⏰',
    tier: 'silver'
  },
  {
    id: 'duration-1000',
    title: 'Thousand Minutes',
    description: 'Complete 1000 total minutes of workouts',
    category: 'duration',
    requirement: { type: 'total', value: 1000, unit: 'minutes' },
    points: 1000,
    icon: '⌛',
    tier: 'gold'
  },
  {
    id: 'duration-10000',
    title: 'Ten Thousand Minutes',
    description: 'Complete 10000 total minutes of workouts',
    category: 'duration',
    requirement: { type: 'total', value: 10000, unit: 'minutes' },
    points: 5000,
    icon: '⏳',
    tier: 'platinum'
  },
  {
    id: 'duration-50000',
    title: 'Fifty Thousand Minutes',
    description: 'Complete 50000 total minutes of workouts',
    category: 'duration',
    requirement: { type: 'total', value: 50000, unit: 'minutes' },
    points: 10000,
    icon: '⌚',
    tier: 'diamond'
  },

  // Workout Type Achievements
  {
    id: 'type-cardio-10',
    title: 'Cardio Enthusiast',
    description: 'Complete 10 cardio workouts',
    category: 'type',
    requirement: { type: 'specific', value: 10, specificType: 'cardio' },
    points: 200,
    icon: '🏃',
    tier: 'bronze'
  },
  {
    id: 'type-strength-10',
    title: 'Strength Builder',
    description: 'Complete 10 strength training workouts',
    category: 'type',
    requirement: { type: 'specific', value: 10, specificType: 'strength' },
    points: 200,
    icon: '💪',
    tier: 'bronze'
  },
  {
    id: 'type-yoga-10',
    title: 'Yoga Master',
    description: 'Complete 10 yoga sessions',
    category: 'type',
    requirement: { type: 'specific', value: 10, specificType: 'yoga' },
    points: 200,
    icon: '🧘',
    tier: 'bronze'
  },
  {
    id: 'type-hiit-10',
    title: 'HIIT Warrior',
    description: 'Complete 10 HIIT workouts',
    category: 'type',
    requirement: { type: 'specific', value: 10, specificType: 'hiit' },
    points: 200,
    icon: '⚡',
    tier: 'bronze'
  },
  {
    id: 'type-swim-10',
    title: 'Aquatic Athlete',
    description: 'Complete 10 swimming sessions',
    category: 'type',
    requirement: { type: 'specific', value: 10, specificType: 'swimming' },
    points: 200,
    icon: '🏊',
    tier: 'bronze'
  },

  // Time of Day Achievements
  {
    id: 'time-morning-10',
    title: 'Early Bird',
    description: 'Complete 10 morning workouts (5-9 AM)',
    category: 'time',
    requirement: { type: 'specific', value: 10, specificType: 'morning' },
    points: 200,
    icon: '🌅',
    tier: 'bronze'
  },
  {
    id: 'time-night-10',
    title: 'Night Owl',
    description: 'Complete 10 evening workouts (8-11 PM)',
    category: 'time',
    requirement: { type: 'specific', value: 10, specificType: 'night' },
    points: 200,
    icon: '🌙',
    tier: 'bronze'
  },
  {
    id: 'time-lunch-10',
    title: 'Lunch Break Warrior',
    description: 'Complete 10 lunchtime workouts (12-2 PM)',
    category: 'time',
    requirement: { type: 'specific', value: 10, specificType: 'lunch' },
    points: 200,
    icon: '🍱',
    tier: 'bronze'
  },

  // Milestone Achievements
  {
    id: 'milestone-first',
    title: 'First Step',
    description: 'Complete your first workout',
    category: 'milestone',
    requirement: { type: 'total', value: 1, unit: 'workouts' },
    points: 50,
    icon: '👣',
    tier: 'bronze'
  },
  {
    id: 'milestone-week',
    title: 'Perfect Week',
    description: 'Complete workouts all 7 days in a week',
    category: 'milestone',
    requirement: { type: 'streak', value: 7, unit: 'days' },
    points: 500,
    icon: '📅',
    tier: 'silver'
  },
  {
    id: 'milestone-month',
    title: 'Perfect Month',
    description: 'Complete workouts all 30 days in a month',
    category: 'milestone',
    requirement: { type: 'streak', value: 30, unit: 'days' },
    points: 2000,
    icon: '📆',
    tier: 'gold'
  },

  // Challenge Achievements
  {
    id: 'challenge-30min',
    title: '30-Minute Challenge',
    description: 'Complete 30 minutes of exercise every day for a week',
    category: 'challenge',
    requirement: { type: 'combination', value: 7, unit: 'days' },
    points: 500,
    icon: '🎯',
    tier: 'silver'
  },
  {
    id: 'challenge-10000',
    title: '10,000 Steps Challenge',
    description: 'Complete 10,000 steps for 7 consecutive days',
    category: 'challenge',
    requirement: { type: 'combination', value: 7, unit: 'days' },
    points: 500,
    icon: '👟',
    tier: 'silver'
  },
  {
    id: 'challenge-5k',
    title: '5K Runner',
    description: 'Complete a 5K run',
    category: 'challenge',
    requirement: { type: 'specific', value: 1, specificType: '5k' },
    points: 300,
    icon: '🏃',
    tier: 'bronze'
  },
  {
    id: 'challenge-10k',
    title: '10K Runner',
    description: 'Complete a 10K run',
    category: 'challenge',
    requirement: { type: 'specific', value: 1, specificType: '10k' },
    points: 500,
    icon: '🏃‍♂️',
    tier: 'silver'
  },
  {
    id: 'challenge-half-marathon',
    title: 'Half Marathon',
    description: 'Complete a half marathon',
    category: 'challenge',
    requirement: { type: 'specific', value: 1, specificType: 'half-marathon' },
    points: 1000,
    icon: '🏃‍♀️',
    tier: 'gold'
  },

  // Social Achievements
  {
    id: 'social-first-friend',
    title: 'Social Butterfly',
    description: 'Add your first friend',
    category: 'social',
    requirement: { type: 'total', value: 1, unit: 'friends' },
    points: 100,
    icon: '👥',
    tier: 'bronze'
  },
  {
    id: 'social-5-friends',
    title: 'Fitness Squad',
    description: 'Add 5 friends',
    category: 'social',
    requirement: { type: 'total', value: 5, unit: 'friends' },
    points: 300,
    icon: '👥👥',
    tier: 'silver'
  },
  {
    id: 'social-10-friends',
    title: 'Social Networker',
    description: 'Add 10 friends',
    category: 'social',
    requirement: { type: 'total', value: 10, unit: 'friends' },
    points: 500,
    icon: '👥👥👥',
    tier: 'gold'
  },

  // Nutrition Achievements
  {
    id: 'nutrition-log-7',
    title: 'Nutrition Tracker',
    description: 'Log meals for 7 consecutive days',
    category: 'nutrition',
    requirement: { type: 'streak', value: 7, unit: 'days' },
    points: 300,
    icon: '🥗',
    tier: 'bronze'
  },
  {
    id: 'nutrition-log-30',
    title: 'Nutrition Expert',
    description: 'Log meals for 30 consecutive days',
    category: 'nutrition',
    requirement: { type: 'streak', value: 30, unit: 'days' },
    points: 1000,
    icon: '🍎',
    tier: 'silver'
  },
  {
    id: 'nutrition-goal-7',
    title: 'Goal Achiever',
    description: 'Meet your nutrition goals for 7 consecutive days',
    category: 'nutrition',
    requirement: { type: 'streak', value: 7, unit: 'days' },
    points: 500,
    icon: '🎯',
    tier: 'silver'
  },

  // Special Achievements
  {
    id: 'special-birthday',
    title: 'Birthday Workout',
    description: 'Complete a workout on your birthday',
    category: 'special',
    requirement: { type: 'specific', value: 1, specificType: 'birthday' },
    points: 500,
    icon: '🎂',
    tier: 'gold'
  },
  {
    id: 'special-holiday',
    title: 'Holiday Hero',
    description: 'Complete a workout on a major holiday',
    category: 'special',
    requirement: { type: 'specific', value: 1, specificType: 'holiday' },
    points: 500,
    icon: '🎄',
    tier: 'gold'
  },
  {
    id: 'special-travel',
    title: 'Globe Trotter',
    description: 'Complete workouts in 5 different locations',
    category: 'special',
    requirement: { type: 'total', value: 5, unit: 'locations' },
    points: 1000,
    icon: '🌍',
    tier: 'platinum'
  }
]; 