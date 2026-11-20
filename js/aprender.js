/* Ferramentas Supera - Aprender Regras (Aula e Praticar) */

(() => {
  const c4 = ['casa 4', 'casa 3', 'casa 2', 'casa 1'], c5 = ['casa 5', ...c4];
  const LS = [
    {
      n: 'Base 5', c: 2, lb: ['Dezena', 'Unidade'],
      r: '<b>Troca de base 5.</b> Pergunte: <b>cabe?</b> (soma) ou <b>tenho?</b> (subtração). Se não, pergunte quanto o número falta para 5 (a diferença) e respeite a ordem: <b>+</b> soma 5 e tira a diferença; <b>−</b> soma a diferença e tira 5.',
      s: [
        ['Vamos somar 3 + 4. Coloque o 3 na unidade.', '.3', [1]],
        ['O 4 cabe? Não: só sobra 1 conta embaixo. Quanto falta do 4 para 5? 1.', '.3', [1]],
        ['Regra do +: soma 5 (desce a conta de cima)…', '.8', [1]],
        ['…e tira a diferença, 1 (sobe uma conta de baixo). 3 + 4 = 7.', '.7', [1]],
        ['Agora 7 − 3. Eu tenho 3? Não: só há 2 contas embaixo. Quanto falta do 3 para 5? 2.', '.7', [1]],
        ['Regra do −: soma a diferença, 2 (descem 2 contas)…', '.9', [1]],
        ['…e tira 5 (sobe a conta de cima). 7 − 3 = 4.', '.4', [1]]
      ]
    },
    {
      n: 'Base 10', c: 2, lb: ['Dezena', 'Unidade'],
      r: '<b>Troca de base 10.</b> As mesmas perguntas, agora com o que falta para 10: <b>+</b> tira a diferença e soma 10 (1 na casa da esquerda); <b>−</b> tira 10 (1 da casa da esquerda) e soma a diferença. Se a diferença não cabe ou não tem, use a base 5 dentro da coluna.',
      s: [
        ['Vamos somar 7 + 6. Coloque o 7.', '.7', [1]],
        ['O 6 cabe? Não, passa de 9. Quanto falta do 6 para 10? 4. Regra do +: tira a diferença e soma 10.', '.7', [1]],
        ['Tirar 4 de 7: eu tenho 4? Não (só 2 embaixo). Base 5: 4 para 5 é 1. Soma 1…', '.8', [1]],
        ['…e tira 5: 7 − 4 = 3.', '.3', [1]],
        ['Agora soma 10: 1 na casa da esquerda. 7 + 6 = 13.', '13', [0]],
        ['Agora 13 − 6. Eu tenho 6? Não (3 < 6). Quanto falta do 6 para 10? 4. Regra do −: tira 10 e soma a diferença.', '13', [0, 1]],
        ['Tira 10: tira 1 da dezena.', '.3', [0]],
        ['Soma 4 em 3: cabe? Não. Base 5: 4 para 5 é 1. Soma 5…', '.8', [1]],
        ['…e tira 1: 3 + 4 = 7. Então 13 − 6 = 7.', '.7', [1]]
      ]
    },
    {
      n: 'Multiplicação 1', c: 4, lb: c4, f: 1,
      r: '<b>Multiplicação com 1 multiplicador.</b> Conte as casas a partir da unidade e pule (dígitos do multiplicando + 1): é a <b>dezena temporária</b>. Multiplique da esquerda para a direita: a <b>dezena</b> do produto vai na casa (casa do multiplicando + casa do multiplicador), onde o dedo aponta, e a <b>unidade</b> na casa à direita. Passou de 9? Troca de base 10.',
      s: [
        ['256 × 4. O 256 tem 3 dígitos: pule 3 + 1 = 4 casas a partir da unidade. A casa 4 é a dezena temporária.', '....', [0]],
        ['2 (casa 3) × 4 (casa 1): 3 + 1 = 4, o dedo aponta a casa 4. 2 × 4 = 08.', '....', [0]],
        ['Dezena 0 na casa 4 e unidade 8 na casa 3.', '.8..', [0, 1]],
        ['5 (casa 2) × 4 = 20. Casa 2 + casa 1 = 3: dezena 2 na casa 3, unidade 0 na casa 2.', '.8..', [1]],
        ['8 + 2 não cabe: 2 para 10 é 8. Tira 8 e soma 10 (vai 1 na casa 4).', '1...', [0, 1]],
        ['6 (casa 1) × 4 = 24. Casa 1 + casa 1 = 2: dezena 2 na casa 2 e unidade 4 na casa 1.', '1.24', [2, 3]],
        ['Resposta: 256 × 4 = 1024.', '1.24', []]
      ]
    },
    {
      n: 'Multiplicação 2', c: 5, lb: c5, f: 1,
      r: '<b>Multiplicação com 2 multiplicadores.</b> O mesmo princípio, em duas etapas: primeiro o dígito da esquerda do multiplicador (dezena), depois o da direita. A dezena temporária fica na casa (dígitos do multiplicando + 2).',
      s: [
        ['256 × 14. O 256 tem 3 dígitos e o 14 tem 2: pule 3 + 2 = 5 casas. A casa 5 é a dezena temporária.', '.....', [0]],
        ['Etapa 1: multiplicador 1 (casa 2). 2 (casa 3) × 1 = 02. Casa 3 + casa 2 = 5: dezena 0 na casa 5, unidade 2 na casa 4.', '.2...', [0, 1]],
        ['5 (casa 2) × 1 = 05. 2 + 2 = 4: unidade 5 na casa 3.', '.25..', [1, 2]],
        ['6 (casa 1) × 1 = 06. 1 + 2 = 3: unidade 6 na casa 2.', '.256.', [2, 3]],
        ['Etapa 2: multiplicador 4 (casa 1). 2 × 4 = 08: unidade 8 na casa 3. 5 + 8 = 13, vai 1 na casa 4.', '.336.', [1, 2]],
        ['5 × 4 = 20. Casa 2 + 1 = 3: dezena 2 na casa 3, unidade 0 na casa 2.', '.356.', [2]],
        ['6 × 4 = 24. Casa 1 + 1 = 2: dezena 2 na casa 2 e unidade 4 na casa 1.', '.3584', [3, 4]],
        ['Resposta: 256 × 14 = 3584.', '.3584', []]
      ]
    },
    {
      n: 'Divisão 1 divisor', c: 7,
      r: '<b>Divisão com 1 divisor.</b> Divisor à esquerda, 4 colunas vazias, depois o dividendo. Se o dividendo é maior ou igual ao divisor, o quociente vai <b>2 casas</b> à esquerda do 1º dígito; se o divisor é maior, <b>1 casa</b>. Depois tire (quociente × divisor) do dividendo, com a unidade do produto 2 casas à direita do quociente.',
      s: [
        ['95 ÷ 4. Divisor 4 à esquerda, 4 colunas vazias e o dividendo 95. O 9 é maior que 4: regra de 2 casas, quociente na coluna 4.', '4....95', [0, 5, 6]],
        ['Coloca 2 (9 ÷ 4) duas casas à esquerda do 9.', '4..2.95', [3]],
        ['2 × 4 = 08: tira 8 do 9.', '4..2.15', [5]],
        ['Resta 15. Próximo dígito do quociente na coluna 5: 15 ÷ 4 = 3.', '4..2315', [4, 5, 6]],
        ['3 × 4 = 12: tira 12 de 15. Quociente 23, resto 3.', '4..23.3', [5, 6]]
      ]
    },
    {
      n: 'Regra do 9', c: 9,
      r: '<b>Divisão com regras do 9.</b> Compare o 1º dígito do dividendo com o do divisor; se forem iguais, compare o 2º. <b>Tudo igual</b>: pula 2 casas à esquerda e soma 1. <b>Divisor maior que o dividendo</b>: pula 1 casa à esquerda e soma 9.',
      s: [
        ['171 ÷ 19. Os primeiros dígitos são iguais (1 e 1). Compare o 2º: 7 é menor que 9, o divisor é maior.', '19....171', [0, 1, 6, 7]],
        ['Regra de 1 casa e soma 9: coloca 9 na coluna 6, uma casa à esquerda do 1.', '19...9171', [5]],
        ['9 × 1 = 09: tira 9 de 17 (empresta 1). Sobra 8.', '19...9.81', [6, 7]],
        ['9 × 9 = 81: tira 81. Quociente 9, resto 0.', '19...9...', [7, 8]]
      ]
    },
    {
      n: 'Tirar do quociente', c: 10,
      r: '<b>Tirar do quociente e colocar no dividendo.</b> Você tirou o 1º dígito do divisor e multiplica o quociente pelo 2º. Se não dá para subtrair, <b>tire 1 do quociente</b> e <b>coloque de volta no dividendo o valor do 1º dígito do divisor</b>. Repita se preciso.',
      s: [
        ['1425 ÷ 19. Primeiros dígitos iguais (1 e 1) e o 2º do dividendo (4) é menor que 9: regra do 9, 1 casa.', '19....1425', [0, 1, 6, 7]],
        ['Coloca 9 no quociente (coluna 6).', '19...91425', [5]],
        ['9 × 1 = 09: tira 9 de 14. Sobra 5.', '19...9.525', [6, 7]],
        ['9 × 9 = 81: a dezena 8 não cabe em 5 e não há de onde emprestar. O quociente está grande demais!', '19...9.525', [7]],
        ['Tira 1 do quociente (9 vira 8) e coloca de volta no dividendo o 1º dígito do divisor, o 1.', '19...8.625', [5, 7]],
        ['8 × 9 = 72: o 7 ainda não cabe em 6. Tira 1 do quociente (vira 7) e devolve outro 1.', '19...7.725', [5, 7]],
        ['7 × 9 = 63: agora cabe (7 − 6 = 1 e 12 − 3 = 9). Resta 95.', '19...7..95', [7, 8]],
        ['Resta 95: regra de 2 casas. 95 ÷ 19 = 5, na coluna 7.', '19...75.95', [6]],
        ['5 × 1 = 05: tira 5 do 9.', '19...75.45', [8]],
        ['5 × 9 = 45: tira 45. Quociente 75, resto 0.', '19...75...', [8, 9]]
      ]
    },
    {
      n: 'Divisão 2 divisores', c: 9,
      r: '<b>Divisão com 2 divisores.</b> Cada dígito do quociente pede duas subtrações, uma por dígito do divisor, alinhadas ao quociente (a unidade do 1º produto fica 2 casas à direita dele; a do 2º, 3 casas).',
      s: [
        ['276 ÷ 12. O 2 é maior que o 1: regra de 2 casas, quociente na coluna 5.', '12....276', [0, 1, 6, 7, 8]],
        ['Coloca 2 (27 ÷ 12 é cerca de 2).', '12..2.276', [4]],
        ['2 × 1 = 02: tira 2 do 2.', '12..2..76', [6]],
        ['2 × 2 = 04: tira 4 do 7.', '12..2..36', [7]],
        ['Resta 36. Próximo dígito do quociente na coluna 6: 36 ÷ 12 = 3.', '12..23.36', [5, 7, 8]],
        ['3 × 1 = 03: tira 3 do 3.', '12..23..6', [7]],
        ['3 × 2 = 06: tira 6. Quociente 23, resto 0.', '12..23...', [8]]
      ]
    },
    {
      n: 'Divisão 3 divisores', c: 11,
      r: '<b>Divisão com 3 divisores.</b> Três subtrações por dígito do quociente. Se a 3ª não couber, tire 1 do quociente e devolva ao dividendo o 1º e o 2º dígito do divisor.',
      s: [
        ['2829 ÷ 123. O 2 é maior que o 1: regra de 2 casas, quociente na coluna 6.', '123....2829', [0, 1, 2, 7, 8, 9, 10]],
        ['Coloca 2 (282 ÷ 123 é cerca de 2).', '123..2.2829', [5]],
        ['2 × 1 = 02: tira 2 do 2.', '123..2..829', [7]],
        ['2 × 2 = 04: tira 4 do 8.', '123..2..429', [8]],
        ['2 × 3 = 06: 2 − 6 pede empréstimo (12 − 6 = 6). Resta 369.', '123..2..369', [8, 9]],
        ['Próximo dígito do quociente na coluna 7: 369 ÷ 123 = 3.', '123..23.369', [6]],
        ['3 × 1 = 03 e 3 × 2 = 06: tira 3 e 6.', '123..23...9', [8, 9]],
        ['3 × 3 = 09: tira 9. Quociente 23, resto 0.', '123..23....', [10]]
      ]
    }
  ];

  const box = $('#lb'), T = $('#lt'), R = $('#lr'), C = $('#lc'), S = $('#ls'), P = $('#lp'), W = 44;
  if (!box) return;

  let L, i = 0, B, D, H, F, tm = 0, PR = 0, idx = 0;
  const stop = () => { clearInterval(tm); tm = 0; P.textContent = '▶ Tocar'; };

  function build() {
    box.textContent = '';
    const n = L.c, w = n * W + 16;
    box.setAttribute('viewBox', `0 0 ${w} 250`);
    box.style.maxWidth = w * 2 + 'px';
    mk('rect', { x: 4, y: 4, width: w - 8, height: 172, rx: 8, class: 'fr' }, box);
    H = []; B = []; D = [];
    for (let c = 0; c < n; c++) {
      const x = 8 + c * W + W / 2;
      H.push(mk('rect', { x: 8 + c * W, y: 6, width: W, height: 168, class: 'hl' }, box));
      mk('line', { x1: x, y1: 6, x2: x, y2: 174, class: 'rod' }, box);
    }
    mk('rect', { x: 4, y: 54, width: w - 8, height: 8, class: 'br' }, box);
    for (let c = 0; c < n; c++) {
      const x = 8 + c * W + W / 2;
      const bd = (t, cc, kk) => {
        const g = mk('g', { class: 'bead ' + t }, box);
        mk('path', { d: 'M-17 0L-8-9.5H8L17 0L8 9.5H-8Z' }, g);
        g.onclick = () => PR && bead(cc, kk);
        return g;
      };
      B.push({ h: bd('h', c, -1), e: [0, 1, 2, 3].map((_, k) => bd('e', c, k)), x });
      D.push(mk('text', { x, y: 198, 'text-anchor': 'middle', class: 'md' }, box));
      mk('text', { x, y: 216, 'text-anchor': 'middle', class: 'ml' }, box).textContent = L.lb ? L.lb[c] : '';
    }
    F = mk('text', { x: 0, y: 242, 'text-anchor': 'middle', 'font-size': 22, id: 'fg' }, box);
    F.textContent = '👆';
  }

  function show() {
    const [t, s, h] = L.s[i];
    B.forEach((b, c) => {
      const d = s[c] === '.' ? 0 : +s[c], e = d % 5;
      b.h.style.transform = `translate(${b.x}px,${d >= 5 ? 42 : 24}px)`;
      b.e.forEach((g, k) => g.style.transform = `translate(${b.x}px,${k < e ? 74 + k * 20 : 158 - (3 - k) * 20}px)`);
      D[c].textContent = s[c] === '.' ? '' : s[c];
    });
    H.forEach((r, c) => r.style.opacity = h.includes(c) ? 1 : 0);
    F.style.opacity = L.f && h.length ? 1 : 0;
    if (h.length) F.style.transform = `translate(${B[h[0]].x}px,0)`;
    T.textContent = t;
    C.textContent = `Passo ${i + 1} de ${L.s.length}`;
  }

  const go = k => { i = clamp(k, 0, L.s.length - 1); show(); };
  $('#ln').onclick = () => go(i + 1);
  $('#lv').onclick = () => go(i - 1);
  $('#lz').onclick = () => { stop(); go(0); };
  P.onclick = () => {
    if (tm) { stop(); return; }
    if (i >= L.s.length - 1) go(0);
    P.textContent = '⏸ Pausar';
    tm = setInterval(() => { if (i >= L.s.length - 1) stop(); else go(i + 1); }, 3200);
  };

  function load(k) {
    stop();
    idx = k;
    L = LS[k];
    i = 0;
    [...S.children].forEach((b, j) => b.classList.toggle('on', j === k));
    const tgBtn = $('#toggle-drawer');
    if (tgBtn) tgBtn.innerHTML = `📚 Módulo: ${L.n} <span>▼</span>`;
    R.innerHTML = L.r;
    if (PR) newEx(); else { build(); show(); }
  }

  LS.forEach((l, k) => {
    const b = document.createElement('button');
    b.textContent = l.n;
    b.onclick = () => {
      load(k);
      const dc = $('#drawer-content');
      if (dc) dc.style.display = 'none';
    };
    S.appendChild(b);
  });

  const tgBtn = $('#toggle-drawer');
  if (tgBtn) {
    tgBtn.onclick = () => {
      const dc = $('#drawer-content');
      if (dc) dc.style.display = dc.style.display === 'none' ? 'block' : 'none';
    };
  }

  /* Praticar: gerador de exercícios com uma única resposta correta */
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), p2 = n => String(n).padStart(2, '0');
  const shuf = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  const nd = (n, len) => String(n).padStart(len, '0').split('').map(Number);
  const Q = (p, list, a, ws) => {
    const o = shuf(list.map((t, i) => ({ t, i })));
    return { p, o: o.map(x => x.t), a: o.findIndex(x => x.i === a), w: o.map(x => ws[x.i]) };
  };
  const YN = (p, yes, wy, wn) => Q(p, ['Sim', 'Não'], yes ? 0 : 1, [wy, wn]);
  const dis = (c, lo, hi) => {
    const s = new Set([c]);
    for (let t = 0; s.size < 4 && t < 99; t++) s.add(rnd(lo, hi));
    return [...s];
  };
  const QN = (p, c, lo, hi, why) => {
    const l = dis(c, lo, hi);
    return Q(p, l.map(String), 0, l.map(v => v === c ? '' : why(v)));
  };
  const BS = (p, s, w) => ({ p, s, w });
  const LB2 = ['Dezena', 'Unidade'];
  const put = (cur, R, a, Ln, qs) => {
    const r = String(R).padStart(Ln, '0');
    for (let i = 0; i < Ln; i++) if (!((a + i) in qs)) cur[a + i] = +r[i];
  };

  const g1 = () => {
    const add = Math.random() < .5;
    let a, n;
    do { a = add ? rnd(1, 4) : rnd(5, 8); n = rnd(1, 4); } while (add ? a + n < 5 : n <= a - 5);
    const d = 5 - n, s = [];
    s.push(YN(add ? `Vamos somar ${a} + ${n}. O ${n} cabe?` : `Vamos fazer ${a} − ${n}. Eu tenho ${n}?`, false, add ? `Só sobram ${4 - a} contas livres embaixo e você precisa de ${n}: não cabe direto.` : `Embaixo só há ${a - 5} contas: faltam contas para tirar ${n}.`, ''));
    s.push(QN(`Quanto falta do ${n} para 5?`, d, 1, 4, x => `${n} + ${x} = ${n + x}, e não 5. Falta ${d}.`));
    if (add) {
      s.push(BS(`Regra do +: primeiro soma 5.`, [0, a + 5], `Na soma, a ordem é: soma 5 e depois tira a diferença (${d}).`));
      s.push(BS(`Agora tira a diferença (${d}).`, [0, a + n], `${a} + 5 − ${d} = ${a + n}.`));
    } else {
      s.push(BS(`Regra do −: primeiro soma a diferença (${d}).`, [0, a + d], `Na subtração, a ordem é: soma a diferença e depois tira 5.`));
      s.push(BS(`Agora tira 5.`, [0, a - n], `${a} + ${d} − 5 = ${a - n}.`));
    }
    return { c: 2, lb: LB2, s0: [0, a], st: s };
  };

  const g2 = () => {
    const add = Math.random() < .5;
    let a, n, u;
    if (add) { a = rnd(2, 9); n = rnd(10 - a, 9); } else { u = rnd(0, 8); n = rnd(u + 1, 9); }
    const d = 10 - n, s = [], qd = QN(`Quanto falta do ${n} para 10?`, d, 1, 9, x => `${n} + ${x} = ${n + x}, e não 10. Falta ${d}.`);
    if (add) {
      s.push(YN(`Vamos somar ${a} + ${n}. O ${n} cabe?`, false, `${a} + ${n} = ${a + n}, passa de 9: não cabe na coluna.`, ''));
      s.push(qd);
      s.push(BS(`Regra do +: primeiro tira a diferença (${d}).`, [0, a - d], `Na soma com base 10 a ordem é: tira a diferença e depois soma 10. (Se faltar conta, use a base 5 dentro da coluna.)`));
      s.push(BS(`Agora soma 10: 1 na casa da esquerda.`, [1, a - d], `Somar 10 é colocar 1 na dezena. Resultado: ${a + n}.`));
      return { c: 2, lb: LB2, s0: [0, a], st: s };
    }
    s.push(YN(`Vamos fazer ${10 + u} − ${n}. Eu tenho ${n} na unidade?`, false, `A unidade tem só ${u}, menor que ${n}: não dá para tirar direto.`, ''));
    s.push(qd);
    s.push(BS(`Regra do −: primeiro tira 10 (1 da dezena).`, [0, u], `Na subtração com base 10 a ordem é: tira 10 e depois soma a diferença.`));
    s.push(BS(`Agora soma a diferença (${d}) na unidade.`, [0, u + d], `${u} + ${d} = ${u + d}. Resultado: ${10 + u - n}.`));
    return { c: 2, lb: LB2, s0: [1, u], st: s };
  };

  const gm = k => () => {
    const n = k == 1 ? rnd(2, 3) : 2, A = Array.from({ length: n }, () => rnd(1, 9)), M = Array.from({ length: k }, () => rnd(k == 1 ? 2 : 1, 9));
    const w = n + k, lb = Array.from({ length: w }, (_, i) => 'casa ' + (w - i)), s = [];
    let ac = 0;
    s.push(QN(`Vamos multiplicar ${A.join('')} × ${M.join('')}. Quantas casas pular, a partir da unidade, até a dezena temporária?`, w, 2, 5, x => `São os dígitos do multiplicando (${n}) mais os do multiplicador (${k}) = ${w}.`));
    M.forEach((m, j) => {
      const cm = k - j;
      A.forEach((d, i) => {
        const cd = n - i, t = cd + cm, pr = d * m;
        s.push(QN(`${d} (casa ${cd}) × ${m} (casa ${cm}): em qual casa fica a dezena do produto?`, t, 1, w, x => `Some a casa do multiplicando (${cd}) com a casa do multiplicador (${cm}): ${t}.`));
        ac += pr * 10 ** (t - 2);
        s.push(BS(`${d} × ${m} = ${p2(pr)}. Coloque a dezena na casa ${t} e a unidade na casa ${t - 1}.`, nd(ac, w), `${d} × ${m} = ${pr}: dezena ${Math.floor(pr/10)} na casa ${t} e unidade ${pr%10} na casa ${t-1}. Passou de 9? Troca de base 10 (vai 1).`));
      });
    });
    return { c: w, lb, s0: Array(w).fill(0), st: s };
  };

  const gd = (k, D, N) => {
    const Ns = String(N).split('').map(Number), Ln = Ns.length, a = k + 4, U = a + Ln - 1, Ds = String(D).split('').map(Number);
    const cur = Array(U + 1).fill(0);
    Ds.forEach((d, i) => cur[i] = d);
    Ns.forEach((d, i) => cur[a + i] = d);
    const s0 = [...cur], qs = {}, s = [], Qd = String(Math.floor(N / D)).split('').map(Number);
    let R = N;
    Qd.forEach((q, ix) => {
      const p = Qd.length - 1 - ix, c = U - k - 1 - p, grp = Math.floor(R / 10 ** p);
      if (ix == 0) {
        const g = Math.floor(N / 10 ** (Ln - k));
        s.push(Q(`Compare o início do dividendo (${g}) com o divisor (${D}). Onde vai o 1º dígito do quociente?`, ['2 casas à esquerda do 1º dígito do dividendo', '1 casa à esquerda do 1º dígito do dividendo'], g >= D ? 0 : 1, [`${g} é menor que ${D}: o divisor é maior, então vale a regra de 1 casa.`, `${g} é maior ou igual a ${D}: o dividendo é maior, então vale a regra de 2 casas.`]));
      }
      s.push(QN(`Quanto vale o próximo dígito do quociente? (${grp} ÷ ${D})`, q, 0, 9, x => x * D > grp ? `${x} × ${D} = ${x * D} é maior que ${grp}: não cabe.` : `${x} × ${D} = ${x * D}: ainda sobra ${grp - x * D}, que comporta mais um divisor. O dígito é maior.`));
      qs[c] = 1; cur[c] = q;
      s.push(BS(`Coloque o ${q} no quociente (coluna ${c + 1}).`, [...cur], ix == 0 ? `Regra de ${Math.floor(N/10**(Ln-k))>=D?2:1} casas: o quociente vai na coluna ${c+1}.` : `Uma casa à direita do dígito anterior: coluna ${c+1}.`));
      Ds.forEach((dj, j) => {
        const pr = q * dj;
        R -= pr * 10 ** (k - 1 - j + p);
        put(cur, R, a, Ln, qs);
        s.push(BS(`Subtraia ${q} × ${dj} = ${p2(pr)}: dezena na coluna ${c + j + 2} e unidade na coluna ${c + j + 3}.`, [...cur], `A unidade de ${q} × ${dj} fica ${j+2} casas à direita do quociente (coluna ${c+j+3}) e a dezena, uma casa à esquerda. Se a coluna for menor, empreste da esquerda.`));
      });
    });
    return { c: U + 1, lb: null, s0, st: s };
  };

  const dv = (k, lo, hi) => () => {
    const D = rnd(lo, hi);
    return gd(k, D, (rnd(1, 9) * 10 + rnd(1, 9)) * D + rnd(0, D - 1));
  };

  const rule9 = (d1, d2, e2, a9) => Q(`Os primeiros dígitos são iguais (${d1}). Compare o 2º: ${e2} (dividendo) e ${d2} (divisor). O que fazer?`, ['Pula 2 casas à esquerda e soma 1', 'Pula 1 casa à esquerda e soma 9', 'Divide só o 1º dígito, sem a regra'], a9 ? 1 : 0, [`${e2} é menor que ${d2}: o divisor é maior, então pula 1 casa e soma 9.`, `${e2} é maior ou igual a ${d2}: o dividendo é maior (ou tudo igual), então pula 2 casas e soma 1.`, `Com os primeiros dígitos iguais vale a regra: compare o 2º dígito.`]);

  const g6 = () => {
    const d1 = rnd(1, 8), d2 = rnd(1, 9), a9 = Math.random() < .5, e2 = a9 ? rnd(0, d2 - 1) : rnd(d2, 9), a = 6, c = a9 ? a - 1 : a - 2;
    const N = Number(`${d1}${e2}${rnd(0, 9)}${rnd(0, 9)}`), cur = Array(10).fill(0);
    cur[0] = d1; cur[1] = d2;
    String(N).split('').forEach((d, i) => cur[a + i] = +d);
    const s0 = [...cur]; cur[c] = a9 ? 9 : 1;
    return { c: 10, lb: null, s0, st: [rule9(d1, d2, e2, a9), BS(`Coloque o ${a9 ? 9 : 1} no quociente (coluna ${c + 1}).`, cur, `Regra de ${a9 ? 1 : 2} casa${a9 ? '' : 's'}: o quociente vai na coluna ${c + 1}.`)] };
  };

  const g7 = () => {
    let D = 19, N = 1425;
    for (let t = 0; t < 4000; t++) {
      const d1 = rnd(1, 3), d2 = rnd(4, 9), DD = d1 * 10 + d2, NN = rnd(1000, 9999), qq = Math.floor(NN / (DD * 10));
      if (Math.floor(NN / 1000) == d1 && Math.floor(NN / 100) < DD && qq >= 6 && qq <= 8) { D = DD; N = NN; break; }
    }
    const d1 = Math.floor(D / 10), d2 = D % 10, e2 = Math.floor(N / 100) % 10, a = 6, c = 5, cur = Array(10).fill(0), qs = {};
    cur[0] = d1; cur[1] = d2;
    String(N).split('').forEach((d, i) => cur[a + i] = +d);
    const s0 = [...cur], s = [];
    let R = N, g = 9;
    s.push(rule9(d1, d2, e2, true));
    cur[c] = 9;
    s.push(BS(`Coloque o 9 no quociente (coluna 6).`, [...cur], `Regra de 1 casa e soma 9 (${e2} < ${d2}): coluna 6.`));
    R -= 9 * d1 * 100;
    put(cur, R, a, 4, qs);
    s.push(BS(`Subtraia 9 × ${d1} = ${p2(9 * d1)} (o 1º dígito do divisor).`, [...cur], `Primeiro tira o 1º dígito do divisor: 9 × ${d1}, com a unidade na coluna 8.`));
    for (;;) {
      const fits = R >= g * d2 * 10, rest = Math.floor(R / 10);
      s.push(YN(`${g} × ${d2} = ${g * d2}: cabe no que sobrou do dividendo?`, fits, `${g * d2} é maior que o que resta nessa posição (${rest}): não dá para subtrair.`, `${g * d2} cabe no que resta (${rest}): dá para subtrair.`));
      if (fits) {
        R -= g * d2 * 10;
        put(cur, R, a, 4, qs);
        s.push(BS(`Subtraia ${g} × ${d2} = ${p2(g * d2)}.`, [...cur], `Agora cabe: dezena na coluna 8 e unidade na coluna 9. Quociente ${g}.`));
        break;
      }
      g--;
      cur[c] = g;
      s.push(BS(`Tire 1 do quociente (${g + 1} vira ${g}).`, [...cur], `O quociente estava grande demais: tira 1.`));
      R += d1 * 100;
      put(cur, R, a, 4, qs);
      s.push(BS(`Coloque de volta no dividendo o 1º dígito do divisor (${d1}).`, [...cur], `Você tinha tirado ${g + 1} × ${d1}; com o quociente ${g}, devolva ${d1} na mesma casa de onde saiu (coluna 8).`));
    }
    return { c: 10, lb: null, s0, st: s };
  };

  const GEN = [g1, g2, gm(1), gm(2), dv(1, 2, 9), g6, g7, dv(2, 12, 49), dv(3, 101, 199)];
  const PN = $('#pn'), PP = $('#pp'), PO = $('#po'), PF = $('#pf'), PG = $('#pg');
  let X, xi = 0, cur = [];

  const fb = (ok, t) => { PF.className = 'fb ' + (ok ? 'ok' : 'no'); PF.textContent = t; };
  const paint = () => {
    B.forEach((b, c) => {
      const d = cur[c] || 0, e = d % 5;
      b.h.style.transform = `translate(${b.x}px,${d >= 5 ? 42 : 24}px)`;
      b.e.forEach((g, k) => g.style.transform = `translate(${b.x}px,${k < e ? 74 + k * 20 : 158 - (3 - k) * 20}px)`);
      D[c].textContent = d || '';
    });
    H.forEach(r => r.style.opacity = 0);
    F.style.opacity = 0;
  };

  function bead(c, k) {
    const d = cur[c] || 0, e = d % 5, h = d >= 5 ? 5 : 0;
    cur[c] = k < 0 ? (h ? d - 5 : d + 5) : h + (e > k ? k : k + 1);
    paint();
  }

  function ask() {
    const s = X.st[xi];
    PO.textContent = '';
    PG.textContent = `Passo ${Math.min(xi + 1, X.st.length)} de ${X.st.length}`;
    if (!s) {
      PP.textContent = '🎉 Exercício concluído! Clique em Novo exercício para praticar de novo.';
      return;
    }
    PP.textContent = s.p;
    if (s.o) {
      s.o.forEach((t, i) => {
        const b = document.createElement('button');
        b.textContent = t;
        b.onclick = () => pick(i);
        PO.appendChild(b);
      });
    } else {
      PP.textContent += ' (mexa nas contas e clique em Conferir)';
    }
  }

  function pick(i) {
    const s = X.st[xi];
    if (i === s.a) { fb(1, '✅ Certo!'); xi++; ask(); }
    else fb(0, '❌ ' + s.w[i]);
  }

  function newEx() {
    X = GEN[idx]();
    xi = 0;
    cur = [...X.s0];
    L = { ...LS[idx], c: X.c, lb: X.lb };
    build(); paint(); ask();
    PF.className = 'fb'; PF.textContent = '';
  }

  $('#pc').onclick = () => {
    const s = X.st[xi];
    if (!s || s.o) return;
    const bad = [];
    cur.forEach((d, c) => { if ((d || 0) !== (s.s[c] || 0)) bad.push(c); });
    if (!bad.length) { fb(1, '✅ Certo! ' + s.w); xi++; ask(); }
    else {
      const c = bad[0];
      fb(0, `❌ Ainda não. ${X.lb ? X.lb[c] : 'Coluna ' + (c + 1)}: você deixou ${cur[c] || 0} e o certo é ${s.s[c] || 0}. Por quê: ${s.w}`);
    }
  };

  $('#pa').onclick = () => {
    const s = X.st[xi];
    if (!s) return;
    if (s.o) fb(0, 'Resposta: ' + s.o[s.a] + '.');
    else { cur = [...s.s]; paint(); fb(0, 'Resposta mostrada. ' + s.w); }
    xi++; ask();
  };

  $('#pm').onclick = newEx;

  function mode(m) {
    PR = m;
    [...$('#lm').children].forEach((b, j) => b.classList.toggle('on', j === m));
    T.style.display = $('#lbar').style.display = m ? 'none' : '';
    PN.style.display = m ? '' : 'none';
    load(idx);
  }

  [...$('#lm').children].forEach((b, j) => b.onclick = () => mode(j));
  load(0);
})();
