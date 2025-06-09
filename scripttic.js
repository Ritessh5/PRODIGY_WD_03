//NAVBAR USERNAME LOGIC
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("Username")) {
    const username = prompt("Enter your Username:");
    if (username) {
      localStorage.setItem("Username", username);
    }
  }

  const name = localStorage.getItem("Username") || "Guest";
  const usernameDisplay = document.getElementById("username-display");
  if (usernameDisplay) usernameDisplay.textContent = name;
});

//RUN ONLY ON GAME PAGE
if (document.getElementById("board")) {
  const board = document.getElementById("board");
  const cells = document.querySelectorAll("[data-cell]");
  const statusText = document.getElementById("status");
  const restartButton = document.getElementById("restartButton");

  let currentPlayer = "X";
  let gameActive = true;
  let winCombo = [];

  const urlParams = new URLSearchParams(window.location.search);
  const gameMode = urlParams.get('mode'); // 'ai' or '2p'

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function startGame() {
    cells.forEach(cell => {
      cell.textContent = "";
      cell.className = "cell";
      cell.addEventListener("click", handleClick, { once: true });
    });
    winCombo = [];
    currentPlayer = "X";
    gameActive = true;
    document.querySelector(".winning-line")?.remove();
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
  }

  function handleClick(e) {
    const cell = e.target;
    if (!gameActive || cell.textContent !== "") return;

    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    if (checkWin(currentPlayer)) {
      drawWinningLine(winCombo);

      // Get username for AI mode
      const username = localStorage.getItem("Username") || "Guest";

      if (gameMode === "ai") {
        if (currentPlayer === "X") {
          // User won
          statusText.textContent = `${username} Wins!`;
          saveMatch(`${username} Wins!`);
        } else {
          // AI won
          statusText.textContent = `AI Wins!`;
          saveMatch(`AI Wins!`);
        }
      } else {
        // 2 player mode
        statusText.textContent = `Player ${currentPlayer} Wins!`;
        saveMatch(`Player ${currentPlayer} Wins!`);
      }

      gameActive = false;
      endGame();

    } else if (isDraw()) {
      statusText.textContent = "It's a Draw!";
      saveMatch("Draw");
      gameActive = false;
      endGame();

    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      statusText.textContent = `Player ${currentPlayer}'s Turn`;

      if (gameMode === "ai" && currentPlayer === "O") {
        setTimeout(aiMove, 500);
      }
    }
  }

  function aiMove() {
    if (!gameActive) return;

    const emptyCells = [...cells].filter(cell => cell.textContent === "");
    if (emptyCells.length === 0) return;

    // Try to win
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].textContent === "") {
        cells[i].textContent = currentPlayer;
        if (checkWin(currentPlayer)) {
          cells[i].textContent = "";
          cells[i].click();
          return;
        }
        cells[i].textContent = "";
      }
    }

    // Try to block opponent
    const opponent = "X";
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].textContent === "") {
        cells[i].textContent = opponent;
        if (checkWin(opponent)) {
          cells[i].textContent = "";
          cells[i].click();
          return;
        }
        cells[i].textContent = "";
      }
    }

    // Random move
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    randomCell.click();
  }

  function checkWin(player) {
    return winPatterns.some(pattern => {
      if (pattern.every(i => cells[i].textContent === player)) {
        winCombo = pattern;
        return true;
      }
      return false;
    });
  }

  function isDraw() {
    return [...cells].every(cell => cell.textContent);
  }

  function endGame() {
    cells.forEach(cell => cell.removeEventListener("click", handleClick));
  }

  function drawWinningLine(indexes) {
    const line = document.createElement("div");
    line.classList.add("winning-line");

    const [a, , c] = indexes;
    const cellA = cells[a].getBoundingClientRect();
    const cellC = cells[c].getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

    const x1 = cellA.left + cellA.width / 2 - boardRect.left;
    const y1 = cellA.top + cellA.height / 2 - boardRect.top;
    const x2 = cellC.left + cellC.width / 2 - boardRect.left;
    const y2 = cellC.top + cellC.height / 2 - boardRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    line.style.width = `${length}px`;
    line.style.height = `5px`;
    line.style.background = `red`;
    line.style.position = `absolute`;
    line.style.top = `${centerY}px`;
    line.style.left = `${centerX}px`;
    line.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    line.style.transformOrigin = `center`;
    line.style.zIndex = 10;

    board.appendChild(line);
  }

  function saveMatch(result) {
    const history = JSON.parse(localStorage.getItem("matchHistory") || "[]");
    history.push({ result, time: new Date().toLocaleString() });
    localStorage.setItem("matchHistory", JSON.stringify(history));
  }

  restartButton.addEventListener("click", startGame);
  startGame();
}
