// Teste automatizado dos geradores de exercícios do Soroban
const assert = require('assert');

// Extrai geradores
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const p2 = n => String(n).padStart(2, '0');
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
    s.push(BS(`Regra do +: primeiro tira a diferença (${d}).`, [0, a - d], `Na soma com base 10 a ordem é: tira a diferença e depois soma 10.`));
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
      s.push(BS(`${d} × ${m} = ${p2(pr)}. Coloque a dezena na casa ${t} e a unidade na casa ${t - 1}.`, nd(ac, w), `${d} × ${m} = ${pr}: dezena ${Math.floor(pr/10)} na casa ${t} e unidade ${pr%10} na casa ${t-1}.`));
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
      s.push(Q(`Compare o início do dividendo (${g}) com o divisor (${D}). Onde vai o 1º dígito do quociente?`, ['2 casas à esquerda do 1º dígito do dividendo', '1 casa à esquerda do 1º dígito do dividendo'], g >= D ? 0 : 1, [`${g} é menor que ${D}`, `${g} é maior ou igual a ${D}`]));
    }
    s.push(QN(`Quanto vale o próximo dígito do quociente? (${grp} ÷ ${D})`, q, 0, 9, x => `${x} × ${D}`));
    qs[c] = 1; cur[c] = q;
    s.push(BS(`Coloque o ${q} no quociente.`, [...cur], ''));
    Ds.forEach((dj, j) => {
      const pr = q * dj;
      R -= pr * 10 ** (k - 1 - j + p);
      put(cur, R, a, Ln, qs);
      s.push(BS(`Subtraia ${q} × ${dj} = ${p2(pr)}.`, [...cur], ''));
    });
  });
  return { c: U + 1, lb: null, s0, st: s };
};

const dv = (k, lo, hi) => () => {
  const D = rnd(lo, hi);
  return gd(k, D, (rnd(1, 9) * 10 + rnd(1, 9)) * D + rnd(0, D - 1));
};

const rule9 = (d1, d2, e2, a9) => Q(`Os primeiros dígitos são iguais (${d1}). Compare o 2º: ${e2} e ${d2}.`, ['Pula 2 casas à esquerda e soma 1', 'Pula 1 casa à esquerda e soma 9', 'Divide só o 1º dígito'], a9 ? 1 : 0, ['', '', '']);

const g6 = () => {
  const d1 = rnd(1, 8), d2 = rnd(1, 9), a9 = Math.random() < .5, e2 = a9 ? rnd(0, d2 - 1) : rnd(d2, 9), a = 6, c = a9 ? a - 1 : a - 2;
  const N = Number(`${d1}${e2}${rnd(0, 9)}${rnd(0, 9)}`), cur = Array(10).fill(0);
  cur[0] = d1; cur[1] = d2;
  String(N).split('').forEach((d, i) => cur[a + i] = +d);
  const s0 = [...cur]; cur[c] = a9 ? 9 : 1;
  return { c: 10, lb: null, s0, st: [rule9(d1, d2, e2, a9), BS(`Coloque o ${a9 ? 9 : 1} no quociente.`, cur, '')] };
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
  s.push(BS(`Coloque o 9 no quociente.`, [...cur], ''));
  R -= 9 * d1 * 100;
  put(cur, R, a, 4, qs);
  s.push(BS(`Subtraia 9 × ${d1} = ${p2(9 * d1)}.`, [...cur], ''));
  for (;;) {
    const fits = R >= g * d2 * 10, rest = Math.floor(R / 10);
    s.push(YN(`${g} × ${d2} = ${g * d2}: cabe?`, fits, '', ''));
    if (fits) {
      R -= g * d2 * 10;
      put(cur, R, a, 4, qs);
      s.push(BS(`Subtraia ${g} × ${d2} = ${p2(g * d2)}.`, [...cur], ''));
      break;
    }
    g--;
    cur[c] = g;
    s.push(BS(`Tire 1 do quociente.`, [...cur], ''));
    R += d1 * 100;
    put(cur, R, a, 4, qs);
    s.push(BS(`Coloque de volta no dividendo ${d1}.`, [...cur], ''));
  }
  return { c: 10, lb: null, s0, st: s };
};

const GEN = [g1, g2, gm(1), gm(2), dv(1, 2, 9), g6, g7, dv(2, 12, 49), dv(3, 101, 199)];

console.log('Testando os 9 geradores de exercícios...');
GEN.forEach((gen, i) => {
  for (let run = 0; run < 100; run++) {
    const ex = gen();
    assert(ex.c > 0, `Gerador ${i} retornou colunas inválidas`);
    assert(Array.isArray(ex.s0), `Gerador ${i} retornou s0 inválido`);
    assert(Array.isArray(ex.st) && ex.st.length > 0, `Gerador ${i} retornou st vazio`);
  }
});

console.log('✅ Todos os geradores passaram nos 100 testes cada (900 testes no total com 0 falhas).');
