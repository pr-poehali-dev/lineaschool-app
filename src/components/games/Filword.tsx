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
    easy: ['ЛИСТ', 'ДОЖДЬ', 'ВЕТЕР', 'ГРИБ', 'УРОЖАЙ', 'ГРЯЗЬ', 'ТУЧА', 'ЛУЖА'],
    medium: ['ЛИСТОПАД', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ЗОЛОТО', 'КРАСОТА', 'ПРИРОДА', 'УВЯДАНИЕ'],
    hard: ['ЛИСТОПАД', 'НЕНАСТЬЕ', 'УВЯДАНИЕ', 'НЕПОГОДА', 'МОРОСЯЩИЙ', 'ПРОМОЗГЛЫЙ', 'ХМУРОСТЬ', 'СЛЯКОТЬ']
  },
  'зима': {
    easy: ['СНЕГ', 'МОРОЗ', 'САНКИ', 'ГОРКА', 'ЗИМА', 'ШУБА', 'ВАЛЕНКИ', 'ЕЛКА'],
    medium: ['СНЕЖИНКА', 'СУГРОБ', 'ДЕКАБРЬ', 'ЯНВАРЬ', 'ФЕВРАЛЬ', 'КОНЬКИ', 'МЕТЕЛЬ', 'ВЬЮГА'],
    hard: ['СНЕГОПАД', 'ГОЛОЛЕДИЦА', 'СОСУЛЬКА', 'ПОЗЕМКА', 'СТУЖА', 'ТРЕСКУЧИЙ', 'ЗАМОРОЗКИ', 'ОТТЕПЕЛЬ']
  },
  'весна': {
    easy: ['ТЕПЛО', 'ПОЧКИ', 'ЛУЖА', 'МАРТ', 'ВЕСНА', 'РУЧЕЙ', 'ПТИЦА', 'СОЛНЦЕ'],
    medium: ['ПОДСНЕЖНИК', 'РУЧЕЕК', 'АПРЕЛЬ', 'МАЙ', 'КАПЕЛЬ', 'ПРОТАЛИНА', 'ОТТЕПЕЛЬ', 'ПЕРВОЦВЕТ'],
    hard: ['ПОДСНЕЖНИК', 'ПРОБУЖДЕНИЕ', 'БЛАГОУХАНИЕ', 'ЖУРЧАНИЕ', 'НАБУХАНИЕ', 'ПОЛОВОДЬЕ', 'ЦВЕТЕНИЕ', 'ЩЕБЕТАНИЕ']
  },
  'лето': {
    easy: ['ЖАРА', 'МОРЕ', 'ПЛЯЖ', 'ЛЕТО', 'СОЛНЦЕ', 'РЕЧКА', 'ЯГОДА', 'ЦВЕТЫ'],
    medium: ['КАНИКУЛЫ', 'АВГУСТ', 'ИЮНЬ', 'ИЮЛЬ', 'ОТДЫХ', 'КУПАНИЕ', 'ЗАГАР', 'ПРОГУЛКА'],
    hard: ['ПУТЕШЕСТВИЕ', 'ПРИКЛЮЧЕНИЕ', 'СОЛНЦЕПЕК', 'ЗНОЙНЫЙ', 'РАСКАЛЕННЫЙ', 'УДУШЛИВЫЙ', 'ИСПАРЕНИЕ', 'БЛАГОДАТЬ']
  },
  'деревья': {
    easy: ['БЕРЕЗА', 'ДУБ', 'ЕЛЬ', 'СОСНА', 'КЛЕН', 'ИВА', 'ЛИПА', 'ЯСЕНЬ'],
    medium: ['БЕРЕЗА', 'ОСИНА', 'ТОПОЛЬ', 'РЯБИНА', 'КАШТАН', 'ОЛЬХА', 'ВЯЗ', 'АКАЦИЯ'],
    hard: ['ЧЕРЕМУХА', 'МОЖЖЕВЕЛЬНИК', 'ЖИМОЛОСТЬ', 'КАЛИНА', 'БОЯРЫШНИК', 'ЛИСТВЕННИЦА', 'КИПАРИС', 'ПЛАТАН']
  },
  'профессии': {
    easy: ['ВРАЧ', 'ПОВАР', 'УЧИТЕЛЬ', 'ПИЛОТ', 'АРТИСТ', 'НЯНЯ', 'СТОЛЯР', 'ШВЕЯ'],
    medium: ['ДОКТОР', 'СТРОИТЕЛЬ', 'ВОДИТЕЛЬ', 'ХУДОЖНИК', 'ПЕВЕЦ', 'ПИСАТЕЛЬ', 'ЮРИСТ', 'АКТЕР'],
    hard: ['АРХИТЕКТОР', 'ИНЖЕНЕР', 'ПРОГРАММИСТ', 'ЖУРНАЛИСТ', 'ПАРИКМАХЕР', 'СТОМАТОЛОГ', 'ДИЗАЙНЕР', 'МАРКЕТОЛОГ']
  },
  'дом': {
    easy: ['СТОЛ', 'СТУЛ', 'ДИВАН', 'КРОВАТЬ', 'ШКАФ', 'ОКНО', 'ДВЕРЬ', 'ПОЛ'],
    medium: ['КРЕСЛО', 'ПОЛКА', 'ЗЕРКАЛО', 'КАРТИНА', 'ЛАМПА', 'КОВЕР', 'КОМОД', 'БУФЕТ'],
    hard: ['ХОЛОДИЛЬНИК', 'ТЕЛЕВИЗОР', 'МИКРОВОЛНОВКА', 'ПЫЛЕСОС', 'ТОРШЕР', 'НАСТЕННЫЕ', 'ТРЮМО', 'ГАРДЕРОБ']
  },
  'цвет': {
    easy: ['КРАСНЫЙ', 'СИНИЙ', 'ЖЕЛТЫЙ', 'БЕЛЫЙ', 'ЧЕРНЫЙ', 'СЕРЫЙ', 'ЗЕЛЕНЫЙ', 'РОЗОВЫЙ'],
    medium: ['ОРАНЖЕВЫЙ', 'ФИОЛЕТОВЫЙ', 'КОРИЧНЕВЫЙ', 'ГОЛУБОЙ', 'БЕЖЕВЫЙ', 'САЛАТОВЫЙ', 'БОРДОВЫЙ', 'ЗОЛОТОЙ'],
    hard: ['МАЛИНОВЫЙ', 'БИРЮЗОВЫЙ', 'СИРЕНЕВЫЙ', 'ЛИЛОВЫЙ', 'ИЗУМРУДНЫЙ', 'БАГРОВЫЙ', 'ЛАЗУРНЫЙ', 'ПУРПУРНЫЙ']
  },
  'фигура': {
    easy: ['КРУГ', 'КВАДРАТ', 'ОВАЛ', 'РОМБ', 'ТРЕУГОЛЬНИК', 'ЛИНИЯ', 'ТОЧКА', 'ШАР'],
    medium: ['ПРЯМОУГОЛЬНИК', 'ПЯТИУГОЛЬНИК', 'ШЕСТИУГОЛЬНИК', 'КОНУС', 'ЦИЛИНДР', 'ПИРАМИДА', 'КУБ', 'СФЕРА'],
    hard: ['ПАРАЛЛЕЛОГРАММ', 'ТРАПЕЦИЯ', 'МНОГОУГОЛЬНИК', 'ОКТАЭДР', 'ДОДЕКАЭДР', 'ИКОСАЭДР', 'ПРИЗМА', 'ТЕТРАЭДР']
  },
  'огород': {
    easy: ['МОРКОВЬ', 'ОГУРЕЦ', 'ПОМИДОР', 'СВЕКЛА', 'ЛУК', 'РЕПА', 'РЕДИС', 'САЛАТ'],
    medium: ['КАРТОФЕЛЬ', 'КАПУСТА', 'ПЕРЕЦ', 'КАБАЧОК', 'БАКЛАЖАН', 'ТЫКВА', 'ЧЕСНОК', 'УКРОП'],
    hard: ['ПАТИССОН', 'ЦУКИНИ', 'ТОПИНАМБУР', 'СПАРЖА', 'РЕВЕНЬ', 'АРТИШОК', 'ФЕНХЕЛЬ', 'ЩАВЕЛЬ']
  },
  'лес': {
    easy: ['ТРОПА', 'ГРИБ', 'ЯГОДА', 'ШИШКА', 'ЗАЯЦ', 'БЕЛКА', 'ДЕРЕВО', 'КУСТ'],
    medium: ['ПОЛЯНКА', 'ОПУШКА', 'ЧАЩА', 'ДУПЛО', 'ГНЕЗДО', 'БЕРЛОГА', 'МОХ', 'ПЕНЬ'],
    hard: ['МУРАВЕЙНИК', 'БУРЕЛОМРАК', 'ПРОСЕКА', 'ВАЛЕЖНИК', 'ПОДЛЕСОК', 'ХВОРОСТ', 'НЕПРОЛАЗНЫЙ', 'ДЕБРИ']
  },
  'грибы': {
    easy: ['БЕЛЫЙ', 'ОПЯТА', 'ГРУЗДЬ', 'ЛИСИЧКИ', 'СЫРОЕЖКА', 'ВОЛНУШКА', 'РЫЖИК', 'МАСЛЕНОК'],
    medium: ['БОРОВИК', 'ПОДБЕРЕЗОВИК', 'ПОДОСИНОВИК', 'МАСЛЯТА', 'МОХОВИК', 'КОЗЛЯК', 'ДУБОВИК', 'ПОЛЬСКИЙ'],
    hard: ['ПОДБЕРЕЗОВИК', 'ПОДОСИНОВИК', 'РЯДОВКА', 'ГОВОРУШКА', 'ВЕШЕНКА', 'ОПЕНОК', 'ШАМПИНЬОН', 'ЗОНТИК']
  },
  'ягоды': {
    easy: ['МАЛИНА', 'КЛУБНИКА', 'ВИШНЯ', 'СМОРОДИНА', 'СЛИВА', 'АРБУЗ', 'ДЫНЯ', 'ВИНОГРАД'],
    medium: ['ЧЕРНИКА', 'ГОЛУБИКА', 'БРУСНИКА', 'КЛЮКВА', 'ЕЖЕВИКА', 'КРЫЖОВНИК', 'ОБЛЕПИХА', 'КАЛИНА'],
    hard: ['МОРОШКА', 'ЧЕРНОПЛОДНАЯ', 'ЖИМОЛОСТЬ', 'КОСТЯНИКА', 'БУЗИНА', 'ШИПОВНИК', 'БАРБАРИС', 'ИРГА']
  },
  'одежда': {
    easy: ['РУБАШКА', 'БРЮКИ', 'ПЛАТЬЕ', 'ЮБКА', 'КУРТКА', 'ПАЛЬТО', 'ШОРТЫ', 'МАЙКА'],
    medium: ['СВИТЕР', 'КОФТА', 'ПИДЖАК', 'ЖИЛЕТ', 'БЛУЗКА', 'ФУТБОЛКА', 'КОСТЮМ', 'ХАЛАТ'],
    hard: ['ДЖЕМПЕР', 'КАРДИГАН', 'ВОДОЛАЗКА', 'САРАФАН', 'КОМБИНЕЗОН', 'ВЕТРОВКА', 'ТОЛСТОВКА', 'БЕЗРУКАВКА']
  },
  'обувь': {
    easy: ['ТУФЛИ', 'САПОГИ', 'БОТИНКИ', 'ТАПКИ', 'КЕДЫ', 'БОСОНОЖКИ', 'САНДАЛИИ', 'ВАЛЕНКИ'],
    medium: ['КРОССОВКИ', 'ГАЛОШИ', 'ШЛЕПАНЦЫ', 'МОКАСИНЫ', 'ЛОФЕРЫ', 'БРОГИ', 'ДЕРБИ', 'ЧЕЛСИ'],
    hard: ['ЭСПАДРИЛЬИ', 'ЛАБУТЕНЫ', 'ОКСФОРДЫ', 'ТОПСАЙДЕРЫ', 'МОНКИ', 'СЛИПОНЫ', 'УГГИ', 'ДЕЗЕРТЫ']
  },
  'головные уборы': {
    easy: ['ШАПКА', 'ПАНАМА', 'КЕПКА', 'БЕРЕТ', 'ШЛЯПА', 'ПЛАТОК', 'КОСЫНКА', 'УШАНКА'],
    medium: ['БЕЙСБОЛКА', 'БАНДАНА', 'ФУРАЖКА', 'ПИЛОТКА', 'КОТЕЛОК', 'ФЕСКА', 'ТЮБЕТЕЙКА', 'КАСКА'],
    hard: ['ЦИЛИНДР', 'ТРЕУГОЛКА', 'СОМБРЕРО', 'КАНОТЬЕ', 'ФЕДОРА', 'ТЮРБАН', 'ЧАЛМА', 'ШАПЕРОН']
  },
  'новый год': {
    easy: ['ЕЛКА', 'СНЕГ', 'ПОДАРОК', 'МОРОЗ', 'ЗИМА', 'ПРАЗДНИК', 'СВЕЧА', 'ХЛОПУШКА'],
    medium: ['ГИРЛЯНДА', 'СНЕГУРОЧКА', 'МИШУРА', 'ИГРУШКА', 'СЕРПАНТИН', 'КОНФЕТТИ', 'САЛЮТ', 'ФЕЙЕРВЕРК'],
    hard: ['СНЕГУРОЧКА', 'КУРАНТЫ', 'ШАМПАНСКОЕ', 'МАНДАРИН', 'БЕНГАЛЬСКИЙ', 'ЗАСТОЛЬЕ', 'ПОЗДРАВЛЕНИЕ', 'НОВОГОДНИЙ']
  },
  'домашние животные': {
    easy: ['КОШКА', 'СОБАКА', 'КОРОВА', 'КОЗА', 'ЛОШАДЬ', 'ОВЦА', 'СВИНЬЯ', 'КУРИЦА'],
    medium: ['КРОЛИК', 'ХОМЯК', 'ПОПУГАЙ', 'ЧЕРЕПАХА', 'МОРСКАЯ СВИНКА', 'КАНАРЕЙКА', 'УТКА', 'ИНДЮК'],
    hard: ['ШИНШИЛЛА', 'ХОРЕК', 'ДЕГУ', 'ИГУАНА', 'КРЫСА', 'ПЕСЧАНКА', 'ЙОРКШИРСКИЙ', 'СИАМСКАЯ']
  },
  'дикие животные': {
    easy: ['ВОЛК', 'ЛИСА', 'ЗАЯЦ', 'МЕДВЕДЬ', 'ЕЖ', 'БЕЛКА', 'КАБАН', 'ОЛЕНЬ'],
    medium: ['БАРСУК', 'РЫСЬ', 'КУНИЦА', 'ЛОСЬ', 'ЕНОТ', 'КОСУЛЯ', 'НОРКА', 'ХОРЬ'],
    hard: ['РОСОМАХА', 'СОБОЛЬ', 'ГОРНОСТАЙ', 'ЛАСКА', 'ВЫДРА', 'БОБР', 'ОНДАТРА', 'НУТРИЯ']
  },
  'птицы': {
    easy: ['ВОРОНА', 'ГОЛУБЬ', 'ВОРОБЕЙ', 'СИНИЦА', 'СНЕГИРЬ', 'СОРОКА', 'ГАЛКА', 'СОВА'],
    medium: ['ДЯТЕЛ', 'КУКУШКА', 'СОЛОВЕЙ', 'СКВОРЕЦ', 'ЖАВОРОНОК', 'СВИРИСТЕЛЬ', 'ИВОЛГА', 'ТРЯСОГУЗКА'],
    hard: ['ПОПОЛЗЕНЬ', 'ЩЕГОЛ', 'ЧЕЧЕТКА', 'КЛЕСТ', 'ПИЩУХА', 'ЗАРЯНКА', 'ГОРИХВОСТКА', 'СЛАВКА']
  },
  'семья': {
    easy: ['МАМА', 'ПАПА', 'СЫН', 'ДОЧЬ', 'БРАТ', 'СЕСТРА', 'ДЯДЯ', 'ТЕТЯ'],
    medium: ['БАБУШКА', 'ДЕДУШКА', 'ВНУК', 'ВНУЧКА', 'ПЛЕМЯННИК', 'ПЛЕМЯННИЦА', 'РОДИТЕЛИ', 'ДЕТИ'],
    hard: ['ДВОЮРОДНЫЙ', 'ТРОЮРОДНАЯ', 'ПРАБАБУШКА', 'ПРАДЕДУШКА', 'ПРАВНУК', 'ПРАВНУЧКА', 'СВЕКРОВЬ', 'ТЕЩА']
  },
  'цветы': {
    easy: ['РОЗА', 'ТЮЛЬПАН', 'РОМАШКА', 'МАК', 'ЛИЛИЯ', 'ПИОН', 'АСТРА', 'НАРЦИСС'],
    medium: ['ГВОЗДИКА', 'ЛАНДЫШ', 'ВАСИЛЕК', 'ГЛАДИОЛУС', 'ГЕОРГИН', 'БЕГОНИЯ', 'ФИАЛКА', 'ПЕТУНИЯ'],
    hard: ['ХРИЗАНТЕМА', 'ГИАЦИНТ', 'ЦИКЛАМЕН', 'ГЕРБЕРА', 'ЭУСТОМА', 'АНЕМОН', 'ЛИЗИАНТУС', 'ДЕЛЬФИНИУМ']
  },
  'город': {
    easy: ['УЛИЦА', 'ДОМ', 'ПАРК', 'МОСТ', 'ШКОЛА', 'МАГАЗИН', 'АПТЕКА', 'КИНО'],
    medium: ['ПЛОЩАДЬ', 'МУЗЕЙ', 'ТЕАТР', 'БОЛЬНИЦА', 'СТАДИОН', 'ВОКЗАЛ', 'РЫНОК', 'ПОЧТА'],
    hard: ['БИБЛИОТЕКА', 'УНИВЕРСИТЕТ', 'ПОЛИКЛИНИКА', 'ТРОЛЛЕЙБУС', 'АДМИНИСТРАЦИЯ', 'НАБЕРЕЖНАЯ', 'БУЛЬВАР', 'ПРОСПЕКТ']
  },
  'насекомые': {
    easy: ['МУХА', 'КОМАР', 'ЖУК', 'ПЧЕЛА', 'ОСА', 'МУРАВЕЙ', 'БАБОЧКА', 'СТРЕКОЗА'],
    medium: ['КУЗНЕЧИК', 'БОЖЬЯ КОРОВКА', 'ШМЕЛЬ', 'СВЕТЛЯЧОК', 'СВЕРЧОК', 'ТАРАКАН', 'КЛОП', 'МОШКА'],
    hard: ['БОГОМОЛ', 'САРАНЧА', 'ЦИКАДА', 'КУЗНЕЧИК', 'ЗЛАТОГЛАЗКА', 'МЕДВЕДКА', 'ЖУЖЕЛИЦА', 'ДОЛГОНОСИК']
  },
  'инструменты': {
    easy: ['МОЛОТОК', 'ПИЛА', 'ТОПОР', 'КЛЕЩИ', 'НОЖ', 'ГВОЗДИ', 'ЛОПАТА', 'ГРАБЛИ'],
    medium: ['ОТВЕРТКА', 'РУБАНОК', 'ДРЕЛЬ', 'КЛЮЧ', 'ПЛОСКОГУБЦЫ', 'ДОЛОТО', 'СТАМЕСКА', 'ШУРУП'],
    hard: ['ПЛОСКОГУБЦЫ', 'НАПИЛЬНИК', 'СТАМЕСКА', 'ШЛИФОВАЛЬНЫЙ', 'ФРЕЗА', 'БОЛГАРКА', 'ПЕРФОРАТОР', 'ШУРУПОВЕРТ']
  },
  'бытовая техника': {
    easy: ['УТЮГ', 'ПЛИТА', 'ЧАЙНИК', 'ТЕЛЕВИЗОР', 'РАДИО', 'ФЕН', 'ТОСТЕР', 'МИКСЕР'],
    medium: ['СТИРАЛЬНАЯ МАШИНА', 'ПЫЛЕСОС', 'БЛЕНДЕР', 'ПЕЧЬ', 'ВЕНТИЛЯТОР', 'ОБОГРЕВАТЕЛЬ', 'СОКОВЫЖИМАЛКА', 'ТОСТЕР'],
    hard: ['МИКРОВОЛНОВКА', 'МУЛЬТИВАРКА', 'КОФЕМАШИНА', 'ПОСУДОМОЕЧНАЯ', 'КОНДИЦИОНЕР', 'ХЛЕБОПЕЧКА', 'ПАРОВАРКА', 'АЭРОГРИЛЬ']
  },
  'транспорт': {
    easy: ['МАШИНА', 'АВТОБУС', 'ТРАМВАЙ', 'ПОЕЗД', 'САМОЛЕТ', 'КОРАБЛЬ', 'ЛОДКА', 'МЕТРО'],
    medium: ['ТРОЛЛЕЙБУС', 'ВЕРТОЛЕТ', 'ЭЛЕКТРИЧКА', 'ТЕПЛОХОД', 'ЯХТА', 'КАТЕР', 'ПАРОМ', 'СКУТЕР'],
    hard: ['ЭЛЕКТРИЧКА', 'МОТОЦИКЛ', 'ВЕЛОСИПЕД', 'ГРУЗОВИК', 'ТРАКТОР', 'ЭКСКАВАТОР', 'БУЛЬДОЗЕР', 'ЭСКАЛАТОР']
  },
  'рыбы и водные жители': {
    easy: ['ЩУКА', 'ОКУНЬ', 'КАРАСЬ', 'РАК', 'КРАБ', 'САЗАН', 'ЕРШ', 'ЛЕЩ'],
    medium: ['ЗОЛОТАЯ РЫБКА', 'МЕДУЗА', 'МОРСКАЯ ЗВЕЗДА', 'ДЕЛЬФИН', 'КИТ', 'АКУЛА', 'СКАТ', 'ФОРЕЛЬ'],
    hard: ['ОСЬМИНОГ', 'МОРСКОЙ КОНЕК', 'БАРРАКУДА', 'МУРЕНА', 'МАРЛИН', 'РЫБАМЕЧ', 'КАРАКАТИЦА', 'АНЧОУС']
  },
  'человек': {
    easy: ['ГОЛОВА', 'РУКА', 'НОГА', 'ГЛАЗ', 'НОС', 'УХО', 'РОТ', 'ШЕЯ'],
    medium: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ', 'БЕДРО', 'ГОЛЕНЬ'],
    hard: ['ПРЕДПЛЕЧЬЕ', 'ЗАПЯСТЬЕ', 'КЛЮЧИЦА', 'ЛОПАТКА', 'ПОЗВОНОЧНИК', 'ПОДМЫШКА', 'ЩИКОЛОТКА', 'СТОПА']
  },
  'части тела': {
    easy: ['ГОЛОВА', 'РУКА', 'НОГА', 'ГЛАЗ', 'НОС', 'УХО', 'РОТ', 'ШЕЯ'],
    medium: ['ПЛЕЧО', 'ЛОКОТЬ', 'КОЛЕНО', 'ЖИВОТ', 'СПИНА', 'ГРУДЬ', 'БЕДРО', 'ГОЛЕНЬ'],
    hard: ['ПРЕДПЛЕЧЬЕ', 'ЗАПЯСТЬЕ', 'КЛЮЧИЦА', 'ЛОПАТКА', 'ПОЗВОНОЧНИК', 'ПОДМЫШКА', 'ЩИКОЛОТКА', 'СТОПА']
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
                maxWidth: difficulty === 'easy' ? '400px' : difficulty === 'medium' ? '600px' : '700px'
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
                      ${difficulty === 'easy' ? 'text-lg' : difficulty === 'medium' ? 'text-base' : 'text-sm'}
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
