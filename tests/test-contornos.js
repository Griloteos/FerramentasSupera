const assert = require('assert');
const TangramContornos = require('../js/tangram-contornos.js');

console.log('--- Testando Biblioteca de Contornos do Tangram ---');

const figuras = TangramContornos.FIGURAS;
assert(figuras.length >= 10, 'Deve ter pelo menos 10 figuras na biblioteca');

let figuresWithTargets = 0;
figuras.forEach(f => {
  if (f.id === 'livre') {
    assert.strictEqual(f.targets, null);
    return;
  }
  figuresWithTargets++;
  assert(Array.isArray(f.targets), `Figura ${f.id} deve ter array targets`);
  assert.strictEqual(f.targets.length, 7, `Figura ${f.id} deve ter exatamente 7 peças alvo`);

  // Confirma que contém as 7 peças (0 a 6)
  const pieceIndices = f.targets.map(t => t.pieceIdx).sort();
  assert.deepStrictEqual(pieceIndices, [0, 1, 2, 3, 4, 5, 6], `Figura ${f.id} deve conter as peças 0 a 6`);

  f.targets.forEach(t => {
    assert(Number.isFinite(t.x), `x inválido na figura ${f.id}`);
    assert(Number.isFinite(t.y), `y inválido na figura ${f.id}`);
    assert(Number.isFinite(t.r), `r inválido na figura ${f.id}`);
    assert(t.f === 1 || t.f === -1, `f inválido na figura ${f.id}`);
  });
});

console.log(`✅ ${figuresWithTargets} figuras validadas com sucesso (todas com 7 peças e coordenadas válidas).`);
