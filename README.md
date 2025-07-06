# Wumpus World - AI Knowledge Analysis

A modern, interactive visualization of the classic Wumpus World AI problem with dual-grid display and real-time knowledge base analysis.

## Features

### 🎮 Dual Grid Display
- **Agent's Knowledge Grid**: Shows only what the agent has discovered or can deduce
- **Complete World Map**: Shows the full world state for comparison
- Side-by-side visualization for educational purposes

### 🧠 AI Analysis Panel
- **Real-time Status**: Current agent position, direction, inventory, and health
- **Percept Detection**: Live updates of stench, breeze, and glitter detection
- **AI Reasoning**: Step-by-step decision making process with explanations
- **Knowledge Base**: Tracks safe, dangerous, and unknown rooms

### 🎨 Modern UI
- Responsive design with dark theme
- Interactive legends for both grids
- Smooth animations and hover effects
- Mobile-friendly layout

### 🔧 Controls
- **Start**: Begin AI simulation
- **Stop**: Pause the simulation
- **Reset**: Restart the game
- **Keyboard Controls**: Arrow keys or WASD for manual play

## Project Structure

```
Wumpus-world/
├── index.html              # Main HTML file
├── css/
│   └── main.css           # Styled UI components
├── js/
│   └── ui-manager.js      # UI management and interactions
└── scripts/
    ├── sketch.js          # Main p5.js setup and rendering
    ├── world.js           # World state management
    ├── agent.js           # Agent behavior and actions
    ├── ai.js              # AI decision making logic
    ├── simulate.js        # Simulation control
    ├── room.js            # Individual room logic
    ├── astar.js           # A* pathfinding algorithm
    ├── wumpus.js          # Wumpus entity
    ├── pit.js             # Pit hazards
    ├── gold.js            # Gold objects
    ├── stench.js          # Stench indicators
    └── breeze.js          # Breeze indicators
```

## How It Works

### Agent's Knowledge Grid (Left)
- Displays rooms the agent has visited (green background)
- Shows unknown rooms as gray with question marks
- Indicates detected percepts (S for Stench, B for Breeze)
- Agent position marked with directional arrow

### Complete World Map (Right)
- Shows all objects in their actual positions
- W = Wumpus, P = Pit, G = Gold, A = Agent
- Color-coded legend for easy identification
- Helps users understand the difference between knowledge and reality

### AI Reasoning Panel (Right)
- **Current Status**: Live agent statistics
- **Current Percepts**: What the agent senses right now
- **AI Reasoning**: Decision explanations with timestamps
- **Knowledge Base**: Categorized room information

## Technical Implementation

### Placeholder Graphics
All visual elements use dynamically generated graphics instead of external assets:
- Colored squares with text labels for objects
- Directional arrows for agent orientation
- Color-coded backgrounds for different room states

### Dual Canvas Rendering
- p5.js canvas for agent's knowledge view
- HTML5 canvas for complete world view
- Synchronized updates between both displays

### Real-time Updates
- 100ms update cycle for UI elements
- Event-driven knowledge base updates
- Smooth animations for state changes

## Controls

### AI Mode
- **Start Button**: Begin automated AI simulation
- **Stop Button**: Pause the current simulation
- **Reset Button**: Restart with new world configuration

### Manual Mode
- **Arrow Keys** or **WASD**: Move agent
- **Enter**: Shoot arrow (if available)
- **Space**: Quick restart

## Educational Value

This implementation serves as an excellent educational tool for:
- Understanding AI knowledge representation
- Visualizing the difference between partial and complete information
- Learning about logical inference in uncertain environments
- Studying pathfinding and decision-making algorithms

## Browser Compatibility

- Modern browsers with HTML5 and ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design works on desktop, tablet, and mobile

## Development

To run locally:
1. Clone/download the project
2. Start a local web server: `python3 -m http.server 8000`
3. Open `http://localhost:8000` in your browser

No build process required - everything runs in the browser!
