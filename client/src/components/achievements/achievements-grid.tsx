import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ACHIEVEMENTS, Achievement } from '@shared/achievements';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from '@shared/schema';

export function AchievementsGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const categories = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)));
  const tiers = Array.from(new Set(ACHIEVEMENTS.map(a => a.tier).filter((tier): tier is NonNullable<typeof tier> => tier !== undefined)));

  // Function to check if an achievement is completed
  const isAchievementCompleted = (achievement: Achievement) => {
    if (!activities) return false;

    switch (achievement.requirement.type) {
      case 'streak':
        const currentStreak = activities[0]?.streakDay || 0;
        return currentStreak >= achievement.requirement.value;
      case 'total':
        return activities.length >= achievement.requirement.value;
      case 'duration':
        return activities.some(a => a.duration >= achievement.requirement.value);
      case 'specific':
        const typeCount = activities.filter(a => a.type.toLowerCase() === achievement.requirement.specificType?.toLowerCase()).length;
        return typeCount >= achievement.requirement.value;
      default:
        return false;
    }
  };

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || achievement.tier === selectedTier;
    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map(tier => (
                <SelectItem key={tier} value={tier}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const isCompleted = isAchievementCompleted(achievement);
          return (
            <Card 
              key={achievement.id} 
              className={`relative overflow-hidden ${isCompleted ? 'border-green-500' : ''}`}
            >
              {isCompleted && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <div className={`absolute top-0 right-0 p-2 text-2xl ${getTierColor(achievement.tier)}`}>
                {achievement.icon}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <div className="flex flex-wrap gap-2">
                  {achievement.tier && (
                    <Badge variant="outline" className={getTierBadgeColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {achievement.points} points
                  </Badge>
                  <Badge variant="outline">
                    {achievement.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function getTierColor(tier?: string): string {
  switch (tier) {
    case 'bronze':
      return 'text-amber-600';
    case 'silver':
      return 'text-gray-400';
    case 'gold':
      return 'text-yellow-500';
    case 'platinum':
      return 'text-blue-400';
    case 'diamond':
      return 'text-purple-500';
    default:
      return 'text-gray-400';
  }
}

function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'bronze':
      return 'border-amber-600 text-amber-600';
    case 'silver':
      return 'border-gray-400 text-gray-400';
    case 'gold':
      return 'border-yellow-500 text-yellow-500';
    case 'platinum':
      return 'border-blue-400 text-blue-400';
    case 'diamond':
      return 'border-purple-500 text-purple-500';
    default:
      return 'border-gray-400 text-gray-400';
  }
} 