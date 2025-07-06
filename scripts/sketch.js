let canvasSize = 400;
let roomsPerRow = 5; // Changed to 5x5 grid
let pitPercentage = 15; // Adjusted for smaller grid
let totalGold = 2;
let goldCollected = 0;
let worldAutoIncrement = false;    
let wumpusWorld;
let agentCanvas, fullCanvas; // Two separate canvases
let wumpus_image;
let wumpus_dead_image;
let gold_image;
let breeze_image;
let stench_image;
let agent_up_image;
let agent_down_image;
let agent_left_image
let agent_right_image;
let agent_walk_sprite_sheet;
let arrow_overlay_image;
let terrain_image;
let cover_image;
let victory_sound;
let defeat_sound;
let bell_sound;
let wind_sound;
let flies_sound;
let pit_image;
let loading = true;
let loadCounter = 0;
let filesToLoad = 16;
let bar;
let cheatMode = false;
let interval;
let isManualMode = true;
let isFixedBoard = false; // Changed to false by default
let customWorld = null; // For custom world data
let totalScore = 0;
let numOfSteps = 0;
let arrowUsed = 0;
let dead = 0;

function loadAssets(callback) {
    // Create placeholder graphics instead of loading images
    createPlaceholderGraphics();
    
    // Create placeholder sounds
    createPlaceholderSounds();
    
    // No need for actual loading
    console.log("Assets loaded (placeholders created)");
}

function createPlaceholderGraphics() {
    // Create simple graphics objects instead of loading images
    const roomSize = canvasSize / roomsPerRow;
    
    // Create graphics for different objects
    wumpus_image = createGraphics(roomSize, roomSize);
    wumpus_image.background(220, 20, 60);
    wumpus_image.fill(255);
    wumpus_image.textAlign(CENTER, CENTER);
    wumpus_image.textSize(roomSize/2);
    wumpus_image.text('W', roomSize/2, roomSize/2);
    
    wumpus_dead_image = createGraphics(roomSize, roomSize);
    wumpus_dead_image.background(139, 69, 19);
    wumpus_dead_image.fill(255);
    wumpus_dead_image.textAlign(CENTER, CENTER);
    wumpus_dead_image.textSize(roomSize/2);
    wumpus_dead_image.text('X', roomSize/2, roomSize/2);
    
    gold_image = createGraphics(roomSize, roomSize);
    gold_image.background(255, 215, 0);
    gold_image.fill(0);
    gold_image.textAlign(CENTER, CENTER);
    gold_image.textSize(roomSize/2);
    gold_image.text('G', roomSize/2, roomSize/2);
    
    pit_image = createGraphics(roomSize, roomSize);
    pit_image.background(101, 67, 33);
    pit_image.fill(255);
    pit_image.textAlign(CENTER, CENTER);
    pit_image.textSize(roomSize/2);
    pit_image.text('P', roomSize/2, roomSize/2);
    
    breeze_image = createGraphics(roomSize, roomSize);
    breeze_image.background(173, 216, 230);
    breeze_image.fill(0);
    breeze_image.textAlign(CENTER, CENTER);
    breeze_image.textSize(roomSize/3);
    breeze_image.text('B', roomSize/2, roomSize/2);
    
    stench_image = createGraphics(roomSize, roomSize);
    stench_image.background(144, 238, 144);
    stench_image.fill(0);
    stench_image.textAlign(CENTER, CENTER);
    stench_image.textSize(roomSize/3);
    stench_image.text('S', roomSize/2, roomSize/2);
    
    // Agent images
    agent_up_image = createGraphics(roomSize, roomSize);
    agent_up_image.background(59, 130, 246);
    agent_up_image.fill(255);
    agent_up_image.textAlign(CENTER, CENTER);
    agent_up_image.textSize(roomSize/2);
    agent_up_image.text('↑', roomSize/2, roomSize/2);
    
    agent_down_image = createGraphics(roomSize, roomSize);
    agent_down_image.background(59, 130, 246);
    agent_down_image.fill(255);
    agent_down_image.textAlign(CENTER, CENTER);
    agent_down_image.textSize(roomSize/2);
    agent_down_image.text('↓', roomSize/2, roomSize/2);
    
    agent_left_image = createGraphics(roomSize, roomSize);
    agent_left_image.background(59, 130, 246);
    agent_left_image.fill(255);
    agent_left_image.textAlign(CENTER, CENTER);
    agent_left_image.textSize(roomSize/2);
    agent_left_image.text('←', roomSize/2, roomSize/2);
    
    agent_right_image = createGraphics(roomSize, roomSize);
    agent_right_image.background(59, 130, 246);
    agent_right_image.fill(255);
    agent_right_image.textAlign(CENTER, CENTER);
    agent_right_image.textSize(roomSize/2);
    agent_right_image.text('→', roomSize/2, roomSize/2);
    
    arrow_overlay_image = createGraphics(roomSize, roomSize);
    arrow_overlay_image.background(0, 0, 0, 0); // Transparent
    arrow_overlay_image.fill(255, 255, 0);
    arrow_overlay_image.textAlign(CENTER, CENTER);
    arrow_overlay_image.textSize(roomSize/4);
    arrow_overlay_image.text('🏹', roomSize/2, roomSize/2);
    
    // Terrain and cover images - create simple colored backgrounds
    terrain_image = createGraphics(roomSize, roomSize);
    terrain_image.background(240, 230, 140);
    
    cover_image = createGraphics(roomSize, roomSize);
    cover_image.background(105, 105, 105);
    cover_image.fill(255);
    cover_image.textAlign(CENTER, CENTER);
    cover_image.textSize(roomSize/3);
    cover_image.text('?', roomSize/2, roomSize/2);
    
    console.log("Placeholder graphics created successfully!");
}

function createPlaceholderSounds() {
    // Create placeholder sound objects
    victory_sound = { play: () => console.log('Victory sound!'), stop: () => {}, isPlaying: () => false };
    defeat_sound = { play: () => console.log('Defeat sound!'), stop: () => {}, isPlaying: () => false };
    bell_sound = { play: () => console.log('Bell sound!'), stop: () => {}, isPlaying: () => false };
    flies_sound = { 
        play: () => console.log('Flies sound!'), 
        stop: () => {}, 
        loop: () => console.log('Flies sound looping!'),
        isPlaying: () => false,
        setVolume: (vol) => {}
    };
    
    wind_sound = [
        { play: () => console.log('Wind sound 1!'), stop: () => {}, isPlaying: () => false },
        { play: () => console.log('Wind sound 2!'), stop: () => {}, isPlaying: () => false },
        { play: () => console.log('Wind sound 3!'), stop: () => {}, isPlaying: () => false }
    ];
}

function loadCallback() {
    loadCounter++;
    bar.next();
    console.log(`Loading progress: ${loadCounter}/${filesToLoad}`);
    if (loadCounter >= filesToLoad) {
        loading = false;
        console.log("Loading complete!");
        
        // Create the world if it doesn't exist
        if (!wumpusWorld) {
            wumpusWorld = new World(roomsPerRow, pitPercentage, totalGold);
            console.log("World created:", wumpusWorld);
        }
    }
}

function setup() {
    // Initialize progress bar
    bar = new ProgressBar(filesToLoad);
    
    // Create agent knowledge canvas
    agentCanvas = createCanvas(canvasSize, canvasSize);
    agentCanvas.id("agent-canvas");
    agentCanvas.parent("agent-canvas-container");
    
    // Create placeholder graphics immediately
    createPlaceholderGraphics();
    
    // Create the world immediately
    wumpusWorld = new World(roomsPerRow, pitPercentage, totalGold);
    
    // Create full canvas
    setTimeout(() => {
        createFullCanvas();
    }, 100);
    
    // Skip loading animation
    loading = false;
}

function createFullCanvas() {
    // Create second canvas for full world view
    const fullContainer = document.getElementById('full-canvas-container');
    if (fullContainer) {
        const fullCanvasElement = document.createElement('canvas');
        fullCanvasElement.id = 'full-canvas';
        fullCanvasElement.width = canvasSize;
        fullCanvasElement.height = canvasSize;
        fullCanvasElement.style.border = '1px solid #ccc';
        fullCanvasElement.style.background = 'white';
        fullContainer.appendChild(fullCanvasElement);
        
        // Get 2D context for manual drawing
        fullCanvas = fullCanvasElement.getContext('2d');
        
        // Initial draw
        drawFullWorldCanvas();
    }
}

function restart() {
    clearInterval(interval);
    isManualMode = true;
    cheatMode = false;
    totalScore = 0;
    numOfSteps = 0;
    arrowUsed = 0;
    dead = 0;
    goldCollected = 0;
    wumpusWorld = new World(roomsPerRow, pitPercentage, totalGold);
    
    // Stop all sounds
    flies_sound.stop();
    wind_sound.forEach(sound => {
        sound.stop();
    });
    victory_sound.stop();
    defeat_sound.stop();
    
    // Update UI
    if (typeof uiManager !== 'undefined') {
        uiManager.updateAll();
    }
}

function draw() {
    if (loading) {
        // Show loading on agent canvas
        background(100);
        smooth();
        bar.display();
    } else {
        // Draw agent's knowledge view on main p5 canvas
        background(255);
        smooth();
        
        if (wumpusWorld) {
            // Draw grid lines first
            drawGrid();
            // Then draw the world content
            wumpusWorld.displayAgentKnowledge();
            
            // Check victory condition every frame
            if (wumpusWorld.agent && wumpusWorld.agent.alive) {
                wumpusWorld.agent.checkWin();
            }
        } else {
            // Debug: Show that world is not created yet
            fill(255, 0, 0);
            textSize(16);
            textAlign(CENTER, CENTER);
            text("Loading World...", canvasSize/2, canvasSize/2);
        }
        
        // Draw full world view on HTML5 canvas
        drawFullWorldCanvas();
    }
}

function drawGrid() {
    // Draw grid lines for the agent's knowledge canvas
    stroke(200);
    strokeWeight(1);
    const roomSize = canvasSize / roomsPerRow;
    
    // Vertical lines
    for (let i = 0; i <= roomsPerRow; i++) {
        line(i * roomSize, 0, i * roomSize, canvasSize);
    }
    
    // Horizontal lines
    for (let i = 0; i <= roomsPerRow; i++) {
        line(0, i * roomSize, canvasSize, i * roomSize);
    }
}

function drawFullWorldCanvas() {
    if (!fullCanvas || !wumpusWorld) return;
    
    // Clear the canvas
    fullCanvas.fillStyle = 'white';
    fullCanvas.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw grid
    fullCanvas.strokeStyle = '#ddd';
    fullCanvas.lineWidth = 1;
    const roomSize = canvasSize / roomsPerRow;
    
    for (let i = 0; i <= roomsPerRow; i++) {
        // Vertical lines
        fullCanvas.beginPath();
        fullCanvas.moveTo(i * roomSize, 0);
        fullCanvas.lineTo(i * roomSize, canvasSize);
        fullCanvas.stroke();
        
        // Horizontal lines
        fullCanvas.beginPath();
        fullCanvas.moveTo(0, i * roomSize);
        fullCanvas.lineTo(canvasSize, i * roomSize);
        fullCanvas.stroke();
    }
    
    // Draw rooms and objects
    for (let i = 0; i < roomsPerRow; i++) {
        for (let j = 0; j < roomsPerRow; j++) {
            const room = wumpusWorld.getRoom(i, j);
            if (!room) continue;
            
            const x = i * roomSize;
            const y = j * roomSize;
            
            // Draw room background based on visibility
            if (room.isVisible()) {
                fullCanvas.fillStyle = '#f0f9ff'; // Light blue for visited
            } else {
                fullCanvas.fillStyle = '#f9fafb'; // Light gray for unvisited
            }
            fullCanvas.fillRect(x + 1, y + 1, roomSize - 2, roomSize - 2);
            
            // Draw main objects (one per room, prioritized)
            fullCanvas.textAlign = 'center';
            fullCanvas.textBaseline = 'middle';
            
            // Priority order: Wumpus > Pit > Gold (only show highest priority)
            if (room.containsWumpus()) {
                fullCanvas.fillStyle = '#dc2626';
                fullCanvas.fillRect(x + 8, y + 8, roomSize - 16, roomSize - 16);
                fullCanvas.fillStyle = 'white';
                fullCanvas.font = 'bold 14px Arial';
                fullCanvas.fillText('W', x + roomSize/2, y + roomSize/2);
            } else if (room.containsPit()) {
                fullCanvas.fillStyle = '#7c2d12';
                fullCanvas.fillRect(x + 8, y + 8, roomSize - 16, roomSize - 16);
                fullCanvas.fillStyle = 'white';
                fullCanvas.font = 'bold 14px Arial';
                fullCanvas.fillText('P', x + roomSize/2, y + roomSize/2);
            } else if (room.containsGold()) {
                fullCanvas.fillStyle = '#f59e0b';
                fullCanvas.fillRect(x + 8, y + 8, roomSize - 16, roomSize - 16);
                fullCanvas.fillStyle = 'white';
                fullCanvas.font = 'bold 14px Arial';
                fullCanvas.fillText('G', x + roomSize/2, y + roomSize/2);
            }
            
            // Draw percepts as small indicators in corners
            fullCanvas.font = '8px Arial';
            
            if (room.containsBreeze()) {
                fullCanvas.fillStyle = '#3b82f6';
                fullCanvas.fillRect(x + 2, y + 2, 12, 8);
                fullCanvas.fillStyle = 'white';
                fullCanvas.textAlign = 'center';
                fullCanvas.fillText('B', x + 8, y + 6);
            }
            
            if (room.containsStench()) {
                fullCanvas.fillStyle = '#10b981';
                fullCanvas.fillRect(x + roomSize - 14, y + 2, 12, 8);
                fullCanvas.fillStyle = 'white';
                fullCanvas.textAlign = 'center';
                fullCanvas.fillText('S', x + roomSize - 8, y + 6);
            }
        }
    }
    
    // Draw agent last (highest priority)
    if (wumpusWorld.agent) {
        const agentX = wumpusWorld.agent.position.x * roomSize;
        const agentY = wumpusWorld.agent.position.y * roomSize;
        
        // Draw agent as a distinct colored circle
        fullCanvas.fillStyle = '#3b82f6';
        fullCanvas.beginPath();
        fullCanvas.arc(agentX + roomSize/2, agentY + roomSize/2, roomSize/4, 0, 2 * Math.PI);
        fullCanvas.fill();
        
        // Draw direction arrow
        fullCanvas.fillStyle = 'white';
        fullCanvas.font = 'bold 12px Arial';
        fullCanvas.textAlign = 'center';
        const arrows = ['↑', '→', '↓', '←'];
        fullCanvas.fillText(arrows[wumpusWorld.agent.direction], agentX + roomSize/2, agentY + roomSize/2 + 3);
    }
}

function randomRestart() {
    isFixedBoard = false;
    restart();
    
}

function fixedRestart() {
    isFixedBoard = true;
    restart();    
}

function keyPressed() {
    if (!wumpusWorld || !wumpusWorld.agent) return;
    
    // Clear previous agent position
    wumpusWorld.rooms.forEach(row => {
        row.forEach(room => {
            room.containsAgent = false;
        });
    });
    
    // Handle movement
    if (keyCode === UP_ARROW || keyCode === 87) {
        wumpusWorld.agent.up();
    } else if (keyCode === DOWN_ARROW || keyCode === 83) {
        wumpusWorld.agent.down();
    } else if (keyCode === LEFT_ARROW || keyCode === 65) {
        wumpusWorld.agent.left();
    } else if (keyCode === RIGHT_ARROW || keyCode === 68) {
        wumpusWorld.agent.right();
    } else if (keyCode == ENTER) {
        if (wumpusWorld.agent.alive && wumpusWorld.wumpus.alive) {
            wumpusWorld.agent.shoot();
        } else {
            restart();
        }
    } else if (keyCode == 32) {
        restart();
    }

    // Update agent position
    if (wumpusWorld.agent.getCurrentRoom()) {
        wumpusWorld.agent.getCurrentRoom().containsAgent = true;
    }
    
    // Prevent default behavior for arrow keys
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        return false;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function cheat() {
    cheatMode = ! cheatMode;
    if(cheatMode) {
        wumpusWorld.showAllRooms();
    }
    else {
        wumpusWorld.hideRooms();
    }
}
function simulate () {
    simulator = new Simulate(wumpusWorld);

    simulator.play();
}

// Add slider update functions that were missing
function updateVolume() {
    // Volume control functionality
    if (typeof document !== 'undefined') {
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.querySelector('.volume-value');
        if (volumeSlider && volumeValue) {
            volumeValue.textContent = volumeSlider.value + '%';
            // Update actual volume here if needed
        }
    }
}

function updatePitPercentage() {
    // Pit percentage control
    if (typeof document !== 'undefined') {
        const pitSlider = document.getElementById('pit-number-slider');
        const pitValue = document.querySelector('.pit-number-value');
        if (pitSlider && pitValue) {
            pitValue.textContent = pitSlider.value + '%';
            pitPercentage = parseInt(pitSlider.value);
        }
    }
}

function updateGoldNumber() {
    // Gold number control
    if (typeof document !== 'undefined') {
        const goldSlider = document.getElementById('gold-number-slider');
        const goldValue = document.querySelector('.gold-number-value');
        if (goldSlider && goldValue) {
            goldValue.textContent = goldSlider.value;
            totalGold = parseInt(goldSlider.value);
        }
    }
}

function setWorldSize(size) {
    // World size control
    roomsPerRow = size;
    if (typeof document !== 'undefined') {
        const sizeValue = document.querySelector('.world-size-value');
        if (sizeValue) {
            sizeValue.textContent = size;
        }
    }
}

// Progress bar class for loading
class ProgressBar {
    constructor(total) {
        this.total = total;
        this.current = 0;
        this.width = 200;
        this.height = 20;
    }
    
    next() {
        this.current++;
    }
    
    display() {
        // Draw progress bar
        fill(50);
        rect(canvasSize/2 - this.width/2, canvasSize/2 - this.height/2, this.width, this.height);
        
        fill(100, 200, 100);
        const progress = (this.current / this.total) * this.width;
        rect(canvasSize/2 - this.width/2, canvasSize/2 - this.height/2, progress, this.height);
        
        // Draw text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(16);
        text(`Loading... ${this.current}/${this.total}`, canvasSize/2, canvasSize/2 + 30);
    }
}