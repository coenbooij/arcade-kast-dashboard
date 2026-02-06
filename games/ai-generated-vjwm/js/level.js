class GameObject {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx) {
        switch(this.type) {
            case 'platform':
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
            case 'lava':
                ctx.fillStyle = '#c0392b';
                this.drawHazard(ctx);
                break;
            case 'water':
                ctx.fillStyle = '#3498db';
                this.drawHazard(ctx);
                break;
            case 'toxic':
                ctx.fillStyle = '#27ae60';
                this.drawHazard(ctx);
                break;
            case 'gem':
                ctx.fillStyle = '#f1c40f';
                this.drawGem(ctx);
                break;
            case 'fire-door':
                ctx.fillStyle = '#e74c3c';
                this.drawDoor(ctx);
                break;
            case 'water-door':
                ctx.fillStyle = '#3498db';
                this.drawDoor(ctx);
                break;
        }
    }

    drawHazard(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add wave effect
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for(let i = 0; i <= this.width; i += 20) {
            ctx.lineTo(this.x + i, 
                      this.y + Math.sin(Date.now()/500 + i/20) * 3);
        }
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    drawGem(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Date.now()/1000);
        
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(0, this.height/2);
        ctx.lineTo(-this.width/2, 0);
        ctx.closePath();
        
        ctx.fill();
        ctx.restore();
    }

    drawDoor(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Door frame
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        // Door arch
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y, this.width/2, Math.PI, 0);
        ctx.stroke();
    }
}

class Level {
    constructor() {
        this.objects = [];
        this.gems = [];
        this.platforms = [];
        this.hazards = [];
        this.doors = [];
        this.gemsCollected = 0;
        
        // Player spawn positions
        this.fireBoySpawn = { x: 50, y: 450 };
        this.waterGirlSpawn = { x: 100, y: 450 };
    }

    clearLevel() {
        this.objects = [];
        this.gems = [];
        this.platforms = [];
        this.hazards = [];
        this.doors = [];
        this.gemsCollected = 0;
    }

    loadLevel(levelNumber) {
        this.clearLevel();

        switch(levelNumber) {
            case 1:
                this.loadLevel1();
                break;
            case 2:
                this.loadLevel2();
                break;
            default:
                // If no more levels, loop back to level 1
                this.loadLevel1();
                break;
        }
    }

    loadLevel1() {
        // Add ground
        this.addPlatform(0, 500, 800, 100);

        // Add platforms
        this.addPlatform(200, 400, 100, 20);
        this.addPlatform(400, 300, 100, 20);
        this.addPlatform(600, 400, 100, 20);
        this.addPlatform(300, 200, 200, 20);

        // Add hazards
        this.addHazard(200, 480, 100, 20, 'lava');
        this.addHazard(500, 480, 100, 20, 'water');
        this.addHazard(350, 480, 100, 20, 'toxic');

        // Add gems
        this.addGem(230, 370, 15, 15);
        this.addGem(445, 270, 15, 15);
        this.addGem(630, 370, 15, 15);

        // Add doors
        this.addDoor(650, 330, 40, 70, 'fire-door');
        this.addDoor(710, 330, 40, 70, 'water-door');

        // Set spawn positions
        this.fireBoySpawn = { x: 50, y: 450 };
        this.waterGirlSpawn = { x: 100, y: 450 };
    }

    loadLevel2() {
        // Add ground platforms
        this.addPlatform(0, 500, 300, 100);
        this.addPlatform(500, 500, 300, 100);

        // Add elevated platforms
        this.addPlatform(150, 350, 100, 20);
        this.addPlatform(350, 250, 100, 20);
        this.addPlatform(550, 350, 100, 20);
        this.addPlatform(250, 150, 300, 20);

        // Add hazards
        this.addHazard(300, 500, 200, 100, 'toxic'); // Central pit
        this.addHazard(150, 330, 100, 20, 'water');
        this.addHazard(550, 330, 100, 20, 'lava');

        // Add gems
        this.addGem(180, 320, 15, 15);
        this.addGem(400, 220, 15, 15);
        this.addGem(580, 320, 15, 15);
        this.addGem(400, 120, 15, 15);

        // Add doors on the highest platform
        this.addDoor(280, 80, 40, 70, 'fire-door');
        this.addDoor(480, 80, 40, 70, 'water-door');

        // Set spawn positions
        this.fireBoySpawn = { x: 50, y: 450 };
        this.waterGirlSpawn = { x: 700, y: 450 };
    }

    addPlatform(x, y, width, height) {
        const platform = new GameObject(x, y, width, height, 'platform');
        this.objects.push(platform);
        this.platforms.push(platform);
    }

    addHazard(x, y, width, height, type) {
        const hazard = new GameObject(x, y, width, height, type);
        this.objects.push(hazard);
        this.hazards.push(hazard);
    }

    addGem(x, y, width, height) {
        const gem = new GameObject(x, y, width, height, 'gem');
        this.objects.push(gem);
        this.gems.push(gem);
    }

    addDoor(x, y, width, height, type) {
        const door = new GameObject(x, y, width, height, type);
        this.objects.push(door);
        this.doors.push(door);
    }

    collectGem(gem) {
        const index = this.gems.indexOf(gem);
        if (index > -1) {
            this.gems.splice(index, 1);
            this.objects.splice(this.objects.indexOf(gem), 1);
            this.gemsCollected++;
            document.getElementById('gemsCollected').textContent = this.gemsCollected;
        }
    }

    draw(ctx) {
        this.objects.forEach(obj => obj.draw(ctx));
    }
}
