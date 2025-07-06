# Wumpus World - AI Knowledge Analysis

A modern, interactive implementation of the classic Wumpus World AI problem with dual-view visualization and custom world loading capabilities.

## 🎯 Features

### **Dual Grid System**
- **Agent's Knowledge View**: Shows only what the agent has discovered
- **Complete World Map**: Shows the full world state for analysis
- **5x5 Grid**: Compact and manageable world size

### **World Loading Options**
1. **Random World Generation**: Automatically generates a random world layout
2. **Custom World Loading**: Load worlds from text files

### **Interactive Controls**
- **Movement**: Arrow keys or WASD to move agent
- **Shooting**: Enter key to shoot arrow
- **Restart**: Space key to restart game
- **AI Simulation**: Start/Stop/Reset buttons for automated play

### **Visual Elements**
- **Agent**: Blue circle with directional arrow
- **Wumpus**: Red square with "W"
- **Pits**: Brown squares with "P"
- **Gold**: Yellow squares with "G"
- **Percepts**: Small colored indicators for Breeze (B) and Stench (S)

## 🗂️ Custom World File Format

Create a `.txt` file with a 5x5 grid using these characters:

```
W = Wumpus
P = Pit
G = Gold
- = Empty space
```

### Example World File:
```
--P--
-G-W-
-----
-P-G-
-----
```

### Rules:
- Exactly 5 lines with 5 characters each
- Agent starts at position (0,0) - top-left corner
- Agent's starting position must be safe (no Wumpus or Pit)
- Use any combination of W, P, G, and - characters

## 🚀 How to Use

### **Loading a Random World**
1. Select "Random World" option
2. Click "Load World" button
3. A new random world will be generated

### **Loading a Custom World**
1. Select "Custom World" option
2. Click "Choose World File" and select your `.txt` file
3. Click "Load World" button
4. Your custom world will be loaded

### **Playing the Game**
- Use arrow keys or WASD to move the agent
- The agent's knowledge view shows what has been discovered
- The complete world map shows everything for reference
- Watch for percepts (Breeze near pits, Stench near Wumpus)
- Collect gold and avoid hazards!

### **AI Analysis**
- Click "Start" to begin AI simulation
- The AI will analyze the world and make decisions
- Watch the reasoning process in the AI Analysis panel
- Use "Stop" to pause or "Reset" to restart

## 🎮 Game Rules

1. **Agent starts at (0,0)** with one arrow
2. **Wumpus**: Deadly creature that kills the agent on contact
3. **Pits**: Bottomless holes that kill the agent
4. **Gold**: Valuable treasure to collect
5. **Percepts**:
   - **Breeze**: Indicates adjacent pit
   - **Stench**: Indicates adjacent Wumpus
   - **Glitter**: Indicates gold in current room

## 🏗️ Technical Details

### **Architecture**
- **Frontend**: HTML5, CSS3, JavaScript
- **Graphics**: p5.js for agent view, HTML5 Canvas for world map
- **File Handling**: JavaScript FileReader API for custom worlds
- **UI**: Modern responsive design with animations

### **File Structure**
```
├── index.html          # Main HTML file
├── css/
│   └── main.css        # Styling
├── js/
│   └── ui-manager.js   # UI management and file handling
├── scripts/
│   ├── sketch.js       # Main p5.js sketch and game loop
│   ├── world.js        # World generation and management
│   ├── agent.js        # Agent behavior and movement
│   ├── room.js         # Room display and properties
│   └── [other game objects]
└── sample-world.txt    # Example custom world file
```

## 📋 Sample World Files

### **Simple World**
```
-----
--P--
-GWG-
--P--
-----
```

### **Complex World**
```
-PG--
W-P-G
--P--
-G-P-
--P-W
```

### **Maze-like World**
```
-PPP-
-G-G-
PPW-P
-G-G-
-PPP-
```

## 🔧 Development

To run locally:
1. Clone/download the repository
2. Start a local HTTP server: `python3 -m http.server 8000`
3. Open `http://localhost:8000` in your browser

## 🎯 Educational Use

This implementation is perfect for:
- **AI/ML Education**: Understanding knowledge representation
- **Game Theory**: Analyzing decision-making under uncertainty
- **Logic Programming**: Implementing inference engines
- **Robotics**: Simulating autonomous agent behavior

## 🤝 Contributing

Feel free to contribute by:
- Adding new world generation algorithms
- Improving the AI reasoning engine
- Creating more sophisticated visualizations
- Adding sound effects and animations

---

Enjoy exploring the Wumpus World! 🕳️🏹💰
