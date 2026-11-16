/* TRIO Game Engine */
class TrioGame {
  constructor(containerId, isOnline = false, isHost = true) {
    this.container = document.getElementById(containerId);
    this.isOnline = isOnline;
    this.isHost = isHost;
    this.players = ['Você', 'Jogador 2'];
    this.currentPlayer = 0;
    this.deck = [];
    this.centerCards = []; // { val, revealed }
    this.playerHands = {}; // { 0: [1, 4, 8], ... } sorted ascending
    this.playerTrios = {}; // { 0: [[7,7,7], ...], ... }

    // Turn state
    this.activeNumber = null;
    this.revealedThisTurn = []; // [{type: 'center', idx, val}, {type: 'player', playerIdx, which, val, cardIdx}]
    this.failedTurn = false;
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
    let handSize = 5;
    if (numPlayers <= 3) handSize = 9;
    else if (numPlayers === 4) handSize = 7;
    else if (numPlayers === 5) handSize = 6;

    this.players.forEach((_, idx) => {
      const hand = this.deck.splice(0, handSize);
      hand.sort((a, b) => a - b);
      this.playerHands[idx] = hand;
    });

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
      failedTurn: this.failedTurn,
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
    this.failedTurn = state.failedTurn;
    this.gameOver = state.gameOver;
    this.render();
  }

  revealCenterCard(idx) {
    if (this.gameOver || this.failedTurn) return;
    const card = this.centerCards[idx];
    if (card.revealed) return;

    const val = card.val;
    if (this.activeNumber === null) {
      this.activeNumber = val;
    }

    this.revealedThisTurn.push({ type: 'center', idx, val });
    card.revealed = true;

    if (val !== this.activeNumber) {
      this.failedTurn = true;
      this.syncOrRender();
      return;
    }

    this.checkTrioProgress();
    this.syncOrRender();
  }

  revealPlayerCard(targetPlayerIdx, which) {
    if (this.gameOver || this.failedTurn) return;
    const hand = this.playerHands[targetPlayerIdx];
    if (!hand || hand.length === 0) return;

    const cardIdx = (which === 'low') ? 0 : hand.length - 1;
    const val = hand[cardIdx];

    if (this.activeNumber === null) {
      this.activeNumber = val;
    }

    this.revealedThisTurn.push({ type: 'player', playerIdx: targetPlayerIdx, which, val, cardIdx });

    if (val !== this.activeNumber) {
      this.failedTurn = true;
      this.syncOrRender();
      return;
    }

    this.checkTrioProgress();
    this.syncOrRender();
  }

  checkTrioProgress() {
    if (this.revealedThisTurn.length === 3) {
      const trioVal = this.activeNumber;
      alert(`🎉 TRIO FORMADO de número ${trioVal}! O Jogador ${this.currentPlayer + 1} pontuou.`);

      this.playerTrios[this.currentPlayer].push([trioVal, trioVal, trioVal]);

      this.revealedThisTurn.forEach(item => {
        if (item.type === 'player') {
          this.playerHands[item.playerIdx].splice(item.cardIdx, 1);
        }
      });

      if (trioVal === 7 || this.playerTrios[this.currentPlayer].length >= 3) {
        this.gameOver = true;
        alert(`🏆 FIM DE JOGO! O Jogador ${this.currentPlayer + 1} venceu a partida!`);
      }

      this.endTurn(true);
    }
  }

  acknowledgeFailure() {
    this.endTurn(false);
  }

  endTurn(success) {
    if (!success) {
      this.revealedThisTurn.forEach(item => {
        if (item.type === 'center') {
          this.centerCards[item.idx].revealed = false;
        }
      });
    }

    this.activeNumber = null;
    this.revealedThisTurn = [];
    this.failedTurn = false;
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
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div>Turno de: <b>${this.players[this.currentPlayer]}</b></div>
          <div>Alvo atual: <span class="badge">${this.activeNumber !== null ? this.activeNumber : 'Nenhum'}</span></div>
          <div>Reveladas: ${this.revealedThisTurn.length}/3</div>
        </div>
    `;

    if (this.failedTurn) {
      html += `
        <div style="background:rgba(239,68,68,0.15); border:1px solid var(--danger); padding:12px; border-radius:10px; text-align:center; margin-bottom:12px;">
          <b style="color:var(--danger);">❌ Errou! As cartas não formam o trio correspondente.</b><br>
          <button class="btn" style="margin-top:8px; background:var(--danger);" onclick="trioGame.acknowledgeFailure()">Recolher Cartas e Passar Turno</button>
        </div>
      `;
    }

    html += `</div>`;

    // Center Grid
    html += `<div class="card"><h3>Mesa Central (Cartas Viradas)</h3><div class="center-grid">`;
    this.centerCards.forEach((c, idx) => {
      const isRevealedThisTurn = this.revealedThisTurn.some(item => item.type === 'center' && item.idx === idx);
      let cardStyle = '';
      if (isRevealedThisTurn && this.failedTurn) {
        cardStyle = 'border: 3px solid var(--danger); background: rgba(239,68,68,0.2);';
      }
      html += `<div class="trio-card ${c.revealed ? '' : 'hidden'}" style="${cardStyle}" onclick="trioGame.revealCenterCard(${idx})">${c.revealed ? c.val : '?'}</div>`;
    });
    html += `</div></div>`;

    // Players Areas
    html += `<div class="card"><h3>Jogadores e Cartas nas Extremidades</h3><div class="player-area">`;
    this.players.forEach((name, idx) => {
      const hand = this.playerHands[idx] || [];
      const isCurrent = idx === this.currentPlayer;
      const hasCards = hand.length > 0;

      const lowVal = hasCards ? hand[0] : '-';
      const highVal = hasCards ? hand[hand.length - 1] : '-';

      // Check if this player's low or high card was revealed this turn
      const lowRevealed = this.revealedThisTurn.find(item => item.type === 'player' && item.playerIdx === idx && item.which === 'low');
      const highRevealed = this.revealedThisTurn.find(item => item.type === 'player' && item.playerIdx === idx && item.which === 'high');

      // Current player sees their own lowest and highest cards by default. Opponents' cards remain hidden until selected/revealed.
      const showLow = isCurrent || lowRevealed;
      const showHigh = isCurrent || highRevealed;

      const lowText = showLow ? `Menor (${lowVal})` : '🔽 Menor Carta';
      const highText = showHigh ? `Maior (${highVal})` : '🔼 Maior Carta';

      const lowStyle = (lowRevealed && this.failedTurn) ? 'border: 2px solid var(--danger); background: rgba(239,68,68,0.2);' : '';
      const highStyle = (highRevealed && this.failedTurn) ? 'border: 2px solid var(--danger); background: rgba(239,68,68,0.2);' : '';

      html += `
        <div class="player-box ${isCurrent ? 'active' : ''}">
          <b>${name}</b><br>
          <small>Cartas na mão: ${hand.length}</small><br>
          <div style="margin-top:8px; display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
            <button class="btn" style="padding:6px 10px; font-size:0.85rem; ${lowStyle}" ${!hasCards || lowRevealed ? 'disabled' : ''} onclick="trioGame.revealPlayerCard(${idx}, 'low')">${lowText}</button>
            <button class="btn" style="padding:6px 10px; font-size:0.85rem; ${highStyle}" ${!hasCards || highRevealed ? 'disabled' : ''} onclick="trioGame.revealPlayerCard(${idx}, 'high')">${highText}</button>
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
