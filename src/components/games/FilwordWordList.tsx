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
    <div className="w-64">
      <h3 className="font-black text-xl text-purple-700 mb-3 flex items-center gap-2">
        <span>📝</span> Найди слова:
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {words.map((word, index) => (
          <div
            key={index}
            className={`
              p-3 rounded-xl text-base font-bold transition-all duration-300 border-2
              ${word.found 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white line-through border-green-600 shadow-lg scale-105' 
                : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 border-purple-300 hover:border-purple-500 hover:shadow-md'
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
