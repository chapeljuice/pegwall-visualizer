// Peg hole grid constants (in inches)
export const PEG_HOLE_SPACING = {
  horizontal: 8, // 8 inches between peg holes horizontally
  vertical: 6,   // 6 inches between peg holes vertically
};

export const PEG_HOLE_SIZE = {
  width: 1,   // 1 inch wide
  height: 3,  // 3 inches tall
};

// Convert inches to Three.js units (1 unit = 1 foot = 12 inches)
export const inchesToUnits = (inches: number): number => {
  return inches / 12;
};

// Convert Three.js units to inches
export const unitsToInches = (units: number): number => {
  return units * 12;
};

// Convert inch dimensions to Three.js units for rendering
export const convertDimensionsToUnits = (dimensions: { width: number; height: number; depth: number }) => {
  return {
    width: inchesToUnits(dimensions.width),
    height: inchesToUnits(dimensions.height),
    depth: inchesToUnits(dimensions.depth),
  };
};

// Calculate peg hole grid positions for a given wall size
export const calculatePegHoleGrid = (wallWidthInches: number, wallHeightInches: number) => {
  const horizontalPositions: number[] = [];
  const verticalPositions: number[] = [];

  // Calculate number of peg holes based on wall dimensions
  // Wall width = (horizontal holes × 8") + 6" margin (3" on each side)
  // Wall height = (vertical holes × 6") + 4" margin (2" on top and bottom)
  const horizontalCount = Math.round((wallWidthInches - 6) / 8);
  const verticalCount = Math.round((wallHeightInches - 4) / 6);

  // Calculate margins to center the peg holes on the wall
  const totalHorizontalSpace = horizontalCount * PEG_HOLE_SPACING.horizontal;
  const totalVerticalSpace = verticalCount * PEG_HOLE_SPACING.vertical;
  
  const horizontalMargin = (wallWidthInches - totalHorizontalSpace) / 2;
  const verticalMargin = (wallHeightInches - totalVerticalSpace) / 2;

  // Generate horizontal positions (centered)
  for (let i = 0; i < horizontalCount; i++) {
    const x = -wallWidthInches / 2 + horizontalMargin + (i * PEG_HOLE_SPACING.horizontal) + PEG_HOLE_SPACING.horizontal / 2;
    horizontalPositions.push(x);
  }

  // Generate vertical positions (centered)
  for (let i = 0; i < verticalCount; i++) {
    const y = verticalMargin + (i * PEG_HOLE_SPACING.vertical) + PEG_HOLE_SPACING.vertical / 2;
    verticalPositions.push(y);
  }

  return { horizontalPositions, verticalPositions };
};

// Calculate the optimal position for furniture to align with peg holes
export const calculateFurniturePosition = (
  furnitureWidthInches: number,
  furnitureHeightInches: number,
  pegHolesToSpan: { horizontal: number; vertical: number },
  targetPosition: [number, number],
  wallWidthInches: number,
  wallHeightInches: number
): [number, number] => {
  const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
  
  // Convert target position from Three.js units to inches
  const targetXInches = unitsToInches(targetPosition[0]);
  const targetYInches = unitsToInches(targetPosition[1]);
  
  let closestX = 0;
  let closestY = 0;
  let minDistance = Infinity;

  // Try each possible peg hole position as the top-left anchor
  for (let i = 0; i <= horizontalPositions.length - pegHolesToSpan.horizontal; i++) {
    for (let j = 0; j <= verticalPositions.length - pegHolesToSpan.vertical; j++) {
      // Calculate the position where furniture should be placed
      // Furniture should align its edges with the peg hole edges
      const firstPegHoleX = horizontalPositions[i];
      const firstPegHoleY = verticalPositions[j];
      
      // Position furniture so its top-left corner aligns with the first peg hole
      const furnitureX = firstPegHoleX - PEG_HOLE_SIZE.width / 2;
      const furnitureY = firstPegHoleY - PEG_HOLE_SIZE.height / 2;
      
      // Check if this position keeps the furniture within wall boundaries
      if (
        furnitureX >= -wallWidthInches / 2 &&
        furnitureX + furnitureWidthInches <= wallWidthInches / 2 &&
        furnitureY >= 0 &&
        furnitureY + furnitureHeightInches <= wallHeightInches
      ) {
        const distance = Math.sqrt(
          (targetXInches - furnitureX) ** 2 + 
          (targetYInches - furnitureY) ** 2
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestX = furnitureX;
          closestY = furnitureY;
        }
      }
    }
  }

  // Convert back to Three.js units
  return [inchesToUnits(closestX), inchesToUnits(closestY)];
};

// Check if a furniture position is valid (within bounds and doesn't overlap)
export const isValidFurniturePosition = (
  furnitureWidthInches: number,
  furnitureHeightInches: number,
  position: [number, number],
  wallWidthInches: number,
  wallHeightInches: number,
  otherFurniture: Array<{
    position: [number, number];
    dimensions: { width: number; height: number };
  }>
): boolean => {
  const [x, y] = position;
  
  // Convert to inches for calculations
  const furnitureXInches = unitsToInches(x);
  const furnitureYInches = unitsToInches(y);
  
  // Check wall boundaries
  if (
    furnitureXInches < -wallWidthInches / 2 ||
    furnitureXInches + furnitureWidthInches > wallWidthInches / 2 ||
    furnitureYInches < 0 ||
    furnitureYInches + furnitureHeightInches > wallHeightInches
  ) {
    return false;
  }
  
  // Check overlap with other furniture
  for (const other of otherFurniture) {
    const otherXInches = unitsToInches(other.position[0]);
    const otherYInches = unitsToInches(other.position[1]);
    
    if (
      furnitureXInches < otherXInches + other.dimensions.width &&
      furnitureXInches + furnitureWidthInches > otherXInches &&
      furnitureYInches < otherYInches + other.dimensions.height &&
      furnitureYInches + furnitureHeightInches > otherYInches
    ) {
      return false;
    }
  }
  
  return true;
}; 

// Calculate the price of the Kerf wall based on grid size
export const calculateWallPrice = (horizontalHoles: number, verticalHoles: number): number => {
  // Base price for 3x4 wall: $165
  // Price for 25x16 wall: $4450
  // Calculate price per hole and apply to total holes
  
  const baseHoles = 3 * 4; // 12 holes for base price
  const maxHoles = 25 * 16; // 400 holes for max price
  
  const basePrice = 165;
  const maxPrice = 4450;
  
  const currentHoles = horizontalHoles * verticalHoles;
  
  if (currentHoles <= baseHoles) {
    return basePrice;
  }
  
  if (currentHoles >= maxHoles) {
    return maxPrice;
  }
  
  // Linear interpolation between base and max prices
  const pricePerHole = (maxPrice - basePrice) / (maxHoles - baseHoles);
  const additionalHoles = currentHoles - baseHoles;
  
  return Math.round(basePrice + (additionalHoles * pricePerHole));
};

// Get wall dimensions from peg hole counts
export const getWallDimensionsFromHoles = (horizontalHoles: number, verticalHoles: number) => {
  const widthInches = (horizontalHoles * 8) + 6; // 8" spacing + 6" margin (3" on each side)
  const heightInches = (verticalHoles * 6) + 4;  // 6" spacing + 4" margin (2" on top and bottom)
  
  return {
    width: widthInches / 12, // Convert to feet
    height: heightInches / 12, // Convert to feet
  };
}; 