class PixelRunner {
    constructor() {
        this.CANVAS_WIDTH = 1500;
        this.CANVAS_HEIGHT = 400;
        this.GRAVITY = 1;
        this.JUMP_FORCE = -25;
        this.GROUND_Y = this.CANVAS_HEIGHT - 10;
        this.PLAYER_WIDTH = 60;
        this.PLAYER_HEIGHT = 80;
        this.PLAYER_SPEED = 5;
        this.MIN_OBSTACLE_DISTANCE = 200;

        this.player1 = {
            x: 50,
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.player2 = {
            x: 50,
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.player1Image = loadImage('player1.1.png');
        this.player2Image = loadImage('player2.1.png');

        this.obstacles = [];
        this.gameSpeed = 5;
        this.gameOver = false;
    }

    setup() {
        createCanvas(this.CANVAS_WIDTH, this.CANVAS_HEIGHT).parent('gameContainer');
        this.resetGame();

        this.backgroundImage = loadImage("Achtergrond.png");
        this.cloudImage = loadImage("clouds.png");

        this.backgroundX = 0;
        this.cloudX = 0;
        this.backgroundSpeed = 2;
        this.cloudSpeed = 0.5;
    }

    draw() {
        background(25);

        this.drawBackground();

        fill(100);
        rect(0, this.GROUND_Y + this.PLAYER_HEIGHT, this.CANVAS_WIDTH, 2);

        if (!this.gameOver) {
            this.updatePlayer(this.player1, 87, 68, 65); // W (87), D (68), A (65)
            this.updatePlayer(this.player2, 38, 39, 37); // Up arrow (38), Right arrow (39), Left arrow (37)

            image(this.player1Image, this.player1.x, this.player1.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
            image(this.player2Image, this.player2.x, this.player2.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);

            if (frameCount % 60 === 0) {
                this.createObstacle();
            }

            this.updateObstacles();
            this.drawObstacles();

            this.updateScores();
            fill(255);
            textSize(20);
            text('Blue Score: ' + Math.floor(this.player1.score / 10), 40, 30);
            text('Red Score: ' + Math.floor(this.player2.score / 10), 40, 60);

            this.checkCollisions();

            // Verhoog de snelheid van het spel elke 10 seconden
            if (frameCount % (60 * 10) === 0) {
                this.gameSpeed += 1;
            }
        } else {
            fill(255);
            textSize(32);
            textAlign(CENTER);
            text('Game Over!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            textSize(20);
            text('Blue Final Score: ' + Math.floor(this.player1.score / 10), this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 40);
            text('Red Final Score: ' + Math.floor(this.player2.score / 10), this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 70);
            text('Press SPACE to restart', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 100);

            if (keyIsDown(32)) {
                this.resetGame();
            }
        }
    }

    drawBackground() {
        this.backgroundSpeed = this.gameSpeed / 2; // Achtergrond beweegt langzamer dan obstakels
        this.cloudSpeed = this.gameSpeed / 4; // Wolken bewegen nog langzamer

        this.backgroundX -= this.backgroundSpeed;
        if (this.backgroundX <= -this.backgroundImage.width) {
            this.backgroundX = 0;
        }

        this.cloudX -= this.cloudSpeed;
        if (this.cloudX <= -this.cloudImage.width) {
            this.cloudX = 0;
        }

        // Teken de achtergrond met oorspronkelijke grootte
        image(this.backgroundImage, this.backgroundX, 0);
        image(this.backgroundImage, this.backgroundX + this.backgroundImage.width, 0);

        // Teken de wolken met oorspronkelijke grootte
        image(this.cloudImage, this.cloudX, 50);
        image(this.cloudImage, this.cloudX + this.cloudImage.width, 50);
    }

    updatePlayer(player, jumpKey, rightKey, leftKey) {
        if (keyIsDown(jumpKey) && !player.isJumping) {
            player.velocity = this.JUMP_FORCE;
            player.isJumping = true;
        }

        if (keyIsDown(rightKey)) {
            player.x += this.PLAYER_SPEED;
        }

        if (keyIsDown(leftKey)) {
            player.x -= this.PLAYER_SPEED;
        }

        player.velocity += this.GRAVITY;
        player.y += player.velocity;

        let onObstacle = false;
        this.obstacles.forEach(obstacle => {
            if (this.checkPlayerLanding(player, obstacle)) {
                player.y = this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height - this.PLAYER_HEIGHT;
                player.velocity = 0;
                player.isJumping = false;
                onObstacle = true;
            }
        });

        // Controleer of de speler op de grond staat als hij niet op een obstakel staat
        if (!onObstacle && player.y > this.GROUND_Y - this.PLAYER_HEIGHT) {
            player.y = this.GROUND_Y - this.PLAYER_HEIGHT;
            player.velocity = 0;
            player.isJumping = false;
        }

        // Zorg ervoor dat de speler binnen de canvas blijft
        player.x = constrain(player.x, 0, this.CANVAS_WIDTH - this.PLAYER_WIDTH);
    }

    checkPlayerLanding(player, obstacle) {
        let obstacleTop = this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height;
        let playerBottom = player.y + this.PLAYER_HEIGHT;
        
        // Check if player is within horizontal bounds of the obstacle
        let horizontalOverlap = player.x + (this.PLAYER_WIDTH * 0.3) < obstacle.x + obstacle.width &&
            player.x + (this.PLAYER_WIDTH * 0.7) > obstacle.x;

        // More generous tolerance for landing detection
        let isCloseToTop = playerBottom >= obstacleTop - 15 && 
                          playerBottom <= obstacleTop + 15;
        
        // Check if player is above and falling
        let isAboveObstacle = player.y + this.PLAYER_HEIGHT <= obstacleTop + 15;
        let isFalling = player.velocity > 0;

        return horizontalOverlap && isAboveObstacle && isFalling && isCloseToTop;
    }

    createObstacle() {
        let lastObstacleX = this.obstacles.length > 0 ? this.obstacles[this.obstacles.length - 1].x : this.CANVAS_WIDTH;
        let newObstacleX = lastObstacleX + random(this.MIN_OBSTACLE_DISTANCE, this.MIN_OBSTACLE_DISTANCE * 2);

        this.obstacles.push({
            x: newObstacleX,
            width: random(100, 300),
            height: random(80, 200),
            passedByPlayer1: false,
            passedByPlayer2: false
        });
    }

    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.gameSpeed;

            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    drawObstacles() {
        fill(255, 0, 0);
        this.obstacles.forEach(obstacle => {
            rect(obstacle.x, this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height,
                obstacle.width, obstacle.height);
        });
    }

    updateScores() {
        this.obstacles.forEach(obstacle => {
            if (!obstacle.passedByPlayer1 && obstacle.x + obstacle.width < 100) {
                this.player1.score++;
                obstacle.passedByPlayer1 = true;
            }
            if (!obstacle.passedByPlayer2 && obstacle.x + obstacle.width < 200) {
                this.player2.score++;
                obstacle.passedByPlayer2 = true;
            }
        });
    }

    checkCollisions() {
        this.obstacles.forEach(obstacle => {
            // Controleer botsing voor speler 1
            if (this.checkPlayerCollision(
                this.player1.x, this.player1.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT,
                obstacle.x, this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height,
                obstacle.width, obstacle.height
            )) {
                this.player2.score++; // Speler 2 krijgt een punt
                this.gameOver = true;
            }

            // Controleer botsing voor speler 2
            if (this.checkPlayerCollision(
                this.player2.x, this.player2.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT,
                obstacle.x, this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height,
                obstacle.width, obstacle.height
            )) {
                this.player1.score++; // Speler 1 krijgt een punt
                this.gameOver = true;
            }
        });
    }

    checkPlayerCollision(px, py, pw, ph, ox, oy, ow, oh) {
        // Only check front collisions, since top landings are handled by checkPlayerLanding
        let fromLeft = px + pw - ox;
        let fromRight = (ox + ow) - px;
        
        // Get player from the current active player to check velocity
        let player = (px === this.player1.x) ? this.player1 : this.player2;
        
        // Check specifically for front collision
        if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
            // Check if we're hitting from the front (left side of obstacle)
            if (fromLeft > 0 && fromLeft < 20 && player.velocity < 5) {
                return true;
            }
            
            // Check if we're hitting from the back (right side of obstacle)
            if (fromRight > 0 && fromRight < 20 && player.velocity < 5) {
                return true;
            }
        }
        
        return false; // No front collision
    }

    resetGame() {
        this.player1 = {
            x: 50,
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.player2 = {
            x: 50,
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.obstacles = [];
        this.gameSpeed = 5;
        this.gameOver = false;
    }
}

this.obstacleInterval = setInterval(() => {
    if (!this.gameOver) {
        this.obstacles.push(new Obstacle());
    }
}, Math.random() * 2000 + 1000);

window.setup = () => {
    game = new PixelRunner();
    game.setup();
};

window.draw = () => {
    game.draw();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('menu').classList.add('hidden');
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') { // Controleer of de spatiebalk is ingedrukt
            document.getElementById('menu').classList.add('hidden');
        }
    });
});
