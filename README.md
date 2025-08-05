# KERF Wall - Interactive Furniture Designer

A modern web application for designing and visualizing custom plywood furniture on Kerf walls. Built with React, TypeScript, and Three.js.

## Features

### 🎨 **Interactive 3D Design**
- **Real-time 3D Visualization**: Interactive scene with realistic furniture rendering
- **Drag & Drop Placement**: Place furniture items on Kerf walls with grid snapping
- **Camera Controls**: Multiple preset views (Front, Top, 45°, Side) plus zoom controls
- **Collision Detection**: Prevents furniture overlap and ensures proper placement
- **Dynamic Wall Sizing**: Adjustable wall dimensions with automatic slot grid calculation

### 🛋️ **Comprehensive Furniture Catalog**
- **Cubby Storage**: 6 size options (10"×10", 10"×16", 20"×10", 20"×16", 39"×10", 40"×16")
- **Hook**: Simple hanging solution for coats, bags, and accessories
- **Table**: Sturdy work surface with customizable colors
- **Magazine Rack**: 2-slot and 3-slot options for mail and magazines
- **Bookshelf**: 2-slot, 3-slot, and 4-slot storage solutions
- **Easel**: Angled workspace for art and drawing projects

### 🎨 **Customization Options**
- **18 Color Palette**: Natural, White, Poppy, Sky, Space, Ochre, Charcoal, Ash, Dove, Tangerine, Sienna, Rust, Night, Mint, Pear, Sage, Kiwi, and Avocado
- **Shared Color State**: Selected colors persist across different furniture groups
- **Size Variants**: Multiple dimensions for most furniture types
- **Material Consistency**: All items crafted from premium plywood

### 💰 **Pricing & Cart Management**
- **Real-time Pricing**: Dynamic cost calculation with currency formatting
- **Shopping Cart**: View all placed items with color swatches and prices
- **Total Calculation**: Automatic sum of all furniture costs
- **Item Removal**: Remove individual items or clear entire wall
- **Wall System Pricing**: Automatic calculation based on slot grid size

### 📄 **Print Layout & Documentation**
- **Professional Print Layout**: Clean, printable design with comprehensive cost breakdown
- **Total Project Cost**: Prominent display of wall system + furniture costs
- **Detailed Specifications**: Wall dimensions, slot grid, and individual item details
- **Furniture List**: Complete inventory with colors, materials, and prices
- **Cost Breakdown**: Itemized wall system and furniture costs
- **Print-Friendly Design**: Optimized for printing with proper page breaks

### 🧠 **Smart Recommendations**
- **AI-Powered Suggestions**: Intelligent furniture recommendations based on wall size and existing items
- **Color Coordination**: Recommendations include color matching suggestions
- **Space Optimization**: Suggests items that fit available wall space
- **Dismissal System**: Hide recommendations you don't want to see again

### 🖼️ **Background Customization**
- **Image Upload**: Upload custom background images for your wall
- **Position Controls**: Adjust background image position and scale
- **Opacity Settings**: Control background image transparency
- **Minimized Interface**: Collapsible upload controls for clean workspace

### 🎯 **User Experience**
- **Expandable Product Cards**: Truncated descriptions with full details on expansion
- **One-Size Display**: Clean interface for single-size items
- **Color Swatches**: Visual color indicators in cart view
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Scrolling**: Full page navigation with proper overflow handling

## Tech Stack

### **Frontend Framework**
- **React 18** with TypeScript for type-safe development
- **React Router DOM** for client-side routing and navigation
- **CSS Modules** for component-scoped styling

### **3D Graphics & Visualization**
- **Three.js** for 3D rendering and scene management
- **React Three Fiber** for React integration with Three.js
- **@react-three/drei** for additional Three.js utilities and components
- **OrbitControls** for camera manipulation and user interaction

### **Development Tools**
- **Create React App** for project scaffolding and build configuration
- **TypeScript** for static type checking and better developer experience
- **ESLint** for code quality and consistency

### **State Management**
- **React Hooks** (useState, useEffect, useMemo, useCallback) for local state
- **localStorage** for data persistence between sessions
- **URL Parameters** for sharing and bookmarking layouts

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pegwall
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── FurnitureVisualizer/     # Main 3D visualization component
│   ├── FurniturePanel/          # Product selection and cart management
│   ├── PrintLayout/             # Print layout and documentation
│   ├── products/                # Individual furniture 3D components
│   │   ├── BaseFurnitureItem.tsx
│   │   ├── Cubby.tsx
│   │   ├── Hook.tsx
│   │   ├── Table.tsx
│   │   ├── MagazineRack.tsx
│   │   ├── Bookshelf.tsx
│   │   └── Easel.tsx
│   ├── Wall/                    # 3D wall and floor components
│   ├── WallDimensionsForm/      # Wall size configuration
│   ├── Recommendations/         # AI-powered furniture suggestions
│   └── shared/                  # Reusable UI components
├── types/
│   └── furniture.ts             # TypeScript interfaces and shared colors
├── utils/
│   ├── pegHoleUtils.ts         # Wall calculation and pricing utilities
│   └── recommendationEngine.ts  # AI recommendation algorithms
├── hooks/
│   └── useTextureLoader.ts     # Texture loading and management
└── App.tsx                      # Main application component with routing
```

## Usage

### **Designing Your Space**

1. **Configure Wall**: Use the wall dimensions form to set your Kerf wall size
2. **Browse Products**: Use the "Available Products" tab to explore furniture options
3. **Customize Items**: 
   - Click on product cards to expand and see customization options
   - Select size variants (where available)
   - Choose from 18 color options
   - See real-time price updates
4. **Place Furniture**: Click "Add to Wall" to place items in the 3D scene
5. **Arrange Items**: Drag placed items to reposition them on the slot grid
6. **Manage Cart**: 
   - View all placed items in the "View Cart" tab
   - See color swatches and individual prices
   - Remove items or clear the entire wall
7. **Camera Controls**: Use preset views or free camera movement to explore your design
8. **Get Recommendations**: Click the brain icon for AI-powered furniture suggestions
9. **Customize Background**: Upload and position background images for context
10. **Print Layout**: Click "Send to Printer" to generate a professional print layout

### **Print Layout Features**

- **Professional Documentation**: Clean, printable design with comprehensive details
- **Total Cost Summary**: Prominent display of complete project cost
- **Wall Specifications**: Dimensions, slot grid, and wall system pricing
- **Furniture Inventory**: Complete list with colors, materials, and individual prices
- **Cost Breakdown**: Itemized wall system and furniture costs
- **Print Optimization**: Proper page breaks and print-friendly styling

### **Furniture Specifications**

| Product | Sizes Available | Base Price | Color Options |
|---------|----------------|------------|---------------|
| Cubby Storage | 6 variants (10"×10" to 40"×16") | $210 | 18 colors |
| Hook | Standard (8"×8"×5") | $25 | Natural only |
| Table | Standard (38"×29"×60") | $1,535 | 18 colors |
| Magazine Rack | 2-slot (8"×8"×6"), 3-slot (16"×8"×6") | $95 | Natural only |
| Bookshelf | 2-slot (8"×10"×10"), 3-slot (16"×10"×10"), 4-slot (24"×10"×10") | $155 | Natural only |
| Easel | Standard (30"×26"×5") | $565 | 18 colors |

### **Wall System Pricing**

- **Base Price**: $165 for 3×4 wall (12 slots)
- **Scaling**: Price increases linearly with slot count
- **Maximum Price**: $4,450 for 25×16 wall (400 slots)
- **Automatic Calculation**: Based on wall dimensions and slot grid

## Development

### **Adding New Furniture**

1. **Define Product Data**: Add to `furnitureGroups` array in `FurniturePanel.tsx`
2. **Create 3D Component**: Add new component in `src/components/products/`
3. **Update Rendering**: Add rendering logic in `FurnitureVisualizer.tsx`
4. **Add Image**: Include product image in `public/images/products/`

### **Color System**

- **Shared Colors**: Centralized in `types/furniture.ts` as `SHARED_COLORS`
- **Product-Specific**: Some items (Hook, Magazine Rack, Bookshelf) use Natural only
- **Color Persistence**: Selected colors persist across furniture groups

### **3D Scene Features**

- **Grid System**: 8" horizontal × 6" vertical slot spacing
- **Wall Positioning**: Furniture back walls flush against Kerf wall
- **Collision Detection**: Prevents overlapping placement
- **Boundary Constraints**: Keeps furniture within wall dimensions
- **Dynamic Camera**: Automatic camera positioning based on wall size

### **Print Layout System**

- **Data Persistence**: Uses localStorage to maintain state between tabs
- **Routing**: React Router for navigation between main app and print layout
- **Responsive Design**: Adapts to different screen sizes and print formats
- **Cost Calculation**: Real-time pricing with wall system and furniture costs

## Future Enhancements

- **User Accounts**: Save and share designs
- **Order Processing**: Direct integration with manufacturing
- **Advanced Materials**: Different wood types and finishes
- **Room Templates**: Pre-designed room layouts
- **Export Options**: Generate images, 3D models, or manufacturing files
- **AR Integration**: View furniture in your actual space
- **Collaboration**: Real-time design sharing
- **Advanced AI**: More sophisticated recommendation algorithms
- **Cloud Storage**: Save designs to cloud for cross-device access

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions, feature requests, or bug reports, please open an issue in the repository.
