export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  time: number; // minutes
  difficulty: 'Легко' | 'Средне' | 'Сложно';
  servings: number;
  nutrition: NutritionInfo;
  ingredients: string[];
  tags: string[];
}

export interface QueueItem {
  recipe: Recipe;
  addedAt: number;
  position: number;
}

export interface HistoryItem {
  recipe: Recipe;
  action: 'like' | 'dislike';
  timestamp: number;
}

export type TabType = 'swipe' | 'queue' | 'history';
