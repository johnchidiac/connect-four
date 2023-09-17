/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const playButton = document.querySelector("#game-settings button");
playButton.addEventListener("click", startGame);

function startGame() {
  const gameWidth = document.querySelector("#game-width").value;
  const gameHeight = document.querySelector("#game-height").value;
  const player1Color = document.querySelector("#player-1-color").value;
  const player2Color = document.querySelector("#player-2-color").value;
  const activeGame = new Game(
    gameWidth,
    gameHeight,
    player1Color,
    player2Color
  );
  activeGame.setUpGame();
}

class Player {
  constructor(num) {
    this.num = num;
  }
}

class Game {
  constructor(width, height, player1Color, player2Color) {
    this.width = width;
    this.height = height;
    this.player1Color = player1Color;
    this.player2Color = player2Color;
    this.currPlayer = new Player(1);
    this.gameInProgress = false;
    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.htmlBoard = document.getElementById("board");
    this.setPlayerColors();
    this.clearBoard();
  }

  setUpGame() {
    this.makeBoard();
    this.makeHtmlBoard();
    playButton.innerText = "Start Game";
    //    playButton.classList.add("hidden");
  }

  setPlayerColors() {
    const style = document.createElement("style");
    style.innerHTML = `
    .player1 { background-color: ${this.player1Color}; }
    .player2 { background-color: ${this.player2Color}; }
    `;

    if (document.head.querySelector("style") === null) {
      document.head.appendChild(style);
    } else {
      document.head.querySelector("style").replaceWith(style);
    }
  }

  makeBoard() {
    // This function creates an array of arrays for the width and height of the board
    // A test for this might be to check if the width * height === the length of the board array * length of it's first element

    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  makeHtmlBoard() {
    // This function constructs the HTML for the board by adding a row of cells for the user to click on and drop their piece, then iterating over the board array and creating rows and cells of a table
    // A test for this might be to check if the number of <td>s created === the total number of items in the array

    // make column tops (clickable area for adding a piece to that column)
    this.top = document.createElement("tr");
    this.top.setAttribute("id", "column-top");
    this.handleTopClick = this.handleClick.bind(this);
    this.top.addEventListener("click", this.handleTopClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      this.top.append(headCell);
    }

    this.htmlBoard.append(this.top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        row.append(cell);
      }

      this.htmlBoard.append(row);
    }
  }

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.classList.add(`player${this.currPlayer.num}`);
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  disablePlay() {
    this.top.removeEventListener("click", this.handleTopClick);
    const topCells = this.top.querySelectorAll("td");
    topCells.forEach((cell) => {
      cell.classList.add("disabled");
    });
  }

  displayResults(resultMessage) {
    const results = document.createElement("div");
    results.classList.add("results");
    results.innerText = resultMessage;
    this.htmlBoard.prepend(results);
  }

  endGame(msg) {
    this.disablePlay();
    this.displayResults(msg);
    setTimeout(() => {
      this.clearBoard();
      startGame();
    }, 5000);
  }

  checkForWin() {
    const _win = (cells) => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer.num
      );
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }

  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;

    if (!this.gameInProgress) {
      //      playButton.classList.remove("hidden");
      playButton.innerText = "Restart Game";
      this.gameInProgress = true;
    }

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer.num;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.num} won!`);
    }

    // check for tie
    if (this.board.every((row) => row.every((cell) => cell))) {
      return this.endGame("Tie!");
    }

    // switch players
    this.currPlayer.num = this.currPlayer.num === 1 ? 2 : 1;
  }

  clearBoard() {
    this.htmlBoard.replaceChildren("");
  }
}
