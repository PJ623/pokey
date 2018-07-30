class Player extends Entity {
    constructor(game, width, height, appearance) {
        super(game, width, height, appearance);
        this.state = "standing";
        this.action = null;
        this.movementSpeed = 6;

        this.hitboxes = [];
        this.hurtboxes = [];

        this.standingHeight = this.height;
        this.standingWidth = this.width;

        // TODO:
        // Side switching
        // Hit points

        // make moveset
        // stand move that has long range but poor recovery
        // crouch move that has shorter range, but good recovery
    }

    processInputs() {
        this.hitboxes = [];
        this.hurtboxes = [];

        let speedX = 0;
        let speedY = 0;

        // a
        if (this.game.inputsList["65"]) {
            speedX += -this.movementSpeed;
        }

        // d
        if (this.game.inputsList["68"]) {
            speedX += this.movementSpeed;
        }

        //s. placed later to override speeds from a or d
        if (this.game.inputsList["83"]) {
            speedX = 0;
            speedY = 0;
            if (!this.action) {
                this.crouch();
            }
        } else {
            if (!this.action) {
                this.stand();
            }
        }

        // space
        if (this.game.inputsList["32"]) {
            this.attack();
        }

        this.move(speedX, speedY);

        if (this.action) {
            if (this.action.isDone) {
                if (this.height < this.standingHeight) {
                    this.crouch();
                } else {
                    this.stand();
                }
                this.action = null;
            } else {
                this.action.execute();
            }
        }
    }

    //jump()?

    attack() {
        //let hitLanded;
        let startup;
        let active;
        let recovery;
        let hitbox;
        let hurtbox;

        let diff;

        let detectHit = function (hitbox) {
            for (let i = 0; i < this.game.entitiesArray.length; i++) {
                if (this.game.entitiesArray[i].id != this.id) {
                    this.game.detectBoxCollision(hitbox, this.game.entitiesArray[i]);
                    for (let j = 0; j < this.game.entitiesArray[i].hurtboxes.length; j++) {
                        this.game.detectBoxCollision(hitbox, this.game.entitiesArray[i].hurtboxes[j]);
                    }
                }
            }
        }

        // Standing attack
        if (this.state == "standing") {
            startup = new Effect(3, () => {
                console.log("startup frames");

                // alter hurtbox?
                // TODO: maybe turn currentframe into currentframe from start of effect?
            });

            active = new Effect(3, () => {
                console.log("active frames");

                // track which hitboxes are active using Player.hitbox array? OR do collision detection right here with these instances of hitbox and hurtbox
                hitbox = new Hitbox(this, 80, 70, this.positionX + (this.width), this.positionY + (this.height / 2) - (50 / 2), 1);
                this.hitboxes.push(hitbox);

                diff = 20;
                hurtbox = new Hurtbox(this, hitbox.width - diff, hitbox.height - diff, hitbox.positionX, hitbox.positionY + diff / 2);
                this.hurtboxes.push(hurtbox);

                detectHit.call(this, hitbox);
            });

            recovery = new Effect(5, () => {
                console.log("recovery frames");
            });
        }

        // Crouching attack
        if (this.state == "crouching") {
            startup = new Effect(10, (currentFrameForSegment) => {
                console.log("startup frames");
                // alter hurtbox?
                hurtbox = new Hurtbox(this, 100, this.height - 10, this.positionX + (this.width / 2), this.positionY);
                this.hurtboxes.push(hurtbox);

                if (currentFrameForSegment == 2) {
                    console.log("HOLLA AT YO BOI");
                }
            });

            active = new Effect(6, () => {
                console.log("active frames");

                // track which hitboxes are active using Player.hitbox array? OR do collision detection right here with these instances of hitbox and hurtbox
                hitbox = new Hitbox(this, 150, 50, this.positionX + (this.width / 2), this.positionY /*+ (this.height / 2) - (50 / 2)*/, 1);
                this.hitboxes.push(hitbox);

                diff = 10;
                hurtbox = new Hurtbox(this, hitbox.width - diff, hitbox.height - diff, hitbox.positionX, hitbox.positionY);
                this.hurtboxes.push(hurtbox);

                detectHit.call(this, hitbox);
            });

            recovery = new Effect(16, () => {
                hurtbox = new Hurtbox(this, 150, 50, this.positionX + (this.width / 2), this.positionY);
                this.hurtboxes.push(hurtbox);
                console.log("recovery frames");
            });
        }

        if (this.state == "standing" || this.state == "crouching") {
            this.state = "attacking";
            this.action = new Action(startup, active, recovery);
        }
    }

    crouch() {
        this.height = this.standingHeight / 2;
        this.width = this.standingWidth /** 1.2*/;
        this.state = "crouching";
    }

    stand() {
        this.height = this.standingHeight;
        this.width = this.standingWidth;
        this.state = "standing";
    }

    // @Override Entity.move()
    move(x, y) {
        if (this.state == "standing" || this.state == "crouching") {
            let newPositionX = this.positionX + x;
            let newPositionY = this.positionY + y;

            for (let i = 0; i < this.game.entitiesArray.length; i++) {
                if (this.game.entitiesArray[i].id != this.id && this.game.detectBoxCollision(this, this.game.entitiesArray[i])) {
                    let thisPoints = this.positionOfPoints;
                    let entityPoints = this.game.entitiesArray[i].positionOfPoints;

                    let differenceToLeft = entityPoints.left - (thisPoints.right + x);
                    let differenceToRight = entityPoints.right - (thisPoints.left + x);

                    if (differenceToLeft < 0)
                        differenceToLeft = differenceToLeft * (-1);

                    if (differenceToRight < 0)
                        differenceToRight = differenceToRight * (-1);

                    if (differenceToLeft < differenceToRight)
                        newPositionX = entityPoints.left - this.width - 1;
                    else
                        newPositionX = entityPoints.right + 1;

                    break; // push mover into non-occupied position
                }
            }

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

            this.positionX = newPositionX;
            this.positionY = newPositionY;
        }
    }

    // @Override Entity.render
    render() {
        this.game.context.beginPath();
        this.game.context.fillStyle = this.appearance;
        this.game.context.fillRect(this.positionX, this.game.adjustForFloor(this.positionY, this.height), this.width, this.height);

        if (this.hitboxes.length > 0) {
            for (let i = 0; i < this.hitboxes.length; i++) {
                this.hitboxes[i].render();
            }
        }

        if (this.hurtboxes.length > 0) {
            for (let i = 0; i < this.hurtboxes.length; i++) {
                this.hurtboxes[i].render();
            }
        }
    }
}