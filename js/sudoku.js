/* Ferramentas Supera - Gerador de Sudoku */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SudokuGenerator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const N = 9;

  function isValid(grid, row, col, num) {
    // Verifica linha
    for (let x = 0; x < N; x++) {
      if (grid[row][x] === num) return false;
    }
    // Verifica coluna
    for (let x = 0; x < N; x++) {
      if (grid[x][col] === num) return false;
    }
    // Verifica subgrid 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  }

  function solveGrid(grid) {
    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        if (grid[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function createFullGrid() {
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    // Preenche as 3 diagonais 3x3 (independentes)
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          grid[i + r][i + c] = nums[idx++];
        }
      }
    }
    solveGrid(grid);
    return grid;
  }

  function removeNumbers(grid, count) {
    const newGrid = grid.map(row => [...row]);
    let removed = 0;
    const positions = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        positions.push([i, j]);
      }
    }
    positions.sort(() => Math.random() - 0.5);

    for (const [r, c] of positions) {
      if (removed >= count) break;
      const backup = newGrid[r][c];
      newGrid[r][c] = 0;
      // Verifica se ainda tem solução única (simplificado)
      const testGrid = newGrid.map(row => [...row]);
      if (solveGrid(testGrid)) {
        removed++;
      } else {
        newGrid[r][c] = backup;
      }
    }
    return newGrid;
  }

  function generateSudoku(nivel) {
    const niveis = {
      facil: { min: 36, max: 45 },
      intermediario: { min: 30, max: 35 },
      dificil: { min: 24, max: 29 },
      avancado: { min: 20, max: 23 },
      expert: { min: 17, max: 19 }
    };
    const config = niveis[nivel] || niveis.facil;
    const filled = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    const toRemove = 81 - filled;

    const fullGrid = createFullGrid();
    const puzzle = removeNumbers(fullGrid, toRemove);

    return {
      grid: puzzle,
      solution: fullGrid
    };
  }

  return { generateSudoku };
}));
