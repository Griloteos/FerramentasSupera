/* TRIO Game Engine */
class TrioGame {
  constructor(containerId, isOnline = false, isHost = true) {
    this.container = document.getElementById(containerId);
    this.isOnline = isOnline;
    this.isHost = isHost;
    this.players = ['Você', 'Jogador 2', 'Jogador 3'];
    this.myIndex = 0;
    this.currentPlayer = 0;
    this.deck = [];
    this.centerCards = []; // Face down cards in center
    this.playerHands = {}; // { 0: [1, 4, 8], 1: [2, 5, 9], ... } sorted ascending
    this.playerTrios = {}; // { 0: [[7,7,7], [3,3,3]], 1: [] }

    // Turn state
    this.activeNumber = null;
    this.revealedThisTurn = []; // [{type: 'center', idx: 3, val: 5}, {type: 'player', playerIdx: 1, which: 'high', val: 5}]
    this.gameOver = false;
  }

  init(playerNames = ['Você', 'Jogador 2']) {
    this.players = playerNames;
    this.playerHands = {};
    this.playerTrios = {};
    this.players.forEach((_, idx) => {
      this.playerHands[idx] = [];
      this.playerTrios[idx] = [];
    });

    if (!this.isOnline || this.isHost) {
      this.buildDeck();
      this.dealCards();
      if (this.isOnline && window.superaNet) {
        window.superaNet.send({
          type: 'TRIO_INIT',
          state: this.getState()
        });
      }
    }
    this.render();
  }

  buildDeck() {
    this.deck = [];
    for (let n = 1; n <= 12; n++) {
      for (let c = 0; c < 3; c++) {
        this.deck.push(n);
      }
    }
    // Shuffle deck
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards() {
    const numPlayers = this.players.length;
    // Hand sizes based on player count
    let handSize = 5;
    if (numPlayers <= 3) handSize = 9;
    else if (numPlayers === 4) handSize = 7;
    else if (numPlayers === 5) handSize = 6;

    this.players.forEach((_, idx) => {
      const hand = this.deck.splice(0, handSize);
      hand.sort((a, b) => a - b);
      this.playerHands[idx] = hand;
    });

    // Remaining cards go to center grid face down
    this.centerCards = this.deck.map(val => ({ val, revealed: false }));
    this.deck = [];
  }

  getState() {
    return {
      currentPlayer: this.currentPlayer,
      centerCards: this.centerCards,
      playerHands: this.playerHands,
      playerTrios: this.playerTrios,
      activeNumber: this.activeNumber,
      revealedThisTurn: this.revealedThisTurn,
      gameOver: this.gameOver
    };
  }

  setState(state) {
    this.currentPlayer = state.currentPlayer;
    this.centerCards = state.centerCards;
    this.playerHands = state.playerHands;
    this.playerTrios = state.playerTrios;
    this.activeNumber = state.activeNumber;
    this.revealedThisTurn = state.revealedThisTurn;
    this.gameOver = state.gameOver;
    this.render();
  }

  revealCenterCard(idx) {
    if (this.gameOver) return;
    const card = this.centerCards[idx];
    if (card.revealed) return;

    // Check value
    const val = card.val;
    if (this.activeNumber === null) {
      this.activeNumber = val;
    }

    if (val !== this.activeNumber) {
      // Failed turn!
      alert(`Errou! Saiu o número ${val} (o alvo era ${this.activeNumber}). Fim do turno.`);
      this.endTurn(false);
      return;
    }

    // Correct match!
    this.revealedThisTurn.push({ type: 'center', idx, val });
    card.revealed = true;

    this.checkTrioProgress();
    this.syncOrRender();
  }

  revealPlayerCard(targetPlayerIdx, which) {
    if (this.gameOver) return;
    const hand = this.playerHands[targetPlayerIdx];
    if (!hand || hand.length === 0) return;

    // Lowest is index 0, Highest is index hand.length - 1 (since sorted ascending)
    const cardIdx = (which === 'low') ? 0 : hand.length - 1;
    const val = hand[cardIdx];

    if (this.activeNumber === null) {
      this.activeNumber = val;
    }

    if (val !== this.activeNumber) {
      alert(`Errou! Saiu o número ${val} do Jogador ${targetPlayerIdx + 1} (o alvo era ${this.activeNumber}). Fim do turno.`);
      this.endTurn(false);
      return;
    }

    this.revealedThisTurn.push({ type: 'player', playerIdx: targetPlayerIdx, which, val, cardIdx });
    this.checkTrioProgress();
    this.syncOrRender();
  }

  checkTrioProgress() {
    if (this.revealedThisTurn.length === 3) {
      // Formed a TRIO!
      const trioVal = this.activeNumber;
      alert(`🎉 TRIO FORMADO de número ${trioVal}! O Jogador ${this.currentPlayer + 1} pontuou.`);

      this.playerTrios[this.currentPlayer].push([trioVal, trioVal, trioVal]);

      // Remove revealed cards if they were player cards or center cards
      this.revealedThisTurn.forEach(item => {
        if (item.type === 'player') {
          this.playerHands[item.playerIdx].splice(item.cardIdx, 1);
        }
      });

      // Check win condition
      if (trioVal === 7 || this.playerTrios[this.currentPlayer].length >= 3) {
        this.gameOver = true;
        alert(`🏆 FIM DE JOGO! O Jogador ${this.currentPlayer + 1} venceu a partida!`);
      }

      this.endTurn(true);
    }
  }

  endTurn(success) {
    // Reset revealed center cards back to hidden if failed
    if (!success) {
      this.revealedThisTurn.forEach(item => {
        if (item.type === 'center') {
          this.centerCards[item.idx].revealed = false;
        }
      });
    }

    this.activeNumber = null;
    this.revealedThisTurn = [];
    if (!this.gameOver) {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
    this.syncOrRender();
  }

  syncOrRender() {
    if (this.isOnline && window.superaNet) {
      window.superaNet.send({
        type: 'TRIO_STATE',
        state: this.getState()
      });
    }
    this.render();
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="card">
        <h2>🃏 Jogo TRIO (Supera Edition)</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>Turno de: <b>${this.players[this.currentPlayer]}</b></div>
          <div>Alvo atual: <span class="badge">${this.activeNumber !== null ? this.activeNumber : 'Nenhum'}</span></div>
          <div>Reveladas: ${this.revealedThisTurn.length}/3</div>
        </div>
      </div>
    `;

    // Center Grid
    html += `<div class="card"><h3>Mesa Central (Cartas Viradas)</h3><div class="center-grid">`;
    this.centerCards.forEach((c, idx) => {
      html += `<div class="trio-card ${c.revealed ? '' : 'hidden'}" onclick="trioGame.revealCenterCard(${idx})">${c.revealed ? c.val : '?'}</div>`;
    });
    html += `</div></div>`;

    // Players Areas
    html += `<div class="card"><h3>Jogadores e Cartas nas Extremidades</h3><div class="player-area">`;
    this.players.forEach((name, idx) => {
      const hand = this.playerHands[idx] || [];
      const low = hand.length > 0 ? hand[0] : '-';
      const high = hand.length > 0 ? hand[hand.length - 1] : '-';
      const isCurrent = idx === this.currentPlayer;

      html += `
        <div class="player-box ${isCurrent ? 'active' : ''}">
          <b>${name}</b><br>
          <small>Cartas na mão: ${hand.length}</small><br>
          <div style="margin-top:8px; display:flex; gap:6px; justify-content:center;">
            <button class="btn" style="padding:6px 10px; font-size:0.85rem;" onclick="trioGame.revealPlayerCard(${idx}, 'low')">Menor (${low})</button>
            <button class="btn" style="padding:6px 10px; font-size:0.85rem;" onclick="trioGame.revealPlayerCard(${idx}, 'high')">Maior (${high})</button>
          </div>
          <div style="margin-top:6px; font-size:0.8rem; color:var(--acc);">
            Trios: ${this.playerTrios[idx].length} / 3
          </div>
        </div>
      `;
    });
    html += `</div></div>`;

    this.container.innerHTML = html;
  }
}
