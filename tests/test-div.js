const assert = require('assert');
const { resolver } = require('../js/solver.js');

console.log('--- Testando Motor de Divisão Supera ---');

// 1. Divisão não exata: 95 ÷ 4
const d1 = resolver('95 / 4');
assert(d1.erro, '95 / 4 deve retornar mensagem de divisão não exata');
assert(d1.erro.includes('em desenvolvimento'), 'Deve avisar que está em desenvolvimento');
console.log('✅ 95 ÷ 4 capturado corretamente:', d1.erro);

// 2. Divisão exata 1 divisor: 96 ÷ 4 = 24
const d2 = resolver('96 / 4');
assert.strictEqual(d2.resultado, 24, '96 ÷ 4 deve ser 24');
console.log('✅ 96 ÷ 4 passou com quociente 24.');

// 3. Divisão exata 2 divisores: 276 ÷ 12 = 23
const d3 = resolver('276 / 12');
assert.strictEqual(d3.resultado, 23, '276 ÷ 12 deve ser 23');
assert(d3.tags.includes('Regra de 2 casas'), 'Deve conter tag Regra de 2 casas');
console.log('✅ 276 ÷ 12 passou com quociente 23 e tags:', d3.tags.join(', '));

// 4. Regra do 9: 171 ÷ 19 = 9
const d4 = resolver('171 / 19');
assert.strictEqual(d4.resultado, 9, '171 ÷ 19 deve ser 9');
assert(d4.tags.includes('Regra do 9'), 'Deve conter tag Regra do 9');
console.log('✅ 171 ÷ 19 passou com quociente 9 e tag Regra do 9.');

// 5. Tirar do quociente: 1425 ÷ 19 = 75
const d5 = resolver('1425 / 19');
assert.strictEqual(d5.resultado, 75, '1425 ÷ 19 deve ser 75');
assert(d5.tags.includes('Tirar do quociente'), 'Deve conter tag Tirar do quociente');
console.log('✅ 1425 ÷ 19 passou com quociente 75 e tag Tirar do quociente.');

// 6. Divisão com 3 divisores: 2829 ÷ 123 = 23
const d6 = resolver('2829 / 123');
assert.strictEqual(d6.resultado, 23, '2829 ÷ 123 deve ser 23');
console.log('✅ 2829 ÷ 123 passou com quociente 23.');
