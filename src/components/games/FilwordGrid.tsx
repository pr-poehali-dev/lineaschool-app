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

  return (
    <div className="flex-1">
      <div 
        className="grid gap-1 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: difficulty === 'easy' ? '400px' : difficulty === 'medium' ? '600px' : '700px'
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
                rounded-xl transition-all duration-300 transform
                ${difficulty === 'easy' ? 'text-xl' : difficulty === 'medium' ? 'text-lg' : 'text-base'}
                ${isCellFound(rowIndex, colIndex) 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white cursor-not-allowed shadow-lg scale-105 animate-pulse' 
                  : isCellSelected(rowIndex, colIndex)
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 shadow-xl ring-4 ring-yellow-300'
                  : 'bg-gradient-to-br from-white to-purple-50 hover:from-purple-100 hover:to-pink-100 text-gray-800 border-2 border-purple-300 hover:scale-105 hover:shadow-lg active:scale-95'
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
