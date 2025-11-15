import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

const THEMES_DATA: Record<string, Record<string, string[]>> = {
  'осень': {
    easy: ['ЛИСТЬЯ', 'ДОЖДЬ', 'ВЕТЕР', 'ГРИБЫ', 'УРОЖАЙ'],
    medium: ['ЛИСТОПАД', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ЗОЛОТО', 'КРАСОТА', 'ПРИРОДА'],
    hard: ['ЛИСТОПАД', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'УРОЖАЙ', 'ЗОЛОТО', 'КРАСОТА', 'ПРИРОДА', 'УВЯДАНИЕ']
  },
  'зима': {
    easy: ['СНЕГ', 'МОРОЗ', 'САНКИ', 'ГОРКА', 'ЗИМА'],
    medium: ['СНЕЖИНКА', 'СУГРОБ', 'ДЕКАБРЬ', 'ЯНВАРЬ', 'ФЕВРАЛЬ', 'КОНЬКИ', 'МЕТЕЛЬ'],
    hard: ['СНЕГОПАД', 'СНЕЖИНКА', 'СУГРОБ', 'ДЕКАБРЬ', 'ЯНВАРЬ', 'ФЕВРАЛЬ', 'КОНЬКИ', 'МЕТЕЛЬ', 'БУРАН']
  },
  'весна': {
    easy: ['ТЕПЛО', 'ПОЧКИ', 'ЛУЖА', 'МАРТ', 'ВЕСНА'],
    medium: ['ПОДСНЕЖНИК', 'РУЧЕЕК', 'АПРЕЛЬ', 'МАЙ', 'КАПЕЛЬ', 'ПРОТАЛИНА'],
    hard: ['ПОДСНЕЖНИК', 'РУЧЕЕК', 'АПРЕЛЬ', 'МАЙ', 'КАПЕЛЬ', 'ПРОТАЛИНА', 'ПРОБУЖДЕНИЕ', 'ОТТЕПЕЛЬ']
  },
  'лето': {
    easy: ['ЖАРА', 'МОРЕ', 'ПЛЯЖ', 'ЛЕТО', 'СОЛНЦЕ'],
    medium: ['КАНИКУЛЫ', 'АВГУСТ', 'ИЮНЬ', 'ИЮЛЬ', 'ОТДЫХ', 'КУПАНИЕ'],
    hard: ['КАНИКУЛЫ', 'АВГУСТ', 'ИЮНЬ', 'ИЮЛЬ', 'ОТДЫХ', 'КУПАНИЕ', 'ЗАГАР', 'ПУТЕШЕСТВИЕ']
  },
  'деревья': {
    easy: ['БЕРЕЗА', 'ДУБ', 'ЕЛЬ', 'СОСНА', 'КЛЕН'],
    medium: ['БЕРЕЗА', 'ОСИНА', 'ТОПОЛЬ', 'ЛИПА', 'РЯБИНА', 'КАШТАН'],
    hard: ['БЕРЕЗА', 'ОСИНА', 'ТОПОЛЬ', 'ЛИПА', 'РЯБИНА', 'КАШТАН', 'ЧЕРЕМУХА', 'МОЖЖЕВЕЛЬНИК']
  },
  'профессии': {
    easy: ['ВРАЧ', 'ПОВАР', 'УЧИТЕЛЬ', 'ПИЛОТ', 'АРТИСТ'],
    medium: ['ДОКТОР', 'СТРОИТЕЛЬ', 'ВОДИТЕЛЬ', 'ХУДОЖНИК', 'ПЕВЕЦ', 'ПИСАТЕЛЬ'],
    hard: ['АРХИТЕКТОР', 'ИНЖЕНЕР', 'ПРОГРАММИСТ', 'ЖУРНАЛИСТ', 'ПАРИКМАХЕР', 'ФОТОГРАФ']
  },
  'дом': {
    easy: ['СТОЛ', 'СТУЛ', 'ДИВАН', 'КРОВАТЬ', 'ШКАФ'],
    medium: ['КРЕСЛО', 'ПОЛКА', 'ЗЕРКАЛО', 'КАРТИНА', 'ЛАМПА', 'КОВЕР'],
    hard: ['ХОЛОДИЛЬНИК', 'ТЕЛЕВИЗОР', 'МИКРОВОЛНОВКА', 'ПЫЛЕСОС', 'ЛЮСТРА', 'ТОРШЕР']
  },
  'цвет': {
    easy: ['КРАСНЫЙ', 'СИНИЙ', 'ЖЕЛТЫЙ', 'БЕЛЫЙ', 'ЧЕРНЫЙ'],
    medium: ['ЗЕЛЕНЫЙ', 'ОРАНЖЕВЫЙ', 'ФИОЛЕТОВЫЙ', 'РОЗОВЫЙ', 'КОРИЧНЕВЫЙ'],
    hard: ['МАЛИНОВЫЙ', 'БИРЮЗОВЫЙ', 'СИРЕНЕВЫЙ', 'ЛИЛОВЫЙ', 'ИЗУМРУДНЫЙ', 'БОРДОВЫЙ']
  },
  'фигура': {
    easy: ['КРУГ', 'КВАДРАТ', 'ОВАЛ', 'РОМБ', 'КУБА'],
    medium: ['ТРЕУГОЛЬНИК', 'ПРЯМОУГОЛЬНИК', 'ПЯТИУГОЛЬНИК', 'ШЕСТИУГОЛЬНИК'],
    hard: ['ПАРАЛЛЕЛОГРАММ', 'ТРАПЕЦИЯ', 'МНОГОУГОЛЬНИК', 'ПИРАМИДА', 'ЦИЛИНДР']
  },
  'огород': {
    easy: ['МОРКОВЬ', 'ОГУРЕЦ', 'ПОМИДОР', 'СВЕКЛА', 'ЛУК'],
    medium: ['КАРТОФЕЛЬ', 'КАПУСТА', 'ПЕРЕЦ', 'КАБАЧОК', 'БАКЛАЖАН', 'РЕДИС'],
    hard: ['КАРТОФЕЛЬ', 'КАПУСТА', 'ПЕРЕЦ', 'КАБАЧОК', 'БАКЛАЖАН', 'РЕДИС', 'ПАТИССОН', 'ЦУКИНИ']
  },
  'лес': {
    easy: ['ТРОПА', 'ГРИБ', 'ЯГОДА', 'ШИШКА', 'ЗАЯЦ'],
    medium: ['ПОЛЯНКА', 'ОПУШКА', 'ЧАЩА', 'ДУПЛО', 'ГНЕЗДО', 'БЕРЛОГА'],
    hard: ['ПОЛЯНКА', 'ОПУШКА', 'ЧАЩА', 'ДУПЛО', 'ГНЕЗДО', 'БЕРЛОГА', 'МУРАВЕЙНИК', 'ТРОПИНКА']
  },
  'грибы': {
    easy: ['БЕЛЫЙ', 'ОПЯТА', 'ЛИСИЧКИ', 'ГРУЗДЬ'],
    medium: ['БОРОВИК', 'ПОДБЕРЕЗОВИК', 'ПОДОСИНОВИК', 'МАСЛЕНОК', 'РЫЖИК'],
    hard: ['БОРОВИК', 'ПОДБЕРЕЗОВИК', 'ПОДОСИНОВИК', 'МАСЛЕНОК', 'РЫЖИК', 'ВОЛНУШКА', 'СЫРОЕЖКА']
  },
  'ягоды': {
    easy: ['МАЛИНА', 'КЛУБНИКА', 'ВИШНЯ', 'СМОРОДИНА'],
    medium: ['ЧЕРНИКА', 'ГОЛУБИКА', 'БРУСНИКА', 'КЛЮКВА', 'ЕЖЕВИКА'],
    hard: ['ЧЕРНИКА', 'ГОЛУБИКА', 'БРУСНИКА', 'КЛЮКВА', 'ЕЖЕВИКА', 'МОРОШКА', 'ОБЛЕПИХА']
  },
  'одежда': {
    easy: ['РУБАШКА', 'БРЮКИ', 'ПЛАТЬЕ', 'ЮБКА', 'КУРТКА'],
    medium: ['СВИТЕР', 'КОФТА', 'ПИДЖАК', 'ЖИЛЕТ', 'БЛУЗКА', 'ФУТБОЛКА'],
    hard: ['ДЖЕМПЕР', 'КАРДИГАН', 'ВОДОЛАЗКА', 'САРАФАН', 'КОМБИНЕЗОН', 'ВЕТРОВКА']
  },
  'обувь': {
    easy: ['ТУФЛИ', 'САПОГИ', 'БОТИНКИ', 'ТАПКИ'],
    medium: ['КРОССОВКИ', 'БОСОНОЖКИ', 'САНДАЛИИ', 'ВАЛЕНКИ', 'ГАЛОШИ'],
    hard: ['КРОССОВКИ', 'БОСОНОЖКИ', 'САНДАЛИИ', 'ВАЛЕНКИ', 'ГАЛОШИ', 'МОКАСИНЫ', 'ЭСПАДРИЛЬИ']
  },
  'головные уборы': {
    easy: ['ШАПКА', 'ПАНАМА', 'КЕПКА', 'БЕРЕТ'],
    medium: ['БЕЙСБОЛКА', 'ШЛЯПА', 'КОСЫНКА', 'ПЛАТОК', 'УШАНКА'],
    hard: ['БЕЙСБОЛКА', 'ШЛЯПА', 'КОСЫНКА', 'ПЛАТОК', 'УШАНКА', 'БАНДАНА', 'ЦИЛИНДР']
  },
  'новый год': {
    easy: ['ЕЛКА', 'СНЕГ', 'ПОДАРОК', 'ДЕД МОРОЗ'],
    medium: ['ГИРЛЯНДА', 'СНЕГУРОЧКА', 'МИШУРА', 'ИГРУШКА', 'ПРАЗДНИК'],
    hard: ['ГИРЛЯНДА', 'СНЕГУРОЧКА', 'МИШУРА', 'ИГРУШКА', 'ПРАЗДНИК', 'ФЕЙЕРВЕРК', 'СЕРПАНТИН']
  },
  'домашние животные': {
    easy: ['КОШКА', 'СОБАКА', 'КОРОВА', 'КОЗА', 'ЛОШАДЬ'],
    medium: ['КРОЛИК', 'ХОМЯК', 'ПОПУГАЙ', 'ЧЕРЕПАХА', 'МОРСКАЯ СВИНКА'],
    hard: ['КРОЛИК', 'ХОМЯК', 'ПОПУГАЙ', 'ЧЕРЕПАХА', 'МОРСКАЯ СВИНКА', 'ШИНШИЛЛА', 'ХОРЕК']
  },
  'дикие животные': {
    easy: ['ВОЛК', 'ЛИСА', 'ЗАЯЦ', 'МЕДВЕДЬ', 'ЕЖ'],
    medium: ['БЕЛКА', 'БАРСУК', 'КАБАН', 'РЫСЬ', 'КУНИЦА', 'ЛОСЬ'],
    hard: ['БЕЛКА', 'БАРСУК', 'КАБАН', 'РЫСЬ', 'КУНИЦА', 'ЛОСЬ', 'РОСОМАХА', 'СОБОЛЬ']
  },
  'птицы': {
    easy: ['ВОРОНА', 'ГОЛУБЬ', 'ВОРОБЕЙ', 'СИНИЦА'],
    medium: ['СНЕГИРЬ', 'ДЯТЕЛ', 'СОРОКА', 'КУКУШКА', 'СОВА', 'СОЛОВЕЙ'],
    hard: ['СНЕГИРЬ', 'ДЯТЕЛ', 'СОРОКА', 'КУКУШКА', 'СОВА', 'СОЛОВЕЙ', 'ПОПОЛЗЕНЬ', 'ЩЕГОЛ']
  },
  'семья': {
    easy: ['МАМА', 'ПАПА', 'СЫН', 'ДОЧЬ', 'БРАТ'],
    medium: ['БАБУШКА', 'ДЕДУШКА', 'СЕСТРА', 'ВНУК', 'ВНУЧКА', 'ТЕТЯ'],
    hard: ['БАБУШКА', 'ДЕДУШКА', 'СЕСТРА', 'ВНУК', 'ВНУЧКА', 'ТЕТЯ', 'ПЛЕМЯННИК', 'ДВОЮРОДНЫЙ']
  },
  'цветы': {
    easy: ['РОЗА', 'ТЮЛЬПАН', 'РОМАШКА', 'МАК', 'ЛИЛИЯ'],
    medium: ['АСТРА', 'ГВОЗДИКА', 'ПИОН', 'ЛАНДЫШ', 'ВАСИЛЕК', 'НАРЦИСС'],
    hard: ['АСТРА', 'ГВОЗДИКА', 'ПИОН', 'ЛАНДЫШ', 'ВАСИЛЕК', 'НАРЦИСС', 'ГЛАДИОЛУС', 'ХРИЗАНТЕМА']
  },
  'город': {
    easy: ['УЛИЦА', 'ДОМ', 'ПАРК', 'МОСТ', 'ШКОЛА'],
    medium: ['ПЛОЩАДЬ', 'МУЗЕЙ', 'ТЕАТР', 'МАГАЗИН', 'БОЛЬНИЦА', 'АПТЕКА'],
    hard: ['ПЛОЩАДЬ', 'МУЗЕЙ', 'ТЕАТР', 'МАГАЗИН', 'БОЛЬНИЦА', 'АПТЕКА', 'БИБЛИОТЕКА', 'СТАДИОН']
  },
  'насекомые': {
    easy: ['МУХА', 'КОМАР', 'ЖУК', 'ПЧЕЛА', 'ОСА'],
    medium: ['БАБОЧКА', 'СТРЕКОЗА', 'МУРАВЕЙ', 'КУЗНЕЧИК', 'БОЖЬЯ КОРОВКА'],
    hard: ['БАБОЧКА', 'СТРЕКОЗА', 'МУРАВЕЙ', 'КУЗНЕЧИК', 'БОЖЬЯ КОРОВКА', 'ШМЕЛЬ', 'СВЕТЛЯЧОК']
  },
  'инструменты': {
    easy: ['МОЛОТОК', 'ПИЛА', 'ТОПОР', 'КЛЕЩИ'],
    medium: ['ОТВЕРТКА', 'РУБАНОК', 'ДРЕЛЬ', 'КЛЮЧ', 'ПЛОСКОГУБЦЫ'],
    hard: ['ОТВЕРТКА', 'РУБАНОК', 'ДРЕЛЬ', 'КЛЮЧ', 'ПЛОСКОГУБЦЫ', 'СТАМЕСКА', 'НАПИЛЬНИК']
  },
  'бытовая техника': {
    easy: ['УТЮГ', 'ПЛИТА', 'ЧАЙНИК', 'ТЕЛЕВИЗОР'],
    medium: ['СТИРАЛЬНАЯ МАШИНА', 'ПЫЛЕСОС', 'МИКСЕР', 'ТОСТЕР', 'БЛЕНДЕР'],
    hard: ['СТИРАЛЬНАЯ МАШИНА', 'ПЫЛЕСОС', 'МИКСЕР', 'ТОСТЕР', 'БЛЕНДЕР', 'МУЛЬТИВАРКА', 'КОФЕМАШИНА']
  },
  'транспорт': {
    easy: ['МАШИНА', 'АВТОБУС', 'ТРАМВАЙ', 'ПОЕЗД'],
    medium: ['ТРОЛЛЕЙБУС', 'МЕТРО', 'САМОЛЕТ', 'ВЕРТОЛЕТ', 'КОРАБЛЬ'],
    hard: ['ТРОЛЛЕЙБУС', 'МЕТРО', 'САМОЛЕТ', 'ВЕРТОЛЕТ', 'КОРАБЛЬ', 'ЭЛЕКТРИЧКА', 'СКУТЕР']
  },
  'рыбы и водные жители': {
    easy: ['ЩУКА', 'ОКУНЬ', 'КАРАСЬ', 'РАК', 'КРАБ'],
    medium: ['ЗОЛОТАЯ РЫБКА', 'МЕДУЗА', 'МОРСКАЯ ЗВЕЗДА', 'ДЕЛЬФИН', 'КИТ'],
    hard: ['ЗОЛОТАЯ РЫБКА', 'МЕДУЗА', 'МОРСКАЯ ЗВЕЗДА', 'ДЕЛЬФИН', 'КИТ', 'ОСЬМИНОГ', 'МОРСКОЙ КОНЕК']
  },
  'человек': {
    easy: ['ГОЛОВА', 'РУКА', 'НОГА', 'ГЛАЗ', 'НОС'],
    medium: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ'],
    hard: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ', 'ПРЕДПЛЕЧЬЕ', 'ЗАПЯСТЬЕ']
  },
  'части тела': {
    easy: ['ГОЛОВА', 'РУКА', 'НОГА', 'ГЛАЗ', 'НОС'],
    medium: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ'],
    hard: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ', 'ПРЕДПЛЕЧЬЕ', 'ЗАПЯСТЬЕ']
  }
};

export default function Filword({ difficulty, theme, onComplete }: FilwordProps) {
  const gridSize = difficulty === 'easy' ? 7 : difficulty === 'medium' ? 10 : 13;
  const difficultyKey = difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard';
  
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isPlaying, setIsPlaying] = useState(true);
  const [startTime] = useState(Date.now());

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
        }
      });
    }
  };

  const handleGameEnd = () => {
    const foundCount = words.filter(w => w.found).length;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete?.(foundCount, words.length, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(c => c.row === row && c.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.wordIndex === null) return false;
    return words[cell.wordIndex]?.found || false;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-4xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Филворд: {theme}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Найдите все слова на поле. Слова располагаются горизонтально и вертикально
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Icon name="Timer" size={20} />
              <span className={timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Найдено: {words.filter(w => w.found).length} / {words.length}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div 
              className="grid gap-1 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: difficulty === 'easy' ? '400px' : difficulty === 'medium' ? '600px' : '800px'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={!isPlaying || isCellFound(rowIndex, colIndex)}
                    className={`
                      aspect-square flex items-center justify-center font-bold
                      rounded transition-all duration-200
                      ${difficulty === 'easy' ? 'text-lg' : difficulty === 'medium' ? 'text-sm' : 'text-xs'}
                      ${isCellFound(rowIndex, colIndex) 
                        ? 'bg-green-500 text-white cursor-not-allowed' 
                        : isCellSelected(rowIndex, colIndex)
                        ? 'bg-blue-400 text-white scale-95'
                        : 'bg-white hover:bg-blue-100 text-gray-800 border border-gray-300'
                      }
                    `}
                  >
                    {cell.letter}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="w-64">
            <h3 className="font-semibold text-gray-700 mb-3">Слова для поиска:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`
                    p-2 rounded text-sm font-medium transition-all
                    ${word.found 
                      ? 'bg-green-100 text-green-700 line-through' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {word.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isPlaying && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-lg font-semibold text-gray-800">
              Игра окончена! Найдено слов: {words.filter(w => w.found).length} / {words.length}
            </p>
          </div>
        )}
      </Card>

      <Card className="w-full max-w-4xl mt-4 p-4 bg-blue-50">
        <h3 className="font-semibold text-gray-800 mb-2">Цели упражнения:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Развитие зрительного гнозиса и анализа</li>
          <li>• Развитие навыков фонематического анализа и синтеза</li>
          <li>• Развитие орфографической зоркости</li>
          <li>• Обогащение активного словаря</li>
          <li>• Развитие произвольного внимания</li>
          <li>• Развитие сукцессивного и симультанного восприятия</li>
        </ul>
      </Card>
    </div>
  );
}