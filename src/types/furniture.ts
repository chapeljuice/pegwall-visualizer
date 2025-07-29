export interface FurnitureItem {
  id: string;
  name: string;
  type: 'shelf' | 'table' | 'chair' | 'cabinet' | 'desk' | 'storage' | 'hook';
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  color: string;
  material: 'plywood' | 'oak' | 'walnut' | 'maple' | 'metal';
  price: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  pegHolesToSpan?: number; // How many peg holes this furniture should span horizontally
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
    width: number;
    height: number;
    depth: number;
  };
  price: number;
  pegHolesToSpan: number;
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