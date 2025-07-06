class Stench {
    constructor(pos, world) {
        this.position = pos;
        this.world = world;
    }

    display() {
        image(stench_image, this.position.x * this.world.roomSize , this.position.y * this.world.roomSize , this.world.roomSize, this.world.roomSize);

    }
}