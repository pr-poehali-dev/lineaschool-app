import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/useSpeech';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  width: number;
  phoneme: string;
  isCorrect: boolean;
  broken: boolean;
}

interface Player {
  x: number;
  y: number;
  velocityY: number;
  width: number;
  height: number;
}

interface DoodleJumpGameProps {
  phoneme1: string;
  phoneme2: string;
  words: Array<{ word: string; phoneme: string }>;
  onComplete: (score: number) => void;
  onQuit: () => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -12;
const MOVE_SPEED = 5;

export const DoodleJumpGame = ({
  phoneme1,
  phoneme2,
  words,
  onComplete,
  onQuit,
}: DoodleJumpGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { speak } = useSpeech();
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [correctPhoneme, setCorrectPhoneme] = useState('');
  
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 150,
    velocityY: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>();
  const wordIndexRef = useRef(0);
  const gameStartedRef = useRef(false);

  const nextWord = useCallback(() => {
    if (wordIndexRef.current >= words.length) {
      setGameOver(true);
      return;
    }
    
    const wordObj = words[wordIndexRef.current];
    setCurrentWord(wordObj.word);
    setCorrectPhoneme(wordObj.phoneme);
    speak(wordObj.word);
    wordIndexRef.current++;
  }, [words, speak]);

  const initPlatforms = useCallback(() => {
    const platforms: Platform[] = [];
    
    for (let i = 0; i < 7; i++) {
      const y = CANVAS_HEIGHT - 100 - i * 80;
      const phoneme = Math.random() > 0.5 ? phoneme1 : phoneme2;
      
      platforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y,
        width: PLATFORM_WIDTH,
        phoneme,
        isCorrect: false,
        broken: false,
      });
    }
    
    platformsRef.current = platforms;
  }, [phoneme1, phoneme2]);

  useEffect(() => {
    initPlatforms();
    nextWord();
  }, [initPlatforms, nextWord]);

  const checkCollision = useCallback(() => {
    const player = playerRef.current;
    
    if (player.velocityY > 0) {
      for (const platform of platformsRef.current) {
        if (
          platform.broken ||
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + PLATFORM_HEIGHT + 5 &&
          player.velocityY > 0
        ) {
          if (!platform.broken) {
            player.velocityY = JUMP_VELOCITY;
            
            platform.isCorrect = platform.phoneme === correctPhoneme;
            
            if (platform.isCorrect) {
              setScore((prev) => prev + 10);
              nextWord();
            } else {
              platform.broken = true;
              setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameOver(true);
                }
                return newLives;
              });
            }
          }
        }
      }
    }
  }, [correctPhoneme, nextWord]);

  const updatePlatforms = useCallback(() => {
    const player = playerRef.current;
    
    if (player.y < CANVAS_HEIGHT / 3) {
      const shift = CANVAS_HEIGHT / 3 - player.y;
      player.y = CANVAS_HEIGHT / 3;
      
      platformsRef.current = platformsRef.current.map((platform) => ({
        ...platform,
        y: platform.y + shift,
      }));
      
      platformsRef.current = platformsRef.current.filter(
        (platform) => platform.y < CANVAS_HEIGHT
      );
      
      while (platformsRef.current.length < 7) {
        const lastPlatform = platformsRef.current[0];
        const newY = lastPlatform ? lastPlatform.y - 80 : -80;
        const phoneme = Math.random() > 0.5 ? phoneme1 : phoneme2;
        
        platformsRef.current.unshift({
          x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
          y: newY,
          width: PLATFORM_WIDTH,
          phoneme,
          isCorrect: false,
          broken: false,
        });
      }
    }
  }, [phoneme1, phoneme2]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;

    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      player.x -= MOVE_SPEED;
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      player.x += MOVE_SPEED;
    }

    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));

    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    if (player.y > CANVAS_HEIGHT) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
      player.y = CANVAS_HEIGHT / 2;
      player.velocityY = 0;
    }

    checkCollision();
    updatePlatforms();

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    platformsRef.current.forEach((platform) => {
      if (platform.broken) {
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = 0.5;
      } else if (platform.isCorrect) {
        ctx.fillStyle = '#22c55e';
      } else {
        ctx.fillStyle = '#f59e0b';
      }
      
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT);
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `[${platform.phoneme}]`,
        platform.x + platform.width / 2,
        platform.y - 5
      );
    });

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🐊', player.x + player.width / 2, player.y + player.height / 2 + 8);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, checkCollision, updatePlatforms]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (!gameStartedRef.current) {
        gameStartedRef.current = true;
        gameLoop();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    if (gameOver) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setTimeout(() => {
        onComplete(score);
      }, 500);
    }
  }, [gameOver, score, onComplete]);

  const handleReplay = () => {
    speak(currentWord);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Icon
                key={i}
                name="Heart"
                size={24}
                className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}
              />
            ))}
          </div>
          <div className="text-2xl font-bold text-purple-600">Счёт: {score}</div>
          <Button onClick={onQuit} variant="ghost" size="icon">
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="mb-4 text-center">
          <div className="text-sm text-gray-600 mb-2">Слушай слово и прыгай на нужный звук:</div>
          <Button onClick={handleReplay} variant="outline" size="lg" className="gap-2">
            <Icon name="Volume2" size={20} />
            Повторить слово
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-purple-400 rounded-2xl w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        <div className="mt-4 text-center text-sm text-gray-600">
          Управление: ← → или A D
        </div>
      </div>
    </div>
  );
};
