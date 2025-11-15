import Icon from '@/components/ui/icon';

interface FilwordHeaderProps {
  theme: string;
  timeLeft: number;
  foundCount: number;
  totalCount: number;
  shake: boolean;
}

export default function FilwordHeader({ theme, timeLeft, foundCount, totalCount, shake }: FilwordHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">🎯 Филворд: {theme}</h2>
        <p className="text-xs sm:text-sm text-purple-700 mt-1 font-semibold">
          Найди все слова! Клик по буквам
        </p>
      </div>
      <div className="w-full sm:w-auto sm:text-right">
        <div className={`flex items-center gap-2 text-xl sm:text-2xl font-black ${shake ? 'animate-shake' : ''}`}>
          <Icon name="Timer" size={24} className={`${timeLeft < 60 ? 'text-red-500' : 'text-green-500'} sm:w-7 sm:h-7`} />
          <span className={`${timeLeft < 60 ? 'text-red-600 animate-pulse' : timeLeft < 120 ? 'text-orange-500' : 'text-green-600'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="text-base sm:text-lg font-bold mt-1 sm:mt-2 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
          🏆 {foundCount} / {totalCount} слов
        </div>
        <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2 sm:h-3 mt-1 sm:mt-2 overflow-hidden border-2 border-purple-300">
          <div 
            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(foundCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}