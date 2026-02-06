let snake1, food;
let selectedRow = 0;
let selectedCol = 0;
let keyboard = {
  layout: [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
    ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z', 'DEL']
  ]
};
let gridSize = 35;
let cellSize = 20;
let gameStarted = false;
let gameOver = false;
let foodIcon;
let player1Name = '';
const MAX_HIGH_SCORES = 10;

function setup() {
  const canvas = createCanvas(gridSize * cellSize, gridSize * cellSize);
  canvas.parent('gameCanvas');
  frameRate(10);

  resetGame();

  foodIcon = loadImage('food.ico');

  document.getElementById('playAgain').addEventListener('click', resetGame);

  updateKeyboardSelection();

  document.addEventListener('keydown', handleKeyboardNavigation);

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      if (!gameStarted || gameOver) {
        window.location.href = 'homescreen.html';
      } else {
        event.preventDefault();
      }
    } else if (event.key.toLowerCase() === 'u') {
      const playAgainButton = document.getElementById('playAgain');
      if (playAgainButton) {
        playAgainButton.click();
      }
    }
  });
}

function startGame() {
  player1Name = document.getElementById('player1Name').value.trim();

  if (!player1Name) {
    alert('Voer een naam in!');
    return;
  }

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  gameStarted = true;

  snake1.score = 0;
  document.getElementById('score1').textContent = `${player1Name}: ${snake1.score} (BLAUWE JOYSTICK)`;

  loop();
}

function resetGame() {
    snake1 = {
      body: [
        { x: 5, y: 20 },
        { x: 4, y: 20 },
        { x: 3, y: 20 }
      ],
      direction: 'RIGHT',
      score: 0
    };
  
    generateFood();
    gameOver = false;
    gameStarted = false;
  
    player1Name = '';
    const player1Input = document.getElementById('player1Name');
    player1Input.value = '';
  
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('score1').textContent = '';
    document.getElementById('winner').textContent = '';
  
    clear();
    noLoop();
  }

  function updateSnake(snake) {
    const head = { ...snake.body[0] };
  
    switch (snake.direction) {
      case 'UP':
        head.y = (head.y - 1 + gridSize) % gridSize;
        break;
      case 'DOWN':
        head.y = (head.y + 1) % gridSize;
        break;
      case 'LEFT':
        head.x = (head.x - 1 + gridSize) % gridSize;
        break;
      case 'RIGHT':
        head.x = (head.x + 1) % gridSize;
        break;
    }
  
    snake.body.unshift(head);
  
    if (checkCollision(head, snake.body.slice(1))) {
      endGame();
      return;
    }
  
    if (head.x === food.x && head.y === food.y) {
      snake.score++;
      document.getElementById('score1').textContent = `${player1Name}: ${snake.score} (BLAUWE JOYSTICK)`;
      generateFood();
    } else {
      snake.body.pop();
    }
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: floor(random(gridSize)),
      y: floor(random(gridSize))
    };
  } while (checkCollision(newFood, snake1.body));
  food = newFood;
}

function checkCollision(head, body) {
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }

  function endGame() {
    gameStarted = false;
    gameOver = true;
    noLoop();
  
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('hidden');
  
    const playerName = player1Name || 'Player 1';
    const score = snake1.score;
  
    document.getElementById('winner').textContent = `Game Over! ${playerName}, je score is ${score}.`;
  
    saveHighScore(playerName, score, '1Player');
    displayHighScores('1Player');
  }

function drawSnake(snake, color) {
  fill(color);
  noStroke();

  snake.body.forEach((segment, index) => {
    if (index === 0) {
      circle(
        segment.x * cellSize + cellSize / 2,
        segment.y * cellSize + cellSize / 2,
        cellSize - 2
      );
    } else {
      rect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
        4
      );
    }
  });
}

function drawFood() {
  image(foodIcon, food.x * cellSize, food.y * cellSize, cellSize, cellSize);
}

function handleKeyboardNavigation(event) {
  const key = event.key.toLowerCase();

  if (!gameStarted) {
    switch (key) {
      case 'arrowup':
      case 'w':
        event.preventDefault();
        selectedRow = (selectedRow - 1 + 4) % 4;
        break;
      case 'arrowdown':
      case 's':
        event.preventDefault();
        selectedRow = (selectedRow + 1) % 4;
        break;
      case 'arrowleft':
      case 'a':
        event.preventDefault();
        selectedCol = (selectedCol - 1 + 7) % 7;
        break;
      case 'arrowright':
      case 'd':
        event.preventDefault();
        selectedCol = (selectedCol + 1) % 7;
        break;
      case 'enter':
        event.preventDefault();
        handleKeySelection(keyboard.layout[selectedRow][selectedCol]);
        break;
      case 'q':
        const input = document.getElementById('player1Name');
        if (input.value.trim().length > 0) {
          document.getElementById('startScreen').classList.add('hidden');
          document.getElementById('gameScreen').classList.remove('hidden');
          player1Name = input.value.trim();
          startGame();
        } else {
          alert('Voer een naam in voordat je verder gaat!');
        }
        break;
    }
    updateKeyboardSelection();
  } else {
    switch (key) {
      case 'arrowup':
      case 'w':
        if (snake1.direction !== 'DOWN') snake1.direction = 'UP';
        break;
      case 'arrowdown':
      case 's':
        if (snake1.direction !== 'UP') snake1.direction = 'DOWN';
        break;
      case 'arrowleft':
      case 'a':
        if (snake1.direction !== 'RIGHT') snake1.direction = 'LEFT';
        break;
      case 'arrowright':
      case 'd':
        if (snake1.direction !== 'LEFT') snake1.direction = 'RIGHT';
        break;
      case ' ':
        event.preventDefault();
        break;
    }
  }
}

function updateKeyboardSelection() {
  document.querySelectorAll('.key').forEach(key => key.classList.remove('selected'));

  const allRows = document.querySelectorAll('.keyboard-row');
  if (allRows[selectedRow]) {
    const keys = allRows[selectedRow].querySelectorAll('.key');
    if (keys[selectedCol]) {
      keys[selectedCol].classList.add('selected');
    }
  }
}

function handleKeySelection(key) {
  const input = document.getElementById('player1Name');
  let value = input.value;

  if (key === 'DEL') {
    input.value = value.slice(0, -1);
  } else {
    input.value = value + key;
  }
}

function getHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    return highScores;
  }
  
  function saveHighScore(playerName, score, gameType) {
    const highScoresKey = `snakeHighScores_${gameType}`;
    const highScores = JSON.parse(localStorage.getItem(highScoresKey) || '[]');
  
    const newScore = {
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString('nl-NL'),
      timestamp: Date.now()
    };
  
    highScores.push(newScore);
  
    highScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp;
    });
  
    const topScores = highScores.slice(0, 10);
  
    localStorage.setItem(highScoresKey, JSON.stringify(topScores));
  }

function displayHighScores(gameType = '1Player') {
  const highScoresKey = `snakeHighScores_${gameType}`;
  const highScores = JSON.parse(localStorage.getItem(highScoresKey) || '[]');

  const highScoresList = document.getElementById('highScoresListStart');
  if (!highScoresList) return;

  highScoresList.innerHTML = '';

  if (highScores.length === 0) {
    highScoresList.innerHTML = '<div class="high-score">Nog geen scores</div>';
    return;
  }

  highScores.forEach((score, index) => {
    const scoreElement = document.createElement('div');
    scoreElement.className = 'high-score';

    let rankEmoji = '';
    if (index === 0) rankEmoji = '🥇 ';
    else if (index === 1) rankEmoji = '🥈 ';
    else if (index === 2) rankEmoji = '🥉 ';

    scoreElement.innerHTML = `
      <span>${rankEmoji}${score.name}</span>
      <span>${score.score} pts</span>
    `;
    highScoresList.appendChild(scoreElement);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  displayHighScores();
});

function draw() {
  if (!gameStarted) return;

  background('#1F2937');

  if (!gameOver) {
    updateSnake(snake1);
  }

  drawFood();
  drawSnake(snake1, '#00bFFF');
}
