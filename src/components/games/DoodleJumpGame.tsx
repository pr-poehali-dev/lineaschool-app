import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/useSpeech';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  width: number;
  phoneme: string;
  isCorrect: boolean | null;
  broken: boolean;
}

interface Player {
  x: number;
  y: number;
  velocityX: number;
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
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 15;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 60;
const GRAVITY = 0.4;
const JUMP_VELOCITY = -11;
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
    velocityX: 0,
    velocityY: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>();
  const wordIndexRef = useRef(0);
  const highestYRef = useRef(0);
  const crocoImageRef = useRef<HTMLImageElement | null>(null);

  const nextWord = useCallback(() => {
    if (wordIndexRef.current >= words.length) {
      setGameOver(true);
      return;
    }
    
    const wordObj = words[wordIndexRef.current];
    setCurrentWord(wordObj.word);
    setCorrectPhoneme(wordObj.phoneme);
    speak(wordObj.word, 0.9);
    wordIndexRef.current++;
  }, [words, speak]);

  const generatePlatform = useCallback((y: number): Platform => {
    const phoneme = Math.random() > 0.5 ? phoneme1 : phoneme2;
    return {
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y,
      width: PLATFORM_WIDTH,
      phoneme,
      isCorrect: null,
      broken: false,
    };
  }, [phoneme1, phoneme2]);

  const initPlatforms = useCallback(() => {
    const platforms: Platform[] = [];
    
    const startPlatform: Platform = {
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      width: PLATFORM_WIDTH,
      phoneme: '',
      isCorrect: null,
      broken: false,
    };
    platforms.push(startPlatform);
    
    for (let i = 1; i < 10; i++) {
      platforms.push(generatePlatform(CANVAS_HEIGHT - 100 - i * 70));
    }
    
    platformsRef.current = platforms;
    playerRef.current.velocityY = JUMP_VELOCITY;
  }, [generatePlatform]);

  useEffect(() => {
    initPlatforms();
    nextWord();
    
    const img = new Image();
    img.src = 'https://cdn.poehali.dev/projects/e88043a3-b424-4f26-8a14-df7debe540b3/files/44e28c3e-7c4a-4b93-bf1a-174b17c3e5c2.jpg';
    img.onload = () => {
      crocoImageRef.current = img;
    };
  }, [initPlatforms, nextWord]);

  const checkCollision = useCallback(() => {
    const player = playerRef.current;
    
    if (player.velocityY > 0) {
      for (const platform of platformsRef.current) {
        if (
          !platform.broken &&
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + PLATFORM_HEIGHT &&
          player.velocityY > 0
        ) {
          player.velocityY = JUMP_VELOCITY;
          
          if (platform.phoneme && platform.phoneme !== '' && platform.isCorrect === null) {
            const isCorrect = platform.phoneme === correctPhoneme;
            platform.isCorrect = isCorrect;
            
            if (isCorrect) {
              setScore((prev) => prev + 10);
              nextWord();
            } else {
              platform.broken = true;
              player.velocityY = 2;
            }
          }
          
          break;
        }
      }
    }
  }, [correctPhoneme, nextWord]);

  const updateGame = useCallback(() => {
    const player = playerRef.current;
    
    if (player.y < CANVAS_HEIGHT / 3) {
      const shift = CANVAS_HEIGHT / 3 - player.y;
      player.y = CANVAS_HEIGHT / 3;
      
      highestYRef.current += shift;
      
      platformsRef.current = platformsRef.current.map((platform) => ({
        ...platform,
        y: platform.y + shift,
      }));
      
      platformsRef.current = platformsRef.current.filter((p) => p.y < CANVAS_HEIGHT + 50);
      
      while (platformsRef.current.length < 10) {
        const minY = Math.min(...platformsRef.current.map((p) => p.y));
        platformsRef.current.push(generatePlatform(minY - 70));
      }
    }
    
    if (player.y > CANVAS_HEIGHT) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
      
      player.y = CANVAS_HEIGHT / 2;
      player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
      player.velocityY = JUMP_VELOCITY;
      player.velocityX = 0;
    }
  }, [generatePlatform]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;

    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      player.velocityX = -MOVE_SPEED;
    } else if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      player.velocityX = MOVE_SPEED;
    } else {
      player.velocityX *= 0.8;
    }

    player.x += player.velocityX;
    
    if (player.x < -player.width) {
      player.x = CANVAS_WIDTH;
    } else if (player.x > CANVAS_WIDTH) {
      player.x = -player.width;
    }

    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    checkCollision();
    updateGame();

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    platformsRef.current.forEach((platform) => {
      if (platform.broken) {
        return;
      }
      
      if (platform.isCorrect === true) {
        ctx.fillStyle = '#22c55e';
      } else if (platform.isCorrect === false) {
        ctx.fillStyle = '#ef4444';
      } else if (platform.phoneme === '') {
        ctx.fillStyle = '#94a3b8';
      } else {
        ctx.fillStyle = '#f59e0b';
      }
      
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT);

      if (platform.phoneme && platform.phoneme !== '') {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `[${platform.phoneme}]`,
          platform.x + platform.width / 2,
          platform.y - 5
        );
      }
    });

    if (crocoImageRef.current && crocoImageRef.current.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(
        crocoImageRef.current,
        player.x,
        player.y,
        player.width,
        player.height
      );
      ctx.restore();
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🐊', player.x + player.width / 2, player.y + player.height / 2 + 10);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, checkCollision, updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    gameLoop();

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
    speak(currentWord, 0.9);
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
          <div className="text-sm text-gray-600 mb-2">Прыгай на плитки с правильным звуком:</div>
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
