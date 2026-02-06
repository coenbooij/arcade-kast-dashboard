let game1, game2;

class PixelRunner {
    constructor(offsetY) {
        this.CANVAS_WIDTH = 800;
        this.CANVAS_HEIGHT = 100; // Halve hoogte voor elke game
        this.GRAVITY = 0.8;
        this.JUMP_FORCE = -15;
        this.GROUND_Y = this.CANVAS_HEIGHT - 40;
        this.PLAYER_WIDTH = 60;
        this.PLAYER_HEIGHT = 80;
        this.offsetY = offsetY; // Offset voor verticale positie

        this.player1 = {
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.player2 = {
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
        this.resetGame();
    }

    draw() {
        // Verticaal offset toepassen
        translate(0, this.offsetY);

        background(25);

        // Draw ground
        fill(100);
        rect(0, this.GROUND_Y + this.PLAYER_HEIGHT, this.CANVAS_WIDTH, 2);

        if (!this.gameOver) {
            // Update and draw players
            this.updatePlayer(this.player1, 87); // W key
            this.updatePlayer(this.player2, 38); // Up arrow

            // Draw players
            image(this.player1Image, 50, this.player1.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
            image(this.player2Image, 50, this.player2.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT);

            // Update and draw obstacles
            if (frameCount % 60 === 0) {
                this.createObstacle();
            }

            this.updateObstacles();
            this.drawObstacles();

            // Update scores
            this.updateScores();
            fill(255);
            textSize(20);
            text('Blue Score: ' + Math.floor(this.player1.score / 10), 20, 30);
            text('Red Score: ' + Math.floor(this.player2.score / 10), 20, 60);

            // Check collisions
            this.checkCollisions();
        } else {
            // Game Over screen
            fill(255);
            textSize(32);
            textAlign(CENTER);
            text('Game Over!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            textSize(20);
            text('Blue Final Score: ' + Math.floor(this.player1.score / 10), this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 40);
            text('Red Final Score: ' + Math.floor(this.player2.score / 10), this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 70);
            text('Press SPACE to restart', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 100);

            if (keyIsDown(32)) { // Space key
                this.resetGame();
            }
        }

        // Verticaal offset terugzetten
        translate(0, -this.offsetY);
    }

    updatePlayer(player, jumpKey) {
        if (keyIsDown(jumpKey) && !player.isJumping) {
            player.velocity = this.JUMP_FORCE;
            player.isJumping = true;
        }

        player.velocity += this.GRAVITY;
        player.y += player.velocity;

        if (player.y > this.GROUND_Y - this.PLAYER_HEIGHT) {
            player.y = this.GROUND_Y - this.PLAYER_HEIGHT;
            player.velocity = 0;
            player.isJumping = false;
        }
    }

    createObstacle() {
        this.obstacles.push({
            x: this.CANVAS_WIDTH,
            width: 20,
            height: random(40, 100),
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
            // Player 1 collision
            if (this.checkPlayerCollision(50, this.player1.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT,
                obstacle.x, this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height,
                obstacle.width, obstacle.height)) {
                this.gameOver = true;
            }

            // Player 2 collision
            if (this.checkPlayerCollision(50, this.player2.y, this.PLAYER_WIDTH, this.PLAYER_HEIGHT,
                obstacle.x, this.GROUND_Y + this.PLAYER_HEIGHT - obstacle.height,
                obstacle.width, obstacle.height)) {
                this.gameOver = true;
            }
        });
    }

    checkPlayerCollision(px, py, pw, ph, ox, oy, ow, oh) {
        return px < ox + ow &&
            px + pw > ox &&
            py < oy + oh &&
            py + ph > oy;
    }

    resetGame() {
        this.player1 = {
            y: this.GROUND_Y - this.PLAYER_HEIGHT,
            velocity: 0,
            isJumping: false,
            score: 0
        };

        this.player2 = {
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

// p5.js setup en draw functies
window.setup = () => {
    createCanvas(800, 400).parent('gameContainer'); // Dubbele hoogte voor beide games
    game1 = new PixelRunner(0); // Eerste game zonder offset
    game2 = new PixelRunner(200); // Tweede game met offset
    game1.setup();
    game2.setup();
};

window.draw = () => {
    game1.draw();
    game2.draw();
};

// Start button event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('menu').classList.add('hidden');
    });
});