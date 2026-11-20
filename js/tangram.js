/* Ferramentas Supera - Tangram Interativo */

(() => {
  const tg = $('#tg'), S = 84, WW = 2000, WH = 1400, OX = 1000 - 2 * S, OY = 700 - 2 * S;
  if (!tg) return;

  mk('rect', { x: OX, y: OY, width: 4 * S, height: 4 * S, fill: 'none', stroke: 'currentColor', 'stroke-opacity': .15, 'stroke-dasharray': '6 6' }, tg);

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
    const el = mk('polygon', {
      points: pts.map(p => ((p[0] - cx) * S) + ',' + ((p[1] - cy) * S)).join(' '),
      fill: col,
      class: 'pc'
    }, tg);
    return { el, hx: OX + cx * S, hy: OY + cy * S, x: 0, y: 0, r: 0, f: 1 };
  });

  const draw = o => o.el.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.r}) scale(${o.f} 1)`);

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
    pcs.forEach(o => { o.x = o.hx; o.y = o.hy; o.r = 0; o.f = 1; draw(o); });
    sync();
    fit();
  };

  /* Seleção, arrasto e giro */
  let sel = null, off = null, pan = null;
  const pt = e => {
    const p = tg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(tg.getScreenCTM().inverse());
  };

  const sync = () => {
    $('#ang').textContent = sel ? sel.r + '°' : '—';
    $('#sl').disabled = !sel;
    if (sel) $('#sl').value = sel.r;
  };

  const rot = d => {
    if (!sel) return;
    sel.r = ((sel.r + d) % 360 + 360) % 360;
    draw(sel);
    sync();
  };

  tg.onpointerdown = e => {
    const o = pcs.find(o => o.el === e.target);
    if (o) {
      if (sel) sel.el.classList.remove('sel');
      sel = o;
      o.el.classList.add('sel');
      tg.appendChild(o.el);
      sync();
      const p = pt(e);
      off = [o.x - p.x, o.y - p.y];
    } else {
      pan = { x: e.clientX, y: e.clientY, vx, vy };
    }
    tg.setPointerCapture(e.pointerId);
  };

  tg.onpointermove = e => {
    if (off) {
      const p = pt(e);
      sel.x = clamp(p.x + off[0], 0, WW);
      sel.y = clamp(p.y + off[1], 0, WH);
      draw(sel);
    } else if (pan) {
      vx = pan.vx - (e.clientX - pan.x) / z;
      vy = pan.vy - (e.clientY - pan.y) / z;
      view();
    }
  };

  tg.onpointerup = tg.onpointercancel = () => { off = pan = null; };
  tg.ondblclick = e => { if (sel && e.target === sel.el) rot(45); };
  tg.onwheel = e => {
    e.preventDefault();
    if (sel && e.target === sel.el) rot(e.deltaY > 0 ? 15 : -15);
    else zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  };

  $('#sl').oninput = e => {
    if (sel) {
      sel.r = +e.target.value;
      draw(sel);
      sync();
    }
  };

  document.querySelectorAll('.rb button').forEach(b => {
    const d = +b.dataset.d;
    let t, iv;
    const stop = () => { clearTimeout(t); clearInterval(iv); };
    b.onpointerdown = e => {
      e.preventDefault();
      rot(d);
      if (Math.abs(d) === 1) t = setTimeout(() => iv = setInterval(() => rot(d), 60), 400);
    };
    b.onpointerup = b.onpointerleave = b.onpointercancel = stop;
  });

  $('#tf').onclick = () => {
    if (sel) {
      sel.f *= -1;
      draw(sel);
      sync();
    }
  };
  $('#tz').onclick = home;
  $('#tm').onclick = () => {
    const vw = tg.clientWidth / z, vh = tg.clientHeight / z;
    pcs.forEach(o => {
      o.x = clamp(vx + (Math.random() - .5) * (vw - 200), 0, WW);
      o.y = clamp(vy + (Math.random() - .5) * (vh - 200), 0, WH);
      o.r = Math.floor(Math.random() * 8) * 45;
      o.f = 1;
      draw(o);
    });
    sync();
  };

  home();
})();
