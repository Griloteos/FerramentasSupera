/* Ferramentas Supera - Ábaco Soroban Livre (15 Colunas) */

(() => {
  const sb = $('#sb'), N = 15, X0 = 20, W = 64;
  if (!sb) return;

  const st = Array.from({ length: N }, () => ({ h: 0, e: 0 }));
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

  const cx = c => X0 + c * W + W/2;

  mk('rect', { x: 8, y: 8, width: 984, height: 304, rx: 10, class: 'fr' }, sb);
  for (let c = 10; c < N; c++) mk('rect', { x: X0 + c * W, y: 10, width: W, height: 300, class: 'dc' }, sb);
  for (let c = 0; c < N; c++) mk('line', { x1: cx(c), y1: 10, x2: cx(c), y2: 310, class: 'rod' }, sb);
  mk('rect', { x: 8, y: 104, width: 984, height: 12, class: 'br' }, sb);
  mk('circle', { cx: cx(9), cy: 110, r: 4, fill: '#fff' }, sb);

  const bead = (c, type, i) => {
    const g = mk('g', { class: 'bead ' + type }, sb);
    mk('path', { d: 'M-26 0L-12-14H12L26 0L12 14H-12Z' }, g);
    g.onclick = () => {
      const s = st[c];
      if (type === 'h') s.h ^= 1;
      else s.e = s.e > i ? i : i + 1;
      upd();
    };
    return g;
  };

  const cols = st.map((_, c) => {
    const tx = (y, cls) => mk('text', { x: cx(c), y, class: cls, 'text-anchor': 'middle' }, sb);
    const q = { hb: bead(c, 'h'), eb: [0, 1, 2, 3].map(i => bead(c, 'e', i)) };
    q.dg = tx(352, 'dg');
    q.vl = tx(375, 'vl');
    q.lb = tx(396, 'lb');
    q.lb.textContent = NM[9 - c];
    return q;
  });

  function upd() {
    let n = 0;
    st.forEach((s, c) => {
      const i = 14 - c, d = s.h * 5 + s.e, q = cols[c], x = cx(c);
      n += d * 10 ** i;
      q.hb.style.transform = `translate(${x}px,${s.h ? 90 : 36}px)`;
      q.eb.forEach((b, k) => b.style.transform = `translate(${x}px,${k < s.e ? 130 + k * 28 : 284 - (3 - k) * 28}px)`);
      q.dg.textContent = d;
      q.dg.classList.toggle('z', !d);
      q.vl.textContent = d ? fmt(d * 10 ** i) : '';
    });
    $('#tot').textContent = fmt(n);
  }

  $('#zr').onclick = () => {
    st.forEach(s => { s.h = 0; s.e = 0; });
    upd();
  };

  $('#go').onclick = () => {
    const v = parseFloat($('#num').value.trim().replace(',', '.'));
    if (isNaN(v) || v < 0 || v >= 1e10) return;
    const n = Math.round(v * 1e5);
    st.forEach((s, c) => {
      const d = Math.floor(n / 10 ** (14 - c)) % 10;
      s.h = d >= 5 ? 1 : 0;
      s.e = d % 5;
    });
    upd();
  };

  upd();
})();
