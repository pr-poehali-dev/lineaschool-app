import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface GameResult {
  id: number;
  student_name: string;
  score: number;
  max_score: number;
  time_spent: number;
  completed_at: string;
}

interface FilwordResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  maxScore: number;
  timeSpent: number;
  theme: string;
  difficulty: string;
  studentName?: string;
}

export default function FilwordResultsModal({
  isOpen,
  onClose,
  score,
  maxScore,
  timeSpent,
  theme,
  difficulty,
  studentName = 'Гость'
}: FilwordResultsModalProps) {
  const [leaderboard, setLeaderboard] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);

  const isVictory = score === maxScore;
  const percentage = Math.round((score / maxScore) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Здесь можно подключить бэкенд для получения турнирной таблицы
      // Пока используем моковые данные
      const mockData: GameResult[] = [
        { id: 1, student_name: studentName, score, max_score: maxScore, time_spent: timeSpent, completed_at: new Date().toISOString() },
        { id: 2, student_name: 'Мария', score: 8, max_score: 8, time_spent: 245, completed_at: '2025-11-15T10:00:00' },
        { id: 3, student_name: 'Алексей', score: 8, max_score: 8, time_spent: 312, completed_at: '2025-11-15T09:30:00' },
        { id: 4, student_name: 'Софья', score: 7, max_score: 8, time_spent: 420, completed_at: '2025-11-15T09:00:00' },
        { id: 5, student_name: 'Даниил', score: 6, max_score: 8, time_spent: 380, completed_at: '2025-11-15T08:30:00' }
      ];
      
      // Сортируем: сначала по проценту, потом по времени
      const sorted = mockData.sort((a, b) => {
        const percentA = (a.score / a.max_score) * 100;
        const percentB = (b.score / b.max_score) * 100;
        if (percentB !== percentA) return percentB - percentA;
        return a.time_spent - b.time_spent;
      });
      
      setLeaderboard(sorted.slice(0, 5));
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (diff: string) => {
    if (diff === 'easy') return 'Простой';
    if (diff === 'medium') return 'Средний';
    return 'Сложный';
  };

  const getMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getEncouragementMessage = () => {
    if (percentage === 100) {
      return '🎉 Невероятно! Все слова найдены!';
    } else if (percentage >= 75) {
      return '👏 Отличный результат! Так держать!';
    } else if (percentage >= 50) {
      return '💪 Хороший результат! Продолжай тренироваться!';
    } else {
      return '🌟 Попробуй еще раз, у тебя получится!';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-black">
            {isVictory ? '🎉 ПОБЕДА! 🎉' : '⏰ Время вышло!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Результаты игрока */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-300">
            <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">
              {getEncouragementMessage()}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-md">
                <div className="text-4xl font-black text-purple-600">{score}/{maxScore}</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Найдено слов</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-md">
                <div className="text-4xl font-black text-blue-600">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Время</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Результат:</span>
                <span className="text-2xl font-black text-purple-600">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="bg-white/70 rounded-lg p-2">
                <span className="text-gray-600">Тема:</span>
                <span className="font-bold ml-1 text-gray-800">{theme}</span>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <span className="text-gray-600">Сложность:</span>
                <span className="font-bold ml-1 text-gray-800">{getDifficultyLabel(difficulty)}</span>
              </div>
            </div>
          </div>

          {/* Турнирная таблица */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Icon name="Trophy" size={24} className="text-yellow-500" />
              Турнирная таблица
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto text-purple-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((result, index) => {
                  const resultPercentage = Math.round((result.score / result.max_score) * 100);
                  const isCurrentUser = result.student_name === studentName && 
                                       result.time_spent === timeSpent;
                  
                  return (
                    <div 
                      key={result.id}
                      className={`
                        rounded-xl p-4 transition-all
                        ${isCurrentUser 
                          ? 'bg-gradient-to-r from-yellow-200 to-orange-200 border-2 border-yellow-400 shadow-lg scale-105' 
                          : 'bg-white border border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black w-8">
                            {getMedal(index)}
                          </span>
                          <div>
                            <div className="font-bold text-gray-800">
                              {result.student_name}
                              {isCurrentUser && <span className="ml-2 text-sm text-orange-600">(ты!)</span>}
                            </div>
                            <div className="text-xs text-gray-600">
                              {Math.floor(result.time_spent / 60)}:{(result.time_spent % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg text-purple-600">
                            {result.score}/{result.max_score}
                          </div>
                          <div className="text-xs text-gray-600">
                            {resultPercentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <Button 
              onClick={onClose}
              className="flex-1"
              size="lg"
            >
              <Icon name="X" size={18} className="mr-2" />
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
