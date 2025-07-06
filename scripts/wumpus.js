class Wumpus {
    constructor(pos, world) {
        this.position = pos;
        this.world = world;
        this.alive = true;
    }

    isVisible() {
        return this.world.roomIsVisible(this.position.x, this.position.y);
    }

    kill() {
        this.alive = false;
        
        // Remove stench from adjacent rooms
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if ((x != 0 || y != 0) && Math.abs(x) + Math.abs(y) < 2) {
                    const room = this.world.getRoom(this.position.x + x, this.position.y + y);
                    if (room != null) {
                        room.removeAttribute("Stench");
                        // Remove stench objects
                        room.objects.forEach(obj => {
                            if (obj.constructor.name === 'Stench') {
                                room.objects.delete(obj);
                            }
                        });
                    }
                }
            }
        }
    }

    display() {
        if (this.alive) {
            image(wumpus_image, this.position.x * this.world.roomSize, this.position.y * this.world.roomSize, this.world.roomSize, this.world.roomSize);
        } else {
            image(wumpus_dead_image, this.position.x * this.world.roomSize, this.position.y * this.world.roomSize, this.world.roomSize, this.world.roomSize);
        }
    }
}