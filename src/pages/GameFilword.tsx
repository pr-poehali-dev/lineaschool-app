import { useState } from 'react';
import Filword from '@/components/games/Filword';
import FilwordConfig from '@/components/games/FilwordConfig';

export default function GameFilword() {
  const [gameConfig, setGameConfig] = useState<{ difficulty: 'easy' | 'medium' | 'hard'; theme: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string }) => {
    setGameConfig(config);
    setIsPlaying(true);
  };

  const handleSave = async (config: { difficulty: 'easy' | 'medium' | 'hard'; theme: string }) => {
    try {
      const response = await fetch('https://functions.poehali.dev/1fc4b783-89ef-4c50-9b7b-c8185ca01681', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_type: 'filword',
          title: `Филворд: ${config.theme}`,
          description: 'Игра на развитие внимания и словарного запаса',
          difficulty: config.difficulty,
          config: config,
          created_by: 1,
          target_age_min: config.difficulty === 'easy' ? 7 : config.difficulty === 'medium' ? 10 : 12,
          target_age_max: config.difficulty === 'easy' ? 10 : config.difficulty === 'medium' ? 14 : 18,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Игра сохранена в библиотеку!');
      }
    } catch (error) {
      console.error('Ошибка при сохранении игры:', error);
      alert('Не удалось сохранить игру');
    }
  };

  const handleComplete = async (score: number, maxScore: number, timeSpent: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/a5f63e7f-87fd-446a-bb03-ba19bcf8cdcb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: 1,
          student_id: 2,
          score: score,
          max_score: maxScore,
          time_spent: timeSpent,
          details: {
            words_found: score,
            total_words: maxScore,
            difficulty: gameConfig?.difficulty,
            theme: gameConfig?.theme,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Результат сохранен!');
      }
    } catch (error) {
      console.error('Ошибка при сохранении результата:', error);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setGameConfig(null);
  };

  return (
    <div className="w-full min-h-screen">
      {!isPlaying ? (
        <FilwordConfig onStart={handleStart} onSave={handleSave} />
      ) : gameConfig ? (
        <div className="relative w-full min-h-screen">
          <Filword
            difficulty={gameConfig.difficulty}
            theme={gameConfig.theme}
            onComplete={handleComplete}
          />
          <button
            onClick={handleRestart}
            className="fixed top-2 left-2 sm:top-4 sm:left-4 px-3 py-2 sm:px-4 text-sm sm:text-base bg-white rounded-lg shadow-md active:bg-gray-100 transition-colors z-10"
          >
            ← Назад
          </button>
        </div>
      ) : null}
    </div>
  );
}