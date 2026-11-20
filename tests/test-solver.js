const assert = require('assert');
const { resolver } = require('../js/solver.js');

console.log('--- Testando Motor de Resolução Supera (Soma e Subtração) ---');

// 1. Testes de casos canônicos do Supera
const c1 = resolver('7 + 6');
assert.strictEqual(c1.resultado, 13, '7 + 6 deve ser 13');
assert(c1.tags.includes('Base 10'), '7 + 6 deve conter tag Base 10');
assert(c1.tags.includes('Base 5'), '7 + 6 deve conter tag Base 5');
console.log('✅ 7 + 6 passou com tags:', c1.tags.join(', '));

const c2 = resolver('3 + 4');
assert.strictEqual(c2.resultado, 7, '3 + 4 deve ser 7');
assert(c2.tags.includes('Base 5'), '3 + 4 deve conter tag Base 5');
console.log('✅ 3 + 4 passou com tags:', c2.tags.join(', '));

const c3 = resolver('7 - 3');
assert.strictEqual(c3.resultado, 4, '7 - 3 deve ser 4');
assert(c3.tags.includes('Base 5'), '7 - 3 deve conter tag Base 5');
console.log('✅ 7 - 3 passou com tags:', c3.tags.join(', '));

const c4 = resolver('13 - 6');
assert.strictEqual(c4.resultado, 7, '13 - 6 deve ser 7');
assert(c4.tags.includes('Base 10'), '13 - 6 deve conter tag Base 10');
assert(c4.tags.includes('Base 5'), '13 - 6 deve conter tag Base 5');
console.log('✅ 13 - 6 passou com tags:', c4.tags.join(', '));

const c5 = resolver('125 + 48 - 17');
assert.strictEqual(c5.resultado, 156, '125 + 48 - 17 deve ser 156');
console.log('✅ 125 + 48 - 17 passou com resultado 156 e', c5.passos.length, 'passos gerados.');

// 2. Testes aleatórios com consistência de estado
let passedRandom = 0;
for (let i = 0; i < 500; i++) {
  const n1 = Math.floor(Math.random() * 800) + 100;
  const n2 = Math.floor(Math.random() * 400) + 10;
  const n3 = Math.floor(Math.random() * Math.min(n1 + n2 - 1, 300)) + 1;
  const expr = `${n1} + ${n2} - ${n3}`;
  const esperado = n1 + n2 - n3;

  const res = resolver(expr);
  assert.strictEqual(res.resultado, esperado, `Resultado incorreto em: ${expr}`);

  // Valida que todos os estados são válidos (0 a 9 em cada coluna)
  res.passos.forEach(p => {
    assert(Array.isArray(p.estado) && p.estado.length === 15, 'Estado deve ter 15 colunas');
    p.estado.forEach(dig => {
      assert(dig >= 0 && dig <= 9, 'Dígito do ábaco deve estar entre 0 e 9');
    });
  });

  passedRandom++;
}

console.log(`✅ ${passedRandom} testes aleatórios de soma/subtração encadeadas passaram com 100% de precisão.`);
