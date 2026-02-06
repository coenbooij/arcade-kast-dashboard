import { Bullet } from './bullet.js';

export class Enemy {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 50 + game.level * 10;
        this.direction = 1;
        this.canShoot = type === 'shooter';
        this.health = type === 'bomber' ? 2 : 1;
        this.points = type === 'basic' ? 10 : (type === 'shooter' ? 20 : 30);
        this.color = type === 'basic' ? '#ff0000' : (type === 'shooter' ? '#ff00ff' : '#ffff00');
        this.descendY = 20;
    }

    update(deltaTime) {
        this.x += this.speed * this.direction * deltaTime;

        // Change direction and move down when hitting edges
        if (this.x <= 0 || this.x + this.width >= this.game.canvas.width) {
            this.direction *= -1;
            this.y += this.descendY;
        }

        // Random shooting for shooter type
        if (this.canShoot && Math.random() < 0.001) {
            this.shoot();
        }
    }

    shoot() {
        this.game.bullets.push(new Bullet(this.game, 
            this.x + this.width / 2, 
            this.y + this.height, 
            false));
    }

    render(ctx) {
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw enemy details based on type
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        if (this.type === 'shooter') {
            // Draw shooter cannon
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height + 5);
            ctx.stroke();
        } else if (this.type === 'bomber') {
            // Draw bomber markings
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width, this.y + this.height / 2);
            ctx.stroke();
        }

        // Draw health bar for bomber type
        if (this.type === 'bomber') {
            const healthBarWidth = this.width;
            const healthBarHeight = 3;
            const healthPercentage = this.health / 2;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y - 5, healthBarWidth, healthBarHeight);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 5, healthBarWidth * healthPercentage, healthBarHeight);
        }
    }
}
