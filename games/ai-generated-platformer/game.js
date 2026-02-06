import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerup.js';
import { Particle } from './particle.js';
import { SoundManager } from './sounds.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        this.difficulty = 'normal';
        this.difficultyModifiers = {
            easy: { enemySpeed: 0.7, enemyHealth: 1, playerLives: 5 },
            normal: { enemySpeed: 1, enemyHealth: 1, playerLives: 3 },
            hard: { enemySpeed: 1.3, enemyHealth: 2, playerLives: 2 }
        };
        
        // Systems
        this.soundManager = new SoundManager();
        
        // Game objects
        this.players = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        
        // Level configuration
        this.enemyRows = 5;
        this.enemiesPerRow = 8;
        this.enemyTypes = ['basic', 'shooter', 'bomber'];
        
        // Timing
        this.lastTime = 0;
        this.enemyShootInterval = 1000;
        this.lastEnemyShot = 0;
        
        // UI elements
        this.menu = document.getElementById('menu');
        this.gameOverScreen = document.getElementById('gameOver');
        this.pauseOverlay = document.getElementById('pauseOverlay');

        // Event listeners
        this.setupEventListeners();
        
        // Initialize HUD
        this.updateHUD();
        this.displayHighScores();
    }

    setupEventListeners() {
        // Setup difficulty buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');

        // Add click handlers for difficulty buttons
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.difficulty;
                startBtn.classList.remove('hidden');
            });
        });

        // Start button handler
        startBtn.addEventListener('click', () => {
            if (this.difficulty) {
                this.startGame();
            }
        });

        // Restart button handler
        restartBtn.addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.menu.classList.remove('hidden');
            startBtn.classList.add('hidden');
            difficultyButtons.forEach(b => b.classList.remove('selected'));
        });

        // Player controls
        window.addEventListener('keydown', (e) => {
            // Player 1 controls (WASD + Space)
            if (this.players[0]) {
                if (e.key === 'a') this.players[0].moveLeft = true;
                if (e.key === 'd') this.players[0].moveRight = true;
                if (e.key === ' ') {
                    this.players[0].shooting = true;
                    e.preventDefault();
                }
            }
            
            // Player 2 controls (Arrow keys + Enter)
            if (this.players[1]) {
                if (e.key === 'ArrowLeft') this.players[1].moveLeft = true;
                if (e.key === 'ArrowRight') this.players[1].moveRight = true;
                if (e.key === 'Enter') this.players[1].shooting = true;
            }

            if (e.key === 'p') this.togglePause();
        });

        window.addEventListener('keyup', (e) => {
            // Player 1 controls
            if (this.players[0]) {
                if (e.key === 'a') this.players[0].moveLeft = false;
                if (e.key === 'd') this.players[0].moveRight = false;
                if (e.key === ' ') this.players[0].shooting = false;
            }
            
            // Player 2 controls
            if (this.players[1]) {
                if (e.key === 'ArrowLeft') this.players[1].moveLeft = false;
                if (e.key === 'ArrowRight') this.players[1].moveRight = false;
                if (e.key === 'Enter') this.players[1].shooting = false;
            }
        });
    }

    startGame() {
        const diffMod = this.difficultyModifiers[this.difficulty];
        this.level = 1;
        this.gameOver = false;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        
        // Create two players
        this.players = [
            new Player(this, 1),
            new Player(this, 2)
        ];

        this.menu.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.spawnEnemies();
        requestAnimationFrame((time) => this.gameLoop(time));

        // Reset HUD
        ['1', '2'].forEach(playerNum => {
            document.getElementById(`score${playerNum}`).textContent = '0';
            document.getElementById(`lives${playerNum}`).textContent = diffMod.playerLives;
            document.getElementById(`multiplier${playerNum}`).textContent = '1';
            document.getElementById(`powerupTimer${playerNum}`).style.width = '0';
        });
    }

    spawnEnemies() {
        const spacing = { x: 60, y: 40 };
        const margin = { x: 50, y: 50 };
        const diffMod = this.difficultyModifiers[this.difficulty];

        for (let row = 0; row < this.enemyRows; row++) {
            for (let col = 0; col < this.enemiesPerRow; col++) {
                const type = this.enemyTypes[Math.min(row, this.enemyTypes.length - 1)];
                const x = margin.x + col * spacing.x;
                const y = margin.y + row * spacing.y;
                const enemy = new Enemy(this, x, y, type);
                enemy.speed *= diffMod.enemySpeed;
                enemy.health = type === 'bomber' ? 2 * diffMod.enemyHealth : diffMod.enemyHealth;
                this.enemies.push(enemy);
            }
        }
    }

    spawnPowerUp(x, y) {
        const types = ['shield', 'rapidFire', 'spreadShot'];
        const type = types[Math.floor(Math.random() * types.length)];
        if (Math.random() < 0.1) { // 10% chance to spawn power-up
            this.powerUps.push(new PowerUp(this, x, y, type));
        }
    }

    gameLoop(currentTime) {
        if (this.gameOver) return;
        if (this.isPaused) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        this.players.forEach(player => player.update(deltaTime));
        this.updateBullets(deltaTime);
        this.updateEnemies(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateParticles(deltaTime);
        this.checkCollisions();
        this.checkLevelProgress();
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime);
            if (this.bullets[i].isOffscreen()) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(deltaTime);
            const enemy = this.enemies[i];
            if (this.players.some(player => 
                enemy.y + enemy.height > player.y)) {
                this.endGame();
                return;
            }
        }
    }

    updatePowerUps(deltaTime) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update(deltaTime);
            if (this.powerUps[i].isOffscreen()) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // Player bullets with enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            if (!bullet.isPlayerBullet) return;
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        if (bullet.player) {
                            bullet.player.addScore(enemy.points);
                            bullet.player.updateMultiplier();
                        }
                        this.createExplosion(enemy.x, enemy.y);
                        this.spawnPowerUp(enemy.x, enemy.y);
                        this.soundManager.play('explosion');
                    }
                }
            });
        });

        // Enemy bullets with players
        this.bullets.forEach((bullet, index) => {
            if (bullet.isPlayerBullet) return;
            
            this.players.forEach(player => {
                if (this.checkCollision(bullet, player) && !player.shieldActive) {
                    this.bullets.splice(index, 1);
                    const lives = parseInt(document.getElementById(`lives${player.playerNumber}`).textContent);
                    document.getElementById(`lives${player.playerNumber}`).textContent = lives - 1;
                    player.resetMultiplier();
                    this.createExplosion(player.x, player.y);
                    this.soundManager.play('hurt');
                    
                    if (lives <= 1) {
                        this.endGame();
                    }
                }
            });
        });

        // Power-ups with players
        this.powerUps.forEach((powerUp, index) => {
            this.players.forEach(player => {
                if (this.checkCollision(powerUp, player)) {
                    this.powerUps.splice(index, 1);
                    player.activatePowerUp(powerUp.type);
                    this.soundManager.play('powerup');
                }
            });
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(this, x, y));
        }
    }

    checkLevelProgress() {
        if (this.enemies.length === 0) {
            this.level++;
            this.enemyShootInterval = Math.max(300, 1000 - (this.level * 100));
            this.spawnEnemies();
            document.getElementById('level').textContent = this.level;
            this.soundManager.play('levelUp');
        }
    }

    render() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderStars();
        
        // Render game objects
        this.players.forEach(player => player.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
    }

    renderStars() {
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = (this.lastTime * 0.02 + i * 10) % this.canvas.height;
            const size = Math.random() * 2;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    endGame() {
        this.gameOver = true;
        const totalScore = this.players.reduce((sum, player) => sum + player.score, 0);
        this.highScores.push(totalScore);
        this.highScores.sort((a, b) => b - a);
        this.highScores = this.highScores.slice(0, 10);
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
        
        this.gameOverScreen.classList.remove('hidden');
        document.getElementById('finalScore1').textContent = this.players[0].score;
        document.getElementById('finalScore2').textContent = this.players[1].score;
        document.getElementById('finalScoreTotal').textContent = totalScore;
        this.displayHighScores();
        this.soundManager.play('hurt');
    }

    displayHighScores() {
        const list = document.getElementById('highScoresList');
        list.innerHTML = '';
        this.highScores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = score;
            list.appendChild(li);
        });
    }

    updateHUD() {
        document.getElementById('level').textContent = this.level;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseOverlay.classList.toggle('hidden', !this.isPaused);
    }
}

// Initialize game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
