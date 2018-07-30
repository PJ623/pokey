class Entity {
    constructor(game, width, height, appearance) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.appearance = appearance;
        this.positionX;
        this.positionY;
        this.id;
    }

    spawn(x, y) {
        this.positionX = x;
        this.positionY = y;
        this.game.entitiesArray.push(this);
        this.id = this.game.entitiesArray.length - 1;

        this.move(0, 0);
    }

    // maybe don't need anymore?
    move(x, y) {
        let newPositionX = this.positionX + x;
        let newPositionY = this.positionY + y;

        // Turn into new function repositionInBounds?
        if (this.game.detectBoundaryCollision(newPositionX, newPositionY, this)) {

            if (newPositionX < 0)
                newPositionX = 0;
            else if (newPositionX > (this.game.canvas.width - this.width))
                newPositionX = this.game.canvas.width - this.width;

            if (newPositionY < 0)
                newPositionY = 0;
            else if (newPositionY > (this.game.canvas.height - this.height))
                newPositionY = this.game.canvas.height - this.height;
        }

        for(let i = 0; i < this.game.entitiesArray.length; i++){
            //console.log(this.id);
            if(this.game.entitiesArray[i].id != this.id && this.game.detectBoxCollision(this, this.game.entitiesArray[i])){
                console.log("Collision Entity.move 43");
            }
        }

        this.positionX = newPositionX;
        this.positionY = newPositionY;
    }

    render() {
        this.game.context.beginPath();
        this.game.context.fillStyle = this.appearance;
        this.game.context.fillRect(this.positionX, this.game.adjustForFloor(this.positionY, this.height), this.width, this.height);
    }

    get positionOfPoints() {
        let left = this.positionX;
        let right = this.positionX + this.width;
        let top = this.positionY + this.height;
        let bottom = this.positionY;

        return { left: left, right: right, top: top, bottom: bottom };
    }
}