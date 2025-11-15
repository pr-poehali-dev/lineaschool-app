import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FilwordConfigProps {
  onStart: (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string }) => void;
  onSave?: (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string }) => void;
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

  const handleStart = () => {
    onStart({ difficulty, theme });
  };

  const handleSave = () => {
    onSave?.({ difficulty, theme });
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="Grid3x3" size={32} className="text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Филворд</h2>
            <p className="text-gray-600 mt-1">Настройте параметры игры</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Сложность:</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDifficulty('easy')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'easy'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-gray-800">Простой</div>
                <div className="text-sm text-gray-600 mt-1">7×7 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Частотные слова</div>
              </button>

              <button
                onClick={() => setDifficulty('medium')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'medium'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-gray-800">Средний</div>
                <div className="text-sm text-gray-600 mt-1">10×10 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Частотные и редкочастотные</div>
              </button>

              <button
                onClick={() => setDifficulty('hard')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${difficulty === 'hard'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="font-semibold text-gray-800">Сложный</div>
                <div className="text-sm text-gray-600 mt-1">13×13 клеток, 8-10 слов</div>
                <div className="text-xs text-gray-500 mt-1">Редкочастотные слова</div>
              </button>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Лексическая тема:</Label>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`
                    p-2 rounded text-sm font-medium transition-all
                    ${theme === t
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Цели упражнения:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Развитие зрительного гнозиса и анализа</li>
              <li>• Развитие навыков фонематического анализа и синтеза</li>
              <li>• Развитие орфографической зоркости</li>
              <li>• Обогащение активного словаря</li>
              <li>• Развитие произвольного внимания</li>
              <li>• Развитие сукцессивного и симультанного восприятия</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleStart} className="flex-1" size="lg">
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
            {onSave && (
              <Button onClick={handleSave} variant="outline" size="lg">
                <Icon name="Save" size={20} className="mr-2" />
                Сохранить настройки
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}