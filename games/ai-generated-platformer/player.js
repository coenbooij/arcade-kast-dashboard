import { Bullet } from './bullet.js';

export class Player {
    constructor(game, playerNumber) {
        this.game = game;
        this.playerNumber = playerNumber;
        this.width = 40;
        this.height = 40;
        
        // Position players side by side
        const spacing = this.width * 2;
        const totalWidth = this.width * 2 + spacing;
        const startX = (game.canvas.width - totalWidth) / 2;
        this.x = startX + (playerNumber === 1 ? 0 : this.width * 2 + spacing);
        
        this.y = game.canvas.height - this.height - 20;
        this.speed = 300;
        this.moveLeft = false;
        this.moveRight = false;
        this.shooting = false;
        this.lastShot = 0;
        this.shootInterval = 250;
        this.shieldActive = false;
        this.powerUpDuration = 5000;
        this.powerUpTimer = 0;
        this.currentPowerUp = null;
        this.score = 0;
        this.multiplier = 1;
        this.consecutiveHits = 0;
        
        // Player-specific color
        this.color = playerNumber === 1 ? '#00ff00' : '#00ffff';
    }

    update(deltaTime) {
        if (this.moveLeft) this.x = Math.max(0, this.x - this.speed * deltaTime);
        if (this.moveRight) this.x = Math.min(this.game.canvas.width - this.width, this.x + this.speed * deltaTime);

        if (this.shooting && Date.now() - this.lastShot > this.shootInterval) {
            this.shoot();
            this.lastShot = Date.now();
        }

        if (this.currentPowerUp) {
            this.powerUpTimer -= deltaTime * 1000;
            if (this.powerUpTimer <= 0) {
                this.deactivatePowerUp();
            }
            // Update power-up timer display
            const percentage = this.powerUpTimer / this.powerUpDuration;
            document.getElementById(`powerupTimer${this.playerNumber}`).style.width = 
                percentage > 0 ? `${percentage * 100}px` : '0';
        }
    }

    shoot() {
        if (this.currentPowerUp === 'spreadShot') {
            for (let angle = -15; angle <= 15; angle += 15) {
                this.game.bullets.push(new Bullet(this.game, this.x + this.width / 2, this.y, true, angle, this));
            }
        } else {
            this.game.bullets.push(new Bullet(this.game, this.x + this.width / 2, this.y, true, 0, this));
        }
        this.game.soundManager.play('shoot');
    }

    activatePowerUp(type) {
        this.currentPowerUp = type;
        this.powerUpTimer = this.powerUpDuration;

        switch (type) {
            case 'shield':
                this.shieldActive = true;
                break;
            case 'rapidFire':
                this.shootInterval = 100;
                break;
            case 'spreadShot':
                break;
        }
    }

    deactivatePowerUp() {
        switch (this.currentPowerUp) {
            case 'shield':
                this.shieldActive = false;
                break;
            case 'rapidFire':
                this.shootInterval = 250;
                break;
        }
        this.currentPowerUp = null;
        document.getElementById(`powerupTimer${this.playerNumber}`).style.width = '0';
    }

    updateMultiplier() {
        this.consecutiveHits++;
        if (this.consecutiveHits >= 10) {
            this.multiplier = Math.min(4, Math.floor(this.consecutiveHits / 10) + 1);
            document.getElementById(`multiplier${this.playerNumber}`).textContent = this.multiplier;
        }
    }

    resetMultiplier() {
        this.consecutiveHits = 0;
        this.multiplier = 1;
        document.getElementById(`multiplier${this.playerNumber}`).textContent = this.multiplier;
    }

    addScore(points) {
        this.score += points * this.multiplier;
        document.getElementById(`score${this.playerNumber}`).textContent = this.score;
    }

    render(ctx) {
        // Draw ship
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Draw shield if active
        if (this.shieldActive) {
            ctx.strokeStyle = this.color === '#00ff00' ? '#88ff88' : '#88ffff';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                   this.width / 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw player number
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.playerNumber}`, this.x + this.width / 2, this.y + this.height + 20);
    }
}
