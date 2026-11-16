/* Ultimate Tic Tac Toe Engine */
class UltimateTTT {
  constructor(containerId, isOnline = false, isHost = true) {
    this.container = document.getElementById(containerId);
    this.isOnline = isOnline;
    this.isHost = isHost;
    this.currentPlayer = 'X'; // X or O
    this.activeBoard = null; // null means any board is valid
    // 9 mini-boards, each with 9 cells ('', 'X', 'O')
    this.boards = Array.from({ length: 9 }, () => Array(9).fill(''));
    // Status of each mini-board ('', 'X', 'O', 'DRAW')
    this.boardStatus = Array(9).fill('');
    this.gameOver = false;
    this.winner = null;
  }

  init() {
    this.currentPlayer = 'X';
    this.activeBoard = null;
    this.boards = Array.from({ length: 9 }, () => Array(9).fill(''));
    this.boardStatus = Array(9).fill('');
    this.gameOver = false;
    this.winner = null;
    this.render();
  }

  getState() {
    return {
      currentPlayer: this.currentPlayer,
      activeBoard: this.activeBoard,
      boards: this.boards,
      boardStatus: this.boardStatus,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  setState(state) {
    this.currentPlayer = state.currentPlayer;
    this.activeBoard = state.activeBoard;
    this.boards = state.boards;
    this.boardStatus = state.boardStatus;
    this.gameOver = state.gameOver;
    this.winner = state.winner;
    this.render();
  }

  makeMove(boardIdx, cellIdx) {
    if (this.gameOver) return;

    // Check if this board is active (or any board if activeBoard is null or won/full)
    if (this.activeBoard !== null && this.activeBoard !== boardIdx && this.boardStatus[this.activeBoard] === '') {
      alert(`Você deve jogar no mini-tabuleiro destacado!`);
      return;
    }

    if (this.boardStatus[boardIdx] !== '') {
      alert(`Este mini-tabuleiro já foi decidido! Escolha outro.`);
      return;
    }

    if (this.boards[boardIdx][cellIdx] !== '') {
      return; // Cell already taken
    }

    // Make move
    this.boards[boardIdx][cellIdx] = this.currentPlayer;

    // Check mini-board winner
    const miniWinner = this.checkWinner(this.boards[boardIdx]);
    if (miniWinner) {
      this.boardStatus[boardIdx] = miniWinner;
    } else if (this.boards[boardIdx].every(c => c !== '')) {
      this.boardStatus[boardIdx] = 'DRAW';
    }

    // Check macro winner
    const macroWinner = this.checkWinner(this.boardStatus);
    if (macroWinner && macroWinner !== 'DRAW') {
      this.gameOver = true;
      this.winner = macroWinner;
      alert(`🏆 Fim de jogo! O Jogador ${macroWinner} venceu o Ultimate Tic Tac Toe!`);
    } else if (this.boardStatus.every(s => s !== '')) {
      this.gameOver = true;
      this.winner = 'Empate';
      alert(`🤝 Fim de jogo! Empate geral no Ultimate Tic Tac Toe!`);
    } else {
      // Set next active board based on cellIdx played
      // If target board is already decided, set activeBoard to null (free choice)
      if (this.boardStatus[cellIdx] !== '') {
        this.activeBoard = null;
      } else {
        this.activeBoard = cellIdx;
      }

      // Switch player
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    this.syncOrRender();
  }

  checkWinner(arr) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6]          // diagonals
    ];
    for (const [a, b, c] of lines) {
      if (arr[a] && arr[a] !== 'DRAW' && arr[a] === arr[b] && arr[a] === arr[c]) {
        return arr[a];
      }
    }
    return null;
  }

  syncOrRender() {
    if (this.isOnline && window.superaNet) {
      window.superaNet.send({
        type: 'UTTT_STATE',
        state: this.getState()
      });
    }
    this.render();
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="card" style="text-align:center;">
        <h2>❌ ⭕ Ultimate Tic Tac Toe</h2>
        <div style="margin-bottom:12px; display:flex; justify-content:center; gap:16px; align-items:center;">
          <div>Vez de: <span class="badge" style="font-size:1.1rem;">${this.currentPlayer}</span></div>
          <div>Tabuleiro Alvo: <span class="badge">${this.activeBoard !== null && this.boardStatus[this.activeBoard] === '' ? '#' + (this.activeBoard + 1) : 'Qualquer um (Livre)'}</span></div>
        </div>
      </div>
      <div class="ultimate-board">
    `;

    this.boards.forEach((cells, bIdx) => {
      const status = this.boardStatus[bIdx];
      const isActive = (this.activeBoard === null || this.boardStatus[this.activeBoard] !== '') || (this.activeBoard === bIdx);
      let boardClass = 'mini-board';
      if (isActive && status === '') boardClass += ' active-board';
      if (status === 'X') boardClass += ' won-x';
      if (status === 'O') boardClass += ' won-o';

      html += `<div class="${boardClass}">`;

      if (status !== '' && status !== 'DRAW') {
        html += `<div style="grid-column: span 3; grid-row: span 3; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:800; color:var(--acc);">${status}</div>`;
      } else if (status === 'DRAW') {
        html += `<div style="grid-column: span 3; grid-row: span 3; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:700; color:var(--mut);">VELHA</div>`;
      } else {
        cells.forEach((val, cIdx) => {
          html += `<div class="cell" onclick="utttGame.makeMove(${bIdx}, ${cIdx})">${val}</div>`;
        });
      }

      html += `</div>`;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}
