export class Bullet {
    constructor(game, x, y, isPlayerBullet, angle = 0, player = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 3;
        this.height = 15;
        this.speed = 400;
        this.isPlayerBullet = isPlayerBullet;
        this.angle = angle * Math.PI / 180; // Convert to radians
        this.player = player; // Track which player fired the bullet
        this.color = player ? player.color : '#ff0000';
    }

    update(deltaTime) {
        const angleModifier = Math.sin(this.angle);
        this.x += angleModifier * this.speed * deltaTime;
        this.y += (this.isPlayerBullet ? -1 : 1) * this.speed * deltaTime;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }

    isOffscreen() {
        return this.y < 0 || this.y > this.game.canvas.height;
    }
}
