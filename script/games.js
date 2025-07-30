let draggedCmds = [];
const terminal = document.querySelector('.terminal');
const hitWallSound = new Audio('media/sounds/crash.mp3');
const victory = new Audio('media/sounds/victory.mp3');

// Enable drag from blocks
document.querySelectorAll('.block').forEach(block => {
  block.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', block.getAttribute('data-cmd'));
  });

  setupMobileDrag(block); // 👈 Add this for mobile
});


function allowDrop(e) {
  e.preventDefault();
}
function drop(e) {
  e.preventDefault();
  const cmd = e.dataTransfer.getData('text/plain');

  // Prompt user for repeat count
  let repeat = parseInt(prompt(`Hvor mange ganger vil du '${cmd}'?`, '1'));
  if (isNaN(repeat) || repeat < 1) repeat = 1;

  const blockData = { cmd, repeat };
  draggedCmds.push(blockData);

  const newCmd = document.createElement('div');
  newCmd.className = 'block';
  newCmd.textContent = cmd === 'forward' ? '→' :
                       cmd === 'up' ? '↑' :
                       cmd === 'down' ? '↓' :
                       cmd === 'left' ? '←' : '?';

  // Add repeat count as a small superscript
  if (repeat > 1) {
    const repeatSpan = document.createElement('sup');
    repeatSpan.textContent = repeat;
    newCmd.appendChild(repeatSpan);
  }

  newCmd.setAttribute('draggable', true);

  // Drag out behavior
  newCmd.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', cmd);
    newCmd.classList.add('being-dragged');
  });

  newCmd.addEventListener('dragend', () => {
    // Remove from DOM and command list if dragged outside terminal
    if (!newCmd.closest('.terminal')) {
      const index = Array.from(terminal.children).indexOf(newCmd);
      if (index > -1) {
        draggedCmds.splice(index, 1);
      }
      newCmd.remove();
    }
    newCmd.classList.remove('being-dragged');
  });

  terminal.appendChild(newCmd);
}



// Maze layout: 0 = path, 1 = wall, 'S' = start, 'G' = goal
const mazeLayout = [
  ['S', 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 1, 0, 'G', 0],
];

const playground = document.getElementById('playground');
let rabbitPosition = { row: 0, col: 0 };

function renderMaze() {
  playground.innerHTML = '';
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;

      const val = mazeLayout[row][col];

      if (val === 1) cell.classList.add('wall');
      if (val === 'S') {
        cell.classList.add('start');
        rabbitPosition = { row, col };
        const img = document.createElement('img');
        img.src = 'media/games/rabbit.png';
        img.className = 'rabbit';
        cell.appendChild(img);
      }
      if (val === 'G') cell.classList.add('goal');

      playground.appendChild(cell);
    }
  }
}

function runCommands() {
  let i = 0;
  let repeatIndex = 0;
function next() {
  if (i >= draggedCmds.length) return;  // End if no more commands

  const { cmd, repeat } = draggedCmds[i];
  let { row, col } = rabbitPosition;
  let nextRow = row;
  let nextCol = col;

  if (cmd === 'forward') nextCol++;
  if (cmd === 'left') nextCol--;
  if (cmd === 'up') nextRow--;
  if (cmd === 'down') nextRow++;

  const rabbitImg = document.querySelector('.rabbit');

  // Check bounds first
  if (nextRow < 0 || nextRow >= 10 || nextCol < 0 || nextCol >= 10) {
    alert('❌ Out of bounds!');
    hitWallSound.play();

    // Vibrate rabbit
    if (rabbitImg) {
      rabbitImg.classList.add('vibrate');
      setTimeout(() => rabbitImg.classList.remove('vibrate'), 300);
    }
    return;  // Stop further moves on error
  }

  // Check if it's a wall
  if (mazeLayout[nextRow][nextCol] === 1) {

    hitWallSound.play();

    // Vibrate rabbit
    if (rabbitImg) {
      rabbitImg.classList.add('vibrate');
      setTimeout(() => rabbitImg.classList.remove('vibrate'), 300);
    }
    return;  // Stop further moves on error
  }

  // Valid move
  rabbitPosition = { row: nextRow, col: nextCol };

  const newCell = document.querySelector(`.cell[data-row="${nextRow}"][data-col="${nextCol}"]`);

  if (newCell && rabbitImg) {
    newCell.appendChild(rabbitImg);

    if (mazeLayout[nextRow][nextCol] === 'G') {
      setTimeout(() => victory.play(), 100);
      return;  // End after success
    }
  } else {
    console.error('Missing rabbit or cell!');
    return;
  }

  // Handle repetition
  repeatIndex++;
  if (repeatIndex >= repeat) {
    repeatIndex = 0;
    i++;
  }

  setTimeout(next, 500);
}


  next();
}
function resetGame() {
  draggedCmds = [];
  const terminal = document.querySelector('.terminal');
  terminal.innerHTML = '';
  renderMaze();
}

terminal.addEventListener('dragend', e => {
  const dropTarget = document.elementFromPoint(e.clientX, e.clientY);

  if (!terminal.contains(dropTarget)) {
    // Get the index stored in dragstart event
    const index = Number(e.dataTransfer.getData('index'));

    if (!isNaN(index) && index >= 0 && index < draggedCmds.length) {
      draggedCmds.splice(index, 1);
      if (terminal.children[index]) {
        terminal.removeChild(terminal.children[index]);
      }
    }
  }
});

let draggingElement = null;
let ghostElement = null;

function setupMobileDrag(block) {
  block.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];

    draggingElement = block;
    ghostElement = block.cloneNode(true);
    ghostElement.style.position = 'absolute';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.opacity = '0.7';
    ghostElement.style.zIndex = '1000';
    document.body.appendChild(ghostElement);

    moveGhost(touch.pageX, touch.pageY);
  });

  block.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    moveGhost(touch.pageX, touch.pageY);
  });

  block.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!ghostElement) return;

    const terminalRect = terminal.getBoundingClientRect();
    const ghostCenterX = ghostElement.offsetLeft + ghostElement.offsetWidth / 2;
    const ghostCenterY = ghostElement.offsetTop + ghostElement.offsetHeight / 2;

    // Check if dropped over terminal
    if (
      ghostCenterX >= terminalRect.left &&
      ghostCenterX <= terminalRect.right &&
      ghostCenterY >= terminalRect.top &&
      ghostCenterY <= terminalRect.bottom
    ) {
      const cmd = draggingElement.getAttribute('data-cmd');
      const dropEvent = new Event('drop');
      dropEvent.dataTransfer = { getData: () => cmd };
      drop(dropEvent); // Call your existing drop logic
    }

    document.body.removeChild(ghostElement);
    ghostElement = null;
    draggingElement = null;
  });
}

function moveGhost(x, y) {
  ghostElement.style.left = x - 25 + 'px';
  ghostElement.style.top = y - 25 + 'px';
}



// Initial render
renderMaze();
