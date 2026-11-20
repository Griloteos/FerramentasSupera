/* Ferramentas Supera - Motor de Resolução de Contas (Soma, Subtração, Multiplicação e Divisão) */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SuperaSolver = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const N_COLS = 15;
  const UNIT_COL = 9; // Coluna 9 é a Unidade (6ª da direita para a esquerda: 14, 13, 12, 11, 10, 9)

  function parseExpression(expr) {
    if (!expr || typeof expr !== 'string') return null;
    const clean = expr.replace(/\s+/g, '').replace(/−/g, '-').replace(/[xX*]/g, '×').replace(/[:/]/g, '÷');

    // Verifica se é divisão (ex: 276÷12 ou 276/12 ou 276:12)
    if (/^[0-9]+÷[0-9]+$/.test(clean)) {
      const parts = clean.split('÷');
      return {
        tipo: 'div',
        dividendo: parseInt(parts[0], 10),
        divisor: parseInt(parts[1], 10),
        raw1: parts[0],
        raw2: parts[1]
      };
    }

    // Verifica se é multiplicação (ex: 256×14 ou 256*4)
    if (/^[0-9]+×[0-9]+$/.test(clean)) {
      const parts = clean.split('×');
      return {
        tipo: 'mult',
        m1: parseInt(parts[0], 10),
        m2: parseInt(parts[1], 10),
        raw1: parts[0],
        raw2: parts[1]
      };
    }

    // Caso contrário, verifica soma e subtração encadeadas
    if (!/^[0-9]+([+-][0-9]+)*$/.test(clean)) return null;

    const tokens = [];
    const regex = /([+-]?)([0-9]+)/g;
    let match;
    while ((match = regex.exec(clean)) !== null) {
      tokens.push({
        op: match[1] || '+',
        val: parseInt(match[2], 10),
        raw: match[2]
      });
    }
    return {
      tipo: 'soma_sub',
      tokens: tokens
    };
  }

  function cloneState(st) {
    return st.slice();
  }

  function getColName(c) {
    const NM = {
      0: 'U. bilhão', 1: 'C. milhão', 2: 'D. milhão', 3: 'U. milhão',
      4: 'C. milhar', 5: 'D. milhar', 6: 'U. milhar', 7: 'Centena',
      8: 'Dezena', 9: 'Unidade'
    };
    return NM[c] || `coluna ${c + 1}`;
  }

  function resolver(expr) {
    const parsed = parseExpression(expr);
    if (!parsed) {
      return { erro: 'Conta inválida. Digite expressões de soma/subtração (ex: 125 + 48 − 17), multiplicação (ex: 256 × 14) ou divisão (ex: 276 ÷ 12).' };
    }

    if (parsed.tipo === 'div') {
      return resolverDivisao(parsed, expr);
    }

    if (parsed.tipo === 'mult') {
      return resolverMultiplicacao(parsed, expr);
    }

    return resolverSomaSub(parsed.tokens, expr);
  }

  /* --- Resolução de Divisão no Método Supera --- */
  function resolverDivisao(parsed, expr) {
    const N = parsed.dividendo;
    const D = parsed.divisor;
    const rawN = parsed.raw1;
    const rawD = parsed.raw2;

    if (D === 0) {
      return { erro: 'Divisão por zero não é permitida.' };
    }

    if (N < D) {
      return { erro: 'O dividendo deve ser maior ou igual ao divisor.' };
    }

    // Regra acordada com o educador: se a divisão não for exata, avisar que está em desenvolvimento
    if (N % D !== 0) {
      const resto = N % D;
      const quoc = Math.floor(N / D);
      return {
        erro: `Esta conta resulta em uma divisão não exata (${N} ÷ ${D} = ${quoc}, resto ${resto}). A divisão com resto e casas decimais está em desenvolvimento.`
      };
    }

    const state = Array(N_COLS).fill(0);
    const passos = [];
    const tagsUsadas = new Set();
    tagsUsadas.add('Divisão');
    let passoId = 1;

    const Ds = rawD.split('').map(Number);
    const Ns = rawN.split('').map(Number);
    const k = Ds.length;
    const Ln = Ns.length;
    const a = k + 4; // 4 colunas vazias
    const U = a + Ln - 1;

    if (U >= N_COLS) {
      return { erro: 'Divisão muito grande para as 15 colunas do ábaco.' };
    }

    // Monta divisor à esquerda e dividendo após 4 colunas vazias
    for (let i = 0; i < k; i++) state[i] = Ds[i];
    for (let i = 0; i < Ln; i++) state[a + i] = Ns[i];

    const colunasIniciais = [];
    for (let i = 0; i < k; i++) colunasIniciais.push(i);
    for (let i = 0; i < Ln; i++) colunasIniciais.push(a + i);

    passos.push({
      id: passoId++,
      tokenIdx: 0,
      dedo: null,
      texto: `Montamos a divisão: divisor ${D} à esquerda, 4 colunas vazias e dividendo ${N}.`,
      estado: cloneState(state),
      destaque: colunasIniciais,
      tags: ['Divisão'],
      operacao: { termo: `${N} ÷ ${D}`, parcial: 0 }
    });

    function putDividendo(restVal) {
      const rStr = String(restVal).padStart(Ln, '0');
      for (let i = 0; i < Ln; i++) {
        state[a + i] = parseInt(rStr[i], 10);
      }
    }

    const Q = Math.floor(N / D);
    const Qd = String(Q).split('').map(Number);
    let R = N;
    let quocAcumulado = '';

    for (let ix = 0; ix < Qd.length; ix++) {
      const qReal = Qd[ix];
      const p = Qd.length - 1 - ix;
      const c = U - k - 1 - p;

      if (ix === 0) {
        const g = Math.floor(N / 10 ** (Ln - k));
        const ehMaiorOuIgual = g >= D;

        const d1 = Ds[0];
        const d2 = k >= 2 ? Ds[1] : 0;
        const e1 = Ns[0];
        const e2 = Ln >= 2 ? Ns[1] : 0;

        if (k >= 2 && d1 === e1) {
          tagsUsadas.add('Regra do 9');
          if (e2 < d2) {
            tagsUsadas.add('Regra de 1 casa');
            passos.push({
              id: passoId++,
              tokenIdx: 0,
              dedo: c,
              texto: `Os primeiros dígitos são iguais (${d1}). O 2º dígito do dividendo (${e2}) é menor que o do divisor (${d2}): pela <b>Regra do 9</b>, pula 1 casa à esquerda e colocamos 9 no quociente (${getColName(c)}).`,
              estado: cloneState(state),
              destaque: [c],
              tags: ['Regra do 9', 'Regra de 1 casa'],
              operacao: { termo: `${N} ÷ ${D}`, parcial: 9 }
            });

            if (qReal < 9) {
              tagsUsadas.add('Tirar do quociente');
              state[c] = 9;

              R -= 9 * d1 * 10 ** (k - 1 + p);
              putDividendo(R);
              passos.push({
                id: passoId++,
                tokenIdx: 0,
                dedo: c,
                texto: `9 × ${d1} = ${String(9 * d1).padStart(2, '0')}: tiramos ${9 * d1} do dividendo.`,
                estado: cloneState(state),
                destaque: [a],
                tags: ['Regra do 9'],
                operacao: { termo: `${N} ÷ ${D}`, parcial: 9 }
              });

              let chuteAtual = 9;
              while (chuteAtual > qReal) {
                const sub2 = chuteAtual * d2;
                passos.push({
                  id: passoId++,
                  tokenIdx: 0,
                  dedo: c,
                  texto: `${chuteAtual} × ${d2} = ${sub2}: a dezena não cabe no dividendo restante. O quociente ${chuteAtual} está grande demais!`,
                  estado: cloneState(state),
                  destaque: [c],
                  tags: ['Tirar do quociente'],
                  operacao: { termo: `${N} ÷ ${D}`, parcial: chuteAtual }
                });

                chuteAtual--;
                state[c] = chuteAtual;
                R += d1 * 10 ** (k - 1 + p);
                putDividendo(R);

                passos.push({
                  id: passoId++,
                  tokenIdx: 0,
                  dedo: c,
                  texto: `Tiramos 1 do quociente (${chuteAtual + 1} vira ${chuteAtual}) e colocamos de volta no dividendo o valor do 1º dígito do divisor (${d1}).`,
                  estado: cloneState(state),
                  destaque: [c, a],
                  tags: ['Tirar do quociente'],
                  operacao: { termo: `${N} ÷ ${D}`, parcial: chuteAtual }
                });
              }

              const pr2 = qReal * d2;
              R -= pr2 * 10 ** p;
              putDividendo(R);
              passos.push({
                id: passoId++,
                tokenIdx: 0,
                dedo: c,
                texto: `${qReal} × ${d2} = ${String(pr2).padStart(2, '0')}: agora cabe! Subtraímos do dividendo.`,
                estado: cloneState(state),
                destaque: [c, a + 1],
                tags: ['Tirar do quociente'],
                operacao: { termo: `${N} ÷ ${D}`, parcial: qReal }
              });

              quocAcumulado += String(qReal);
              continue;
            } else {
              state[c] = 9;
              Ds.forEach((dj, j) => {
                const pr = 9 * dj;
                R -= pr * 10 ** (k - 1 - j + p);
                putDividendo(R);
                passos.push({
                  id: passoId++,
                  tokenIdx: 0,
                  dedo: c,
                  texto: `Subtraímos 9 × ${dj} = ${String(pr).padStart(2, '0')}: unidade na ${getColName(c + j + 2)} e dezena na ${getColName(c + j + 1)}.`,
                  estado: cloneState(state),
                  destaque: [c + j + 2],
                  tags: ['Regra do 9'],
                  operacao: { termo: `${N} ÷ ${D}`, parcial: 9 }
                });
              });
              quocAcumulado += String(qReal);
              continue;
            }
          } else {
            tagsUsadas.add('Regra de 2 casas');
            passos.push({
              id: passoId++,
              tokenIdx: 0,
              dedo: c,
              texto: `Os primeiros dígitos são iguais (${d1}). Pela <b>Regra do 9</b>, como os dígitos são iguais ou maiores, pulamos 2 casas e colocamos 1 no quociente (${getColName(c)}).`,
              estado: cloneState(state),
              destaque: [c],
              tags: ['Regra do 9', 'Regra de 2 casas'],
              operacao: { termo: `${N} ÷ ${D}`, parcial: 1 }
            });
          }
        } else {
          if (ehMaiorOuIgual) {
            tagsUsadas.add('Regra de 2 casas');
            passos.push({
              id: passoId++,
              tokenIdx: 0,
              dedo: c,
              texto: `O início do dividendo (${g}) é maior ou igual ao divisor (${D}): pela <b>regra de 2 casas</b>, o quociente vai 2 casas à esquerda do dividendo (${getColName(c)}).`,
              estado: cloneState(state),
              destaque: [c],
              tags: ['Regra de 2 casas'],
              operacao: { termo: `${N} ÷ ${D}`, parcial: 0 }
            });
          } else {
            tagsUsadas.add('Regra de 1 casa');
            passos.push({
              id: passoId++,
              tokenIdx: 0,
              dedo: c,
              texto: `O início do dividendo (${g}) é menor que o divisor (${D}): pela <b>regra de 1 casa</b>, o quociente vai 1 casa à esquerda do dividendo (${getColName(c)}).`,
              estado: cloneState(state),
              destaque: [c],
              tags: ['Regra de 1 casa'],
              operacao: { termo: `${N} ÷ ${D}`, parcial: 0 }
            });
          }
        }
      }

      state[c] = qReal;
      quocAcumulado += String(qReal);

      passos.push({
        id: passoId++,
        tokenIdx: 0,
        dedo: c,
        texto: `Colocamos o dígito ${qReal} no quociente (${getColName(c)}).`,
        estado: cloneState(state),
        destaque: [c],
        tags: ['Divisão'],
        operacao: { termo: `${N} ÷ ${D}`, parcial: parseInt(quocAcumulado, 10) }
      });

      Ds.forEach((dj, j) => {
        const pr = qReal * dj;
        R -= pr * 10 ** (k - 1 - j + p);
        putDividendo(R);
        passos.push({
          id: passoId++,
          tokenIdx: 0,
          dedo: c,
          texto: `Subtraímos ${qReal} × ${dj} = ${String(pr).padStart(2, '0')}: unidade na ${getColName(c + j + 2)} e dezena na ${getColName(c + j + 1)}.`,
          estado: cloneState(state),
          destaque: [c + j + 2],
          tags: ['Divisão'],
          operacao: { termo: `${N} ÷ ${D}`, parcial: parseInt(quocAcumulado, 10) }
        });
      });
    }

    return {
      operacao: `${N} ÷ ${D}`,
      tokens: [{ op: '', raw: `${N} ÷ ${D}` }],
      resultado: Q,
      passos: passos,
      tags: Array.from(tagsUsadas)
    };
  }

  /* --- Resolução de Multiplicação no Método Supera --- */
  function resolverMultiplicacao(parsed, expr) {
    let rawA = parsed.raw1;
    let rawB = parsed.raw2;
    let valA = parsed.m1;
    let valB = parsed.m2;

    if (valA < valB) {
      const tmpR = rawA; rawA = rawB; rawB = tmpR;
      const tmpV = valA; valA = valB; valB = tmpV;
    }

    const state = Array(N_COLS).fill(0);
    const passos = [];
    const tagsUsadas = new Set();
    tagsUsadas.add('Dezena temporária');
    let passoId = 1;
    let resultadoAcumulado = 0;

    const lenA = rawA.length;
    const lenB = rawB.length;
    const totalCasasPular = lenA + lenB;
    const dezenaTempCol = UNIT_COL - totalCasasPular + 1;

    if (dezenaTempCol < 0) {
      return { erro: 'Multiplicação muito grande para o ábaco de 15 colunas.' };
    }

    passos.push({
      id: passoId++,
      tokenIdx: 0,
      dedo: dezenaTempCol,
      texto: `Multiplicação: ${rawA} × ${rawB}. O multiplicando tem ${lenA} dígitos e o multiplicador tem ${lenB}. Pulamos ${lenA} + ${lenB} = ${totalCasasPular} casas a partir da unidade. O dedo aponta a <b>${getColName(dezenaTempCol)}</b> (dezena temporária).`,
      estado: cloneState(state),
      destaque: [dezenaTempCol],
      tags: ['Dezena temporária'],
      operacao: { termo: `${rawA} × ${rawB}`, parcial: 0 }
    });

    for (let j = 0; j < lenB; j++) {
      const digM = parseInt(rawB[j], 10);
      const casaM = lenB - j;
      const nomeCasaM = casaM === 2 ? 'dezena' : (casaM === 1 ? 'unidade' : `casa ${casaM}`);

      for (let i = 0; i < lenA; i++) {
        const digA = parseInt(rawA[i], 10);
        const casaA = lenA - i;
        const produto = digA * digM;
        const casaAlvoDezena = casaA + casaM;
        const colDezena = UNIT_COL - casaAlvoDezena + 1;
        const colUnidade = colDezena + 1;

        const dezProd = Math.floor(produto / 10);
        const uniProd = produto % 10;
        const strP2 = String(produto).padStart(2, '0');

        passos.push({
          id: passoId++,
          tokenIdx: j,
          dedo: colDezena,
          texto: `${digA} (casa ${casaA}) × ${digM} (${nomeCasaM}): casa ${casaA} + casa ${casaM} = ${casaAlvoDezena}. O dedo aponta a <b>${getColName(colDezena)}</b>. Produto: ${digA} × ${digM} = ${strP2}.`,
          estado: cloneState(state),
          destaque: [colDezena, colUnidade],
          tags: ['Dezena temporária'],
          operacao: { termo: `${digA} × ${digM}`, parcial: resultadoAcumulado }
        });

        if (dezProd > 0) {
          somarDigitoNaColuna(colDezena, dezProd, `dezena ${dezProd}`, colDezena);
        }

        if (uniProd > 0) {
          somarDigitoNaColuna(colUnidade, uniProd, `unidade ${uniProd}`, colDezena);
        }

        resultadoAcumulado += produto * 10 ** (casaAlvoDezena - 2);
        passos[passos.length - 1].operacao.parcial = resultadoAcumulado;
      }
    }

    function somarDigitoNaColuna(c, n, rotulo, dedoRef) {
      const d = state[c];
      const nomeCasa = getColName(c);
      const cimaLivre = d < 5;
      const baixoOcupadas = d >= 5 ? d - 5 : d;
      const baixoLivre = 4 - baixoOcupadas;
      const cabeDireto = (d + n <= 9) && (
        (n <= baixoLivre) ||
        (cimaLivre && n >= 5 && (n - 5) <= baixoLivre)
      );

      if (cabeDireto) {
        state[c] += n;
        tagsUsadas.add('Direto');
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `Na ${nomeCasa}: somamos ${rotulo}. Cabe direto.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Direto'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
        return;
      }

      if (d + n <= 9) {
        const dif5 = 5 - n;
        tagsUsadas.add('Base 5');
        state[c] += 5;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `Na ${nomeCasa}: somamos ${rotulo}. Troca de base 5: primeiro soma 5…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
        state[c] -= dif5;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `…e depois tira a diferença (${dif5}).`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
        return;
      }

      const dif10 = 10 - n;
      tagsUsadas.add('Base 10');
      tagsUsadas.add('Vai um');

      const dAtual = state[c];
      const contasBaixo = dAtual >= 5 ? dAtual - 5 : dAtual;

      if (contasBaixo >= dif10) {
        state[c] -= dif10;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `Na ${nomeCasa}: somamos ${rotulo} (passa de 9). Troca de base 10: primeiro tira ${dif10}…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
      } else {
        const dif5 = 5 - dif10;
        tagsUsadas.add('Base 5');
        state[c] += dif5;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `Na ${nomeCasa}: somamos ${rotulo} (passa de 9). Tira ${dif10} usando base 5 interna: soma ${dif5}…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
        state[c] -= 5;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `…e tira 5.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoAcumulado }
        });
      }

      somarCarryMult(c - 1, dedoRef);
    }

    function somarCarryMult(col, dedoRef) {
      if (col < 0) return;
      const nomeCasa = getColName(col);
      if (state[col] < 9) {
        state[col] += 1;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `…e soma 10: vai 1 para a ${nomeCasa}.`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Vai um'],
          operacao: { termo: '+1', parcial: resultadoAcumulado }
        });
      } else {
        state[col] = 0;
        passos.push({
          id: passoId++,
          dedo: dedoRef,
          texto: `Na ${nomeCasa}: 9 com +1 vira 0 e passa 1 para a esquerda.`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Vai um', 'Base 10'],
          operacao: { termo: '+1', parcial: resultadoAcumulado }
        });
        somarCarryMult(col - 1, dedoRef);
      }
    }

    return {
      operacao: expr,
      tokens: [{ op: '', raw: `${rawA} × ${rawB}` }],
      resultado: valA * valB,
      passos: passos,
      tags: Array.from(tagsUsadas)
    };
  }

  /* --- Resolução de Soma e Subtração Encadeadas --- */
  function resolverSomaSub(tokens, expr) {
    const state = Array(N_COLS).fill(0);
    const passos = [];
    const tagsUsadas = new Set();
    let passoId = 1;
    let resultadoParcial = 0;
    let currentTokenIdx = 0;

    const primeiro = tokens[0];
    resultadoParcial = primeiro.val;
    const strPrimeiro = primeiro.raw;
    const lenPrimeiro = strPrimeiro.length;
    const startColPrimeiro = UNIT_COL - lenPrimeiro + 1;

    if (startColPrimeiro < 0) {
      return { erro: 'Número muito grande para o ábaco de 15 colunas.' };
    }

    for (let i = 0; i < lenPrimeiro; i++) {
      const col = startColPrimeiro + i;
      state[col] = parseInt(strPrimeiro[i], 10);
    }
    tagsUsadas.add('Direto');

    passos.push({
      id: passoId++,
      tokenIdx: 0,
      texto: `Colocamos o primeiro número: ${primeiro.val} no ábaco.`,
      estado: cloneState(state),
      destaque: Array.from({ length: lenPrimeiro }, (_, i) => startColPrimeiro + i),
      tags: ['Direto'],
      operacao: { termo: strPrimeiro, parcial: resultadoParcial }
    });

    for (let t = 1; t < tokens.length; t++) {
      currentTokenIdx = t;
      const token = tokens[t];
      const isSoma = token.op === '+';
      const strVal = token.raw;
      const lenVal = strVal.length;
      const startCol = UNIT_COL - lenVal + 1;

      if (startCol < 0) {
        return { erro: 'Número muito grande para o ábaco de 15 colunas.' };
      }

      for (let i = 0; i < lenVal; i++) {
        const n = parseInt(strVal[i], 10);
        if (n === 0) continue;

        const col = startCol + i;
        const colName = getColName(col);

        if (isSoma) {
          executarSomaDigito(col, n, colName);
        } else {
          executarSubtracaoDigito(col, n, colName);
        }
      }

      resultadoParcial = isSoma ? resultadoParcial + token.val : resultadoParcial - token.val;
      passos[passos.length - 1].operacao.parcial = resultadoParcial;
    }

    function executarSomaDigito(c, n, nomeCasa) {
      const d = state[c];
      const cimaLivre = d < 5;
      const baixoOcupadas = d >= 5 ? d - 5 : d;
      const baixoLivre = 4 - baixoOcupadas;
      const cabeDireto = (d + n <= 9) && (
        (n <= baixoLivre) ||
        (cimaLivre && n >= 5 && (n - 5) <= baixoLivre)
      );

      if (cabeDireto) {
        state[c] += n;
        tagsUsadas.add('Direto');
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos somar ${n}. O ${n} cabe? Sim. Somamos direto.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Direto'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
        return;
      }

      if (d + n <= 9) {
        const dif5 = 5 - n;
        tagsUsadas.add('Base 5');
        state[c] += 5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos somar ${n}. O ${n} cabe embaixo? Não. Troca de base 5: do ${n} para 5 falta ${dif5}. Regra do +: primeiro soma 5…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
        state[c] -= dif5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `…e depois tira a diferença, ${dif5}.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
        return;
      }

      const dif10 = 10 - n;
      tagsUsadas.add('Base 10');
      tagsUsadas.add('Vai um');

      const dAtual = state[c];
      const contasBaixo = dAtual >= 5 ? dAtual - 5 : dAtual;

      if (contasBaixo >= dif10) {
        state[c] -= dif10;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos somar ${n}. Passa de 9! Troca de base 10: do ${n} para 10 falta ${dif10}. Regra do +: primeiro tira a diferença, ${dif10}…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
      } else {
        const dif5 = 5 - dif10;
        tagsUsadas.add('Base 5');
        state[c] += dif5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos somar ${n} (passa de 9, falta ${dif10} para 10). Para tirar ${dif10}, usamos base 5 interna: primeiro soma ${dif5}…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
        state[c] -= 5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `…e tira 5.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `+${n}`, parcial: resultadoParcial }
        });
      }

      somarCarry(c - 1);
    }

    function somarCarry(col) {
      if (col < 0) return;
      const nomeCasa = getColName(col);
      if (state[col] < 9) {
        state[col] += 1;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `…e depois soma 10: vai 1 para a ${nomeCasa}.`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Vai um'],
          operacao: { termo: '+1', parcial: resultadoParcial }
        });
      } else {
        state[col] = 0;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: 9 com +1 vira 0 e passa 1 para a esquerda.`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Vai um', 'Base 10'],
          operacao: { termo: '+1', parcial: resultadoParcial }
        });
        somarCarry(col - 1);
      }
    }

    function executarSubtracaoDigito(c, n, nomeCasa) {
      const d = state[c];
      const contasBaixo = d >= 5 ? d - 5 : d;

      if (d >= n && (contasBaixo >= n || (d >= 5 && n === 5) || (d >= 5 && n > 5 && contasBaixo >= n - 5))) {
        state[c] -= n;
        tagsUsadas.add('Direto');
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos subtrair ${n}. Eu tenho ${n}? Sim. Tiramos direto.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Direto'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
        return;
      }

      if (d >= n) {
        const dif5 = 5 - n;
        tagsUsadas.add('Base 5');
        state[c] += dif5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: vamos subtrair ${n}. Eu tenho ${n} embaixo? Não. Troca de base 5: do ${n} para 5 falta ${dif5}. Regra do −: primeiro soma a diferença, ${dif5}…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
        state[c] -= 5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `…e depois tira 5.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 5'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
        return;
      }

      const dif10 = 10 - n;
      tagsUsadas.add('Base 10');
      tagsUsadas.add('Empréstimo');

      subtrairEmprestimo(c - 1);

      const dAtual = state[c];
      const baixoLivre = dAtual < 5 ? 4 - dAtual : 9 - dAtual;

      if (baixoLivre >= dif10) {
        state[c] += dif10;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: e depois soma a diferença (${dif10}).`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
      } else {
        const dif5 = 5 - dif10;
        tagsUsadas.add('Base 5');
        state[c] += 5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: para somar a diferença (${dif10}) usamos base 5: primeiro soma 5…`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
        state[c] -= dif5;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `…e tira ${dif5}.`,
          estado: cloneState(state),
          destaque: [c],
          tags: ['Base 10', 'Base 5'],
          operacao: { termo: `-${n}`, parcial: resultadoParcial }
        });
      }
    }

    function subtrairEmprestimo(col) {
      if (col < 0) return;
      const nomeCasa = getColName(col);
      if (state[col] > 0) {
        state[col] -= 1;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Regra do − (Base 10): primeiro tira 10 (1 da ${nomeCasa})…`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Empréstimo', 'Base 10'],
          operacao: { termo: '-1', parcial: resultadoParcial }
        });
      } else {
        state[col] = 9;
        passos.push({
          id: passoId++,
          tokenIdx: currentTokenIdx,
          texto: `Na ${nomeCasa}: como estava em 0, vira 9 e empresta da casa anterior.`,
          estado: cloneState(state),
          destaque: [col],
          tags: ['Empréstimo'],
          operacao: { termo: '-1', parcial: resultadoParcial }
        });
        subtrairEmprestimo(col - 1);
      }
    }

    return {
      operacao: expr,
      tokens: tokens,
      resultado: resultadoParcial,
      passos: passos,
      tags: Array.from(tagsUsadas)
    };
  }

  return {
    resolver: resolver
  };
}));
