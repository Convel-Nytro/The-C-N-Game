let tiles = [];
let level = 1;
const size = 4; // 4x4 grid
const totalLevels = 20;

// Game DOM elements
const puzzleContainer = document.getElementById("puzzle-container");
const levelDisplay = document.getElementById("level-display");
const mainMenuBtn = document.getElementById("main-menu-btn");
const retryBtn = document.getElementById("retry-btn");

function startGame() {
  // Try to load the saved game state
  const savedState = loadGameState();
  if (savedState) {
    tiles = savedState.tiles;
    level = savedState.level;
    loadLevel(level);
  } else {
    level = 1;
    loadLevel(level);
  }
}

function loadLevel(level) {
  levelDisplay.textContent = `Level ${level}`;
  initializeTiles(size);
  renderPuzzle(size);
  saveGameState();  // Autosave after loading a level
}

function initializeTiles(size) {
  if (!tiles || tiles.length !== size * size) {
    tiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1); // Numbers 1 to 15
    tiles.push(null); // Add empty space
  }

  // Shuffle tiles until solvable
  do {
    shuffle(tiles);
  } while (!isSolvable(tiles, size));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isSolvable(array, size) {
  let inversions = 0;
  const emptyIndex = array.indexOf(null);
  const emptyRow = Math.floor(emptyIndex / size);

  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] && array[j] && array[i] > array[j]) inversions++;
    }
  }

  return size % 2 !== 0
    ? inversions % 2 === 0
    : (size - emptyRow) % 2 === 0 ? inversions % 2 !== 0 : inversions % 2 === 0;
}

function moveTile(index, size) {
  const emptyIndex = tiles.indexOf(null);

  // Valid moves: Up, Down, Left, Right
  const validMoves = [
    index - 1, // Left
    index + 1, // Right
    index - size, // Up
    index + size // Down
  ];

  // Check if the move is valid and within the same row/column
  if (validMoves.includes(emptyIndex) && isValidMove(index, emptyIndex, size)) {
    // Swap the clicked tile with the empty space
    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];

    // Update the puzzle grid
    renderPuzzle(size);

    // Autosave after each move
    saveGameState();

    // Check if the puzzle is solved
    if (isSolved()) {
      setTimeout(() => {
        alert("Level Complete!");
        // Increment the level after completing a level
        if (level < totalLevels) {
          level++;
          loadLevel(level);
        } else {
          alert("Congratulations! You completed all levels!");
        }
      }, 300);
    }
  }
}

function isValidMove(index, emptyIndex, size) {
  const row = Math.floor(index / size);
  const emptyRow = Math.floor(emptyIndex / size);

  // A move is valid if it's in the same row or column as the empty space
  return (
    (row === emptyRow && Math.abs(index - emptyIndex) === 1) || // Left/Right move
    Math.abs(index - emptyIndex) === size // Up/Down move
  );
}

function renderPuzzle(size) {
  puzzleContainer.innerHTML = ""; // Clear the container
  tiles.forEach((tile, index) => {
    const tileElement = document.createElement("div");
    tileElement.classList.add("tile");

    if (tile === null) {
      tileElement.classList.add("empty");
    } else {
      tileElement.textContent = tile;
      tileElement.addEventListener("click", () => moveTile(index, size));
    }

    puzzleContainer.appendChild(tileElement);
  });
}

function isSolved() {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return true;
}

// Save the current game state to localStorage
function saveGameState() {
  const gameState = {
    tiles: tiles,
    level: level
  };
  localStorage.setItem("puzzleGameState", JSON.stringify(gameState));
}

// Load the saved game state from localStorage
function loadGameState() {
  const savedState = localStorage.getItem("puzzleGameState");
  if (savedState) {
    return JSON.parse(savedState);
  }
  return null;
}

// Event Listeners
retryBtn.addEventListener("click", () => loadLevel(level));

// Modified Main Menu Button Event Listener
mainMenuBtn.addEventListener("click", () => {
  // Hide the game screen and show the main menu
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("main-menu").style.display = "block";
  // Clear saved state when going back to the main menu
  localStorage.removeItem("puzzleGameState");
});

// Start Game
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  startGame();
});
