import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FilwordConfigProps {
  onStart: (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string; showWords: boolean }) => void;
  onSave?: (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string; showWords: boolean }) => void;
}

const THEMES = [
  'осень', 'зима', 'весна', 'лето', 'деревья', 'профессии', 'дом', 'цвет', 
  'фигура', 'огород', 'лес', 'грибы', 'ягоды', 'одежда', 'обувь', 
  'головные уборы', 'новый год', 'домашние животные', 'дикие животные', 
  'птицы', 'семья', 'цветы', 'город', 'насекомые', 'инструменты', 
  'бытовая техника', 'транспорт', 'рыбы и водные жители', 'человек', 'части тела'
];

export default function FilwordConfig({ onStart, onSave }: FilwordConfigProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [theme, setTheme] = useState(THEMES[0]);
  const [showWords, setShowWords] = useState(true);

  const handleStart = () => {
    onStart({ difficulty, theme, showWords });
  };

  const handleSave = () => {
    onSave?.({ difficulty, theme, showWords });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Icon name="Grid3x3" size={28} className="text-blue-600 sm:w-8 sm:h-8" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Филворд</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Настройте параметры игры</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">Сложность:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => setDifficulty('easy')}
                className={`
                  p-3 sm:p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'easy'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 active:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-sm sm:text-base text-gray-800">Простой</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">7×7 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Частотные слова</div>
              </button>

              <button
                onClick={() => setDifficulty('medium')}
                className={`
                  p-3 sm:p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'medium'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 active:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-sm sm:text-base text-gray-800">Средний</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">10×10 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Частотные и редкочастотные</div>
              </button>

              <button
                onClick={() => setDifficulty('hard')}
                className={`
                  p-3 sm:p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'hard'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 active:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-sm sm:text-base text-gray-800">Сложный</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">13×13 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Редкочастотные слова</div>
              </button>
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">Показывать подсказки:</Label>
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <button
                onClick={() => setShowWords(!showWords)}
                className={`
                  relative w-14 h-7 rounded-full transition-all
                  ${showWords ? 'bg-green-500' : 'bg-gray-300'}
                `}
              >
                <div
                  className={`
                    absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${showWords ? 'translate-x-7' : 'translate-x-0'}
                  `}
                />
              </button>
              <div>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {showWords ? '✅ Список слов виден' : '🔒 Список слов скрыт'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {showWords 
                    ? 'Ребёнок видит, какие слова нужно найти' 
                    : 'Повышенная сложность — слова скрыты'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">Лексическая тема:</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 sm:max-h-64 overflow-y-auto p-2 border rounded-lg">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`
                    p-2 rounded text-xs sm:text-sm font-medium transition-all
                    ${theme === t
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2">Цели упражнения:</h3>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
              <li>• Развитие зрительного гнозиса и анализа</li>
              <li>• Развитие навыков фонематического анализа и синтеза</li>
              <li>• Развитие орфографической зоркости</li>
              <li>• Обогащение активного словаря</li>
              <li>• Развитие произвольного внимания</li>
              <li>• Развитие сукцессивного и симультанного восприятия</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={handleStart} className="flex-1" size="lg">
              <Icon name="Play" size={18} className="mr-2 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Начать игру</span>
            </Button>
            {onSave && (
              <Button onClick={handleSave} variant="outline" size="lg" className="sm:flex-shrink-0">
                <Icon name="Save" size={18} className="mr-2 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Сохранить</span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}