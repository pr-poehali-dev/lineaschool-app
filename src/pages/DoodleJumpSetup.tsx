import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { phonemeSets } from '@/data/phonemicWords';
import { DoodleJumpGame } from '@/components/games/DoodleJumpGame';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export const DoodleJumpSetup = () => {
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [isRandom, setIsRandom] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState<{
    phoneme1: string;
    phoneme2: string;
    words: Array<{ word: string; phoneme: string }>;
  } | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleStartGame = () => {
    let selectedSet;
    
    if (isRandom) {
      selectedSet = phonemeSets[Math.floor(Math.random() * phonemeSets.length)];
    } else {
      selectedSet = phonemeSets.find((set) => set.pair === selectedPair);
    }

    if (!selectedSet) return;

    const allWords = [
      ...selectedSet.words1.map((word) => ({ word, phoneme: selectedSet!.phoneme1 })),
      ...selectedSet.words2.map((word) => ({ word, phoneme: selectedSet!.phoneme2 })),
    ];

    const shuffledWords = allWords.sort(() => Math.random() - 0.5).slice(0, 30);

    setGameData({
      phoneme1: selectedSet.phoneme1,
      phoneme2: selectedSet.phoneme2,
      words: shuffledWords,
    });
    setGameStarted(true);
  };

  const handleComplete = (score: number) => {
    setFinalScore(score);
    setGameStarted(false);
  };

  const handleRestart = () => {
    setFinalScore(null);
    setSelectedPair(null);
    setIsRandom(false);
    setGameStarted(false);
    setGameData(null);
  };

  const handleQuit = () => {
    setGameStarted(false);
    setGameData(null);
  };

  if (finalScore !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 via-pink-200 to-blue-200 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-purple-600 mb-4">Игра завершена!</h1>
          <div className="text-5xl font-bold text-pink-500 mb-6">{finalScore} очков</div>
          <div className="flex gap-4">
            <Button onClick={handleRestart} className="flex-1 bg-purple-500 hover:bg-purple-600">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameStarted && gameData) {
    return (
      <DoodleJumpGame
        phoneme1={gameData.phoneme1}
        phoneme2={gameData.phoneme2}
        words={gameData.words}
        onComplete={handleComplete}
        onQuit={handleQuit}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-200 via-blue-200 to-purple-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-600">🐊 Крокодил-прыгун</h1>
          <Button onClick={() => navigate('/')} variant="ghost" size="icon">
            <Icon name="X" size={24} />
          </Button>
        </div>

        <p className="text-gray-600 mb-6">
          Слушай слова и прыгай на плитки с правильными звуками. У тебя 3 жизни!
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Выбери пару звуков:</h2>
            <Button
              onClick={() => {
                setIsRandom(!isRandom);
                if (!isRandom) setSelectedPair(null);
              }}
              variant={isRandom ? 'default' : 'outline'}
              className="gap-2"
            >
              <Icon name="Shuffle" size={20} />
              Рандом
            </Button>
          </div>

          {!isRandom && (
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {phonemeSets.map((set) => (
                <Button
                  key={set.pair}
                  onClick={() => setSelectedPair(set.pair)}
                  variant={selectedPair === set.pair ? 'default' : 'outline'}
                  className="h-auto py-4 text-lg font-bold"
                >
                  {set.pair}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleStartGame}
          disabled={!isRandom && !selectedPair}
          size="lg"
          className="w-full bg-green-500 hover:bg-green-600 text-white text-xl py-6"
        >
          <Icon name="Play" size={24} className="mr-2" />
          Начать игру
        </Button>
      </div>
    </div>
  );
};
