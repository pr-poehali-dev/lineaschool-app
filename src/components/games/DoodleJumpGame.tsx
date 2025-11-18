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
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 60;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -15;
const MOVE_SPEED = 6;
const PLATFORM_GAP = 120;

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
  const [musicEnabled, setMusicEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const crocoImageRef = useRef<HTMLImageElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 200,
    velocityY: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>();
  const wordIndexRef = useRef(0);
  const gameStartedRef = useRef(false);
  const currentPlatformRowRef = useRef(0);

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

  const createPlatformPair = useCallback((y: number) => {
    const leftX = 50;
    const rightX = CANVAS_WIDTH - PLATFORM_WIDTH - 50;
    
    const isLeftCorrect = Math.random() > 0.5;
    
    return [
      {
        x: leftX,
        y,
        width: PLATFORM_WIDTH,
        phoneme: isLeftCorrect ? phoneme1 : phoneme2,
        isCorrect: null,
        broken: false,
      },
      {
        x: rightX,
        y,
        width: PLATFORM_WIDTH,
        phoneme: isLeftCorrect ? phoneme2 : phoneme1,
        isCorrect: null,
        broken: false,
      },
    ];
  }, [phoneme1, phoneme2]);

  const initPlatforms = useCallback(() => {
    const platforms: Platform[] = [];
    
    const startPlatform: Platform = {
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 150,
      width: PLATFORM_WIDTH,
      phoneme: '',
      isCorrect: null,
      broken: false,
    };
    platforms.push(startPlatform);
    
    for (let i = 1; i <= 4; i++) {
      const y = CANVAS_HEIGHT - 150 - i * PLATFORM_GAP;
      platforms.push(...createPlatformPair(y));
    }
    
    platformsRef.current = platforms;
    currentPlatformRowRef.current = 0;
  }, [createPlatformPair]);

  useEffect(() => {
    initPlatforms();
    nextWord();
    
    const img = new Image();
    img.src = 'https://cdn.poehali.dev/projects/e88043a3-b424-4f26-8a14-df7debe540b3/files/44e28c3e-7c4a-4b93-bf1a-174b17c3e5c2.jpg';
    img.onload = () => {
      crocoImageRef.current = img;
    };
    
    audioRef.current = null;
    
    const successSound = new Audio();
    successSound.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';
    successSound.volume = 0.5;
    successSoundRef.current = successSound;
    
    const errorSound = new Audio();
    errorSound.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';
    errorSound.volume = 0.4;
    errorSoundRef.current = errorSound;
    
    return () => {
      audio.pause();
    };
  }, [initPlatforms, nextWord]);

  const checkCollision = useCallback(() => {
    const player = playerRef.current;
    
    if (player.velocityY > 0) {
      for (const platform of platformsRef.current) {
        if (
          !platform.broken &&
          platform.isCorrect === null &&
          player.x + player.width / 2 > platform.x &&
          player.x + player.width / 2 < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + PLATFORM_HEIGHT + 10 &&
          player.velocityY > 0
        ) {
          player.velocityY = JUMP_VELOCITY;
          
          if (platform.phoneme === '') {
            return;
          }
          
          const isCorrect = platform.phoneme === correctPhoneme;
          platform.isCorrect = isCorrect;
          
          if (isCorrect) {
            if (successSoundRef.current) {
              successSoundRef.current.currentTime = 0;
              successSoundRef.current.play().catch(() => {});
            }
            setScore((prev) => prev + 10);
            
            const otherPlatform = platformsRef.current.find(
              (p) => p.y === platform.y && p !== platform
            );
            if (otherPlatform) {
              otherPlatform.broken = true;
            }
            
            nextWord();
          } else {
            if (errorSoundRef.current) {
              errorSoundRef.current.currentTime = 0;
              errorSoundRef.current.play().catch(() => {});
            }
            platform.broken = true;
            
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameOver(true);
              } else {
                setTimeout(() => {
                  player.y = CANVAS_HEIGHT - 200;
                  player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
                  player.velocityY = 0;
                }, 300);
              }
              return newLives;
            });
          }
          
          break;
        }
      }
    }
  }, [correctPhoneme, nextWord]);

  const updatePlatforms = useCallback(() => {
    const player = playerRef.current;
    
    if (player.y < CANVAS_HEIGHT / 2.5) {
      const shift = CANVAS_HEIGHT / 2.5 - player.y;
      player.y = CANVAS_HEIGHT / 2.5;
      
      platformsRef.current = platformsRef.current.map((platform) => ({
        ...platform,
        y: platform.y + shift,
      }));
      
      platformsRef.current = platformsRef.current.filter(
        (platform) => platform.y < CANVAS_HEIGHT + 100
      );
      
      const topPlatforms = platformsRef.current.filter((p) => p.phoneme !== '');
      if (topPlatforms.length > 0) {
        const topY = Math.min(...topPlatforms.map((p) => p.y));
        
        if (topY > -PLATFORM_GAP) {
          const newY = topY - PLATFORM_GAP;
          platformsRef.current.push(...createPlatformPair(newY));
        }
      }
    }
  }, [createPlatformPair]);

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
      player.y = CANVAS_HEIGHT - 200;
      player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
      player.velocityY = 0;
    }

    checkCollision();
    updatePlatforms();

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    platformsRef.current.forEach((platform) => {
      if (platform.broken) {
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = 0.3;
      } else if (platform.isCorrect === true) {
        ctx.fillStyle = '#22c55e';
      } else if (platform.isCorrect === false) {
        ctx.fillStyle = '#ef4444';
      } else if (platform.phoneme === '') {
        ctx.fillStyle = '#94a3b8';
      } else {
        ctx.fillStyle = '#f59e0b';
      }
      
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT);
      ctx.globalAlpha = 1;

      if (platform.phoneme && !platform.broken) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `[${platform.phoneme}]`,
          platform.x + platform.width / 2,
          platform.y - 8
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
  }, [gameOver, checkCollision, updatePlatforms]);

  useEffect(() => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      gameLoop();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
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
  }, [gameLoop, musicEnabled]);

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

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    
    if (audioRef.current) {
      if (newState && gameStartedRef.current) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
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
          <div className="flex gap-2">
            <Button onClick={toggleMusic} variant="ghost" size="icon">
              <Icon name={musicEnabled ? 'Volume2' : 'VolumeX'} size={20} />
            </Button>
            <Button onClick={onQuit} variant="ghost" size="icon">
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="text-sm text-gray-600 mb-2">Слушай слово и прыгай на правильный звук:</div>
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