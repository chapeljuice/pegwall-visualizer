import { FurnitureItem } from '../types/furniture';

// User behavior tracking
export interface UserAction {
  type: 'place_item' | 'remove_item' | 'change_color' | 'view_layout';
  itemType?: string;
  color?: string;
  wallDimensions?: { width: number; height: number };
  timestamp: number;
}

// Recommendation types
export interface Recommendation {
  id: string;
  type: 'suggestion' | 'combination' | 'layout' | 'color';
  title: string;
  description: string;
  confidence: number; // 0-1, how confident we are in this recommendation
  furnitureType?: string;
  color?: string;
  position?: [number, number, number];
}

// Store user actions in localStorage
const USER_ACTIONS_KEY = 'pegwall_user_actions';

export const trackUserAction = (action: Omit<UserAction, 'timestamp'>) => {
  const userAction: UserAction = {
    ...action,
    timestamp: Date.now(),
  };

  // Get existing actions
  const existingActions = localStorage.getItem(USER_ACTIONS_KEY);
  const actions: UserAction[] = existingActions ? JSON.parse(existingActions) : [];
  
  // Add new action
  actions.push(userAction);
  
  // Keep only last 100 actions to prevent localStorage from getting too large
  if (actions.length > 100) {
    actions.splice(0, actions.length - 100);
  }
  
  localStorage.setItem(USER_ACTIONS_KEY, JSON.stringify(actions));
};

export const getUserActions = (): UserAction[] => {
  const actions = localStorage.getItem(USER_ACTIONS_KEY);
  return actions ? JSON.parse(actions) : [];
};

// Simple rule-based recommendation engine
export const generateRecommendations = (
  placedItems: FurnitureItem[],
  wallDimensions: { width: number; height: number },
  availableColors: string[],
  currentSelectedColor: string = '#FA623B' // Default to Poppy
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const actions = getUserActions();
  
  // Get dismissed recommendations from localStorage
  const dismissedRecommendations = JSON.parse(localStorage.getItem('dismissed_recommendations') || '[]');

  // Rule 1: Suggest starting items for empty walls
  if (placedItems.length === 0 && !dismissedRecommendations.includes('start-with-cubby')) {
    recommendations.push({
      id: 'start-with-cubby',
      type: 'suggestion',
      title: 'Start with Storage',
      description: 'Try adding a cubby for organized storage. They come in 6 sizes to fit any space.',
      confidence: 0.9,
      furnitureType: 'cubby',
      color: currentSelectedColor
    });
  }

  // Rule 2: Suggest complementary items based on what's placed
  const hasCubby = placedItems.some(item => item.name.includes('Cubby'));
  const hasTable = placedItems.some(item => item.name.includes('Table'));
  const hasHook = placedItems.some(item => item.name.includes('Hook'));

  if (hasCubby && !hasTable && !dismissedRecommendations.includes('add-table')) {
    recommendations.push({
      id: 'add-table',
      type: 'combination',
      title: 'Add a Workspace',
      description: 'A table below your cubbies creates a perfect workspace for projects.',
      confidence: 0.8,
      furnitureType: 'table',
      color: currentSelectedColor
    });
  }

  if (hasCubby && !hasHook && !dismissedRecommendations.includes('add-hook')) {
    recommendations.push({
      id: 'add-hook',
      type: 'combination',
      title: 'Hang It Up',
      description: 'Add hooks for coats, bags, or tools. They work great with cubby storage.',
      confidence: 0.7,
      furnitureType: 'hook',
      color: currentSelectedColor
    });
  }

  // Rule 3: Suggest based on wall dimensions
  if (wallDimensions.height > 8 && !dismissedRecommendations.includes('tall-wall-bookshelf')) {
    recommendations.push({
      id: 'tall-wall-bookshelf',
      type: 'layout',
      title: 'Use Your Height',
      description: 'Your tall wall is perfect for a bookshelf. Great for books, plants, or display items.',
      confidence: 0.8,
      furnitureType: 'bookshelf',
      color: currentSelectedColor
    });
  }

  if (wallDimensions.width > 10 && !dismissedRecommendations.includes('wide-wall-magazine-rack')) {
    recommendations.push({
      id: 'wide-wall-magazine-rack',
      type: 'layout',
      title: 'Stay Organized',
      description: 'A magazine rack keeps mail and papers organized on your wide wall.',
      confidence: 0.7,
      furnitureType: 'magazine-rack',
      color: currentSelectedColor
    });
  }

  // Rule 4: Color harmony suggestions
  if (placedItems.length > 0) {
    const usedColors = Array.from(new Set(placedItems.map(item => item.color)));
    const unusedColors = availableColors.filter(color => !usedColors.includes(color));
    
    if (unusedColors.length > 0) {
      // Simple color harmony: suggest complementary colors
      const lastUsedColor = usedColors[usedColors.length - 1];
      const complementaryColor = getComplementaryColor(lastUsedColor, unusedColors);
      
      if (complementaryColor && !dismissedRecommendations.includes('color-harmony')) {
        recommendations.push({
          id: 'color-harmony',
          type: 'color',
          title: 'Color Harmony',
          description: `Try ${getColorName(complementaryColor)} for your next piece. It complements your ${getColorName(lastUsedColor)} items beautifully.`,
          confidence: 0.6,
          color: complementaryColor
        });
      }
    }
  }

  // Rule 5: Based on user behavior patterns
  const recentActions = actions.filter(action => 
    Date.now() - action.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
  );
  
  const placedItemsCount = recentActions.filter(action => action.type === 'place_item').length;
  if (placedItemsCount >= 3 && !dismissedRecommendations.includes('workspace-setup')) {
    recommendations.push({
      id: 'workspace-setup',
      type: 'layout',
      title: 'Complete Your Workspace',
      description: 'You\'re building a great workspace! Consider an easel for creative projects.',
      confidence: 0.7,
      furnitureType: 'easel',
      color: currentSelectedColor
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

// Helper functions
const getComplementaryColor = (baseColor: string, availableColors: string[]): string | null => {
  // Simple color harmony rules
  const colorHarmonyMap: { [key: string]: string[] } = {
    '#FA623B': ['#74B9FF', '#00B894'], // Poppy goes with Sky, Mint
    '#F5F5DC': ['#636E72', '#2D3436'], // Natural goes with Charcoal, Space
    '#FFFFFF': ['#2D3436', '#636E72'], // White goes with Space, Charcoal
    '#74B9FF': ['#FA623B', '#FDCB6E'], // Sky goes with Poppy, Ochre
    '#2D3436': ['#FFFFFF', '#F5F5DC'], // Space goes with White, Natural
    '#FDCB6E': ['#74B9FF', '#A29BFE'], // Ochre goes with Sky, Pear
    '#636E72': ['#FFFFFF', '#F5F5DC'], // Charcoal goes with White, Natural
    '#B2BEC3': ['#2D3436', '#636E72'], // Ash goes with Space, Charcoal
    '#DFE6E9': ['#2D3436', '#636E72'], // Dove goes with Space, Charcoal
    '#FF8A65': ['#74B9FF', '#00B894'], // Tangerine goes with Sky, Mint
    '#D63031': ['#74B9FF', '#00B894'], // Sienna goes with Sky, Mint
    '#E17055': ['#74B9FF', '#00B894'], // Rust goes with Sky, Mint
    '#00B894': ['#FA623B', '#FDCB6E'], // Mint goes with Poppy, Ochre
    '#A29BFE': ['#FDCB6E', '#FA623B'], // Pear goes with Ochre, Poppy
    '#6C5CE7': ['#FDCB6E', '#FA623B'], // Sage goes with Ochre, Poppy
    '#00CEA9': ['#FA623B', '#FDCB6E'], // Kiwi goes with Poppy, Ochre
    '#55A3FF': ['#FA623B', '#FDCB6E'], // Avocado goes with Poppy, Ochre
  };

  const harmoniousColors = colorHarmonyMap[baseColor] || [];
  const availableHarmonious = harmoniousColors.filter(color => availableColors.includes(color));
  
  return availableHarmonious[0] || availableColors[0] || null;
};

const getColorName = (hexCode: string): string => {
  const colorMap: { [key: string]: string } = {
    '#FA623B': 'Poppy',
    '#F5F5DC': 'Natural',
    '#FFFFFF': 'White',
    '#74B9FF': 'Sky',
    '#2D3436': 'Space',
    '#FDCB6E': 'Ochre',
    '#636E72': 'Charcoal',
    '#B2BEC3': 'Ash',
    '#DFE6E9': 'Dove',
    '#FF8A65': 'Tangerine',
    '#D63031': 'Sienna',
    '#E17055': 'Rust',
    '#00B894': 'Mint',
    '#A29BFE': 'Pear',
    '#6C5CE7': 'Sage',
    '#00CEA9': 'Kiwi',
    '#55A3FF': 'Avocado',
  };
  return colorMap[hexCode] || 'Unknown Color';
}; 