export interface FurnitureItem {
  id: string;
  name: string;
  type: 'shelf' | 'table' | 'chair' | 'cabinet' | 'desk' | 'storage';
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  color: string;
  material: 'plywood' | 'oak' | 'walnut' | 'maple';
  price: number;
  position: [number, number, number];
  rotation?: [number, number, number];
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