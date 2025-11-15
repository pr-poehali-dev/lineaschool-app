interface Word {
  text: string;
  found: boolean;
  cells: { row: number; col: number }[];
}

interface FilwordWordListProps {
  words: Word[];
}

export default function FilwordWordList({ words }: FilwordWordListProps) {
  return (
    <div className="w-full lg:w-64">
      <h3 className="font-black text-base sm:text-lg lg:text-xl text-purple-700 mb-2 sm:mb-3 flex items-center gap-2">
        <span>📝</span> Найди слова:
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-0 lg:max-h-96 lg:overflow-y-auto lg:pr-2">
        {words.map((word, index) => (
          <div
            key={index}
            className={`
              p-2 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 border-2
              ${word.found 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white line-through border-green-600 shadow-md sm:shadow-lg' 
                : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 border-purple-300 active:border-purple-500 active:shadow-md'
              }
            `}
          >
            {word.found ? '✅ ' : '🔍 '}{word.text}
          </div>
        ))}
      </div>
    </div>
  );
}