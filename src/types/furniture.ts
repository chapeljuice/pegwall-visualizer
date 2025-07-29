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

export interface WallDimensions {
  width: number;
  height: number;
  depth: number;
} 