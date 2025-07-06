// UI utilities and functions for Wumpus World
class UIManager {
    constructor() {
        this.currentStep = 0;
        this.aiDecisions = [];
        this.knowledgeBase = {
            safeRooms: new Set(['0,0']),
            dangerousRooms: new Set(),
            unknownRooms: new Set()
        };
        this.maxDecisions = 10;
        this.initializeUI();
    }
    
    initializeUI() {
        // Initialize UI elements and event listeners
        this.setupEventListeners();
        this.updateInitialStatus();
    }
    
    setupEventListeners() {
        // Add event listeners for keyboard controls
        document.addEventListener('keydown', (event) => {
            if (typeof wumpusWorld !== 'undefined' && wumpusWorld.agent) {
                this.handleKeyPress(event);
            }
        });
        
        // Add periodic updates
        setInterval(() => {
            this.updateAll();
        }, 100);
    }
    
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                wumpusWorld.agent.up();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                wumpusWorld.agent.down();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                wumpusWorld.agent.left();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                wumpusWorld.agent.right();
                break;
            case 'Enter':
                if (wumpusWorld.agent.alive && wumpusWorld.wumpus.alive) {
                    wumpusWorld.agent.shoot();
                }
                break;
        }
    }
    
    updateAll() {
        this.updateAgentStatus();
        this.updatePercepts();
        this.updateKnowledgeBase();
    }
    
    updateAgentStatus() {
        if (typeof wumpusWorld !== 'undefined' && wumpusWorld.agent) {
            this.updateElement('step-count', this.currentStep);
            this.updateElement('agent-position', `(${wumpusWorld.agent.position.x}, ${wumpusWorld.agent.position.y})`);
            this.updateElement('agent-direction', this.getDirectionName(wumpusWorld.agent.direction));
            this.updateElement('has-arrow', wumpusWorld.agent.hasArrow ? 'Yes' : 'No');
            this.updateElement('gold-collected', wumpusWorld.agent.collectedGold);
            this.updateElement('agent-alive', wumpusWorld.agent.alive ? 'Yes' : 'No');
        }
    }
    
    updatePercepts() {
        if (typeof wumpusWorld !== 'undefined' && wumpusWorld.agent) {
            const currentRoom = wumpusWorld.agent.getCurrentRoom();
            this.updateElement('stench-status', currentRoom.containsStench() ? 'Yes' : 'No');
            this.updateElement('breeze-status', currentRoom.containsBreeze() ? 'Yes' : 'No');
            this.updateElement('glitter-status', currentRoom.containsGold() ? 'Yes' : 'No');
        }
    }
    
    updateKnowledgeBase() {
        this.updateElement('safe-rooms', JSON.stringify(Array.from(this.knowledgeBase.safeRooms)));
        this.updateElement('dangerous-rooms', JSON.stringify(Array.from(this.knowledgeBase.dangerousRooms)));
        this.updateElement('unknown-rooms', JSON.stringify(Array.from(this.knowledgeBase.unknownRooms)));
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    addDecision(decision) {
        this.aiDecisions.push({
            step: this.currentStep,
            decision: decision,
            timestamp: new Date().toLocaleTimeString()
        });
        
        const decisionsContent = document.getElementById('decisions-content');
        if (decisionsContent) {
            const decisionDiv = document.createElement('div');
            decisionDiv.className = 'decision-item';
            decisionDiv.innerHTML = `
                <strong>Step ${this.currentStep}:</strong> ${decision}
                <small style="display: block; color: #9ca3af; margin-top: 5px;">${new Date().toLocaleTimeString()}</small>
            `;
            decisionsContent.appendChild(decisionDiv);
            
            // Keep only last maxDecisions
            if (this.aiDecisions.length > this.maxDecisions) {
                this.aiDecisions.shift();
                if (decisionsContent.firstChild) {
                    decisionsContent.removeChild(decisionsContent.firstChild);
                }
            }
            
            decisionsContent.scrollTop = decisionsContent.scrollHeight;
        }
    }
    
    updateKnowledgeFromRoom(pos, roomInfo) {
        const roomKey = `${pos.x},${pos.y}`;
        
        // Mark current room as safe
        this.knowledgeBase.safeRooms.add(roomKey);
        this.knowledgeBase.dangerousRooms.delete(roomKey);
        this.knowledgeBase.unknownRooms.delete(roomKey);
        
        // If there's a stench or breeze, mark adjacent rooms as potentially dangerous
        if (roomInfo.hasStench || roomInfo.hasBreeze) {
            this.markAdjacentRooms(pos, 'dangerous');
        }
        
        // Update unknown rooms
        this.updateUnknownRooms();
    }
    
    markAdjacentRooms(pos, type) {
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        directions.forEach(([dx, dy]) => {
            const newX = pos.x + dx;
            const newY = pos.y + dy;
            if (newX >= 0 && newX < roomsPerRow && newY >= 0 && newY < roomsPerRow) {
                const roomKey = `${newX},${newY}`;
                if (!this.knowledgeBase.safeRooms.has(roomKey)) {
                    if (type === 'dangerous') {
                        this.knowledgeBase.dangerousRooms.add(roomKey);
                    }
                }
            }
        });
    }
    
    updateUnknownRooms() {
        this.knowledgeBase.unknownRooms.clear();
        for (let x = 0; x < roomsPerRow; x++) {
            for (let y = 0; y < roomsPerRow; y++) {
                const roomKey = `${x},${y}`;
                if (!this.knowledgeBase.safeRooms.has(roomKey) && !this.knowledgeBase.dangerousRooms.has(roomKey)) {
                    this.knowledgeBase.unknownRooms.add(roomKey);
                }
            }
        }
    }
    
    incrementStep() {
        this.currentStep++;
    }
    
    reset() {
        this.currentStep = 0;
        this.aiDecisions = [];
        this.knowledgeBase = {
            safeRooms: new Set(['0,0']),
            dangerousRooms: new Set(),
            unknownRooms: new Set()
        };
        
        const decisionsContent = document.getElementById('decisions-content');
        if (decisionsContent) {
            decisionsContent.innerHTML = '<div style="color: #9ca3af; font-style: italic;">Ready to start AI analysis...</div>';
        }
        
        this.updateInitialStatus();
    }
    
    updateInitialStatus() {
        this.updateElement('step-count', 0);
        this.updateElement('agent-position', '(0, 0)');
        this.updateElement('agent-direction', 'Right');
        this.updateElement('has-arrow', 'Yes');
        this.updateElement('gold-collected', 0);
        this.updateElement('agent-alive', 'Yes');
        this.updateElement('stench-status', 'No');
        this.updateElement('breeze-status', 'No');
        this.updateElement('glitter-status', 'No');
    }
    
    getDirectionName(direction) {
        const directions = ['Up', 'Right', 'Down', 'Left'];
        return directions[direction] || 'Unknown';
    }
    
    showNotification(message, type = 'info') {
        // Create a notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global UI manager instance
let uiManager;

// Button handlers
function startAI() {
    if (typeof simulate === 'function') {
        simulate();
        uiManager.addDecision('AI simulation started');
        uiManager.showNotification('AI simulation started', 'success');
    }
}

function stopAI() {
    if (typeof interval !== 'undefined') {
        clearInterval(interval);
        uiManager.addDecision('AI simulation stopped');
        uiManager.showNotification('AI simulation stopped', 'info');
    }
}

function resetAI() {
    if (typeof fixedRestart === 'function') {
        fixedRestart();
        uiManager.reset();
        uiManager.addDecision('Game reset');
        uiManager.showNotification('Game reset', 'info');
    }
}

// World loading functionality
let customWorldData = null;

// Handle radio button changes
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="worldType"]');
    const fileContainer = document.getElementById('file-input-container');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'custom') {
                fileContainer.style.display = 'block';
            } else {
                fileContainer.style.display = 'none';
                customWorldData = null;
            }
        });
    });
    
    // Handle file input
    const fileInput = document.getElementById('world-file');
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    customWorldData = parseWorldFile(e.target.result);
                    showNotification('World file loaded successfully!', 'success');
                } catch (error) {
                    showNotification('Error loading world file: ' + error.message, 'error');
                    customWorldData = null;
                }
            };
            reader.readAsText(file);
        }
    });
});

function parseWorldFile(content) {
    const lines = content.trim().split('\n');
    if (lines.length !== 5) {
        throw new Error('World file must have exactly 5 lines for 5x5 grid');
    }
    
    const world = {
        wumpus: [],
        pits: [],
        gold: []
    };
    
    for (let y = 0; y < 5; y++) {
        const line = lines[y];
        if (line.length !== 5) {
            throw new Error(`Line ${y + 1} must have exactly 5 characters`);
        }
        
        for (let x = 0; x < 5; x++) {
            const char = line[x].toUpperCase();
            switch (char) {
                case 'W':
                    world.wumpus.push([x, y]);
                    break;
                case 'P':
                    world.pits.push([x, y]);
                    break;
                case 'G':
                    world.gold.push([x, y]);
                    break;
                case '-':
                    // Empty space
                    break;
                default:
                    throw new Error(`Invalid character '${char}' at position (${x}, ${y}). Use W, P, G, or -`);
            }
        }
    }
    
    // Validate that agent starting position (0,0) is safe
    if (world.wumpus.some(([x, y]) => x === 0 && y === 0) || 
        world.pits.some(([x, y]) => x === 0 && y === 0)) {
        throw new Error('Agent starting position (0,0) must be safe (no Wumpus or Pit)');
    }
    
    return world;
}

function loadWorld() {
    const selectedType = document.querySelector('input[name="worldType"]:checked').value;
    
    if (selectedType === 'custom') {
        if (!customWorldData) {
            showNotification('Please select a world file first!', 'error');
            return;
        }
        isFixedBoard = true;
        customWorld = customWorldData;
    } else {
        isFixedBoard = false;
        customWorld = null;
    }
    
    restart();
    showNotification(`${selectedType === 'custom' ? 'Custom' : 'Random'} world loaded!`, 'success');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Victory/Defeat Modal functionality
function showVictoryModal(scoreData) {
    const modal = createModal('victory', scoreData);
    document.body.appendChild(modal);
}

function showDefeatModal(scoreData) {
    const modal = createModal('defeat', scoreData);
    document.body.appendChild(modal);
}

function createModal(type, scoreData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const isVictory = type === 'victory';
    const emoji = isVictory ? '🏆' : '💀';
    const title = isVictory ? 'VICTORY!' : 'GAME OVER';
    const titleClass = isVictory ? 'victory' : 'defeat';
    
    modal.innerHTML = `
        <div class="modal-content ${titleClass}">
            <span class="modal-emoji">${emoji}</span>
            <h2 class="modal-title ${titleClass}">${title}</h2>
            
            <div class="score-breakdown">
                <div class="score-item">
                    <span>Gold Collected:</span>
                    <span style="color: #fbbf24;">+${scoreData.goldScore}</span>
                </div>
                <div class="score-item">
                    <span>Steps Taken:</span>
                    <span style="color: #ef4444;">${scoreData.stepPenalty}</span>
                </div>
                <div class="score-item">
                    <span>Arrow Used:</span>
                    <span style="color: #ef4444;">${scoreData.arrowPenalty}</span>
                </div>
                ${!isVictory ? `
                <div class="score-item">
                    <span>Death Penalty:</span>
                    <span style="color: #ef4444;">${scoreData.deathPenalty}</span>
                </div>
                ` : ''}
                <div class="score-item total ${titleClass}">
                    <span>TOTAL SCORE:</span>
                    <span>${scoreData.totalScore}</span>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn play-again" onclick="closeModalAndRestart()">
                    🔄 Play Again
                </button>
                <button class="modal-btn new-world" onclick="closeModalAndNewWorld()">
                    🌍 New World
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

function closeModalAndRestart() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    restart();
}

function closeModalAndNewWorld() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    // Switch to random world and restart
    document.querySelector('input[name="worldType"][value="random"]').checked = true;
    document.getElementById('file-input-container').style.display = 'none';
    loadWorld();
}

// Enhanced score calculation
function calculateScore() {
    return {
        goldScore: goldCollected,
        stepPenalty: numOfSteps * (-1),
        arrowPenalty: arrowUsed,
        deathPenalty: dead,
        totalScore: goldCollected + (numOfSteps * (-1)) + arrowUsed + dead
    };
}

// Initialize UI Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
}
