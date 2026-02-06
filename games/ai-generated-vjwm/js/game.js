class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state
        this.currentLevel = 1;
        this.gameState = 'playing'; // 'playing', 'gameover', 'completed'

        // Initialize game objects
        this.level = new Level();
        this.fireBoy = new Player(this.level.fireBoySpawn.x, this.level.fireBoySpawn.y, 30, 40, 'fire');
        this.waterGirl = new Player(this.level.waterGirlSpawn.x, this.level.waterGirlSpawn.y, 30, 40, 'water');

        // Bind event listeners
        this.bindEventListeners();

        // Load first level
        this.loadLevel(1);

        // Start game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    bindEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (event) => {
            this.fireBoy.handleKeydown(event);
            this.waterGirl.handleKeydown(event);
        });

        window.addEventListener('keyup', (event) => {
            this.fireBoy.handleKeyup(event);
            this.waterGirl.handleKeyup(event);
        });

        // Reset button
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetLevel();
        });
    }

    update() {
        // Update players
        this.fireBoy.update();
        this.waterGirl.update();

        // Check platform collisions
        this.level.platforms.forEach(platform => {
            Collision.checkPlatformCollision(this.fireBoy, platform);
            Collision.checkPlatformCollision(this.waterGirl, platform);
        });

        // Check hazard collisions
        this.level.hazards.forEach(hazard => {
            if (Collision.checkHazardCollision(this.fireBoy, hazard)) {
                this.fireBoy.isDead = true;
            }
            if (Collision.checkHazardCollision(this.waterGirl, hazard)) {
                this.waterGirl.isDead = true;
            }
        });

        // Check gem collisions
        this.level.gems.forEach(gem => {
            if (Collision.checkGemCollision(this.fireBoy, gem) || 
                Collision.checkGemCollision(this.waterGirl, gem)) {
                this.level.collectGem(gem);
            }
        });

        // Check win condition
        let fireBoyAtDoor = false;
        let waterGirlAtDoor = false;

        this.level.doors.forEach(door => {
            if (door.type === 'fire-door' && Collision.checkDoorCollision(this.fireBoy, door)) {
                fireBoyAtDoor = true;
            }
            if (door.type === 'water-door' && Collision.checkDoorCollision(this.waterGirl, door)) {
                waterGirlAtDoor = true;
            }
        });

        if (fireBoyAtDoor && waterGirlAtDoor) {
            this.showWinMessage();
        }

        // Keep players in bounds
        this.keepInBounds(this.fireBoy);
        this.keepInBounds(this.waterGirl);

        // Check game over condition
        if (this.fireBoy.isDead || this.waterGirl.isDead) {
            if (this.gameState !== 'gameover') {
                this.gameState = 'gameover';
                setTimeout(() => this.showGameOverScreen(), 500);
            }
        }
    }

    keepInBounds(player) {
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > this.canvas.width) {
            player.x = this.canvas.width - player.width;
        }
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > this.canvas.height) {
            player.y = this.canvas.height - player.height;
            player.isJumping = false;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw level
        this.level.draw(this.ctx);

        // Draw players
        this.fireBoy.draw(this.ctx);
        this.waterGirl.draw(this.ctx);
    }

    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }

    resetLevel() {
        this.gameState = 'playing';
        this.fireBoy.reset(this.level.fireBoySpawn.x, this.level.fireBoySpawn.y);
        this.waterGirl.reset(this.level.waterGirlSpawn.x, this.level.waterGirlSpawn.y);
        this.level.loadLevel(this.currentLevel);
    }

    showGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Druk op SPATIE om opnieuw te proberen', this.canvas.width/2, this.canvas.height/2 + 20);

        // Add event listener for space key
        const restartHandler = (e) => {
            if (e.code === 'Space') {
                this.gameState = 'playing';
                this.resetLevel();
                window.removeEventListener('keydown', restartHandler);
            }
        };
        window.addEventListener('keydown', restartHandler);
    }

    showWinMessage() {
        if (this.gameState !== 'completed') {
            this.gameState = 'completed';
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Level Complete!', this.canvas.width/2, this.canvas.height/2 - 50);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Druk op SPATIE voor het volgende level', this.canvas.width/2, this.canvas.height/2 + 20);

            // Add event listener for space key
            const nextLevelHandler = (e) => {
                if (e.code === 'Space') {
                    this.gameState = 'playing';
                    this.loadNextLevel();
                    window.removeEventListener('keydown', nextLevelHandler);
                }
            };
            window.addEventListener('keydown', nextLevelHandler);
        }
    }

    loadNextLevel() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }

    loadLevel(levelNumber) {
        this.level.loadLevel(levelNumber);
        this.fireBoy.reset(this.level.fireBoySpawn.x, this.level.fireBoySpawn.y);
        this.waterGirl.reset(this.level.waterGirlSpawn.x, this.level.waterGirlSpawn.y);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
