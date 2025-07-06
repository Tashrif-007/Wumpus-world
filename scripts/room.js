class Room {
    constructor(pos, roomSize) {
        this.position = pos;
        this.size = roomSize;
        this.attributes = new Set();
        this.visible = false;
        this.objects = new Set();
        this.containsArrow = false;
        this.containsAgent = false;
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    isVisible() {
        return this.visible;
    }
    addAttribute(attr) {
        this.attributes.add(attr);
    }

    removeAttribute(attr) {
        this.attributes.delete(attr);
    }

    addObject(obj) {
        this.objects.add(obj);
    }

    removeObject(obj) {
        this.objects.delete(obj);
    }

    addArrow() {
        this.containsArrow = true;
        this.addAttribute("Arrow");
    }

    removeArrow() {
        this.containsArrow = false;
        this.removeAttribute("Arrow");
    }

    containsWumpus() {
        let result = false;
        this.objects.forEach(obj => {
            if (obj instanceof Wumpus) {
                result = true;
            }
        });
        return result;
    }

    containsPit() {
        let result = false;
        this.objects.forEach(obj => {
            if (obj instanceof Pit) {
                result = true;
            }
        });
        return result;
    }

    containsGold() {
        let result = false;
        this.objects.forEach(obj => {
            if (obj instanceof Gold) {
                result = true;
            }
        });
        return result;
    }

    containsBreeze() {
        return this.attributes.has("Breeze");
    }

    containsStench() {
        return this.attributes.has("Stench");
    }

    display() {
        strokeWeight(1);
        stroke(30);
        if (this.visible) {
            // Draw terrain background
            if (terrain_image) {
                image(terrain_image, this.position.x * this.size, this.position.y * this.size, this.size, this.size);
            } else {
                fill(240, 230, 140); // Sandy background
                rect(this.position.x * this.size, this.position.y * this.size, this.size, this.size);
            }
            
            noFill();
            rect(this.position.x * this.size, this.position.y * this.size, this.size, this.size);
            
            if (this.objects.size > 0) {
                this.objects.forEach(obj => {
                    obj.display();
                });
            } 
            
            // Display attribute text for stench/breeze
            if (this.attributes.size > 0) {
                fill(0);
                let size = this.size / 6 < 12 ? this.size / 6 : 12;
                textSize(size);
                textAlign(LEFT, TOP);
                strokeWeight(0.5);
                let s = "";
                let y_offset = 0;
                
                this.attributes.forEach((value) => {
                    if (value === "Stench" || value === "Breeze") {
                        s += value.charAt(0) + " ";
                    }
                });
                
                if (s.trim()) {
                    text(s.trim(), this.position.x * this.size + 5, this.position.y * this.size + 5);
                }
            }
        } 
        else {
            // Draw covered room
            if (cover_image) {
                image(cover_image, this.position.x * this.size, this.position.y * this.size, this.size, this.size);
            } else {
                fill(105, 105, 105); // Gray for unknown
                rect(this.position.x * this.size, this.position.y * this.size, this.size, this.size);
            }
            noFill();
            rect(this.position.x * this.size, this.position.y * this.size, this.size, this.size);
        }

        // Handle sound effects when agent is in this room
        if (this.containsAgent) {
            if (this.attributes.has("Breeze")) {
                if (wind_sound && wind_sound.length > 0) {
                    let playing = false;
                    wind_sound.forEach(sound => {
                        if (sound.isPlaying()) {
                            playing = true;
                        }
                    });
                    if (!playing) {
                        let windSound = wind_sound[getRandomInt(wind_sound.length)];
                        windSound.play();
                    }
                }
            } else if (wind_sound) {
                wind_sound.forEach(sound => {
                    if (sound.isPlaying()) {
                        sound.stop();
                    }
                });
            }

            if (this.attributes.has("Stench")) {
                if (flies_sound && !flies_sound.isPlaying()) {
                    flies_sound.loop();
                }
            } else if (flies_sound) {
                flies_sound.stop();
            }
        }
    }
    displayAsUnknown() {
        // Display unknown rooms as gray squares
        strokeWeight(1);
        stroke(30);
        fill(100); // Gray color for unknown
        rect(this.position.x * this.size, this.position.y * this.size, this.size, this.size);
        
        // Add question mark or unknown indicator
        fill(200);
        textSize(this.size / 4);
        textAlign(CENTER, CENTER);
        text("?", 
             this.position.x * this.size + this.size / 2, 
             this.position.y * this.size + this.size / 2);
    }

    // Fallback display method for testing
    displaySimple() {
        const roomSize = canvasSize / roomsPerRow; // Calculate room size
        const x = this.position.x * roomSize;
        const y = this.position.y * roomSize;
        
        // Draw room background
        if (this.visible) {
            fill(240, 230, 140); // Light yellow for visited
        } else {
            fill(105, 105, 105); // Gray for unvisited
        }
        
        stroke(0);
        strokeWeight(1);
        rect(x, y, roomSize, roomSize);
        
        // Draw text labels
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(10);
        
        if (this.visible) {
            let label = "";
            if (this.containsWumpus()) label += "W ";
            if (this.containsPit()) label += "P ";
            if (this.containsGold()) label += "G ";
            if (this.containsBreeze()) label += "B ";
            if (this.containsStench()) label += "S ";
            
            if (label) {
                text(label.trim(), x + roomSize/2, y + roomSize/2 - 5);
            }
        } else {
            text("?", x + roomSize/2, y + roomSize/2);
        }
    }

}