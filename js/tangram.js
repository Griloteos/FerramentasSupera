/* Ferramentas Supera - Tangram Interativo com Bolinha de Giro, Encaixe e Contornos */

(() => {
  const tg = $('#tg'), S = 84, WW = 2000, WH = 1400, OX = 1000 - 2 * S, OY = 700 - 2 * S;
  if (!tg) return;

  // Camada de Contorno / Silhueta da Figura
  const outlineGroup = mk('g', { id: 'tg-outline-group' }, tg);

  const defs = [
    ['#e4572e', [[0, 0], [4, 0], [2, 2]]],
    ['#3a86ff', [[0, 0], [2, 2], [0, 4]]],
    ['#ffbe0b', [[4, 4], [4, 2], [2, 4]]],
    ['#8338ec', [[2, 2], [3, 1], [4, 2], [3, 3]]],
    ['#06d6a0', [[4, 0], [4, 2], [3, 1]]],
    ['#ff006e', [[1, 3], [3, 3], [2, 2]]],
    ['#fb8500', [[0, 4], [2, 4], [3, 3], [1, 3]]]
  ];

  const pcs = defs.map(([col, pts], idx) => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const localPts = pts.map(p => [(p[0] - cx) * S, (p[1] - cy) * S]);
    const el = mk('polygon', {
      points: localPts.map(p => p[0] + ',' + p[1]).join(' '),
      fill: col,
      class: 'pc'
    }, tg);
    const topY = Math.min(...localPts.map(p => p[1]));
    return { id: idx, el, localPts, hx: OX + cx * S, hy: OY + cy * S, x: 0, y: 0, r: 0, f: 1, topY, defaultCol: col, col };
  });

  // Restaura cores salvas do localStorage se existirem
  try {
    const savedColors = JSON.parse(localStorage.getItem('supera_tangram_colors') || '{}');
    pcs.forEach((p, idx) => {
      if (savedColors[idx]) {
        p.col = savedColors[idx];
        p.el.setAttribute('fill', p.col);
      }
    });
  } catch(e) {}

  const draw = o => o.el.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.r}) scale(${o.f} 1)`);

  // Indicador visual de encaixe (ponto brilhante)
  const snapDot = mk('circle', { class: 'tg-snap-indicator', cx: 0, cy: 0, r: 7, style: 'opacity:0;' }, tg);

  // Alça visual de rotação (Bolinha acoplada à peça selecionada)
  const handleGroup = mk('g', { id: 'tg-handle', style: 'display:none;' }, tg);
  const handleStem = mk('line', { class: 'tg-rot-stem', x1: 0, y1: 0, x2: 0, y2: -100 }, handleGroup);
  const handleKnob = mk('circle', { class: 'tg-rot-knob', cx: 0, cy: -100, r: 14 }, handleGroup);
  const handleIcon = mk('text', { class: 'tg-rot-icon', x: 0, y: -95 }, handleGroup);
  handleIcon.textContent = '↻';
  const handleHit = mk('circle', { class: 'tg-rot-hit', cx: 0, cy: -100, r: 28 }, handleGroup);

  let sel = null, off = null, pan = null, isRotating = false;
  let startPointerAngle = 0, startPieceAngle = 0;
  let snapEnabled = true;
  let figuraAtual = null;

  // Botão liga/desliga encaixe
  const snapBtn = $('#tsnap');
  if (snapBtn) {
    snapBtn.onclick = () => {
      snapEnabled = !snapEnabled;
      snapBtn.textContent = snapEnabled ? '🧲 Encaixe: Ativo' : '🧲 Encaixe: Desativado';
      snapBtn.style.opacity = snapEnabled ? '1' : '0.65';
    };
  }

  // Calcula coordenadas dos vértices de uma peça no mundo do SVG
  function getVertices(o, posX = o.x, posY = o.y, rotAng = o.r) {
    const rad = rotAng * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return o.localPts.map(([lx, ly]) => {
      const fx = lx * o.f;
      const rx = fx * cos - ly * sin;
      const ry = fx * sin + ly * cos;
      return [posX + rx, posY + ry];
    });
  }

  // Função auxiliar: distância do ponto P até o segmento de linha AB
  function distPontoSegmento(px, py, ax, ay, bx, by) {
    const ABx = bx - ax;
    const ABy = by - ay;
    const ABsq = ABx * ABx + ABy * ABy;
    if (ABsq === 0) {
      const dx = px - ax;
      const dy = py - ay;
      return { distSq: dx * dx + dy * dy, closestX: ax, closestY: ay };
    }
    const t = Math.max(0, Math.min(1, ((px - ax) * ABx + (py - ay) * ABy) / ABsq));
    const closestX = ax + t * ABx;
    const closestY = ay + t * ABy;
    const dx = px - closestX;
    const dy = py - closestY;
    return { distSq: dx * dx + dy * dy, closestX, closestY };
  }

  // Encontra o melhor ponto de encaixe com vértices E ARESTAS das outras peças
  function findSnap(targetPiece, testX, testY) {
    if (!snapEnabled) return { x: testX, y: testY, snapped: false };

    const THRESH_VERTEX = 19; // trava forte para vértice-vértice
    const THRESH_EDGE   = 14;   // suave para vértice-aresta

    let bestVtDistSq = THRESH_VERTEX * THRESH_VERTEX;
    let bestEdgeDistSq = THRESH_EDGE * THRESH_EDGE;

    let vtOffsetX = 0, vtOffsetY = 0;
    let edgeOffsetX = 0, edgeOffsetY = 0;
    let snapPoint = null;

    const myVerts = getVertices(targetPiece, testX, testY);

    // ----- Vértice-Vértice (TRAVA FORTE) -----
    pcs.forEach(other => {
      if (other !== targetPiece) {
        const verts = getVertices(other);
        for (let i = 0; i < verts.length; i++) {
          const [ax, ay] = verts[i];
          for (let j = 0; j < myVerts.length; j++) {
            const [mx, my] = myVerts[j];
            const dx = ax - mx;
            const dy = ay - my;
            const dSq = dx * dx + dy * dy;
            if (dSq < bestVtDistSq) {
              bestVtDistSq = dSq;
              vtOffsetX = dx;
              vtOffsetY = dy;
              snapPoint = [ax, ay];
            }
          }
        }
      }
    });

    // ----- Vértice-Aresta (SUAVE) -----
    pcs.forEach(other => {
      if (other !== targetPiece) {
        const verts = getVertices(other);
        for (let i = 0; i < verts.length; i++) {
          const [ax, ay] = verts[i];
          const [bx, by] = verts[(i + 1) % verts.length];
          for (let j = 0; j < myVerts.length; j++) {
            const [mx, my] = myVerts[j];
            const d = distPontoSegmento(mx, my, ax, ay, bx, by);
            if (d.distSq < bestEdgeDistSq) {
              bestEdgeDistSq = d.distSq;
              edgeOffsetX = d.closestX - mx;
              edgeOffsetY = d.closestY - my;
              snapPoint = [d.closestX, d.closestY];
            }
          }
        }
      }
    });

    // Silhueta da figura atual também entra como arestas
    if (figuraAtual && figuraAtual.targets) {
      figuraAtual.targets.forEach(tgt => {
        const dummyP = pcs[tgt.pieceIdx];
        if (dummyP) {
          const verts = getVertices(dummyP, tgt.x, tgt.y, tgt.r);
          for (let i = 0; i < verts.length; i++) {
            const [ax, ay] = verts[i];
            const [bx, by] = verts[(i + 1) % verts.length];
            for (let j = 0; j < myVerts.length; j++) {
              const [mx, my] = myVerts[j];
              const d = distPontoSegmento(mx, my, ax, ay, bx, by);
              if (d.distSq < bestEdgeDistSq) {
                bestEdgeDistSq = d.distSq;
                edgeOffsetX = d.closestX - mx;
                edgeOffsetY = d.closestY - my;
                snapPoint = [d.closestX, d.closestY];
              }
            }
          }
        }
      });
    }

    // Vértice-vértice tem prioridade (trava forte)
    if (bestVtDistSq < THRESH_VERTEX * THRESH_VERTEX) {
      return {
        x: testX + vtOffsetX,
        y: testY + vtOffsetY,
        snapped: true,
        point: snapPoint
      };
    }

    // Senão, tenta aresta (suave)
    if (bestEdgeDistSq < THRESH_EDGE * THRESH_EDGE) {
      return {
        x: testX + edgeOffsetX,
        y: testY + edgeOffsetY,
        snapped: true,
        point: snapPoint
      };
    }

    return { x: testX, y: testY, snapped: false };
  }

  const updateHandle = () => {
    if (!sel) {
      handleGroup.style.display = 'none';
      return;
    }
    handleGroup.style.display = '';
    const GAP = 38;
    const knobY = sel.topY - GAP;
    handleStem.setAttribute('y1', sel.topY);
    handleStem.setAttribute('y2', knobY);
    handleKnob.setAttribute('cy', knobY);
    handleHit.setAttribute('cy', knobY);
    handleIcon.setAttribute('y', knobY + 4.5);
    handleGroup.setAttribute('transform', `translate(${sel.x} ${sel.y}) rotate(${sel.r})`);
    tg.appendChild(handleGroup);
  };

  // Paleta de Cores por Peça
  const paletteEl = $('#tg-palette');
  const swatchesEl = $('#tg-swatches');
  const customColorInput = $('#tg-custom-color');
  const resetColorsBtn = $('#tresetcolors');

  const PALETTE_COLORS = [
    '#e4572e', '#3a86ff', '#ffbe0b', '#ff7a00', '#8338ec',
    '#06d6a0', '#ff006e', '#00b4d8', '#343a40'
  ];

  if (swatchesEl) {
    PALETTE_COLORS.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'tg-color-btn';
      btn.style.background = c;
      btn.dataset.col = c;
      btn.title = `Cor: ${c}`;
      btn.onclick = () => {
        if (sel) setPieceColor(sel, c);
      };
      swatchesEl.appendChild(btn);
    });
  }

  if (customColorInput) {
    customColorInput.oninput = e => {
      if (sel) setPieceColor(sel, e.target.value);
    };
  }

  if (resetColorsBtn) {
    resetColorsBtn.onclick = () => {
      pcs.forEach(p => {
        p.col = p.defaultCol;
        p.el.setAttribute('fill', p.col);
      });
      try { localStorage.removeItem('supera_tangram_colors'); } catch(e) {}
      updatePalette();
    };
  }

  function setPieceColor(p, c) {
    p.col = c;
    p.el.setAttribute('fill', c);
    try {
      const saved = {};
      pcs.forEach((item, idx) => { saved[idx] = item.col; });
      localStorage.setItem('supera_tangram_colors', JSON.stringify(saved));
    } catch(e) {}
    updatePalette();
  }

  function updatePalette() {
    if (!paletteEl) return;
    if (!sel) {
      paletteEl.style.display = 'none';
      return;
    }
    paletteEl.style.display = 'flex';
    if (swatchesEl) {
      swatchesEl.querySelectorAll('.tg-color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.col.toLowerCase() === (sel.col || '').toLowerCase());
      });
    }
    if (customColorInput) {
      customColorInput.value = sel.col || '#000000';
    }
  }

  const sync = () => {
    const angBadge = $('#ang');
    if (angBadge) {
      if (sel) {
        angBadge.style.display = 'inline-block';
        angBadge.textContent = `Ângulo: ${sel.r}°`;
      } else {
        angBadge.style.display = 'none';
      }
    }
    updatePalette();
  };

  const snapAngle = ang => {
    const nearest45 = Math.round(ang / 45) * 45;
    if (Math.abs(ang - nearest45) <= 5.5) return (nearest45 % 360 + 360) % 360;
    const nearest15 = Math.round(ang / 15) * 15;
    if (Math.abs(ang - nearest15) <= 3) return (nearest15 % 360 + 360) % 360;
    return Math.round(ang);
  };

  const rot = d => {
    if (!sel) return;
    sel.r = ((sel.r + d) % 360 + 360) % 360;
    draw(sel);
    updateHandle();
    sync();
    checkCompletion();
  };

  /* Visão (zoom e deslocamento) */
  let vx = WW / 2, vy = WH / 2, z = 1, z0 = 1;
  const view = () => {
    const w = tg.clientWidth, h = tg.clientHeight;
    if (!w) return;
    const vw = w / z, vh = h / z;
    vx = vw >= WW ? WW / 2 : clamp(vx, vw / 2, WW - vw / 2);
    vy = vh >= WH ? WH / 2 : clamp(vy, vh / 2, WH - vh / 2);
    tg.setAttribute('viewBox', `${vx - vw / 2} ${vy - vh / 2} ${vw} ${vh}`);
  };
  window.viewTangram = view;

  const fit = () => {
    const w = tg.clientWidth;
    if (!w) return;
    z0 = w / 760;
    z = z0;
    vx = WW / 2;
    vy = WH / 2;
    view();
  };

  const zoom = f => {
    const w = tg.clientWidth, h = tg.clientHeight;
    z = clamp(z * f, Math.min(w / WW, h / WH), z0 * 3.2);
    view();
  };

  $('#zi').onclick = () => zoom(1.25);
  $('#zo').onclick = () => zoom(1 / 1.25);
  $('#zf').onclick = fit;
  addEventListener('resize', view);

  // Renderiza a Silhueta da Figura Atual
  function renderSilhouette(figura) {
    outlineGroup.textContent = '';
    if (!figura || !figura.targets) return;

    figura.targets.forEach(t => {
      const dummyP = pcs[t.pieceIdx];
      if (dummyP) {
        const poly = mk('polygon', {
          points: dummyP.localPts.map(p => p[0] + ',' + p[1]).join(' '),
          class: 'tg-silhouette',
          transform: `translate(${t.x} ${t.y}) rotate(${t.r}) scale(${t.f} 1)`
        }, outlineGroup);
      }
    });
  }

  // Verifica se a figura foi montada corretamente
  function checkCompletion() {
    if (!figuraAtual || !figuraAtual.targets) return false;

    let matchedCount = 0;
    const usedTargets = new Set();

    pcs.forEach(p => {
      for (let i = 0; i < figuraAtual.targets.length; i++) {
        if (usedTargets.has(i)) continue;
        const tgt = figuraAtual.targets[i];

        // Peças do mesmo tamanho são intercambiáveis:
        // Triângulos Grandes: 0 e 1
        // Triângulos Pequenos: 4 e 5
        const isSameType = (p.id === tgt.pieceIdx) ||
          ((p.id === 0 || p.id === 1) && (tgt.pieceIdx === 0 || tgt.pieceIdx === 1)) ||
          ((p.id === 4 || p.id === 5) && (tgt.pieceIdx === 4 || tgt.pieceIdx === 5));

        if (!isSameType) continue;

        const distSq = (p.x - tgt.x) ** 2 + (p.y - tgt.y) ** 2;
        const angDiff = Math.abs((p.r % 360) - (tgt.r % 360));
        const rotOk = angDiff <= 6 || angDiff >= 354;

        if (distSq <= 400 && rotOk) {
          usedTargets.add(i);
          matchedCount++;
          break;
        }
      }
    });

    const isComplete = matchedCount === 7;
    outlineGroup.querySelectorAll('.tg-silhouette').forEach(el => {
      el.classList.toggle('complete', isComplete);
    });

    if (isComplete) {
      showWinToast(`🎉 Parabéns! Figura "${figuraAtual.nome}" montada com sucesso!`);
    }

    return isComplete;
  }

  let toastTimer = 0;
  function showWinToast(msg) {
    let toast = $('#tg-win-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tg-win-toast';
      toast.className = 'tg-win-toast';
      $('.wrap').appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 4500);
  }

  // Carrega e ativa uma figura da biblioteca
  function carregarFigura(id) {
    if (window.TangramContornos) {
      figuraAtual = TangramContornos.getFiguraById(id);
      renderSilhouette(figuraAtual);
      checkCompletion();
    }
  }

  const selectFigura = $('#tg-select-figura');
  const optgroupSalvas = $('#tg-optgroup-salvas');

  function atualizarSelectFiguras() {
    if (!optgroupSalvas || !window.TangramContornos) return;
    optgroupSalvas.innerHTML = '';
    const customList = TangramContornos.getCustomFiguras();
    customList.forEach(fig => {
      const opt = document.createElement('option');
      opt.value = fig.id;
      opt.textContent = fig.nome;
      optgroupSalvas.appendChild(opt);
    });
    optgroupSalvas.style.display = customList.length ? '' : 'none';
  }

  if (selectFigura) {
    selectFigura.onchange = e => {
      carregarFigura(e.target.value);
    };
  }

  // Botão Salvar Contorno Atual
  const saveFigBtn = $('#tsavefig');
  if (saveFigBtn) {
    saveFigBtn.onclick = () => {
      const nome = prompt('Digite o nome da figura montada (ex: Gato, Cachorro, Baleia):');
      if (!nome || !nome.trim()) return;

      const targets = pcs.map(p => ({
        pieceIdx: p.id,
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        r: Math.round(p.r),
        f: p.f
      }));

      const id = 'custom_' + Date.now();
      const novaFigura = {
        id: id,
        nome: nome.trim(),
        categoria: 'Minhas Figuras',
        targets: targets
      };

      if (window.TangramContornos) {
        TangramContornos.saveCustomFigura(novaFigura);
        atualizarSelectFiguras();
        if (selectFigura) selectFigura.value = id;
        carregarFigura(id);
        showWinToast(`✅ Figura "${novaFigura.nome}" salva com sucesso!`);
      }
    };
  }

  // Botão Copiar JSON da Figura Atual
  const copyJsonBtn = $('#tcopyjson');
  if (copyJsonBtn) {
    copyJsonBtn.onclick = () => {
      const figToCopy = (figuraAtual && figuraAtual.targets) ? figuraAtual : {
        id: 'figura',
        nome: 'Figura Montada',
        categoria: 'Animais',
        targets: pcs.map(p => ({
          pieceIdx: p.id,
          x: Math.round(p.x * 10) / 10,
          y: Math.round(p.y * 10) / 10,
          r: Math.round(p.r),
          f: p.f
        }))
      };

      const jsonStr = JSON.stringify(figToCopy, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          showWinToast('📋 Código JSON copiado para a área de transferência!');
        }).catch(() => {
          prompt('Copie o código JSON da figura:', jsonStr);
        });
      } else {
        prompt('Copie o código JSON da figura:', jsonStr);
      }
    };
  }

  // Botão Dica: move uma peça ainda não encaixada para sua posição correta
  const dicaBtn = $('#tdica');
  if (dicaBtn) {
    dicaBtn.onclick = () => {
      if (!figuraAtual || !figuraAtual.targets) {
        showWinToast('Escolha uma figura para ver a dica!');
        return;
      }
      for (let i = 0; i < figuraAtual.targets.length; i++) {
        const tgt = figuraAtual.targets[i];
        const p = pcs[tgt.pieceIdx];
        const distSq = (p.x - tgt.x) ** 2 + (p.y - tgt.y) ** 2;
        if (distSq > 400) {
          p.x = tgt.x;
          p.y = tgt.y;
          p.r = tgt.r;
          p.f = tgt.f;
          draw(p);
          checkCompletion();
          break;
        }
      }
    };
  }

  // Resolver / Montar Figura Atual
  const solveBtn = $('#tz');
  if (solveBtn) {
    solveBtn.onclick = () => {
      if (sel) { sel.el.classList.remove('sel'); sel = null; }
      snapDot.style.opacity = '0';

      if (figuraAtual && figuraAtual.targets) {
        figuraAtual.targets.forEach(tgt => {
          const p = pcs[tgt.pieceIdx];
          if (p) {
            p.x = tgt.x;
            p.y = tgt.y;
            p.r = tgt.r;
            p.f = tgt.f;
            draw(p);
          }
        });
        checkCompletion();
      } else {
        pcs.forEach(o => { o.x = o.hx; o.y = o.hy; o.r = 0; o.f = 1; draw(o); });
      }

      updateHandle();
      sync();
      fit();
    };
  }

  const pt = e => {
    const p = tg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(tg.getScreenCTM().inverse());
  };

  tg.onpointerdown = e => {
    if (e.target === handleHit && sel) {
      isRotating = true;
      const p = pt(e);
      startPointerAngle = Math.atan2(p.y - sel.y, p.x - sel.x) * 180 / Math.PI;
      startPieceAngle = sel.r;
      tg.setPointerCapture(e.pointerId);
      return;
    }

    const o = pcs.find(o => o.el === e.target);
    if (o) {
      if (sel && sel !== o) sel.el.classList.remove('sel');
      sel = o;
      o.el.classList.add('sel');
      tg.appendChild(o.el);
      updateHandle();
      sync();
      const p = pt(e);
      off = [o.x - p.x, o.y - p.y];
    } else {
      if (sel) {
        sel.el.classList.remove('sel');
        sel = null;
        updateHandle();
        sync();
      }
      snapDot.style.opacity = '0';
      pan = { x: e.clientX, y: e.clientY, vx, vy };
    }
    tg.setPointerCapture(e.pointerId);
  };

  tg.onpointermove = e => {
    if (isRotating && sel) {
      const p = pt(e);
      const currentPointerAngle = Math.atan2(p.y - sel.y, p.x - sel.x) * 180 / Math.PI;
      const diff = currentPointerAngle - startPointerAngle;
      let rawR = (startPieceAngle + diff) % 360;
      if (rawR < 0) rawR += 360;
      sel.r = snapAngle(rawR);
      draw(sel);
      updateHandle();
      sync();
    } else if (off && sel) {
      const p = pt(e);
      const rawX = clamp(p.x + off[0], 0, WW);
      const rawY = clamp(p.y + off[1], 0, WH);

      const snapResult = findSnap(sel, rawX, rawY);
      sel.x = snapResult.x;
      sel.y = snapResult.y;

      if (snapResult.snapped) {
        snapDot.setAttribute('cx', snapResult.point[0]);
        snapDot.setAttribute('cy', snapResult.point[1]);
        snapDot.style.opacity = '1';
        tg.appendChild(snapDot);
      } else {
        snapDot.style.opacity = '0';
      }

      draw(sel);
      updateHandle();
    } else if (pan) {
      vx = pan.vx - (e.clientX - pan.x) / z;
      vy = pan.vy - (e.clientY - pan.y) / z;
      view();
    }
  };

  tg.onpointerup = tg.onpointercancel = () => {
    isRotating = false;
    off = null;
    pan = null;
    if (snapDot) snapDot.style.opacity = '0';
    checkCompletion();
  };

  tg.ondblclick = e => {
    if (sel && e.target === sel.el) rot(45);
  };

  tg.onwheel = e => {
    e.preventDefault();
    if (sel && (e.target === sel.el || e.target === handleHit)) {
      rot(e.deltaY > 0 ? 15 : -15);
    } else {
      zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
    }
  };

  window.addEventListener('keydown', e => {
    if (!sel || (document.activeElement && document.activeElement.tagName === 'INPUT')) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rot(e.shiftKey ? -45 : -15);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rot(e.shiftKey ? 45 : 15);
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      rot(45);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      sel.f *= -1;
      draw(sel);
      updateHandle();
      sync();
      checkCompletion();
    } else if (e.key === 'Escape') {
      sel.el.classList.remove('sel');
      sel = null;
      snapDot.style.opacity = '0';
      updateHandle();
      sync();
    }
  });

  $('#tf').onclick = () => {
    if (sel) {
      sel.f *= -1;
      draw(sel);
      updateHandle();
      sync();
      checkCompletion();
    }
  };

  $('#tm').onclick = () => {
    if (sel) { sel.el.classList.remove('sel'); sel = null; }
    snapDot.style.opacity = '0';
    const vw = tg.clientWidth / z, vh = tg.clientHeight / z;
    pcs.forEach(o => {
      o.x = clamp(vx + (Math.random() - .5) * (vw - 200), 0, WW);
      o.y = clamp(vy + (Math.random() - .5) * (vh - 200), 0, WH);
      o.r = Math.floor(Math.random() * 8) * 45;
      o.f = 1;
      draw(o);
    });
    updateHandle();
    sync();
    checkCompletion();
  };

  // Inicializa com as figuras salvas e o Quadrado Tradicional
  atualizarSelectFiguras();
  carregarFigura('quadrado');
  pcs.forEach(o => { o.x = o.hx; o.y = o.hy; o.r = 0; o.f = 1; draw(o); });
  sync();
  fit();
})();
