class Pacman {
    constructor(x, y) {
        //posizione nel Canvas
        this.pos = createVector(x, y);
        //posizione nella griglia
        this.virtualPos = createVector(14, 24);
        this.currentCell = createVector(Math.floor(this.pos.x / cellWidth), Math.floor(this.pos.y / cellHeight));
        //indici nell'immagine sheet
        this.imgIndex = createVector(4, 3);
        //raggio
        this.r = cellWidth / 3;
        //direzione
        this.dir = createVector(0, 0);
        //variabili per animare la morte di PacMan
        this.flag = 0;
        this.open = 0;
        this.death = false;
        this.deathStage = 0;
        //if open is 0, the mouth is fully opened,
        //if it's 2, the mouth is semi closed

        //variabili per lo spostamento
        this.commands = [];
    }

    //questo metodo mostra PacMan
    show() {
        this.currentCell.x = Math.floor(this.pos.x / cellWidth);
        this.currentCell.y = Math.floor(this.pos.y / cellHeight);
        this.flag++;
        if (this.flag == 10)
            this.changeMouth();
        fill(255);
        if (this.dir.x == 1) {
            this.imgIndex.x = 4 + this.open;
        } else if (this.dir.x == -1) {
            this.imgIndex.x = 0 + this.open;
        } else if (this.dir.y == 1) {
            this.imgIndex.x = 5 + this.open;
        } else if (this.dir.y == -1) {
            this.imgIndex.x = 1 + this.open;
        }
        image(sheetImage, this.pos.x, this.pos.y, this.r * 2, this.r * 2,
            imgWidth * this.imgIndex.x, imgHeight * this.imgIndex.y, imgWidth, imgHeight);
    }

    move() {
        if (this.pos.x + this.r >= CANVAS_WIDTH && this.dir.x == 1) {
            this.pos.x += this.dir.x;
            if (this.pos.x - this.r >= CANVAS_WIDTH) {
                this.pos.x = this.r;
            }
        } else if (this.pos.x - this.r <= 0 && this.dir.x == -1) {
            this.pos.x += this.dir.x;
            if (this.pos.x + this.r <= 0)
                this.pos.x = CANVAS_WIDTH - this.r;
        } else {
            let nextCommand;
            if (this.commands.length != 0) {
                nextCommand = this.commands.shift();
                if (!terrain.terrain[this.currentCell.y + nextCommand.y][this.currentCell.x + nextCommand.x].wall)
                    this.setDir(nextCommand.x, nextCommand.y);
                else this.commands.unshift(nextCommand);
            }

            if (!this.wall()) {
                this.pos.x += this.dir.x;
                this.pos.y += this.dir.y;
            } else {
                if (this.commands.length != 0)
                    nextCommand = this.commands.pop();
                else {
                    nextCommand = createVector(0, 0);
                }
                this.setDir(nextCommand.x, nextCommand.y);
                this.pos.x = this.currentCell.x * cellWidth + cellWidth / 2;
                this.pos.y = this.currentCell.y * cellHeight + cellHeight / 2;
            }
        }
    }

    wall() {
        if (this.dir.x == 1) {
            this.virtualPos.x = Math.floor((this.pos.x + this.r) / cellWidth);
            this.virtualPos.y = Math.floor((this.pos.y - this.r) / cellHeight);
            this.pos.y = this.currentCell.y * cellHeight + cellHeight / 2;
        } else if (this.dir.x == -1) {
            this.virtualPos.x = Math.floor((this.pos.x - this.r) / cellWidth);
            this.virtualPos.y = Math.floor((this.pos.y - this.r) / cellHeight);
            this.pos.y = this.currentCell.y * cellHeight + cellHeight / 2;
        } else if (this.dir.y == 1) {
            this.virtualPos.y = Math.floor((this.pos.y + this.r) / cellHeight);
            this.virtualPos.x = Math.floor((this.pos.x - this.r) / cellWidth);
            this.pos.x = this.currentCell.x * cellWidth + cellWidth / 2;
        } else if (this.dir.y == -1) {
            this.virtualPos.y = Math.floor((this.pos.y - this.r) / cellHeight);
            this.virtualPos.x = Math.floor((this.pos.x - this.r) / cellWidth);
            this.pos.x = this.currentCell.x * cellWidth + cellWidth / 2;
        }
        if (terrain.terrain[this.virtualPos.y][this.virtualPos.x].wall) {
            return true;
        }
        return false;

    }

    addInstruction(xdir, ydir) {
        this.commands.push(createVector(xdir, ydir));
        if (!terrain.terrain[this.currentCell.y + ydir][this.currentCell.x + xdir].wall) {
            this.setDir(xdir, ydir);
            this.clearCommands();
        }
    }

    clearCommands() {
        if (this.commands.length != 0)
            for (let i = this.commands.length; i > 0; i--)
                this.commands.pop();
    }

    setDir(xdir, ydir) {
        this.dir.x = xdir;
        this.dir.y = ydir;

        if (xdir == 0 && ydir == 0) {
            this.clearCommands();
        }
    }

    //questo metodo verifica se PacMan colpisce uno spettro
    hits(object) {
        var dx = this.pos.x - object.pos.x;
        var dy = this.pos.y - object.pos.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.r + object.r) {
            return true;
        }
        return false;

    }

    //Questo metodo gestisce l'animazione della morte
    die() {
        this.flag++;
        if (this.flag == 10) {
            this.flag = 0;
            this.deathStage++;
        } else {
            this.imgIndex.y = 7;
            this.imgIndex.x = 4;
            let xIndex = this.imgIndex.x + this.deathStage;
            image(sheetImage, this.pos.x, this.pos.y, this.r * 2, this.r * 2,
                imgWidth * xIndex, imgHeight * this.imgIndex.y, imgWidth, imgHeight);
            if (this.deathStage == 11) {
                noLoop();
                textAlign(CENTER);
                textSize(60);
                textStyle(BOLD);
                fill(255, 211, 0);
                text('YOU LOST!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
                player.lives--;
                for (var i = ghosts.length; i > 0; i--)
                    ghosts.pop();
                if (player.lives >= 0) {
                    textSize(50);
                    text('press enter to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
                }
            }
        }
    }

    //questo metodo apre e chiude
    //la bocca di PacMan mentre si muove
    changeMouth() {
        this.flag = 0;
        if (this.open == 0)
            this.open = 2;
        else this.open = 0;
    }
}