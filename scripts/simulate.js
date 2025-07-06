class Simulate {
    constructor(world) {
        this.world = world;
        this.stepCount = 0;
        this.maxSteps = 100; // Prevent infinite loops
        this.lastPosition = null;
        this.stuckCounter = 0;
    }

    play() {       
        isManualMode = false;
        var ai = new Ai(this.world);
        
        // Make sure AI position matches agent position (bottom-left)
        ai.agentRow = this.world.agent.position.y;
        ai.agentCol = this.world.agent.position.x;
        
        let nextMoveArray = [];
        let wumpuskillingwaiter = 0;
        
        interval = setInterval(()=>{
            this.stepCount++;
            
            // Check for infinite loop/stuck condition
            if (this.stepCount > this.maxSteps) {
                clearInterval(interval);
                console.log("AI reached maximum steps, stopping simulation");
                if (typeof uiManager !== 'undefined') {
                    uiManager.addDecision("Simulation stopped - reached maximum steps");
                }
                return;
            }
            
            // Synchronize AI position with agent position
            ai.agentRow = this.world.agent.position.y;
            ai.agentCol = this.world.agent.position.x;
            
            // Check if agent is stuck in same position
            const currentPos = `${this.world.agent.position.x},${this.world.agent.position.y}`;
            if (this.lastPosition === currentPos) {
                this.stuckCounter++;
                if (this.stuckCounter > 5) {
                    // Agent is stuck, try random movement
                    nextMoveArray = [Math.floor(Math.random() * 4)];
                    this.stuckCounter = 0;
                    if (typeof uiManager !== 'undefined') {
                        uiManager.addDecision("Agent stuck - trying random movement");
                    }
                }
            } else {
                this.stuckCounter = 0;
            }
            this.lastPosition = currentPos;
            
            if (typeof uiManager !== 'undefined') {
                uiManager.currentStep = this.stepCount;
                uiManager.incrementStep();
            }
            
            // Check if agent is dead or won
            if (!this.world.agent.alive || this.world.agent.collectedGold >= this.world.totalGold) {
                clearInterval(interval);
                return;
            }
            
            if (nextMoveArray.length==1 && ai.killWumpus==true) {
                this.world.agent.direction = nextMoveArray[0];
                this.world.agent.shoot();
                ai.killWumpus = false;
                ai.wumpusAlive = false; // Update AI knowledge immediately
                
                // Also update the world's Wumpus knowledge
                if (this.world.wumpus) {
                    this.world.wumpus.kill();
                }
                
                wumpuskillingwaiter = 3;
                
                // Add decision to UI
                if (typeof uiManager !== 'undefined') {
                    uiManager.addDecision(`🏹 Shooting arrow ${this.getDirectionName(nextMoveArray[0])} - targeting Wumpus!`);
                }
                
                // Clear the move array after shooting
                nextMoveArray = [];
            }
            else if (wumpuskillingwaiter == 0) {
                if (nextMoveArray.length == 0) {
                    nextMoveArray = ai.getNextMove();
                    
                    // Debug AI knowledge occasionally
                    if (this.stepCount % 10 === 0) {
                        ai.debugKnowledge();
                    }
                    
                    // Add reasoning to UI
                    if (typeof uiManager !== 'undefined' && nextMoveArray.length > 0) {
                        const reasoning = this.getMovementReasoning(nextMoveArray[0]);
                        uiManager.addDecision(reasoning);
                    }
                    
                    // Debug: Check if AI is about to move into danger
                    if (nextMoveArray.length > 0 && typeof uiManager !== 'undefined') {
                        const agentX = this.world.agent.position.x;
                        const agentY = this.world.agent.position.y;
                        let targetX = agentX, targetY = agentY;
                        
                        if (nextMoveArray[0] === 0) targetY--;
                        if (nextMoveArray[0] === 1) targetX++;
                        if (nextMoveArray[0] === 2) targetY++;
                        if (nextMoveArray[0] === 3) targetX--;
                        
                        if (targetX >= 0 && targetX < this.world.roomsPerRow && 
                            targetY >= 0 && targetY < this.world.roomsPerRow) {
                            const targetRoom = this.world.getRoom(targetX, targetY);
                            if (targetRoom.containsWumpus() && ai.wumpusAlive) {
                                uiManager.addDecision(`⚠️ WARNING: About to move into Wumpus room at (${targetX}, ${targetY})!`);
                            }
                            if (targetRoom.containsPit()) {
                                uiManager.addDecision(`⚠️ WARNING: About to move into pit at (${targetX}, ${targetY})!`);
                            }
                        }
                    }
                    
                    // If AI returns no moves, try to find unexplored safe areas
                    if (nextMoveArray.length === 0) {
                        nextMoveArray = this.findAlternativeMove(ai);
                    }
                }

                if (nextMoveArray.length > 0) {
                    // Final safety check before executing move
                    const agentX = this.world.agent.position.x;
                    const agentY = this.world.agent.position.y;
                    let targetX = agentX, targetY = agentY;
                    
                    if (nextMoveArray[0] === 0) targetY--;
                    if (nextMoveArray[0] === 1) targetX++;
                    if (nextMoveArray[0] === 2) targetY++;
                    if (nextMoveArray[0] === 3) targetX--;
                    
                    // Check if target position is valid and safe
                    if (targetX >= 0 && targetX < this.world.roomsPerRow && 
                        targetY >= 0 && targetY < this.world.roomsPerRow) {
                        const targetRoom = this.world.getRoom(targetX, targetY);
                        
                        // CRITICAL: Never move into Wumpus room if Wumpus is alive
                        if (targetRoom.containsWumpus() && ai.wumpusAlive && this.world.agent.hasArrow) {
                            if (typeof uiManager !== 'undefined') {
                                uiManager.addDecision(`🚨 EMERGENCY: Blocking move into Wumpus room! Shooting instead!`);
                            }
                            // Force shoot instead of move
                            this.world.agent.direction = nextMoveArray[0];
                            this.world.agent.shoot();
                            ai.killWumpus = false;
                            ai.wumpusAlive = false;
                            if (this.world.wumpus) {
                                this.world.wumpus.kill();
                            }
                            wumpuskillingwaiter = 3;
                            nextMoveArray = [];
                            return; // Skip movement this turn
                        }
                        
                        // If we would move into Wumpus room but have no arrow, don't move
                        if (targetRoom.containsWumpus() && ai.wumpusAlive && !this.world.agent.hasArrow) {
                            if (typeof uiManager !== 'undefined') {
                                uiManager.addDecision(`🚨 CRITICAL: Cannot move into Wumpus room without arrow! Skipping move.`);
                            }
                            nextMoveArray = [];
                            return;
                        }
                    }
                    
                    // Execute the move
                    if (nextMoveArray[0] == 0) {
                        this.world.agent.up();
                    }
                    else if (nextMoveArray[0] == 1) {
                        this.world.agent.right();
                    }
                    else if (nextMoveArray[0] == 2) {
                        this.world.agent.down();
                    }
                    else if (nextMoveArray[0] == 3) {
                        this.world.agent.left();
                    }

                    nextMoveArray.shift();
                    
                    // Update knowledge base
                    this.updateKnowledgeBase();
                }
            }

            if (wumpuskillingwaiter > 0) {
                wumpuskillingwaiter--;
            }

        }, 600);        
    }
    
    findAlternativeMove(ai) {
        // Try to find any safe adjacent room
        const agentX = this.world.agent.position.x;
        const agentY = this.world.agent.position.y;
        const moves = [];
        
        // Check all four directions
        const directions = [
            [0, -1, 0], // up
            [1, 0, 1],  // right
            [0, 1, 2],  // down
            [-1, 0, 3]  // left
        ];
        
        for (let [dx, dy, dir] of directions) {
            const newX = agentX + dx;
            const newY = agentY + dy;
            
            if (newX >= 0 && newX < this.world.roomsPerRow && 
                newY >= 0 && newY < this.world.roomsPerRow) {
                
                // Check if this room is marked as safe in AI's knowledge
                if (ai.safeBoxMap[newY][newX] === 1) {
                    moves.push(dir);
                }
                // If unknown and no danger signals from adjacent rooms, consider it
                else if (ai.safeBoxMap[newY][newX] === 0 && ai.pathKnowledge[newY][newX] === 0) {
                    // Check if any adjacent visited room has danger signals
                    let isDangerous = false;
                    const adjacent = [
                        [newY-1, newX], [newY+1, newX], [newY, newX-1], [newY, newX+1]
                    ];
                    
                    for (let [adjRow, adjCol] of adjacent) {
                        if (ai.isBoxAvailable(adjRow, adjCol) && ai.pathKnowledge[adjRow][adjCol] > 0) {
                            if (ai.breezeKnowledge[adjRow][adjCol] === 1 || 
                                (ai.stenchKnowledge[adjRow][adjCol] === 1 && ai.wumpusAlive)) {
                                isDangerous = true;
                                break;
                            }
                        }
                    }
                    
                    if (!isDangerous) {
                        moves.push(dir);
                    }
                }
            }
        }
        
        if (moves.length > 0) {
            if (typeof uiManager !== 'undefined') {
                uiManager.addDecision("🔍 Finding alternative safe move");
            }
            return [moves[Math.floor(Math.random() * moves.length)]];
        }
        
        // If no safe moves found, return to a previously visited safe room
        for (let [dx, dy, dir] of directions) {
            const newX = agentX + dx;
            const newY = agentY + dy;
            
            if (newX >= 0 && newX < this.world.roomsPerRow && 
                newY >= 0 && newY < this.world.roomsPerRow) {
                
                if (ai.pathKnowledge[newY][newX] > 0) {
                    if (typeof uiManager !== 'undefined') {
                        uiManager.addDecision("🔄 Returning to previously visited safe room");
                    }
                    return [dir];
                }
            }
        }
        
        return [];
    }
    
    getMovementReasoning(direction) {
        const dirName = this.getDirectionName(direction);
        const currentRoom = this.world.agent.getCurrentRoom();
        let reasoning = `🚶 Moving ${dirName}`;
        
        if (currentRoom.containsStench()) {
            reasoning += " - Stench detected, being cautious";
        }
        if (currentRoom.containsBreeze()) {
            reasoning += " - Breeze detected, avoiding pits";
        }
        if (currentRoom.containsGold()) {
            reasoning += " - Gold found! 💰";
        }
        
        // Add AI reasoning about target cell
        const agentX = this.world.agent.position.x;
        const agentY = this.world.agent.position.y;
        let targetX = agentX, targetY = agentY;
        
        if (direction === 0) targetY--;
        if (direction === 1) targetX++;
        if (direction === 2) targetY++;
        if (direction === 3) targetX--;
        
        if (targetX >= 0 && targetX < this.world.roomsPerRow && 
            targetY >= 0 && targetY < this.world.roomsPerRow) {
            const targetRoom = this.world.getRoom(targetX, targetY);
            if (targetRoom.containsGold()) {
                reasoning += " - Targeting gold!";
            }
        }
        
        return reasoning;
    }
    
    getDirectionName(direction) {
        const directions = ['Up', 'Right', 'Down', 'Left'];
        return directions[direction] || 'Unknown';
    }
    
    updateKnowledgeBase() {
        if (typeof uiManager === 'undefined') return;
        
        const agentPos = this.world.agent.position;
        const currentRoom = this.world.agent.getCurrentRoom();
        
        // Update knowledge base through UI manager
        uiManager.updateKnowledgeFromRoom(agentPos, {
            hasStench: currentRoom.containsStench(),
            hasBreeze: currentRoom.containsBreeze(),
            hasGold: currentRoom.containsGold()
        });
    }
}
