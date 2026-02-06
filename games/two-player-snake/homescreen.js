let selectedButtonIndex = 0; // 0 = "1 Player", 1 = "2 Player"

document.getElementById('onePlayerButton').addEventListener('click', () => {
    // Start de game in 1-player mode
    window.location.href = '1 player.html';
    // Voeg hier logica toe voor 1-player mode
  });
  
  document.getElementById('twoPlayerButton').addEventListener('click', () => {
    // Start de game in 2-player mode
    window.location.href = 'multi snake.html';
  });

  function updateButtonSelection() {
    const buttons = document.querySelectorAll('.button');
    
    // Verwijder de 'selected' klasse van alle knoppen
    buttons.forEach(button => button.classList.remove('selected'));
  
    // Voeg de 'selected' klasse toe aan de huidige selectie
    if (buttons[selectedButtonIndex]) {
      buttons[selectedButtonIndex].classList.add('selected');
    }
  }

  function handleButtonSelection(key) {
    const buttons = document.querySelectorAll('.button');
  
    if (key === 'LEFT' || key === 'A') {
      // Ga naar links
      selectedButtonIndex = (selectedButtonIndex - 1 + buttons.length) % buttons.length;
      updateButtonSelection();
    } else if (key === 'RIGHT' || key === 'D') {
      // Ga naar rechts
      selectedButtonIndex = (selectedButtonIndex + 1) % buttons.length;
      updateButtonSelection();
    } else if (key === 'ENTER') {
      // Activeer de geselecteerde knop
      if (buttons[selectedButtonIndex]) {
        buttons[selectedButtonIndex].click();
      }
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      handleButtonSelection('LEFT');
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      handleButtonSelection('RIGHT');
    } else if (event.key === 'Enter') {
      handleButtonSelection('ENTER');
    }
  });

