// ...existing code...

// Simple Tetris outline (minimal, extendable)

const COLS = 10;
const ROWS = 20;
let BLOCK = 30; // px; will be recalculated to fill height

// two separate playing fields
let fields = [];
function createField(xOffset) {
    return {
        grid: null,
        current: null,
        lastDrop: 0,
        running: false,
        score: 0,
        lastType: null,
        xOffset
    };
}

const SHAPES = {
    I: [[[1,1,1,1]],
        [[1],[1],[1],[1]]],
    O: [[[1,1],[1,1]]],
    T: [[[0,1,0],[1,1,1]],
        [[1,0],[1,1],[1,0]],
        [[1,1,1],[0,1,0]],
        [[0,1],[1,1],[0,1]]],
    L: [[[1,0],[1,0],[1,1]],
        [[1,1,1],[1,0,0]],
        [[1,1],[0,1],[0,1]],
        [[0,0,1],[1,1,1]]],
    J: [[[0,1],[0,1],[1,1]],
        [[1,0,0],[1,1,1]],
        [[1,1],[1,0],[1,0]],
        [[1,1,1],[0,0,1]]],
    S: [[[0,1,1],[1,1,0]],
        [[1,0],[1,1],[0,1]]],
    Z: [[[1,1,0],[0,1,1]],
        [[0,1],[1,1],[1,0]]]
};
const COLORS = { I:'#00f0f0', O:'#f0f000', T:'#a000f0', L:'#f09000', J:'#0000f0', S:'#00f000', Z:'#f00000' };

let canvas, ctx;
// per‑field data stored in fields array
let dropInterval = 800;

// special block constants
const SPECIAL_CHANCE = 0.1; // 10% chance per piece
let flashTimer = 0;
let rainbowHue = 0; // for colour cycling

// game state
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
let buttons = []; // stores clickable buttons for UI

function makeGrid(field) {
    // each cell will be an object: { color: null|string, special: boolean }
    field.grid = Array.from({length: ROWS}, () => 
        Array.from({length: COLS}, () => ({color: null, special: false}))
    );
}

function randomShape(field) {
    const types = Object.keys(SHAPES);
    let t;
    // avoid repeating same shape as last spawn
    do {
        t = types[Math.floor(Math.random()*types.length)];
    } while (field.lastType && types.length > 1 && t === field.lastType);
    field.lastType = t;

    const piece = {
        type: t,
        rot: 0,
        shape: SHAPES[t][0],
        x: Math.floor((COLS - SHAPES[t][0][0].length) / 2),
        y: 0,
        color: COLORS[t],
        special: null // will hold {r,c} if we add a special cell
    };

    // maybe pick one of the blocks to be special
    if (Math.random() < SPECIAL_CHANCE) {
        const coords = [];
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) coords.push({r, c});
            }
        }
        if (coords.length) {
            piece.special = coords[Math.floor(Math.random() * coords.length)];
        }
    }

    return piece;
}

function rotateMatrix(matrix) {
    const H = matrix.length, W = matrix[0].length;
    const out = Array.from({length: W}, () => Array(H).fill(0));
    for (let r=0;r<H;r++) for (let c=0;c<W;c++) out[c][H-1-r] = matrix[r][c];
    return out;
}

function setPieceRotation(piece) {
    const variants = SHAPES[piece.type];
    piece.rot = (piece.rot + 1) % variants.length;
    piece.shape = variants[piece.rot];
}

// collision helper
function canMove(field, piece, dx=0, dy=0, testShape=null) {
    const shape = testShape || piece.shape;
    for (let r=0;r<shape.length;r++) {
        for (let c=0;c<shape[r].length;c++) {
            if (!shape[r][c]) continue;
            const x = piece.x + c + dx;
            const y = piece.y + r + dy;
            if (x < 0 || x >= COLS || y >= ROWS) return false;
            if (y >= 0 && field.grid[y][x].color) return false;
        }
    }
    return true;
}

function lockPiece(field) {
    for (let r=0;r<field.current.shape.length;r++) {
        for (let c=0;c<field.current.shape[r].length;c++) {
            if (!field.current.shape[r][c]) continue;
            const x = field.current.x + c;
            const y = field.current.y + r;
            if (y >= 0) {
                const isSpecial = field.current.special && field.current.special.r === r && field.current.special.c === c;
                field.grid[y][x] = {
                    color: isSpecial ? 'rainbow' : field.current.color,
                    special: !!isSpecial
                };
            }
        }
    }
    clearLines(field);
    spawn(field);
}

function clearLines(field) {
    let lines = 0;
    for (let r = ROWS-1; r >= 0; r--) {
        if (field.grid[r].every(cell => cell.color)) {
            // if any special cell on this row, trigger flash
            if (field.grid[r].some(cell => cell.special)) {
                flashTimer = 8; // a few frames
            }
            field.grid.splice(r,1);
            field.grid.unshift(Array.from({length: COLS}, () => ({color:null, special:false})));
            lines++;
            r++; // recheck same index after splice
        }
    }
    if (lines) field.score += lines * 100;
}

function spawn(field) {
    field.current = randomShape(field);
    // ensure correct starting rotation index 0
    field.current.rot = 0;
    field.current.shape = SHAPES[field.current.type][0];
    if (!canMove(field, field.current, 0, 0)) {
        field.running = false; // game over
        // TODO: handle game over UI for that field
    }
}

function drop(field) {
    if (canMove(field, field.current, 0,1)) {
        field.current.y++;
    } else {
        lockPiece(field);
    }
}

function hardDrop(field) {
    while (canMove(field, field.current, 0,1)) field.current.y++;
    lockPiece(field);
}

function move(field, dx) {
    if (canMove(field, field.current, dx,0)) field.current.x += dx;
}

function rotate(field) {
    const current = field.current;
    const variants = SHAPES[current.type];
    const nextRot = (current.rot + 1) % variants.length;
    const nextShape = variants[nextRot];
    // compute transformed special coordinate if present
    let newSpecial = null;
    if (current.special) {
        const {r,c} = current.special;
        const H = current.shape.length;
        const W = current.shape[0].length;
        // clockwise rotation formula: newRow = c, newCol = H-1-r
        newSpecial = {r: c, c: H - 1 - r};
    }
    const testPiece = { ...current, shape: nextShape, special: newSpecial };
    if (canMove(field, testPiece,0,0,nextShape)) {
        current.rot = nextRot;
        current.shape = nextShape;
        if (newSpecial) current.special = newSpecial;
    } else {
        // simple wall kick attempts
        if (canMove(field, testPiece,1,0,nextShape)) {
            current.x++;
            current.rot = nextRot;
            current.shape = nextShape;
            if (newSpecial) current.special = newSpecial;
        } else if (canMove(field, testPiece,-1,0,nextShape)) {
            current.x--;
            current.rot = nextRot;
            current.shape = nextShape;
            if (newSpecial) current.special = newSpecial;
        }
    }
}

function drawCell(x,y,color) {
    ctx.fillStyle = color || '#111';
    ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK-1, BLOCK-1);
}

function getRainbowColor() {
    rainbowHue = (rainbowHue + 2) % 360;
    return `hsl(${rainbowHue},100%,50%)`;
}

function drawButton(x, y, width, height, text, bgColor='#444', textColor='#fff') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width/2, y + height/2);
    return {x, y, width, height, text};
}

function drawStartScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 130px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TETRIS', canvas.width / 2, 200);
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    let y = 280;
    const lineHeight = 35;
    const controls = [
        '--- LEFT PLAYER (WASD) ---',
        'W: Rotate  A: Left  D: Right',
        'S: Drop  Q: Hard Drop',
        '',
        '--- RIGHT PLAYER (ARROWS) ---',
        'Up Arrow: Rotate  Left: Left  Right: Right',
        'Down Arrow: Drop  Space: Hard Drop',
        '',
        'P: Pause/Resume',
        'R: Return to Start'
    ];
    
    controls.forEach(line => {
        ctx.fillText(line, canvas.width / 2, y);
        y += lineHeight;
    });
    
    buttons = [];
    buttons.push(drawButton(canvas.width / 2 - 100, canvas.height - 300, 200, 50, 'START GAME'));
}

function drawPauseScreen() {
    // blur effect - semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // pause panel
    const panelWidth = 400;
    const panelHeight = 200;
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = canvas.height / 2 - panelHeight / 2;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', canvas.width / 2, panelY + 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText('Press P to continue', canvas.width / 2, panelY + 100);
    
    buttons = [];
    buttons.push(drawButton(panelX + panelWidth / 2 - 90, panelY + 130, 180, 40, 'Return to Menu'));
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const panelWidth = 500;
    const panelHeight = 330;
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = canvas.height / 2 - panelHeight / 2;
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, panelY + 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Player 1 Score: ' + fields[0].score, canvas.width / 2, panelY + 110);
    ctx.fillText('Player 2 Score: ' + fields[1].score, canvas.width / 2, panelY + 160);
    
    buttons = [];
    buttons.push(drawButton(panelX + panelWidth / 2 - 100, panelY + 210, 200, 40, 'Restart'));
    buttons.push(drawButton(panelX + panelWidth / 2 - 100, panelY + 260, 200, 40, 'Menu'));
}

function isMouseInButton(mouseX, mouseY, button) {
    return mouseX >= button.x && mouseX <= button.x + button.width &&
           mouseY >= button.y && mouseY <= button.y + button.height;
}

function drawGameboard() {
    fields.forEach(field => {
        for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
            const cell = field.grid[r][c];
            const drawX = c + field.xOffset;
            if (cell.color) {
                const col = cell.special || cell.color === 'rainbow' ? getRainbowColor() : cell.color;
                drawCell(drawX, r, col);
            } else {
                drawCell(drawX, r, '#222');
            }
        }
        const cur = field.current;
        for (let r=0;r<cur.shape.length;r++) for (let c=0;c<cur.shape[r].length;c++) {
            if (!cur.shape[r][c]) continue;
            const x = cur.x + c + field.xOffset;
            const y = cur.y + r;
            if (y >= 0) {
                let col = cur.color;
                if (cur.special && cur.special.r === r && cur.special.c === c) {
                    col = getRainbowColor();
                }
                drawCell(x,y,col);
            }
        }
    });
}

function draw() {
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'gameover') {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawGameboard();
        drawGameOverScreen();
    } else if (gameState === 'paused') {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawGameboard();
        drawPauseScreen();
    } else {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawGameboard();
        if (flashTimer > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            flashTimer--;
        }
    }
}

function update(time) {
    // only update game if playing
    if (gameState === 'playing') {
        fields.forEach(field => {
            if (!field.running) {
                gameState = 'gameover';
                return;
            }
            if (!field.lastDrop) field.lastDrop = time;
            const delta = time - field.lastDrop;
            if (delta > dropInterval) {
                drop(field);
                field.lastDrop = time;
            }
        });
        // check if both players are out
        if (fields.some(f => !f.running)) {
            gameState = 'gameover';
        }
    }
    draw();
    requestAnimationFrame(update);
}

function start(canvasId) {
    canvas = document.getElementById(canvasId);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    BLOCK = Math.floor(canvas.height / ROWS);
    const halfWidth = canvas.width / 2;
    if (BLOCK * COLS > halfWidth) {
        BLOCK = Math.floor(halfWidth / COLS);
    }
    canvas.height = BLOCK * ROWS;
    ctx = canvas.getContext('2d');
    flashTimer = 0;
    rainbowHue = 0;
    gameState = 'start';

    // compute column offsets so each field is centered in its half
    const leftOffsetCols = Math.floor((halfWidth - COLS * BLOCK) / 2 / BLOCK);
    const rightOffsetCols = Math.floor(halfWidth / BLOCK) + leftOffsetCols;

    // create and initialize two fields with those offsets
    fields = [createField(leftOffsetCols), createField(rightOffsetCols)];
    fields.forEach(f => {
        makeGrid(f);
        spawn(f);
        f.running = true;
        f.lastDrop = 0;
    });

    // Add canvas click listener for buttons
    canvas.addEventListener('click', handleCanvasClick);

    requestAnimationFrame(update);
    attachInput();
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    buttons.forEach((btn, idx) => {
        if (isMouseInButton(x, y, btn)) {
            if (gameState === 'start') {
                if (btn.text === 'START GAME') {
                    gameState = 'playing';
                    fields.forEach(f => {
                        f.running = true;
                        f.lastDrop = 0;
                    });
                }
            } else if (gameState === 'paused') {
                if (btn.text === 'Return to Menu') {
                    gameState = 'start';
                    fields.forEach(f => {
                        makeGrid(f);
                        spawn(f);
                        f.running = true;
                        f.score = 0;
                        f.lastDrop = 0;
                    });
                }
            } else if (gameState === 'gameover') {
                if (btn.text === 'Restart') {
                    gameState = 'playing';
                    fields.forEach(f => {
                        makeGrid(f);
                        spawn(f);
                        f.running = true;
                        f.score = 0;
                        f.lastDrop = 0;
                    });
                } else if (btn.text === 'Menu') {
                    gameState = 'start';
                    fields.forEach(f => {
                        makeGrid(f);
                        spawn(f);
                        f.running = true;
                        f.score = 0;
                        f.lastDrop = 0;
                    });
                }
            }
        }
    });
}

function attachInput() {
    window.addEventListener('keydown', e => {
        // Handle pause key
        if ((e.key === 'p' || e.key === 'P') && gameState !== 'start') {
            e.preventDefault();
            if (gameState === 'playing') {
                gameState = 'paused';
            } else if (gameState === 'paused') {
                gameState = 'playing';
            }
            draw();
            return;
        }

        // Handle return to start key
        if ((e.key === 'r' || e.key === 'R') && gameState !== 'start' && gameState !== 'playing') {
            e.preventDefault();
            gameState = 'start';
            fields.forEach(f => {
                makeGrid(f);
                spawn(f);
                f.running = true;
                f.score = 0;
                f.lastDrop = 0;
            });
            draw();
            return;
        }

        // Only handle game controls when playing
        if (gameState !== 'playing') return;

        const f0 = fields[0];
        const f1 = fields[1];
        let handled = false;
        if (f0.running) {
            if (e.key === 'a' || e.key === 'A') { move(f0, -1); handled = true; }
            else if (e.key === 'd' || e.key === 'D') { move(f0, 1); handled = true; }
            else if (e.key === 's' || e.key === 'S') { drop(f0); handled = true; }
            else if (e.key === 'w' || e.key === 'W') { rotate(f0); handled = true; }
            else if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); hardDrop(f0); handled = true; }
        }
        if (f1.running) {
            if (e.key === 'ArrowLeft') { move(f1, -1); handled = true; }
            else if (e.key === 'ArrowRight') { move(f1, 1); handled = true; }
            else if (e.key === 'ArrowDown') { drop(f1); handled = true; }
            else if (e.key === 'ArrowUp') { rotate(f1); handled = true; }
            else if (e.key === ' ') { e.preventDefault(); hardDrop(f1); handled = true; }
        }
        if (handled) draw();
    });
}

// Expose minimal API
window.Tetris = { start };

// ...existing code...