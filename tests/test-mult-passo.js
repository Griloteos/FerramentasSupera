const assert = require('assert');
const { resolver } = require('../js/solver.js');

console.log('--- Testando Multiplicação 256 × 14 Passo a Passo ---');
const res = resolver('256 * 14');
assert.strictEqual(res.resultado, 3584);

// Verifica o passo onde 6 × 1 = 6 é somado na Dezena
const passo6x1 = res.passos.find(p => p.texto.includes('6 (casa 1) × 1 (dezena)'));
assert(passo6x1, 'Deve existir passo 6 × 1');
console.log('Passo 6x1:', passo6x1.texto);

const passoSoma6 = res.passos.find(p => p.texto.includes('Na Dezena: somamos unidade 6'));
assert(passoSoma6, 'Deve existir o passo somando unidade 6 na dezena');
console.log('Passo soma 6:', passoSoma6.texto);
assert(passoSoma6.texto.includes('Cabe direto'), 'Deve somar 6 direto sem fazer troca de base 5!');

console.log('✅ Verificado: 6 × 1 = 06 soma direto na Dezena sem acionar troca de base 5.');
