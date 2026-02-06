let snake1, snake2, food;
let currentPlayer = 1;
let selectedRow = 0;
let selectedCol = 0;
let keyboard = {
  layout: [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
    ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z', 'DEL', 'NEXT']
  ]
};
let gridSize = 35;  // Adjusted grid size to 30
let cellSize = 20;
let gameStarted = false;
let gameOver = false;
let foodIcon;
let player1Name = '';
let player2Name = '';
const MAX_HIGH_SCORES = 10;

function setup() {
  const canvas = createCanvas(gridSize * cellSize, gridSize * cellSize);
  canvas.parent('gameCanvas');  // Bind the canvas to the 'gameCanvas' div
  frameRate(10);

  // Initialize game objects
  resetGame();

  foodIcon = loadImage('food.ico');  // Replace with your icon path

  // Bind buttons
  document.getElementById('startButton').addEventListener('click', startGame);
  document.getElementById('playAgain').addEventListener('click', resetGame);

  // Initialize keyboard selection
  updateKeyboardSelection();

  document.addEventListener('keydown', handleKeyboardNavigation);
  

  // Eventlistener voor de spatiebalk om naar het homescreen te navigeren
  document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') { // Controleer of de spatiebalk is ingedrukt
    event.preventDefault(); // Voorkom standaard scrollgedrag van de spatiebalk
    window.location.href = 'homescreen.html'; // Navigeer naar het homescreen
  }
  });

  function handleKeyboardNavigation(event) {
    const key = event.key.toLowerCase();
    
    if (!gameStarted) {
      switch(key) {
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
          selectedCol = (selectedCol - 1 + 8) % 8;
          break;
        case 'arrowright':
        case 'd':
          event.preventDefault();
          selectedCol = (selectedCol + 1) % 8;
          break;
        case 'enter':
          event.preventDefault();
          handleKeySelection(keyboard.layout[selectedRow][selectedCol]);
          break;
      }
      updateKeyboardSelection();
    }

    displayHighScores();
  }

  function saveHighScore(playerName, score) {
    const highScores = JSON.parse(localStorage.getItem('snakeHighScores') || '[]');
  
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
  
    const topScores = highScores.slice(0, MAX_HIGH_SCORES);
  
    localStorage.setItem('snakeHighScores', JSON.stringify(topScores));
  
    displayHighScores(); // Update highscores direct na opslaan
  }

  function displayHighScores() {
    const highScoresList = document.querySelector('.high-scores-list');
    if (!highScoresList) return;
  
    highScoresList.innerHTML = ''; // Maak de lijst leeg voordat je nieuwe scores toevoegt
    const highScores = JSON.parse(localStorage.getItem('snakeHighScores') || '[]');
  
    if (highScores.length === 0) {
      highScoresList.innerHTML = '<div class="high-score">Nog geen scores</div>';
      return;
    }
  
    highScores.forEach((score, index) => {
      const scoreElement = document.createElement('div');
      scoreElement.className = 'high-score';
  
      // Voeg rang-emoji toe voor de top 3
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
  displayHighScores(); // Toon highscores direct bij het laden van de pagina
});
  function updateKeyboardSelection() {
    // Remove selected class from all keys
    document.querySelectorAll('.key').forEach(key => key.classList.remove('selected'));
    
    // Add selected class to current key
    const allRows = document.querySelectorAll('.keyboard-row');
    if (allRows[selectedRow]) {
      const keys = allRows[selectedRow].querySelectorAll('.key');
      if (keys[selectedCol]) {
        keys[selectedCol].classList.add('selected');
      }
    }
  }

  function handleKeySelection(key) {
    const input = document.getElementById(currentPlayer === 1 ? 'player1Name' : 'player2Name');
    let value = input.value;

    if (key === 'DEL') {
      input.value = value.slice(0, -1);
    } else if (key === 'PREV') {
      if (currentPlayer === 1) return; // Do nothing if on player 1
      // Only allow PREV when on player 2
      if (currentPlayer === 2) {
      currentPlayer = 1;
      const keyboard = document.getElementById('virtualKeyboard');
      const player1Container = document.querySelector('.input-container:first-child');
      player1Container.appendChild(keyboard);
      input.blur();
      document.getElementById('player1Name').focus();
      }
    } else if (key === 'NEXT') {
      if (currentPlayer === 1 && value.trim().length > 0) {
        currentPlayer = 2;
        const keyboard = document.getElementById('virtualKeyboard');
        const player2Container = document.querySelector('.input-container:nth-child(2)');
        player2Container.appendChild(keyboard);
        input.blur();
        document.getElementById('player2Name').focus();
      } else if (currentPlayer === 2 && value.trim().length > 0) {
        validateNames();
      }
    } else {
      input.value = value + key;
    }
  }

  function validateNames() {
    const p1Name = document.getElementById('player1Name').value.trim();
    const p2Name = document.getElementById('player2Name').value.trim();
    const startButton = document.getElementById('startButton');
    
    if (p1Name && p2Name) {
      startButton.disabled = false;
      startButton.focus();
    }
  }

 document.addEventListener('keydown', function(event) {
    // Check for u key (key code 85) to retry the game
    if (event.keyCode === 85) {
        event.preventDefault();
        let retryButton = document.getElementById('retryButton');
        let playAgain = document.getElementById('playAgain');
        
        if (retryButton && !retryButton.classList.contains('hidden')) {
            retryButton.click();
        } else if (playAgain && !playAgain.classList.contains('hidden')) {
            playAgain.click();
        }
    // Check for q key (key code 81) to start the game
    } else if (event.keyCode === 81)  {
        event.preventDefault();
        let playButton = document.getElementById('startButton');
        let retryButton = document.getElementById('playAgain');
        
        if (playButton && !playButton.classList.contains('hidden')) {
            playButton.click();
        } else if (retryButton && !retryButton.classList.contains('hidden')) {
            retryButton.click();
        }
    }

    // Check for arrow keys and handle navigation
    switch (event.keyCode) {
        case 37: // Left arrow
            // Handle left arrow key press
            break;
        case 38: // Up arrow
            // Handle up arrow key press
            break;
        case 39: // Right arrow
            // Handle right arrow key press
            break;
        case 40: // Down arrow
            // Handle down arrow key press
            break;
    }
  });
}

function draw() {
  if (!gameStarted) return;

  background('#1F2937');

  // Update snake positions
  if (!gameOver) {
    updateSnakes();
  }

  // Draw food
  drawFood();

  // Draw snakes
  drawSnake(snake1, '#00bFFF');
  drawSnake(snake2, '#C21A09');
}

function drawFood() {
  image(foodIcon, 
        food.x * cellSize, 
        food.y * cellSize, 
        cellSize, 
        cellSize);
}

function drawSnake(snake, color) {
  fill(color);
  noStroke();

  // Draw body
  snake.body.forEach((segment, index) => {
    if (index === 0) {
      // Draw head
      circle(
        segment.x * cellSize + cellSize / 2,
        segment.y * cellSize + cellSize / 2,
        cellSize - 2
      );
    } else {
      // Draw body segment
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

function updateSnakes() {
  updateSnake(snake1);
  updateSnake(snake2);

  // Check collisions
  checkCollisions();
}

function updateSnake(snake) {
  // Create new head position
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

  // Add new head
  snake.body.unshift(head);

  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    // Increase score for the correct snake
    if (snake === snake1) {
      snake2.score++;
    } else if (snake === snake2) {
      snake1.score++;
    }
    document.getElementById('eatSound').play();
    updateScore();
    generateFood();
  } else {
    // Only remove the tail segment if the snake didn't eat food
    snake.body.pop();
  }
}

function checkCollisions() {
  const head1 = snake1.body[0];
  const head2 = snake2.body[0];

  // Check if both heads collide
  if (head1.x === head2.x && head1.y === head2.y && head2.x === head1.x && head2.y === head1.y) {
    endGame('No one'); // No one wins
    return;
  }

  // Only check if snakes collide with each other (not themselves)
  if (checkSnakeCollision(head1, snake2.body)) {
    endGame('Player 1'); // Player 1 wins
    return;
  }

  if (checkSnakeCollision(head2, snake1.body)) {
    endGame('Player 2'); // Player 2 wins
    return;
  }

  // Check wall collisions if needed
  if (head1.x < 0 || head1.x >= gridSize || head1.y < 0 || head1.y >= gridSize) {
    endGame('Player 1'); // Player 1 wins
    return;
  }

  if (head2.x < 0 || head2.x >= gridSize || head2.y < 0 || head2.y >= gridSize) {
    endGame('Player 2'); // Player 2 wins
    return;
  }
}

function checkSnakeCollision(head, body) {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: floor(random(gridSize)),
      y: floor(random(gridSize))
    };
  } while (
    checkSnakeCollision(newFood, snake1.body) ||
    checkSnakeCollision(newFood, snake2.body)
  );
  food = newFood;
}

function keyPressed() {
  if (!gameStarted || gameOver) return;

  // Player 1 - Arrow Keys
  switch (keyCode) {
    case UP_ARROW:
      if (snake1.direction !== 'DOWN') snake1.direction = 'UP';
      break;
    case DOWN_ARROW:
      if (snake1.direction !== 'UP') snake1.direction = 'DOWN';
      break;
    case LEFT_ARROW:
      if (snake1.direction !== 'RIGHT') snake1.direction = 'LEFT';
      break;
    case RIGHT_ARROW:
      if (snake1.direction !== 'LEFT') snake1.direction = 'RIGHT';
      break;
  }

  // Player 2 - WASD
  switch (key.toLowerCase()) {
    case 'w':
      if (snake2.direction !== 'DOWN') snake2.direction = 'UP';
      break;
    case 's':
      if (snake2.direction !== 'UP') snake2.direction = 'DOWN';
      break;
    case 'a':
      if (snake2.direction !== 'RIGHT') snake2.direction = 'LEFT';
      break;
    case 'd':
      if (snake2.direction !== 'LEFT') snake2.direction = 'RIGHT';
      break;
  }
}

  function updateScore() {
    document.getElementById('score1').textContent = `${player1Name}: ${snake1.score} (RODE JOYSTICK)`;
    document.getElementById('score2').textContent = `${player2Name}: ${snake2.score} (BLAUWE JOYSTICK)`;
}

function saveHighScore(playerName, score) {
  // Laad bestaande scores
  const highScores = JSON.parse(localStorage.getItem('snakeHighScores') || '[]');

  // Maak een nieuwe score-entry
  const newScore = {
    name: playerName,
    score: score,
    date: new Date().toLocaleDateString('nl-NL'),
    timestamp: Date.now() // Voeg timestamp toe voor sorteren bij gelijke scores
  };

  // Voeg de nieuwe score toe aan de lijst
  highScores.push(newScore);

  // Sorteer scores op hoogste score, en bij gelijke scores op timestamp
  highScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.timestamp - a.timestamp;
  });

  // Beperk het aantal highscores tot MAX_HIGH_SCORES
  const topScores = highScores.slice(0, MAX_HIGH_SCORES);

  // Sla de bijgewerkte lijst op in localStorage
  localStorage.setItem('snakeHighScores', JSON.stringify(topScores));
}

function startGame() {
  player1Name = document.getElementById('player1Name').value.trim();
  player2Name = document.getElementById('player2Name').value.trim();
  
  // Controleer of beide namen zijn ingevuld
  if (!player1Name || !player2Name) {
    alert('Please enter names for both players!');
    return;
  }

  // Controleer of de namen hetzelfde zijn
  if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
    alert('Choose different names!');
    return;
  }
  
  // Start het spel
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  gameStarted = true;
  updateScore();
  loop();
}

function endGame(winner) {
  gameStarted = false;
  gameOver = true;
  noLoop();

  // Verberg het game-scherm en toon het game-over-scherm
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('gameOver').classList.remove('hidden');

  // Toon de winnaar
  if (winner === 'No one') {
    document.getElementById('winner').textContent = `Niemand heeft gewonnen! 😭`;
  } else {
    const winnerName = winner === 'Player 1' ? player1Name : player2Name;
    document.getElementById('winner').textContent = `${winnerName} wint met ${winner === 'Player 1' ? snake1.score : snake2.score} punten! 🎉`;
  }

  // Voeg de winnaar toe aan de highscores
  if (winner !== 'No one') {
    const winnerName = winner === 'Player 1' ? player1Name : player2Name;
    const score = winner === 'Player 1' ? snake1.score : snake2.score;
    saveHighScore(winnerName, score);
  }

  // Toon de bijgewerkte highscores
  displayHighScores();

  // Toon felicitatiebericht voor de top 3
  const highScores = JSON.parse(localStorage.getItem('snakeHighScores') || '[]');
  const lastScore = highScores.find(score => score.name === (winner === 'Player 1' ? player1Name : player2Name));
  const position = highScores.indexOf(lastScore) + 1;

  const congratulationsElement = document.getElementById('congratulations');
  if (position <= 3) {
    congratulationsElement.innerHTML = `🏆 Gefeliciteerd! Je staat op plaats ${position} in de highscores!`;
  } else {
    congratulationsElement.innerHTML = ''; // Geen bericht als niet in de top 3
  }
}

function resetGame() {
  // Reset game state
  snake1 = {
    body: [
      { x: 5, y: 20 },
      { x: 4, y: 20 },
      { x: 3, y: 20 },
    ],
    direction: 'RIGHT',
    score: 0
  };

  snake2 = {
    body: [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ],
    direction: 'RIGHT',
    score: 0
  };

  generateFood();
  gameOver = false;
  gameStarted = false;

  // Reset player names
  player1Name = '';
  player2Name = '';
  const player1Input = document.getElementById('player1Name');
  const player2Input = document.getElementById('player2Name');
  player1Input.value = '';
  player2Input.value = '';

  // Reset UI elements
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('gameOver').classList.add('hidden');
  document.getElementById('score1').textContent = '';
  document.getElementById('score2').textContent = '';
  document.getElementById('winner').textContent = '';
  document.getElementById('congratulations').textContent = '';

  // Reset focus to Player 1 input field
  currentPlayer = 1; // Start met speler 1
  player1Input.focus();
  player1Input.classList.add('input-focused');
  player2Input.classList.remove('input-focused');

  // Reset canvas
  clear();
  noLoop();
}

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'u') {
    // Herstart de game
    const playAgainButton = document.getElementById('playAgain');
    if (playAgainButton) {
      playAgainButton.click(); // Simuleer een klik op de "Play Again"-knop
    }
  }
});