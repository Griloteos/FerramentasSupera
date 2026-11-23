/* Ferramentas Supera - Biblioteca de Contornos e Silhuetas do Tangram */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TangramContornos = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const S = 84;
  const CX = 1000;
  const CY = 700;
  const OX = CX - 2 * S; // 832
  const OY = CY - 2 * S; // 532

  const FIGURAS_PADRAO = [
    {
      id: 'livre',
      nome: 'Sem contorno (Mesa Livre)',
      categoria: 'Livre',
      targets: null
    },
    {
      id: 'quadrado',
      nome: 'Quadrado Tradicional',
      categoria: 'Padrão',
      dificuldade: 1,
      targets: [
        { pieceIdx: 0, x: OX + 2 * S, y: OY + (2/3) * S, r: 0, f: 1 },
        { pieceIdx: 1, x: OX + (2/3) * S, y: OY + 2 * S, r: 0, f: 1 },
        { pieceIdx: 2, x: OX + (10/3) * S, y: OY + (10/3) * S, r: 0, f: 1 },
        { pieceIdx: 3, x: OX + 3 * S, y: OY + 2 * S, r: 0, f: 1 },
        { pieceIdx: 4, x: OX + (11/3) * S, y: OY + 1 * S, r: 0, f: 1 },
        { pieceIdx: 5, x: OX + 2 * S, y: OY + (8/3) * S, r: 0, f: 1 },
        { pieceIdx: 6, x: OX + 1.5 * S, y: OY + 3.5 * S, r: 0, f: 1 }
      ]
    },
    /* --- FIGURAS SALVAS PELO EDUCADOR --- */
    {
      id: 'baleia',
      nome: 'Baleia',
      categoria: 'Animais',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 888.8, y: 701.8, r: 45, f: 1 },
        { pieceIdx: 1, x: 730.4, y: 622.6, r: 315, f: 1 },
        { pieceIdx: 2, x: 1131.2, y: 449.8, r: 45, f: 1 },
        { pieceIdx: 3, x: 1047.2, y: 697, r: 0, f: 1 },
        { pieceIdx: 4, x: 1103.2, y: 613, r: 0, f: 1 },
        { pieceIdx: 5, x: 963.2, y: 641, r: 180, f: 1 },
        { pieceIdx: 6, x: 690.8, y: 721.6, r: 45, f: 1 }
      ]
    },
    {
      id: 'triangulo',
      nome: 'Triângulo',
      categoria: 'Geometria',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 738.2, y: 811.8, r: 180, f: 1 },
        { pieceIdx: 1, x: 1074.2, y: 811.8, r: 270, f: 1 },
        { pieceIdx: 2, x: 850.2, y: 643.8, r: 0, f: 1 },
        { pieceIdx: 3, x: 906.2, y: 783.8, r: 0, f: 1 },
        { pieceIdx: 4, x: 822.2, y: 727.8, r: 270, f: 1 },
        { pieceIdx: 5, x: 1018.2, y: 699.8, r: 90, f: 1 },
        { pieceIdx: 6, x: 948.2, y: 657.8, r: 90, f: 1 }
      ]
    },
    {
      id: 'retangulo',
      nome: 'Retângulo',
      categoria: 'Geometria',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 1216.1, y: 794.9, r: 315, f: 1 },
        { pieceIdx: 1, x: 1136.9, y: 715.7, r: 225, f: 1 },
        { pieceIdx: 2, x: 859.7, y: 755.3, r: 315, f: 1 },
        { pieceIdx: 3, x: 998.3, y: 814.7, r: 315, f: 1 },
        { pieceIdx: 4, x: 899.3, y: 834.5, r: 225, f: 1 },
        { pieceIdx: 5, x: 1018.1, y: 676.1, r: 45, f: 1 },
        { pieceIdx: 6, x: 938.9, y: 695.9, r: 45, f: 1 }
      ]
    },
    {
      id: 'paralelogramo',
      nome: 'Paralelogramo',
      categoria: 'Geometria',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 740.9, y: 794.9, r: 315, f: 1 },
        { pieceIdx: 1, x: 1136.9, y: 715.7, r: 225, f: 1 },
        { pieceIdx: 2, x: 859.7, y: 755.3, r: 315, f: 1 },
        { pieceIdx: 3, x: 998.3, y: 814.7, r: 315, f: 1 },
        { pieceIdx: 4, x: 899.3, y: 834.5, r: 225, f: 1 },
        { pieceIdx: 5, x: 1018.1, y: 676.1, r: 45, f: 1 },
        { pieceIdx: 6, x: 938.9, y: 695.9, r: 45, f: 1 }
      ]
    },
    {
      id: 'elefante',
      nome: 'Elefante',
      categoria: 'Animais',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 1003.4, y: 680.1, r: 315, f: 1 },
        { pieceIdx: 1, x: 811.7, y: 711.6, r: 225, f: 1 },
        { pieceIdx: 2, x: 1122.2, y: 640.5, r: 315, f: 1 },
        { pieceIdx: 3, x: 1023.2, y: 818.7, r: 135, f: 1 },
        { pieceIdx: 4, x: 1241, y: 600.9, r: 315, f: 1 },
        { pieceIdx: 5, x: 704.9, y: 858.8, r: 270, f: 1 },
        { pieceIdx: 6, x: 1201.4, y: 699.9, r: 315, f: -1 }
      ]
    },
    {
      id: 'cavalo',
      nome: 'Cavalo',
      categoria: 'Animais',
      dificuldade: 2,
      targets: [
        { pieceIdx: 0, x: 1051.1, y: 951.6, r: 270, f: 1 },
        { pieceIdx: 1, x: 915.9, y: 862.8, r: 315, f: 1 },
        { pieceIdx: 2, x: 876.3, y: 625.2, r: 225, f: 1 },
        { pieceIdx: 3, x: 935.7, y: 724.2, r: 225, f: 1 },
        { pieceIdx: 4, x: 955.5, y: 1100.4, r: 225, f: 1 },
        { pieceIdx: 5, x: 757.5, y: 839.6, r: 0, f: 1 },
        { pieceIdx: 6, x: 1222.5, y: 1070.4, r: 225, f: -1 }
      ]
    }
  ];

  function getCustomFiguras() {
    try {
      return JSON.parse(localStorage.getItem('supera_tangram_custom_figures') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveCustomFigura(fig) {
    const list = getCustomFiguras();
    const existingIdx = list.findIndex(f => f.id === fig.id);
    if (existingIdx >= 0) {
      list[existingIdx] = fig;
    } else {
      list.push(fig);
    }
    try {
      localStorage.setItem('supera_tangram_custom_figures', JSON.stringify(list));
    } catch(e) {}
    return list;
  }

  function getTodasFiguras() {
    return [...FIGURAS_PADRAO, ...getCustomFiguras()];
  }

  return {
    S: S,
    CX: CX,
    CY: CY,
    OX: OX,
    OY: OY,
    FIGURAS: FIGURAS_PADRAO,
    getCustomFiguras: getCustomFiguras,
    saveCustomFigura: saveCustomFigura,
    getTodasFiguras: getTodasFiguras,
    getFiguraById: function (id) {
      const all = getTodasFiguras();
      return all.find(f => f.id === id) || all[0];
    }
  };
}));
