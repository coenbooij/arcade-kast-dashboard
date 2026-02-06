export class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 20;
        this.height = 20;
        this.speed = 100;
        this.colors = {
            shield: '#00ffff',
            rapidFire: '#ff00ff',
            spreadShot: '#ffff00'
        };
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
    }

    render(ctx) {
        ctx.fillStyle = this.colors[this.type];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Draw power-up icon
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
                this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw type indicator
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = this.type === 'shield' ? 'S' : 
                      this.type === 'rapidFire' ? 'R' : 'W';
        ctx.fillText(symbol, this.x + this.width / 2, this.y + this.height / 2);
    }

    isOffscreen() {
        return this.y > this.game.canvas.height;
    }
}
