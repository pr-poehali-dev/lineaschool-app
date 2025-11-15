interface Cell {
  letter: string;
  wordIndex: number | null;
  isSelected: boolean;
  row: number;
  col: number;
}

interface Word {
  text: string;
  found: boolean;
  cells: { row: number; col: number }[];
  foundTime?: number;
}

interface FilwordGridProps {
  grid: Cell[][];
  words: Word[];
  selectedCells: { row: number; col: number }[];
  difficulty: 'easy' | 'medium' | 'hard';
  isPlaying: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function FilwordGrid({ grid, words, selectedCells, difficulty, isPlaying, onCellClick }: FilwordGridProps) {
  const gridSize = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 10 : 13;

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(c => c.row === row && c.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.wordIndex === null) return false;
    return words[cell.wordIndex]?.found || false;
  };

  const shouldAnimate = (row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.wordIndex === null) return false;
    const word = words[cell.wordIndex];
    if (!word?.found || !word.foundTime) return false;
    const timeSinceFound = Date.now() - word.foundTime;
    return timeSinceFound < 1500;
  };

  return (
    <div className="flex-1 w-full">
      <div 
        className="grid gap-0.5 sm:gap-1 mx-auto w-full"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: difficulty === 'easy' ? '100%' : difficulty === 'medium' ? '100%' : '100%'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={!isPlaying || isCellFound(rowIndex, colIndex)}
              className={`
                aspect-square flex items-center justify-center font-black
                rounded-md sm:rounded-xl transition-all duration-300 transform
                ${difficulty === 'easy' ? 'text-base sm:text-xl' : difficulty === 'medium' ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'}
                ${isCellFound(rowIndex, colIndex) 
                  ? `bg-gradient-to-br from-green-400 to-emerald-600 text-white cursor-not-allowed shadow-md sm:shadow-lg scale-105 ${shouldAnimate(rowIndex, colIndex) ? 'animate-pulse' : ''}` 
                  : isCellSelected(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 shadow-lg sm:shadow-xl ring-2 sm:ring-4 ring-yellow-300'
                  : 'bg-gradient-to-br from-white to-purple-50 active:from-purple-100 active:to-pink-100 text-gray-800 border border-purple-300 sm:border-2 active:scale-95'
                }
              `}
            >
              {cell.letter}
            </button>
          ))
        )}
      </div>
    </div>
  );
}