export interface FurnitureItem {
  id: string;
  name: string;
  type: 'shelf' | 'table' | 'chair' | 'cabinet' | 'desk' | 'storage' | 'hook';
  dimensions: {
    width: number; // in inches
    height: number; // in inches
    depth: number; // in inches
  };
  color: string;
  material: 'plywood' | 'oak' | 'walnut' | 'maple' | 'metal';
  price: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  pegHolesToSpan: {
    horizontal: number; // How many peg holes this furniture spans horizontally
    vertical: number;   // How many peg holes this furniture spans vertically
  };
}

export interface FurnitureCategory {
  name: string;
  items: FurnitureItem[];
}

// New interfaces for grouped furniture system
export interface FurnitureVariant {
  id: string;
  name: string;
  dimensions: {
    width: number; // in inches
    height: number; // in inches
    depth: number; // in inches
  };
  price: number;
  pegHolesToSpan: {
    horizontal: number;
    vertical: number;
  };
}

export interface FurnitureColor {
  id: string;
  name: string;
  hexCode: string;
  price: number; // Some colors might cost more
}

export interface FurnitureGroup {
  id: string;
  name: string;
  description: string;
  type: 'storage' | 'table' | 'hook';
  material: 'plywood' | 'oak' | 'walnut' | 'maple' | 'metal';
  basePrice: number;
  variants: FurnitureVariant[];
  colors: FurnitureColor[];
  imagePath: string;
}

export interface WallDimensions {
  width: number;
  height: number;
  depth: number;
}

// Shared color configuration
export const SHARED_COLORS: FurnitureColor[] = [
  { id: 'poppy', name: 'Poppy', hexCode: '#FA623B', price: 0 },
  { id: 'natural', name: 'Natural', hexCode: '#F5F5DC', price: 0 },
  { id: 'white', name: 'White', hexCode: '#FFFFFF', price: 0 },
  { id: 'sky', name: 'Sky', hexCode: '#74B9FF', price: 0 },
  { id: 'space', name: 'Space', hexCode: '#2D3436', price: 0 },
  { id: 'ochre', name: 'Ochre', hexCode: '#FDCB6E', price: 0 },
  { id: 'charcoal', name: 'Charcoal', hexCode: '#636E72', price: 0 },
  { id: 'ash', name: 'Ash', hexCode: '#B2BEC3', price: 0 },
  { id: 'dove', name: 'Dove', hexCode: '#DFE6E9', price: 0 },
  { id: 'tangerine', name: 'Tangerine', hexCode: '#FF8A65', price: 0 },
  { id: 'sienna', name: 'Sienna', hexCode: '#D63031', price: 0 },
  { id: 'rust', name: 'Rust', hexCode: '#E17055', price: 0 },
  { id: 'night', name: 'Night', hexCode: '#2D3436', price: 0 },
  { id: 'mint', name: 'Mint', hexCode: '#00B894', price: 0 },
  { id: 'pear', name: 'Pear', hexCode: '#A29BFE', price: 0 },
  { id: 'sage', name: 'Sage', hexCode: '#6C5CE7', price: 0 },
  { id: 'kiwi', name: 'Kiwi', hexCode: '#00CEA9', price: 0 },
  { id: 'avocado', name: 'Avocado', hexCode: '#55A3FF', price: 0 },
]; 