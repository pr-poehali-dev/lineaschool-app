import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { THEMES_DATA } from './FilwordThemesData';
import FilwordHeader from './FilwordHeader';
import FilwordGrid from './FilwordGrid';
import FilwordWordList from './FilwordWordList';

interface FilwordProps {
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  onComplete?: (score: number, maxScore: number, timeSpent: number) => void;
}

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

export default function Filword({ difficulty, theme, onComplete }: FilwordProps) {
  const gridSize = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 10 : 13;
  const difficultyKey = difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard';
  
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isPlaying, setIsPlaying] = useState(true);
  const [startTime] = useState(Date.now());
  const [celebrationWord, setCelebrationWord] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const confettiIdRef = useRef(0);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    const allFound = words.length > 0 && words.every(w => w.found);
    if (allFound && isPlaying) {
      setIsPlaying(false);
      handleGameEnd();
    }
  }, [words, isPlaying]);

  const initializeGame = () => {
    const themeWords = THEMES_DATA[theme]?.[difficultyKey] || THEMES_DATA['осень'][difficultyKey];
    const newGrid: Cell[][] = Array(gridSize).fill(null).map((_, row) =>
      Array(gridSize).fill(null).map((_, col) => ({
        letter: '',
        wordIndex: null,
        isSelected: false,
        row,
        col
      }))
    );

    const newWords: Word[] = [];
    const usedCells = new Set<string>();

    themeWords.forEach((word, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (horizontal && col + word.length <= gridSize) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (usedCells.has(`${row}-${col + i}`)) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            const cells: { row: number; col: number }[] = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i].letter = word[i];
              newGrid[row][col + i].wordIndex = index;
              usedCells.add(`${row}-${col + i}`);
              cells.push({ row, col: col + i });
            }
            newWords.push({ text: word, found: false, cells });
            placed = true;
          }
        } else if (!horizontal && row + word.length <= gridSize) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (usedCells.has(`${row + i}-${col}`)) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            const cells: { row: number; col: number }[] = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col].letter = word[i];
              newGrid[row + i][col].wordIndex = index;
              usedCells.add(`${row + i}-${col}`);
              cells.push({ row: row + i, col });
            }
            newWords.push({ text: word, found: false, cells });
            placed = true;
          }
        }
      }
    });

    const alphabet = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ';
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!newGrid[row][col].letter) {
          newGrid[row][col].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(newWords);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying) return;

    const cellKey = `${row}-${col}`;
    const existingIndex = selectedCells.findIndex(c => `${c.row}-${c.col}` === cellKey);

    if (existingIndex !== -1) {
      setSelectedCells(selectedCells.filter((_, i) => i !== existingIndex));
    } else {
      const newSelected = [...selectedCells, { row, col }];
      setSelectedCells(newSelected);

      words.forEach((word, wordIndex) => {
        if (word.found) return;

        const allCellsSelected = word.cells.every(cell =>
          newSelected.some(s => s.row === cell.row && s.col === cell.col)
        );

        if (allCellsSelected) {
          setWords(prev => prev.map((w, i) => i === wordIndex ? { ...w, found: true } : w));
          setSelectedCells([]);
          setCelebrationWord(word.text);
          triggerConfetti();
          setTimeout(() => setCelebrationWord(null), 1500);
        }
      });
    }
  };

  const handleGameEnd = () => {
    const foundCount = words.filter(w => w.found).length;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete?.(foundCount, words.length, timeSpent);
  };

  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 15 }, (_, i) => ({
      id: confettiIdRef.current++,
      x: Math.random() * 100,
      y: -10,
      color: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'][Math.floor(Math.random() * 7)]
    }));
    setConfetti(prev => [...prev, ...newConfetti]);
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.find(nc => nc.id === c.id)));
    }, 2000);
  };

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0 && isPlaying) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [timeLeft, isPlaying]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 relative overflow-hidden">
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute w-3 h-3 rounded-full animate-fall pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            backgroundColor: c.color,
            animation: 'fall 2s ease-in forwards'
          }}
        />
      ))}
      
      {celebrationWord && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-6 sm:px-12 py-4 sm:py-8 rounded-2xl sm:rounded-3xl shadow-2xl animate-bounce-in text-2xl sm:text-4xl font-black">
            🎉 {celebrationWord}! 🎉
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fall {
          animation: fall 2s ease-in forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>

      <Card className="w-full max-w-4xl p-3 sm:p-6 shadow-2xl bg-white/95 backdrop-blur-sm border-2 sm:border-4 border-purple-300">
        <FilwordHeader 
          theme={theme}
          timeLeft={timeLeft}
          foundCount={words.filter(w => w.found).length}
          totalCount={words.length}
          shake={shake}
        />

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <FilwordGrid
            grid={grid}
            words={words}
            selectedCells={selectedCells}
            difficulty={difficulty}
            isPlaying={isPlaying}
            onCellClick={handleCellClick}
          />

          <FilwordWordList words={words} />
        </div>

        {!isPlaying && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-center shadow-2xl border-2 sm:border-4 border-white">
            <p className="text-2xl sm:text-3xl font-black text-white mb-2">
              {words.filter(w => w.found).length === words.length ? '🎉 ПОБЕДА! 🎉' : '⏰ Время вышло!'}
            </p>
            <p className="text-lg sm:text-xl font-bold text-white">
              Найдено слов: {words.filter(w => w.found).length} / {words.length}
            </p>
            {words.filter(w => w.found).length === words.length && (
              <p className="text-base sm:text-lg font-semibold text-yellow-200 mt-2">💪 Ты супер! Все слова найдены!</p>
            )}
          </div>
        )}
      </Card>

      <Card className="w-full max-w-4xl mt-3 sm:mt-4 p-3 sm:p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200">
        <h3 className="font-bold text-purple-800 mb-2 sm:mb-3 text-base sm:text-lg flex items-center gap-2">
          <span>🎓</span> Что развивает эта игра:
        </h3>
        <ul className="text-xs sm:text-sm text-purple-900 space-y-1 sm:space-y-2 font-medium">
          <li className="flex items-start gap-2">👁️ <span>Зрительное восприятие и анализ</span></li>
          <li className="flex items-start gap-2">🔤 <span>Навыки работы со словами</span></li>
          <li className="flex items-start gap-2">✨ <span>Грамотность и внимательность</span></li>
          <li className="flex items-start gap-2">📚 <span>Обогащение словарного запаса</span></li>
          <li className="flex items-start gap-2">🎯 <span>Концентрацию внимания</span></li>
          <li className="flex items-start gap-2">🧠 <span>Память и быстроту мышления</span></li>
        </ul>
      </Card>
    </div>
  );
}