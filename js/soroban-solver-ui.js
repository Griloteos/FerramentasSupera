/* Ferramentas Supera - Interface do Ábaco "Resolver Conta" */

(() => {
  const sb = $('#sb-solver');
  if (!sb) return;

  const N = 15, X0 = 20, W = 64;
  let B = [], D = [], H = [], cols = [], fingerEl = null;
  let currentRes = null;
  let currentStep = 0;
  let playTimer = 0;

  const NM = {
    9: 'U. bilhão', 8: 'C. milhão', 7: 'D. milhão', 6: 'U. milhão',
    5: 'C. milhar', 4: 'D. milhar', 3: 'U. milhar', 2: 'Centena',
    1: 'Dezena', 0: 'Unidade', '-1': 'Décimo', '-2': 'Centésimo',
    '-3': 'Milésimo', '-4': 'D. milésimo', '-5': 'C. milésimo'
  };

  const fmt = n => {
    const f = String(n % 1e5).padStart(5, '0').replace(/0+$/, '');
    return Math.floor(n / 1e5).toLocaleString('pt-BR') + (f ? ',' + f : '');
  };

  const cx = c => X0 + c * W + W / 2;

  function initBoard() {
    sb.textContent = '';
    mk('rect', { x: 8, y: 8, width: 984, height: 304, rx: 10, class: 'fr' }, sb);
    for (let c = 10; c < N; c++) mk('rect', { x: X0 + c * W, y: 10, width: W, height: 300, class: 'dc' }, sb);

    H = [];
    for (let c = 0; c < N; c++) {
      H.push(mk('rect', { x: X0 + c * W, y: 10, width: W, height: 300, class: 'hl' }, sb));
      mk('line', { x1: cx(c), y1: 10, x2: cx(c), y2: 310, class: 'rod' }, sb);
    }

    mk('rect', { x: 8, y: 104, width: 984, height: 12, class: 'br' }, sb);
    mk('circle', { cx: cx(9), cy: 110, r: 4, fill: '#fff' }, sb);

    const bead = (type) => {
      const g = mk('g', { class: 'bead ' + type }, sb);
      mk('path', { d: 'M-26 0L-12-14H12L26 0L12 14H-12Z' }, g);
      return g;
    };

    cols = Array.from({ length: N }, (_, c) => {
      const tx = (y, cls) => mk('text', { x: cx(c), y, class: cls, 'text-anchor': 'middle' }, sb);
      const q = { hb: bead('h'), eb: [0, 1, 2, 3].map(() => bead('e')) };
      q.dg = tx(352, 'dg');
      q.vl = tx(375, 'vl');
      q.lb = tx(396, 'lb');
      q.lb.textContent = NM[9 - c];
      return q;
    });

    fingerEl = mk('text', {
      x: 0,
      y: 330,
      'text-anchor': 'middle',
      'font-size': '26px',
      id: 'solver-finger',
      style: 'opacity:0; transition: transform .35s ease, opacity .25s;'
    }, sb);
    fingerEl.textContent = '👆';

    paintState(Array(N).fill(0), [], null);
  }

  function paintState(st, destaque = [], dedoCol = null) {
    let n = 0;
    st.forEach((d, c) => {
      const i = 14 - c, q = cols[c], x = cx(c);
      const h = d >= 5 ? 1 : 0;
      const e = d % 5;
      n += d * 10 ** i;
      q.hb.style.transform = `translate(${x}px,${h ? 90 : 36}px)`;
      q.eb.forEach((b, k) => b.style.transform = `translate(${x}px,${k < e ? 130 + k * 28 : 284 - (3 - k) * 28}px)`);
      q.dg.textContent = d;
      q.dg.classList.toggle('z', !d);
      q.vl.textContent = d ? fmt(d * 10 ** i) : '';
    });

    H.forEach((r, c) => {
      r.style.opacity = destaque.includes(c) ? 1 : 0;
    });

    if (fingerEl) {
      if (dedoCol !== null && dedoCol !== undefined && dedoCol >= 0 && dedoCol < N) {
        fingerEl.style.opacity = '1';
        fingerEl.style.transform = `translate(${cx(dedoCol)}px, 0)`;
      } else {
        fingerEl.style.opacity = '0';
      }
    }
  }

  function renderContaVisual(currentActiveTokenIdx) {
    if (!currentRes || !currentRes.tokens) return;
    const panelOp = $('#panel-operacao');
    panelOp.innerHTML = '';

    currentRes.tokens.forEach((tok, idx) => {
      const span = document.createElement('span');
      span.className = 'termo-conta';
      const sinal = idx === 0 ? '' : (tok.op === '-' ? ' − ' : ' + ');
      span.textContent = `${sinal}${tok.raw}`;

      if (idx < currentActiveTokenIdx) {
        span.classList.add('done');
      } else if (idx === currentActiveTokenIdx) {
        span.classList.add('current');
      }
      panelOp.appendChild(span);
    });
  }

  function renderStep(idx) {
    if (!currentRes || !currentRes.passos || currentRes.passos.length === 0) return;
    currentStep = Math.max(0, Math.min(idx, currentRes.passos.length - 1));
    const passo = currentRes.passos[currentStep];
    const isLastStep = currentStep === currentRes.passos.length - 1;

    paintState(passo.estado, passo.destaque || [], passo.dedo);

    let textoPasso = `<b>Passo ${currentStep + 1}:</b> ${passo.texto}`;
    if (isLastStep) {
      textoPasso += `<div style="margin-top:8px; padding:6px 12px; border-radius:8px; background:rgba(31,122,62,0.15); border:1px solid #1f7a3e; color:#1f7a3e; font-weight:700;">🎉 Conta resolvida com sucesso! Resultado final: ${currentRes.resultado}.</div>`;
    }

    $('#solver-step-text').innerHTML = textoPasso;
    $('#sol-step-count').textContent = `Passo ${currentStep + 1} de ${currentRes.passos.length}`;

    if (passo.operacao) {
      $('#panel-parcial').textContent = passo.operacao.parcial;
    }

    renderContaVisual(passo.tokenIdx !== undefined ? passo.tokenIdx : 0);

    document.querySelectorAll('.tag-badge').forEach(badge => {
      const tagName = badge.dataset.tag;
      badge.classList.toggle('active', passo.tags && passo.tags.includes(tagName));
    });
  }

  function stopPlay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = 0;
      $('#sol-play').textContent = '▶ Tocar';
    }
  }

  function resolverConta(expr) {
    stopPlay();
    const res = SuperaSolver.resolver(expr);
    if (res.erro) {
      alert(res.erro);
      return;
    }
    currentRes = res;
    currentStep = 0;

    const tagsDiv = $('#solver-tags');
    tagsDiv.innerHTML = '';
    res.tags.forEach(t => {
      const sp = document.createElement('span');
      sp.className = 'tag-badge';
      sp.dataset.tag = t;
      sp.textContent = `# ${t}`;
      tagsDiv.appendChild(sp);
    });

    renderStep(0);
  }

  window.preencherExemplo = (expr) => {
    $('#solver-input').value = expr;
    resolverConta(expr);
  };

  $('#solver-btn').onclick = () => {
    const expr = $('#solver-input').value.trim();
    if (expr) resolverConta(expr);
  };

  $('#sol-first').onclick = () => { stopPlay(); renderStep(0); };
  $('#sol-last').onclick = () => { stopPlay(); renderStep(currentRes ? currentRes.passos.length - 1 : 0); };
  $('#sol-prev').onclick = () => { stopPlay(); renderStep(currentStep - 1); };
  $('#sol-next').onclick = () => { stopPlay(); renderStep(currentStep + 1); };

  $('#sol-play').onclick = () => {
    if (playTimer) {
      stopPlay();
      return;
    }
    if (!currentRes) return;
    if (currentStep >= currentRes.passos.length - 1) currentStep = 0;
    $('#sol-play').textContent = '⏸ Pausar';
    playTimer = setInterval(() => {
      if (currentStep >= currentRes.passos.length - 1) {
        stopPlay();
      } else {
        renderStep(currentStep + 1);
      }
    }, 2800);
  };

  $('#btn-mode-livre').onclick = () => {
    $('#btn-mode-livre').classList.add('on');
    $('#btn-mode-resolver').classList.remove('on');
    $('#area-soroban-livre').style.display = 'block';
    $('#area-soroban-resolver').style.display = 'none';
  };

  $('#btn-mode-resolver').onclick = () => {
    $('#btn-mode-resolver').classList.add('on');
    $('#btn-mode-livre').classList.remove('on');
    $('#area-soroban-livre').style.display = 'none';
    $('#area-soroban-resolver').style.display = 'block';
  };

  initBoard();
})();
