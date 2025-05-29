// layoutEngine.ts

// Grid constants
export const GRID_COLUMNS = 14;
export const GRID_ROWS = 300;
export const GRID_CELL_WIDTH = 96;
export const GRID_CELL_HEIGHT = 140;
export const GAP = 8;
export const MARGIN = 16;

// Display size options
export type DisplaySize = 'auto' | 'small' | 'medium' | 'large';

// Valid post types
export type PostType = 'photo' | 'map' | 'route' | 'write' | 'gear' | 'video' | 'review';

// Post shape interface for layout system
export interface LayoutPost {
  id: string;
  type: PostType;
  displaySize: DisplaySize;
  isPremiumUser: boolean;
  content?: {
    displaySize?: DisplaySize;
    [key: string]: any;
  };
}

// Perfectly aligned post sizes for each type
export const POST_SIZE_MAP: Record<PostType, Record<'small' | 'medium' | 'large', { w: number; h: number }>> = {
  photo: {
    small: { w: 2, h: 2 },
    medium: { w: 3, h: 3 },
    large: { w: 4, h: 4 }
  },
  map: {
    small: { w: 3, h: 2 },
    medium: { w: 4, h: 3 },
    large: { w: 6, h: 4 }
  },
  route: {
    small: { w: 3, h: 2 },
    medium: { w: 4, h: 3 },
    large: { w: 6, h: 4 }
  },
  video: {
    small: { w: 4, h: 2 },
    medium: { w: 5, h: 3 },
    large: { w: 6, h: 4 }
  },
  write: {
    small: { w: 2, h: 2 },
    medium: { w: 3, h: 3 },
    large: { w: 4, h: 5 }
  },
  gear: {
    small: { w: 2, h: 2 },
    medium: { w: 2, h: 3 },
    large: { w: 3, h: 4 }
  },
  review: {
    small: { w: 2, h: 2 },
    medium: { w: 3, h: 3 },
    large: { w: 4, h: 4 }
  }
};

// Create a blank grid with all cells empty (false)
export function createEmptyGrid(rows = GRID_ROWS, cols = GRID_COLUMNS): boolean[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(false));
}

// Fallback size logic (used when displaySize is 'auto')
export function getAutoSizeFor(type: PostType): 'small' | 'medium' | 'large' {
  return 'medium';
}
