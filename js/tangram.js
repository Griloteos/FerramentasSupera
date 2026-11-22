/* Ferramentas Supera - Tangram Interativo com Bolinha de Giro e Encaixe Automático */

(() => {
  const tg = $('#tg'), S = 84, WW = 2000, WH = 1400, OX = 1000 - 2 * S, OY = 700 - 2 * S;
  if (!tg) return;

  // Grade/molde quadrado guia
  const squareGuide = mk('rect', { x: OX, y: OY, width: 4 * S, height: 4 * S, fill: 'none', stroke: 'currentColor', 'stroke-opacity': .15, 'stroke-dasharray': '6 6' }, tg);

  const defs = [
    ['#e4572e', [[0, 0], [4, 0], [2, 2]]],
    ['#3a86ff', [[0, 0], [2, 2], [0, 4]]],
    ['#ffbe0b', [[4, 4], [4, 2], [2, 4]]],
    ['#8338ec', [[2, 2], [3, 1], [4, 2], [3, 3]]],
    ['#06d6a0', [[4, 0], [4, 2], [3, 1]]],
    ['#ff006e', [[1, 3], [3, 3], [2, 2]]],
    ['#fb8500', [[0, 4], [2, 4], [3, 3], [1, 3]]]
  ];

  const pcs = defs.map(([col, pts]) => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const localPts = pts.map(p => [(p[0] - cx) * S, (p[1] - cy) * S]);
    const el = mk('polygon', {
      points: localPts.map(p => p[0] + ',' + p[1]).join(' '),
      fill: col,
      class: 'pc'
    }, tg);
    const topY = Math.min(...localPts.map(p => p[1]));
    return { el, localPts, hx: OX + cx * S, hy: OY + cy * S, x: 0, y: 0, r: 0, f: 1, topY };
  });

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

  // Encontra o melhor ponto de encaixe vértice-vértice com outras peças e com o molde quadrado
  function findSnap(targetPiece, testX, testY) {
    if (!snapEnabled) return { x: testX, y: testY, snapped: false };
    const threshold = 18; // Tolerância em unidades do SVG (~12 a 15px de tela)
    let bestDistSq = threshold * threshold;
    let snapOffsetX = 0, snapOffsetY = 0;
    let snapPoint = null;

    const myVerts = getVertices(targetPiece, testX, testY);

    // 1. Alvos de outras peças
    const targetVerts = [];
    pcs.forEach(other => {
      if (other !== targetPiece) {
        targetVerts.push(...getVertices(other));
      }
    });

    // 2. Alvos dos vértices do molde quadrado padrão
    targetVerts.push(
      [OX, OY], [OX + 4 * S, OY], [OX + 4 * S, OY + 4 * S], [OX, OY + 4 * S],
      [OX + 2 * S, OY], [OX + 4 * S, OY + 2 * S], [OX + 2 * S, OY + 4 * S], [OX, OY + 2 * S],
      [OX + 2 * S, OY + 2 * S]
    );

    for (let i = 0; i < myVerts.length; i++) {
      const [mx, my] = myVerts[i];
      for (let j = 0; j < targetVerts.length; j++) {
        const [tx, ty] = targetVerts[j];
        const dx = tx - mx;
        const dy = ty - my;
        const dSq = dx * dx + dy * dy;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          snapOffsetX = dx;
          snapOffsetY = dy;
          snapPoint = [tx, ty];
        }
      }
    }

    if (snapPoint) {
      return {
        x: testX + snapOffsetX,
        y: testY + snapOffsetY,
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

  const home = () => {
    if (sel) { sel.el.classList.remove('sel'); sel = null; }
    snapDot.style.opacity = '0';
    pcs.forEach(o => { o.x = o.hx; o.y = o.hy; o.r = 0; o.f = 1; draw(o); });
    updateHandle();
    sync();
    fit();
  };

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

      // Aplica atração magnética por vértices
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
    }
  };

  $('#tz').onclick = home;

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
  };

  home();
})();
