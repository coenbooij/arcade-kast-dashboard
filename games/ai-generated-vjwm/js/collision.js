class Collision {
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static checkPlatformCollision(player, platform) {
        const collision = this.checkRectCollision(player, platform);
        
        if (collision) {
            // Check if player is falling and above the platform
            if (player.velocityY > 0 &&
                player.y + player.height - player.velocityY <= platform.y) {
                // Land on platform
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                return 'top';
            }
            // Side collisions
            else if (player.x + player.width - player.velocityX <= platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
                return 'left';
            }
            else if (player.x - player.velocityX >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
                return 'right';
            }
            // Bottom collision
            else if (player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
                return 'bottom';
            }
        }
        return null;
    }

    static checkHazardCollision(player, hazard) {
        if (this.checkRectCollision(player, hazard)) {
            // Check if the hazard is deadly for this player type
            if (hazard.type === 'lava' && player.type === 'water' ||
                hazard.type === 'water' && player.type === 'fire' ||
                hazard.type === 'toxic') {
                return true; // Player dies
            }
        }
        return false;
    }

    static checkGemCollision(player, gem) {
        return this.checkRectCollision(player, gem);
    }

    static checkDoorCollision(player, door) {
        if (this.checkRectCollision(player, door)) {
            return player.type === door.type;
        }
        return false;
    }
}
