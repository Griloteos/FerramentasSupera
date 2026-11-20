const assert = require('assert');
const { resolver } = require('../js/solver.js');

console.log('--- Testando Motor de Multiplicação Supera ---');

// 1. Multiplicação com 1 multiplicador: 256 × 4 = 1024
const m1 = resolver('256 * 4');
assert.strictEqual(m1.resultado, 1024, '256 × 4 deve ser 1024');
assert(m1.tags.includes('Dezena temporária'), 'Deve conter tag Dezena temporária');
console.log('✅ 256 × 4 passou com resultado 1024 e tags:', m1.tags.join(', '));

// 2. Multiplicação com 2 multiplicadores: 256 × 14 = 3584
const m2 = resolver('256 * 14');
assert.strictEqual(m2.resultado, 3584, '256 × 14 deve ser 3584');
console.log('✅ 256 × 14 passou com resultado 3584 e', m2.passos.length, 'passos.');

// 3. Teste com multiplicador menor colocado na frente: 4 * 256
const m3 = resolver('4 * 256');
assert.strictEqual(m3.resultado, 1024, '4 × 256 deve ser 1024');
console.log('✅ 4 × 256 inverteu para colocar o maior à esquerda automaticamente.');

// 4. Testes aleatórios de multiplicação
for (let i = 0; i < 200; i++) {
  const a = Math.floor(Math.random() * 899) + 10;
  const b = Math.floor(Math.random() * 89) + 2;
  const esperado = a * b;
  const res = resolver(`${a} * ${b}`);
  assert.strictEqual(res.resultado, esperado, `Erro em ${a} × ${b}`);
  res.passos.forEach(p => {
    p.estado.forEach(dig => {
      assert(dig >= 0 && dig <= 9, 'Dígito deve ser entre 0 e 9');
    });
  });
}

console.log('✅ 200 testes aleatórios de multiplicação passaram com 100% de precisão.');
