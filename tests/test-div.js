const assert = require('assert');
const { resolver } = require('../js/solver.js');

console.log('--- Testando Motor de Divisão Supera com Regra de Casas ---');

// 1. Divisão não exata: 95 ÷ 4
const d1 = resolver('95 / 4');
assert(d1.erro, '95 / 4 deve retornar mensagem de divisão não exata');
assert(d1.erro.includes('em desenvolvimento'), 'Deve avisar que está em desenvolvimento');
console.log('✅ 95 ÷ 4 capturado corretamente:', d1.erro);

// 2. Divisão exata 1 divisor: 96 ÷ 4 = 24
// Ln = 2, k = 1 => 2 - (1 + 1) = 0 => casa 0 (Décimo, col 10)
const d2 = resolver('96 / 4');
assert.strictEqual(d2.resultado, 24, '96 ÷ 4 deve ser 24');
assert(d2.passos[0].texto.includes('2 − 2 = 0 (Décimo (casa 0))'), 'Texto deve explicar a regra da casa 0');
assert.strictEqual(d2.passos[0].estado[10], 9, 'Primeiro dígito do 96 deve estar na coluna 10');
assert.strictEqual(d2.passos[0].estado[11], 6, 'Segundo dígito do 96 deve estar na coluna 11');
console.log('✅ 96 ÷ 4 posicionado na casa 0 (coluna 10) e quociente 24.');

// 3. Divisão exata 2 divisores: 276 ÷ 12 = 23
// Ln = 3, k = 2 => 3 - (1 + 2) = 0 => casa 0 (Décimo, col 10)
const d3 = resolver('276 / 12');
assert.strictEqual(d3.resultado, 23, '276 ÷ 12 deve ser 23');
assert(d3.tags.includes('Regra de 2 casas'), 'Deve conter tag Regra de 2 casas');
assert.strictEqual(d3.passos[0].estado[10], 2, 'Primeiro dígito do 276 deve estar na coluna 10');
assert.strictEqual(d3.passos[0].estado[11], 7, 'Segundo dígito do 276 deve estar na coluna 11');
assert.strictEqual(d3.passos[0].estado[12], 6, 'Terceiro dígito do 276 deve estar na coluna 12');
console.log('✅ 276 ÷ 12 posicionado na casa 0 (coluna 10) com quociente 23.');

// 4. Regra do 9: 171 ÷ 19 = 9
// Ln = 3, k = 2 => 3 - 3 = 0 => casa 0 (col 10)
const d4 = resolver('171 / 19');
assert.strictEqual(d4.resultado, 9, '171 ÷ 19 deve ser 9');
assert(d4.tags.includes('Regra do 9'), 'Deve conter tag Regra do 9');
assert.strictEqual(d4.passos[0].estado[10], 1, 'Primeiro dígito do 171 na coluna 10');
console.log('✅ 171 ÷ 19 posicionado na casa 0 (coluna 10) com quociente 9.');

// 5. Tirar do quociente: 1425 ÷ 19 = 75
// Ln = 4, k = 2 => 4 - (1 + 2) = 1 => casa 1 (Unidade, col 9)
const d5 = resolver('1425 / 19');
assert.strictEqual(d5.resultado, 75, '1425 ÷ 19 deve ser 75');
assert(d5.tags.includes('Tirar do quociente'), 'Deve conter tag Tirar do quociente');
assert(d5.passos[0].texto.includes('4 − 3 = 1 (Unidade (casa 1))'), 'Texto deve explicar a regra da casa 1');
assert.strictEqual(d5.passos[0].estado[9], 1, 'Primeiro dígito do 1425 na coluna 9');
assert.strictEqual(d5.passos[0].estado[10], 4, 'Segundo dígito do 1425 na coluna 10');
console.log('✅ 1425 ÷ 19 posicionado na casa 1 (coluna 9) com quociente 75.');

// 6. Divisão com 3 divisores: 2829 ÷ 123 = 23
// Ln = 4, k = 3 => 4 - (1 + 3) = 0 => casa 0 (Décimo, col 10)
const d6 = resolver('2829 / 123');
assert.strictEqual(d6.resultado, 23, '2829 ÷ 123 deve ser 23');
assert.strictEqual(d6.passos[0].estado[10], 2, 'Primeiro dígito do 2829 na coluna 10');
console.log('✅ 2829 ÷ 123 posicionado na casa 0 (coluna 10) com quociente 23.');
