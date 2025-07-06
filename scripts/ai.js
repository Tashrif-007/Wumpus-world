class Ai {

    constructor(wholeWorldKnowledge) {
        
        this.wholeWorldKnowledge=wholeWorldKnowledge;
        this.worldSize=this.wholeWorldKnowledge.roomsPerRow;
        this.agentRow=this.worldSize - 1; // Start at bottom row
        this.agentCol=0; // Start at leftmost column
        this.pathKnowledge=[];
        this.pathKnowledgeInitialization();
        this.moves=[0,0,0,0];
        this.stenchKnowledge=[];
        this.breezeKnowledge=[];
        this.knowledgeBaseInitialization();
        this.deadlockBreakingBoxRow=0;
        this.deadlockBreakingBoxCol=0;
        this.safeBoxMap=[];
        this.safeBoxMapInitialization();
        this.wumpusAlive = true;
        this.killWumpus = false;
    }

    safeBoxMapInitialization() {
        for (var i = 0; i < this.worldSize; i++) {
            this.safeBoxMap.push(new Array());
            for (var j = 0; j < this.worldSize; j++) {
               this.safeBoxMap[i].push(-1);
            }
        }

        this.safeBoxMap[this.worldSize - 1][0]=1; // Bottom-left corner is safe
    }

    pathKnowledgeInitialization() {

        for (var i = 0; i < this.worldSize; i++) {
            this.pathKnowledge.push(new Array());
            for (var j = 0; j < this.worldSize; j++) {
               this.pathKnowledge[i].push(0);
            }
        }
        this.pathKnowledge[this.worldSize - 1][0]=1; // Bottom-left corner is visited
    }

    knowledgeBaseInitialization() {

        for (var i = 0; i < this.worldSize; i++) {
            this.breezeKnowledge.push(new Array());
            this.stenchKnowledge.push(new Array());
            for (var j = 0; j < this.worldSize; j++) {
                this.breezeKnowledge[i].push(0);
                this.stenchKnowledge[i].push(0);
            }
        }
        this.breezeKnowledge[this.worldSize - 1][0]=-1; // Bottom-left corner knowledge
        this.stenchKnowledge[this.worldSize - 1][0]=-1; // Bottom-left corner knowledge
    }

    ifShootWumpus() {
        let stenchCounter = 0;
        let numberOfAvailableBoxes = 0;
        let stenchData = [];
        for (var i = 0; i < this.worldSize; i++) {
            for (var j = 0; j < this.worldSize; j++) {
                stenchCounter=0;
                numberOfAvailableBoxes = 0;
                if (this.isBoxAvailable(i+1,j))
                {
                    numberOfAvailableBoxes++;
                    if (this.stenchKnowledge[i+1][j]==1)
                    {
                        stenchCounter++;
                    }
                    else if (this.stenchKnowledge[i+1][j]==-1)
                    {
                        continue;
                    }
                }
                if (this.isBoxAvailable(i-1,j))
                {
                    numberOfAvailableBoxes++;
                    if (this.stenchKnowledge[i-1][j]==1)
                    {
                        stenchCounter++;
                    }
                    else if (this.stenchKnowledge[i-1][j]==-1)
                    {
                        continue;
                    }
                }
                if (this.isBoxAvailable(i,j+1))
                {
                    numberOfAvailableBoxes++;
                    if (this.stenchKnowledge[i][j+1]==1)
                    {
                        stenchCounter++;
                    }
                    else if (this.stenchKnowledge[i][j+1]==-1)
                    {
                        continue;
                    }
                }
                if (this.isBoxAvailable(i,j-1))
                {
                    numberOfAvailableBoxes++;
                    if (this.stenchKnowledge[i][j-1]==1)
                    {
                        stenchCounter++;
                    }
                    else if (this.stenchKnowledge[i][j-1]==-1)
                    {
                        continue;
                    }
                }

                let wumpusBox = new Unsafeboxcost (i, j, parseFloat(stenchCounter/numberOfAvailableBoxes));

                stenchData.push(wumpusBox);
            }
        }

        let maxCost = -10;
        let finalBox = stenchData[0];
        
        for (var i = 0; i < stenchData.length; i++) {
            if (stenchData[i].cost>maxCost)
            {
                maxCost = stenchData[i].cost;
                finalBox = stenchData[i];
            }
        }

        let row = finalBox.row;
        let col = finalBox.col;

        if (finalBox.cost==0)
        {
            return [-1,-1];
        }
        else
        {
            return [row,col];
        }
    }

    handleWumpusKilling(nextMoveArray) {
        let wumpusBox = this.ifShootWumpus();
        if (!(wumpusBox[0]==-1||wumpusBox[1]==-1))
        {
            let row = wumpusBox[0];
            let col = wumpusBox[1];

            nextMoveArray = [];

            nextMoveArray = this.calculateQueueOfMoves(row, col);

            this.deadlockBreakingBoxRow = row;
            this.deadlockBreakingBoxCol = col;

            this.updateStenchAfterKillingWumpus(row, col);

            this.killWumpus = true;

            return nextMoveArray;
        }

        return nextMoveArray;
    }

    updateStenchAfterKillingWumpus(row, col) {
      
        if (this.wholeWorldKnowledge.getRoom(col,row).containsWumpus())
        {
            if (this.isBoxAvailable(row,col+1))
            {
                this.stenchKnowledge[row][col+1]=-1;
            }
            if (this.isBoxAvailable(row+1,col))
            {
                this.stenchKnowledge[row+1][col]=-1;
            }     
            if (this.isBoxAvailable(row-1,col))
            {
                this.stenchKnowledge[row-1][col]=-1;
            }        
            if (this.isBoxAvailable(row,col-1))
            {
                this.stenchKnowledge[row][col-1]=-1;
            }

            this.wumpusAlive = false;
        }
    }

    getNextMove() {
        this.calculateAvailableMoves();
        this.calculateSafeMoves();
        
        // First priority: Check if we should shoot Wumpus before moving
        let shootDirection = this.shouldShootWumpus();
        if (shootDirection !== -1 && this.wholeWorldKnowledge.agent.hasArrow && this.wumpusAlive) {
            this.killWumpus = true;
            return [shootDirection];
        }
        
        let nextMoveArray = this.finalMove();

        if (!this.isDeadlock())
        {
            if (nextMoveArray.length>1)
            {
                this.updateKnowledgeBase(this.deadlockBreakingBoxRow, this.deadlockBreakingBoxCol);
                this.agentRow=this.deadlockBreakingBoxRow;
                this.agentCol=this.deadlockBreakingBoxCol;
            }
            else
            {
                // Before making any move, check if we're about to enter a dangerous room
                let targetRow = this.agentRow;
                let targetCol = this.agentCol;
                
                if(nextMoveArray[0]==0) {
                    targetRow = this.agentRow-1;
                }
                if(nextMoveArray[0]==1) {
                    targetCol = this.agentCol+1;
                }
                if(nextMoveArray[0]==2) {
                    targetRow = this.agentRow+1;
                }
                if(nextMoveArray[0]==3) {
                    targetCol = this.agentCol-1;
                }
                
                // Check if target room might have Wumpus - HIGH PRIORITY CHECK
                if (this.isWumpusLikelyInRoom(targetRow, targetCol) && this.wumpusAlive) {
                    // MUST NOT MOVE THERE! Shoot first if possible
                    if (this.wholeWorldKnowledge.agent.hasArrow) {
                        let shootDir = this.getShootDirectionForMove(nextMoveArray[0]);
                        if (shootDir !== -1) {
                            this.killWumpus = true;
                            return [shootDir];
                        }
                    }
                    
                    // If we can't shoot, try to find alternative safe move
                    let alternativeMove = this.findSafeAlternativeMove();
                    if (alternativeMove !== -1) {
                        nextMoveArray = [alternativeMove];
                        // Update target position for safe move
                        if(alternativeMove==0) {
                            targetRow = this.agentRow-1;
                            targetCol = this.agentCol;
                        }
                        if(alternativeMove==1) {
                            targetRow = this.agentRow;
                            targetCol = this.agentCol+1;
                        }
                        if(alternativeMove==2) {
                            targetRow = this.agentRow+1;
                            targetCol = this.agentCol;
                        }
                        if(alternativeMove==3) {
                            targetRow = this.agentRow;
                            targetCol = this.agentCol-1;
                        }
                    } else {
                        // No safe alternative and can't shoot - avoid this move entirely
                        return [];
                    }
                }
                
                // Update position after safe move
                if(nextMoveArray[0]==0) {
                    this.updateKnowledgeBase(this.agentRow-1,this.agentCol);
                    this.agentRow=this.agentRow-1;
                }
                if(nextMoveArray[0]==1) {
                    this.updateKnowledgeBase(this.agentRow,this.agentCol+1);
                    this.agentCol=this.agentCol+1;
                }
                if(nextMoveArray[0]==2) {
                    this.updateKnowledgeBase(this.agentRow+1,this.agentCol);
                    this.agentRow=this.agentRow+1;
                }
                if(nextMoveArray[0]==3) {
                    this.updateKnowledgeBase(this.agentRow,this.agentCol-1);
                    this.agentCol=this.agentCol-1;
                }
            }
        }
        else
        {
            nextMoveArray = this.handleWumpusKilling(nextMoveArray);
            this.updateKnowledgeBase(this.deadlockBreakingBoxRow, this.deadlockBreakingBoxCol);
            this.agentRow=this.deadlockBreakingBoxRow;
            this.agentCol=this.deadlockBreakingBoxCol;
        }

        this.safeBoxMap[this.agentRow][this.agentCol]=1;
        
        this.moves=[0,0,0,0];
        return nextMoveArray;
    }

    updateKnowledgeBase(row, col) {
        this.pathKnowledge[row][col]++;
        
        // Update breeze knowledge
        if (this.wholeWorldKnowledge.getRoom(col,row).containsBreeze())
        {
            this.breezeKnowledge[row][col]=1;
        }
        else
        {
            this.breezeKnowledge[row][col]=-1;
        }

        // Update stench knowledge
        if (this.wholeWorldKnowledge.getRoom(col,row).containsStench()&&this.wumpusAlive==true)
        {
            this.stenchKnowledge[row][col]=1;
        }
        else
        {
            this.stenchKnowledge[row][col]=-1;
        }
        
        // Perform knowledge inference after updating
        this.inferKnowledge(row, col);
    }
    
    inferKnowledge(currentRow, currentCol) {
        // If current cell has no stench, then adjacent cells that were suspected to have Wumpus are now safe
        if (this.stenchKnowledge[currentRow][currentCol] === -1) {
            this.clearWumpusSuspicions(currentRow, currentCol);
        }
        
        // If current cell has no breeze, then adjacent cells that were suspected to have pit are now safe  
        if (this.breezeKnowledge[currentRow][currentCol] === -1) {
            this.clearPitSuspicions(currentRow, currentCol);
        }
        
        // If current cell has stench, mark adjacent unvisited cells as potentially dangerous
        if (this.stenchKnowledge[currentRow][currentCol] === 1) {
            this.markWumpusSuspicions(currentRow, currentCol);
        }
        
        // If current cell has breeze, mark adjacent unvisited cells as potentially dangerous
        if (this.breezeKnowledge[currentRow][currentCol] === 1) {
            this.markPitSuspicions(currentRow, currentCol);
        }
        
        // Perform logical deduction
        this.performLogicalDeduction();
    }
    
    clearWumpusSuspicions(row, col) {
        const adjacent = [
            [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ];
        
        for (let [adjRow, adjCol] of adjacent) {
            if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] === 0) {
                // If this adjacent cell was suspected to have Wumpus, clear that suspicion
                if (this.safeBoxMap[adjRow][adjCol] === -1) {
                    // Check if any other visited adjacent cells have stench
                    let hasOtherStenchSource = false;
                    const adjAdjacent = [
                        [adjRow-1, adjCol], [adjRow+1, adjCol], [adjRow, adjCol-1], [adjRow, adjCol+1]
                    ];
                    
                    for (let [adjAdjRow, adjAdjCol] of adjAdjacent) {
                        if (this.isBoxAvailable(adjAdjRow, adjAdjCol) && 
                            this.pathKnowledge[adjAdjRow][adjAdjCol] > 0 && 
                            this.stenchKnowledge[adjAdjRow][adjAdjCol] === 1 &&
                            !(adjAdjRow === row && adjAdjCol === col)) {
                            hasOtherStenchSource = true;
                            break;
                        }
                    }
                    
                    if (!hasOtherStenchSource) {
                        this.safeBoxMap[adjRow][adjCol] = 1; // Mark as safe
                    }
                }
            }
        }
    }
    
    clearPitSuspicions(row, col) {
        const adjacent = [
            [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ];
        
        for (let [adjRow, adjCol] of adjacent) {
            if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] === 0) {
                // If this adjacent cell was suspected to have pit, clear that suspicion
                if (this.safeBoxMap[adjRow][adjCol] === -1) {
                    // Check if any other visited adjacent cells have breeze
                    let hasOtherBreezeSource = false;
                    const adjAdjacent = [
                        [adjRow-1, adjCol], [adjRow+1, adjCol], [adjRow, adjCol-1], [adjRow, adjCol+1]
                    ];
                    
                    for (let [adjAdjRow, adjAdjCol] of adjAdjacent) {
                        if (this.isBoxAvailable(adjAdjRow, adjAdjCol) && 
                            this.pathKnowledge[adjAdjRow][adjAdjCol] > 0 && 
                            this.breezeKnowledge[adjAdjRow][adjAdjCol] === 1 &&
                            !(adjAdjRow === row && adjAdjCol === col)) {
                            hasOtherBreezeSource = true;
                            break;
                        }
                    }
                    
                    if (!hasOtherBreezeSource) {
                        this.safeBoxMap[adjRow][adjCol] = 1; // Mark as safe
                    }
                }
            }
        }
    }
    
    markWumpusSuspicions(row, col) {
        const adjacent = [
            [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ];
        
        for (let [adjRow, adjCol] of adjacent) {
            if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] === 0) {
                // Mark unvisited adjacent cells as potentially dangerous
                if (this.safeBoxMap[adjRow][adjCol] === 0) {
                    this.safeBoxMap[adjRow][adjCol] = -1; // Mark as potentially dangerous
                }
            }
        }
    }
    
    markPitSuspicions(row, col) {
        const adjacent = [
            [row-1, col], [row+1, col], [row, col-1], [row, col+1]
        ];
        
        for (let [adjRow, adjCol] of adjacent) {
            if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] === 0) {
                // Mark unvisited adjacent cells as potentially dangerous
                if (this.safeBoxMap[adjRow][adjCol] === 0) {
                    this.safeBoxMap[adjRow][adjCol] = -1; // Mark as potentially dangerous
                }
            }
        }
    }
    
    performLogicalDeduction() {
        // For each visited cell with stench, check if we can deduce Wumpus location
        for (let row = 0; row < this.worldSize; row++) {
            for (let col = 0; col < this.worldSize; col++) {
                if (this.pathKnowledge[row][col] > 0) {
                    this.deduceFromStench(row, col);
                    this.deduceFromBreeze(row, col);
                }
            }
        }
    }
    
    deduceFromStench(row, col) {
        if (this.stenchKnowledge[row][col] === 1) {
            // Count adjacent dangerous cells
            const adjacent = [
                [row-1, col], [row+1, col], [row, col-1], [row, col+1]
            ];
            
            let dangerousCells = [];
            let safeCells = 0;
            
            for (let [adjRow, adjCol] of adjacent) {
                if (this.isBoxAvailable(adjRow, adjCol)) {
                    if (this.safeBoxMap[adjRow][adjCol] === -1) {
                        dangerousCells.push([adjRow, adjCol]);
                    } else if (this.safeBoxMap[adjRow][adjCol] === 1 || this.pathKnowledge[adjRow][adjCol] > 0) {
                        safeCells++;
                    }
                }
            }
            
            // If only one dangerous cell remains, it must have the Wumpus
            if (dangerousCells.length === 1) {
                // This cell definitely has Wumpus - but don't mark it as safe yet
                // We'll handle it in shooting logic
            }
        }
    }
    
    deduceFromBreeze(row, col) {
        if (this.breezeKnowledge[row][col] === 1) {
            // Count adjacent dangerous cells
            const adjacent = [
                [row-1, col], [row+1, col], [row, col-1], [row, col+1]
            ];
            
            let dangerousCells = [];
            let safeCells = 0;
            
            for (let [adjRow, adjCol] of adjacent) {
                if (this.isBoxAvailable(adjRow, adjCol)) {
                    if (this.safeBoxMap[adjRow][adjCol] === -1) {
                        dangerousCells.push([adjRow, adjCol]);
                    } else if (this.safeBoxMap[adjRow][adjCol] === 1 || this.pathKnowledge[adjRow][adjCol] > 0) {
                        safeCells++;
                    }
                }
            }
            
            // If only one dangerous cell remains, it must have a pit
            if (dangerousCells.length === 1) {
                // This cell definitely has pit - keep it marked as dangerous
            }
        }
    }

    isDeadlock()
    {
        let flagForDeadlock = true;
        for (let i=0; i<this.safeBoxMap.length; i++)
        {
            for (let j=0; j<this.safeBoxMap.length; j++)
            {
                if (this.safeBoxMap[i][j]==0)
                {
                    flagForDeadlock = false;
                }
            }
        }

        return flagForDeadlock;
    }

    finalMove() {
        let bestMove = 0;
        let bestMoveArray = [];
        let bestMoveCost = 9999999;
        for (var i = 0; i < this.moves.length; i++) {
            if (this.moves[i]>-1)
            {
                if(this.moves[i]<bestMoveCost)
                {
                    bestMove = i;
                    bestMoveCost=this.moves[i];
                }
            }
        }

        if (this.isDeadlock())
        {
            bestMoveArray = this.handleDeadlockSituation();
        }
        else if (bestMoveCost>0)
        {
            let minimumDistance = 99999;
            let minRow;
            let minCol;
            for (var i = 0; i < this.worldSize; i++) {
                for (var j = 0; j < this.worldSize; j++) {
                   if (this.safeBoxMap[i][j]==0)
                   {
                       if ((((this.agentRow-i)*(this.agentRow-i))+((this.agentCol-j)*(this.agentCol-j)))<minimumDistance)
                       {
                           minimumDistance = ((this.agentRow-i)*(this.agentRow-i))+((this.agentCol-j)*(this.agentCol-j));
                           minRow = i;
                           minCol = j;
                       }
                   }
                }
            }

            bestMoveArray = this.calculateQueueOfMoves(minRow, minCol);

            this.deadlockBreakingBoxRow = minRow;
            this.deadlockBreakingBoxCol = minCol;
        }
        else
        {
            bestMoveArray.push(bestMove);
        }

        return bestMoveArray;
    }

    handleDeadlockSituation() {

        let unSafeBoxCostArray = [];
        for (var i = 0; i < this.worldSize; i++) {
            for (var j = 0; j < this.worldSize; j++) {
                if (this.breezeKnowledge[i][j]==0)
                {
                    let row = i;
                    let col = j;

                    let numberOfThreats = 0;
                    let numberOfAvailableBoxes = 0;

                    if (this.isBoxAvailable(row,col+1))
                    {
                        numberOfAvailableBoxes++;
                        if(this.breezeKnowledge[row][col+1]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                        if(this.stenchKnowledge[row][col+1]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                    }
                    if (this.isBoxAvailable(row+1,col))
                    {
                        numberOfAvailableBoxes++;
                        if(this.breezeKnowledge[row+1][col]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                        if(this.stenchKnowledge[row+1][col]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                    }
                    if (this.isBoxAvailable(row-1,col))
                    {
                        numberOfAvailableBoxes++;
                        if(this.breezeKnowledge[row-1][col]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                        if(this.stenchKnowledge[row-1][col]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                    }
                    if (this.isBoxAvailable(row,col-1))
                    {
                        numberOfAvailableBoxes++;
                        if(this.breezeKnowledge[row][col-1]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                        if(this.stenchKnowledge[row][col-1]==1)
                        {
                            numberOfThreats = (numberOfThreats+1)*(numberOfThreats+1);
                        }
                    }

                    let unSafeBox = new Unsafeboxcost (row, col, parseFloat(numberOfThreats/numberOfAvailableBoxes));

                    unSafeBoxCostArray.push(unSafeBox);
                }
            }
        }

        let arrayOfMoves = this.calculateBestBoxForDeadlock(unSafeBoxCostArray);

        return arrayOfMoves;
    }

    calculateBestBoxForDeadlock(unSafeBoxCostArray)
    {
        let maxCost = -10;
        let finalBox = unSafeBoxCostArray[0];
        
        for (var i = 0; i < unSafeBoxCostArray.length; i++) {
            if (unSafeBoxCostArray[i].cost>maxCost)
            {
                maxCost = unSafeBoxCostArray[i].cost;
                finalBox = unSafeBoxCostArray[i];
            }
        }

        let row = finalBox.row;
        let col = finalBox.col;

        let flag = true;

        if (this.isBoxAvailable(row+1,col)&&(this.breezeKnowledge[row+1][col]==1||this.stenchKnowledge[row+1][col]==1))
        {
            if (this.isBoxAvailable(row+1,col+1)&&this.pathKnowledge[row+1][col+1]==0)
            {
                row = row+1;
                col = col+1;
                flag = false;
            }
            else if (this.isBoxAvailable(row+1,col-1)&&this.pathKnowledge[row+1][col-1]==0)
            {
                row = row+1;
                col = col-1;
                flag = false;
            }
        }
        if (this.isBoxAvailable(row,col+1)&&(this.breezeKnowledge[row][col+1]==1||this.stenchKnowledge[row][col+1]==1)&&flag==true)
        {
            if (this.isBoxAvailable(row+1,col+1)&&this.pathKnowledge[row+1][col+1]==0)
            {
                row = row+1;
                col = col+1;
                flag = false;
            }
            else if (this.isBoxAvailable(row-1,col+1)&&this.pathKnowledge[row-1][col+1]==0)
            {
                row = row-1;
                col = col+1;
                flag = false;
            }
        }
        if (this.isBoxAvailable(row-1,col)&&(this.breezeKnowledge[row-1][col]==1||this.stenchKnowledge[row-1][col]==1)&&flag==true)
        {
            if (this.isBoxAvailable(row-1,col+1)&&this.pathKnowledge[row-1][col+1]==0)
            {
                row = row-1;
                col = col+1;
                flag = false;
            }
            else if (this.isBoxAvailable(row-1,col-1)&&this.pathKnowledge[row-1][col-1]==0)
            {
                row = row-1;
                col = col-1;
                flag = false;
            }
        }
        if (this.isBoxAvailable(row,col-1)&&(this.breezeKnowledge[row][col-1]==1||this.stenchKnowledge[row][col-1]==1)&&flag==true)
        {
            if (this.isBoxAvailable(row+1,col-1)&&this.pathKnowledge[row+1][col-1]==0)
            {
                row = row+1;
                col = col-1;
                flag = false;
            }
            else if (this.isBoxAvailable(row-1,col-1)&&this.pathKnowledge[row-1][col-1]==0)
            {
                row = row-1;
                col = col-1;
                flag = false;
            }
        }

        if (flag==true&&unSafeBoxCostArray.length>1)
        {
            unSafeBoxCostArray.splice(unSafeBoxCostArray.indexOf(finalBox), 1);
            return this.calculateBestBoxForDeadlock(unSafeBoxCostArray);
        }

        let arrayOfMoves = this.calculateQueueOfMoves(row, col);

        this.deadlockBreakingBoxRow=row;
        this.deadlockBreakingBoxCol=col;

        return arrayOfMoves;
    }

    calculateQueueOfMoves(row, col)
    {
        let pathMap = [];
        for (var i = 0; i < this.worldSize; i++) {
            pathMap.push(new Array());
            for (var j = 0; j < this.worldSize; j++) {
               if (this.pathKnowledge[i][j]==0)
               {
                   pathMap[i][j]=-1;
               }
               else
               {
                   pathMap[i][j]=0;
               }
            }
        }

        pathMap[row][col]=0;

        let arrayOfMoves = this.recursion([this.agentRow, this.agentCol], pathMap, row, col, [], 0);

        arrayOfMoves.shift();

        return arrayOfMoves;
    }

    recursion (currentBox, pathMap, row, col, arrayOfMoves, move)
    {
        pathMap[currentBox[0]][currentBox[1]] = -1;
        arrayOfMoves.push(move);
 
        if (currentBox[0]==row&&currentBox[1]==col)
        {
            return arrayOfMoves;
        }

        let a, b, c, d;

        if (this.isBoxAvailable(currentBox[0],currentBox[1]-1)&&pathMap[currentBox[0]][currentBox[1]-1]==0)
        {
            let c1 = [...arrayOfMoves];
            let pathMapC = [...pathMap];
            c = this.recursion([currentBox[0],currentBox[1]-1], pathMapC, row, col, c1, 3);
        }
        if (this.isBoxAvailable(currentBox[0]+1,currentBox[1])&&pathMap[currentBox[0]+1][currentBox[1]]==0)
        {
            let a1 = [...arrayOfMoves];
            let pathMapA = [...pathMap];
            a = this.recursion([currentBox[0]+1,currentBox[1]], pathMapA, row, col, a1, 2);
        }
        if (this.isBoxAvailable(currentBox[0],currentBox[1]+1)&&pathMap[currentBox[0]][currentBox[1]+1]==0)
        {
            let b1 = [...arrayOfMoves];
            let pathMapB = [...pathMap];
            b= this.recursion([currentBox[0],currentBox[1]+1], pathMapB, row, col, b1, 1);
        }
        if (this.isBoxAvailable(currentBox[0]-1,currentBox[1])&&pathMap[currentBox[0]-1][currentBox[1]]==0)
        {
            let d1 = [...arrayOfMoves];
            let pathMapD = [...pathMap];
            d = this.recursion([currentBox[0]-1,currentBox[1]], pathMapD, row, col, d1, 0);
        }

        // let resultArray = [];

        if (a!=null||a!=undefined)
        {
            return a; //resultArray.push(a);
        }
        else if (b!=null||b!=undefined)
        {
            return b; //resultArray.push(b);
        }
        else if (c!=null||c!=undefined)
        {
            return c; //resultArray.push(c);
        }
        else if (d!=null||d!=undefined)
        {
            return d; //resultArray.push(d);
        }

        // let size = 99999;

        // let finalMoves;

        // for (let i=0; i<resultArray.length; i++)
        // {
        //     if (resultArray[i].length<size)
        //     {
        //         finalMoves = resultArray[i];
        //         size = resultArray[i].length;
        //     }
        // }

        // if (finalMoves!=null||finalMoves!=undefined)
        // {
        //     return finalMoves;
        // }
    }

    isMoveSafe(row,col) {
        
        if (row==this.deadlockBreakingBoxRow&&col==this.deadlockBreakingBoxCol)
        {
            return true;
        }
        
        // Check if this room itself is known to be safe
        if (this.safeBoxMap[row][col] === 1) {
            return true;
        }
        
        // Never enter a room marked as dangerous (suspected pit or Wumpus)
        if (this.safeBoxMap[row][col] === -1) {
            return false;
        }
        
        // Don't enter a room if we suspect Wumpus is there and it's alive
        if (this.wumpusAlive && this.isWumpusLikelyInRoom(row, col)) {
            return false;
        }
        
        // If we haven't visited this room yet, check adjacent rooms for safety
        if (this.pathKnowledge[row][col] === 0) {
            // Check if any adjacent visited room has dangerous signals
            const adjacent = [
                [row-1, col], [row+1, col], [row, col-1], [row, col+1]
            ];
            
            for (let [adjRow, adjCol] of adjacent) {
                if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] > 0) {
                    // If adjacent room has breeze, this room might have pit
                    if (this.breezeKnowledge[adjRow][adjCol] === 1) {
                        return false;
                    }
                    // If adjacent room has stench and Wumpus is alive, this room might have Wumpus
                    if (this.stenchKnowledge[adjRow][adjCol] === 1 && this.wumpusAlive) {
                        return false;
                    }
                }
            }
            
            // If no adjacent room gives warning signals, it's probably safe
            return true;
        }
        
        // If we've been here before, it's safe
        return true;
    }

    isBoxAvailable (row, col)
    {
        if (row<0||row>this.worldSize-1||col<0||col>this.worldSize-1)
        {
            return false;
        }
        return true;
    }

    calculateSafeMoves() {
        for (var i = 0; i < this.moves.length; i++) {
            if (this.moves[i]!=-1)
            {
                if (i==0)
                {
                    if (this.isMoveSafe(this.agentRow-1,this.agentCol)==true)
                    {
                        this.moves[i]=this.pathKnowledge[this.agentRow-1][this.agentCol];
                        // Mark unknown safe rooms as explored targets
                        if (this.moves[i]==0 && this.safeBoxMap[this.agentRow-1][this.agentCol] === 0)
                        {
                            this.safeBoxMap[this.agentRow-1][this.agentCol]=0;
                        }
                    }
                    else
                    {
                        this.moves[i]=-1;
                    }
                }
                if (i==1)
                {
                    if (this.isMoveSafe(this.agentRow,this.agentCol+1)==true)
                    {
                        this.moves[i]=this.pathKnowledge[this.agentRow][this.agentCol + 1];
                        // Mark unknown safe rooms as explored targets
                        if (this.moves[i]==0 && this.safeBoxMap[this.agentRow][this.agentCol+1] === 0)
                        {
                            this.safeBoxMap[this.agentRow][this.agentCol+1]=0;
                        }
                    }
                    else
                    {
                        this.moves[i]=-1;
                    }
                }
                if (i==2)
                {
                    if (this.isMoveSafe(this.agentRow+1,this.agentCol)==true)
                    {
                        this.moves[i]=this.pathKnowledge[this.agentRow+1][this.agentCol];
                        // Mark unknown safe rooms as explored targets
                        if (this.moves[i]==0 && this.safeBoxMap[this.agentRow+1][this.agentCol] === 0)
                        {
                            this.safeBoxMap[this.agentRow+1][this.agentCol]=0;
                        }
                    }
                    else
                    {
                        this.moves[i]=-1;
                    }
                }
                if (i==3)
                {
                    if (this.isMoveSafe(this.agentRow,this.agentCol-1)==true)
                    {
                        this.moves[i]=this.pathKnowledge[this.agentRow][this.agentCol-1];
                        // Mark unknown safe rooms as explored targets
                        if (this.moves[i]==0 && this.safeBoxMap[this.agentRow][this.agentCol-1] === 0)
                        {
                            this.safeBoxMap[this.agentRow][this.agentCol-1]=0;
                        }
                    }
                    else
                    {
                        this.moves[i]=-1;
                    }
                }
            }
        }
    }

    calculateAvailableMoves() {
        if(this.agentRow==0)
        {
            this.moves[0]=-1;
        }
        if(this.agentRow==this.worldSize-1)
        {
            this.moves[2]=-1;
        }
        if(this.agentCol==0)
        {
            this.moves[3]=-1;
        }
        if(this.agentCol==this.worldSize-1)
        {
            this.moves[1]=-1;
        }
    }

    // Check if we should shoot the Wumpus from current position
    shouldShootWumpus() {
        if (!this.wumpusAlive || !this.wholeWorldKnowledge.agent.hasArrow) {
            return -1;
        }
        
        // Check all four directions for potential Wumpus
        const directions = [
            [-1, 0, 0], // up
            [0, 1, 1],  // right  
            [1, 0, 2],  // down
            [0, -1, 3]  // left
        ];
        
        for (let [dRow, dCol, direction] of directions) {
            // Check if there's a Wumpus in this direction
            for (let distance = 1; distance < this.worldSize; distance++) {
                const targetRow = this.agentRow + (dRow * distance);
                const targetCol = this.agentCol + (dCol * distance);
                
                if (!this.isBoxAvailable(targetRow, targetCol)) {
                    break; // Out of bounds
                }
                
                // Check if this room likely contains Wumpus
                if (this.isWumpusLikelyInRoom(targetRow, targetCol)) {
                    return direction;
                }
                
                // If we've visited this room and it's safe, continue checking further
                if (this.pathKnowledge[targetRow][targetCol] > 0 && 
                    this.stenchKnowledge[targetRow][targetCol] === -1) {
                    continue;
                }
                
                // If we haven't visited this room and it's adjacent to a stench, 
                // it could be dangerous, but we need to check more carefully
                if (this.pathKnowledge[targetRow][targetCol] === 0) {
                    // Check if any adjacent rooms (that we've visited) have stench
                    let hasAdjacentStench = false;
                    const adjacent = [
                        [targetRow-1, targetCol], [targetRow+1, targetCol], 
                        [targetRow, targetCol-1], [targetRow, targetCol+1]
                    ];
                    
                    for (let [adjRow, adjCol] of adjacent) {
                        if (this.isBoxAvailable(adjRow, adjCol) && 
                            this.pathKnowledge[adjRow][adjCol] > 0 && 
                            this.stenchKnowledge[adjRow][adjCol] === 1) {
                            hasAdjacentStench = true;
                            break;
                        }
                    }
                    
                    if (hasAdjacentStench) {
                        return direction;
                    }
                }
            }
        }
        
        return -1;
    }
    
    // Check if a room likely contains the Wumpus based on stench knowledge
    isWumpusLikelyInRoom(row, col) {
        if (!this.isBoxAvailable(row, col)) {
            return false;
        }
        
        // If we know there's no stench here, no Wumpus
        if (this.stenchKnowledge[row][col] === -1) {
            return false;
        }
        
        // If we haven't visited this room but adjacent rooms have stench, it's dangerous
        if (this.pathKnowledge[row][col] === 0) {
            // Check if adjacent rooms have stench
            let adjacentStenchCount = 0;
            let adjacentVisitedCount = 0;
            
            const adjacent = [
                [row-1, col], [row+1, col], [row, col-1], [row, col+1]
            ];
            
            for (let [adjRow, adjCol] of adjacent) {
                if (this.isBoxAvailable(adjRow, adjCol) && this.pathKnowledge[adjRow][adjCol] > 0) {
                    adjacentVisitedCount++;
                    if (this.stenchKnowledge[adjRow][adjCol] === 1) {
                        adjacentStenchCount++;
                    }
                }
            }
            
            // If any adjacent visited room has stench, this room is dangerous
            // Be very conservative - even one stench makes it dangerous
            return adjacentStenchCount > 0 && adjacentVisitedCount > 0;
        }
        
        return false;
    }
    
    // Find a safe alternative move when current path is dangerous
    findSafeAlternativeMove() {
        const directions = [0, 1, 2, 3]; // up, right, down, left
        
        for (let direction of directions) {
            let targetRow = this.agentRow;
            let targetCol = this.agentCol;
            
            if (direction === 0) targetRow--;
            if (direction === 1) targetCol++;
            if (direction === 2) targetRow++;
            if (direction === 3) targetCol--;
            
            // Check if this move is within bounds
            if (!this.isBoxAvailable(targetRow, targetCol)) {
                continue;
            }
            
            // Check if this room is known to be safe
            if (this.safeBoxMap[targetRow][targetCol] === 1) {
                return direction;
            }
            
            // Check if this room is unvisited but seems safe
            if (this.pathKnowledge[targetRow][targetCol] === 0) {
                // Only consider it safe if no adjacent visited rooms have stench or breeze
                let isSafe = true;
                const adjacent = [
                    [targetRow-1, targetCol], [targetRow+1, targetCol],
                    [targetRow, targetCol-1], [targetRow, targetCol+1]
                ];
                
                for (let [adjRow, adjCol] of adjacent) {
                    if (this.isBoxAvailable(adjRow, adjCol) && 
                        this.pathKnowledge[adjRow][adjCol] > 0) {
                        if (this.stenchKnowledge[adjRow][adjCol] === 1 || 
                            this.breezeKnowledge[adjRow][adjCol] === 1) {
                            isSafe = false;
                            break;
                        }
                    }
                }
                
                if (isSafe) {
                    return direction;
                }
            }
        }
        
        return -1;
    }
    
    // Get the shooting direction for a planned move
    getShootDirectionForMove(moveDirection) {
        // The shooting direction is the same as move direction
        return moveDirection;
   }

    // Debug method to show current knowledge state
    debugKnowledge() {
        console.log("=== AI Knowledge State ===");
        console.log("Agent position:", this.agentRow, this.agentCol);
        console.log("Wumpus alive:", this.wumpusAlive);
        console.log("Safe box map:");
        for (let row = 0; row < this.worldSize; row++) {
            let rowStr = "";
            for (let col = 0; col < this.worldSize; col++) {
                if (this.safeBoxMap[row][col] === 1) rowStr += "S ";
                else if (this.safeBoxMap[row][col] === -1) rowStr += "D ";
                else rowStr += "? ";
            }
            console.log(rowStr);
        }
        console.log("Stench knowledge:");
        for (let row = 0; row < this.worldSize; row++) {
            let rowStr = "";
            for (let col = 0; col < this.worldSize; col++) {
                if (this.stenchKnowledge[row][col] === 1) rowStr += "Y ";
                else if (this.stenchKnowledge[row][col] === -1) rowStr += "N ";
                else rowStr += "? ";
            }
            console.log(rowStr);
        }
        console.log("Breeze knowledge:");
        for (let row = 0; row < this.worldSize; row++) {
            let rowStr = "";
            for (let col = 0; col < this.worldSize; col++) {
                if (this.breezeKnowledge[row][col] === 1) rowStr += "Y ";
                else if (this.breezeKnowledge[row][col] === -1) rowStr += "N ";
                else rowStr += "? ";
            }
            console.log(rowStr);
        }
        console.log("========================");
    }
}