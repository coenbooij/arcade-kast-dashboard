class Player {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'fire' or 'water'
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.6;
        this.isJumping = false;
        this.isDead = false;

        // Controls setup
        if (type === 'fire') {
            this.controls = {
                left: 'ArrowLeft',
                right: 'ArrowRight',
                jump: 'ArrowUp'
            };
            this.color = '#e74c3c'; // Red for Fireboy
        } else {
            this.controls = {
                left: 'KeyA',
                right: 'KeyD',
                jump: 'KeyW'
            };
            this.color = '#3498db'; // Blue for Watergirl
        }

        // Keep track of pressed keys
        this.pressedKeys = new Set();
    }

    handleKeydown(event) {
        this.pressedKeys.add(event.code);
    }

    handleKeyup(event) {
        this.pressedKeys.delete(event.code);
    }

    update() {
        if (this.isDead) return;

        // Horizontal movement
        if (this.pressedKeys.has(this.controls.left)) {
            this.velocityX = -this.speed;
        } else if (this.pressedKeys.has(this.controls.right)) {
            this.velocityX = this.speed;
        } else {
            // Add friction
            this.velocityX *= 0.8;
        }

        // Jumping
        if (this.pressedKeys.has(this.controls.jump) && !this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocityY += this.gravity;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add glow effect based on player type
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0; // Reset shadow
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isDead = false;
        this.pressedKeys.clear();
    }
}
