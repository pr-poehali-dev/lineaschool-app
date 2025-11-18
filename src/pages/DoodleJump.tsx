import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  type: 'normal' | 'moving' | 'breakable' | 'spring';
}

interface Doodler {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const DOODLER_WIDTH = 60;
const DOODLER_HEIGHT = 60;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 15;
const GRAVITY = 0.33;
const INITIAL_VELOCITY_Y = -8;
const MAX_VELOCITY_X = 5;
const PLATFORM_GAP_MIN = 40;
const PLATFORM_GAP_MAX = 90;

export default function DoodleJump() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const doodlerRef = useRef<Doodler>({
    x: CANVAS_WIDTH / 2 - DOODLER_WIDTH / 2,
    y: 200,
    width: DOODLER_WIDTH,
    height: DOODLER_HEIGHT,
    velocityX: 0,
    velocityY: INITIAL_VELOCITY_Y,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const animationRef = useRef<number>();
  const platformYRef = useRef(CANVAS_HEIGHT - 50);
  const scoreRef = useRef(0);
  const maxHeightRef = useRef(CANVAS_HEIGHT);

  const createPlatform = (y: number): Platform => {
    const rand = Math.random();
    let type: 'normal' | 'moving' | 'breakable' | 'spring' = 'normal';
    
    if (y < 200) {
      if (rand < 0.15) type = 'moving';
      else if (rand < 0.25) type = 'breakable';
      else if (rand < 0.30) type = 'spring';
    } else if (y < 400) {
      if (rand < 0.10) type = 'moving';
      else if (rand < 0.18) type = 'breakable';
    }
    
    return {
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y,
      type,
    };
  };

  const initGame = () => {
    const platforms: Platform[] = [];
    let y = CANVAS_HEIGHT - 50;
    
    platforms.push({
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: y,
      type: 'normal',
    });
    
    while (y > -100) {
      y -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
      platforms.push(createPlatform(y));
    }
    
    platformsRef.current = platforms;
    platformYRef.current = y;
    
    doodlerRef.current = {
      x: CANVAS_WIDTH / 2 - DOODLER_WIDTH / 2,
      y: CANVAS_HEIGHT - 150,
      width: DOODLER_WIDTH,
      height: DOODLER_HEIGHT,
      velocityX: 0,
      velocityY: INITIAL_VELOCITY_Y,
    };
    
    scoreRef.current = 0;
    maxHeightRef.current = CANVAS_HEIGHT;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const saved = localStorage.getItem('doodlejump_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const gameLoop = () => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const doodler = doodlerRef.current;

    if (keysRef.current.left) {
      doodler.velocityX = -MAX_VELOCITY_X;
    } else if (keysRef.current.right) {
      doodler.velocityX = MAX_VELOCITY_X;
    } else {
      doodler.velocityX *= 0.9;
    }

    doodler.x += doodler.velocityX;

    if (doodler.x > CANVAS_WIDTH) {
      doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
      doodler.x = CANVAS_WIDTH;
    }

    doodler.velocityY += GRAVITY;
    doodler.y += doodler.velocityY;

    if (doodler.velocityY < 0 && doodler.y < CANVAS_HEIGHT / 2) {
      const dy = CANVAS_HEIGHT / 2 - doodler.y;
      doodler.y = CANVAS_HEIGHT / 2;

      platformsRef.current.forEach((platform) => {
        platform.y += dy;
      });

      platformsRef.current = platformsRef.current.filter((p) => p.y < CANVAS_HEIGHT + 50);

      while (platformsRef.current.length < 20) {
        platformYRef.current -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
        platformsRef.current.push(createPlatform(platformYRef.current));
      }

      if (doodler.y < maxHeightRef.current) {
        const points = Math.floor((maxHeightRef.current - doodler.y) / 10);
        scoreRef.current += points;
        maxHeightRef.current = doodler.y;
        setScore(scoreRef.current);
      }
    }

    platformsRef.current.forEach((platform, index) => {
      if (platform.type === 'moving') {
        if (!platformsRef.current[index].hasOwnProperty('direction')) {
          (platform as any).direction = Math.random() > 0.5 ? 1 : -1;
        }
        const dir = (platform as any).direction;
        platform.x += dir * 2;
        
        if (platform.x <= 0 || platform.x >= CANVAS_WIDTH - PLATFORM_WIDTH) {
          (platform as any).direction *= -1;
        }
      }

      if (
        doodler.velocityY > 0 &&
        doodler.y + doodler.height >= platform.y &&
        doodler.y + doodler.height <= platform.y + PLATFORM_HEIGHT &&
        doodler.x + doodler.width > platform.x &&
        doodler.x < platform.x + PLATFORM_WIDTH
      ) {
        if (platform.type === 'breakable') {
          platformsRef.current.splice(index, 1);
        } else {
          if (platform.type === 'spring') {
            doodler.velocityY = INITIAL_VELOCITY_Y * 2;
          } else {
            doodler.velocityY = INITIAL_VELOCITY_Y;
          }
        }
      }
    });

    if (doodler.y > CANVAS_HEIGHT) {
      setGameOver(true);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('doodlejump_highscore', scoreRef.current.toString());
      }
      return;
    }

    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      for (let j = 0; j < CANVAS_HEIGHT; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillStyle = '#E8F4FF';
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }

    platformsRef.current.forEach((platform) => {
      if (platform.type === 'normal') {
        ctx.fillStyle = '#7AC74F';
      } else if (platform.type === 'moving') {
        ctx.fillStyle = '#4F9FD9';
      } else if (platform.type === 'breakable') {
        ctx.fillStyle = '#8B6F47';
      } else if (platform.type === 'spring') {
        ctx.fillStyle = '#FF6B6B';
      }

      ctx.beginPath();
      ctx.roundRect(platform.x, platform.y, PLATFORM_WIDTH, PLATFORM_HEIGHT, 5);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.fillStyle = '#FFE135';
    ctx.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(doodler.x + 15, doodler.y + 15, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(doodler.x + 45, doodler.y + 15, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF4757';
    ctx.beginPath();
    ctx.arc(doodler.x + 30, doodler.y + 35, 8, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${scoreRef.current}`, 20, 40);

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
        if (!gameStarted) initGame();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
        if (!gameStarted) initGame();
      }
      if (e.key === ' ' && !gameStarted) {
        initGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
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
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoop();
    }
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Рекорд</div>
            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
          </div>
          <div className="text-3xl font-black text-blue-600">
            DOODLE JUMP
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="icon">
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-blue-400 rounded-2xl w-full bg-sky-50"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">🦘</div>
                <div className="text-2xl font-bold mb-4">DOODLE JUMP</div>
                <div className="text-lg mb-6">Нажмите стрелки или SPACE</div>
                <Button onClick={initGame} size="lg" className="bg-green-500 hover:bg-green-600">
                  <Icon name="Play" size={20} className="mr-2" />
                  Начать игру
                </Button>
              </div>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
              <div className="text-center text-white">
                <div className="text-3xl font-bold mb-2">GAME OVER</div>
                <div className="text-xl mb-4">Счёт: {score}</div>
                {score === highScore && score > 0 && (
                  <div className="text-yellow-400 text-lg mb-4">🏆 Новый рекорд!</div>
                )}
                <Button onClick={initGame} size="lg" className="bg-green-500 hover:bg-green-600">
                  <Icon name="RotateCcw" size={20} className="mr-2" />
                  Играть снова
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="font-semibold mb-2">Управление:</p>
          <p>← → стрелки или A D</p>
          <p className="mt-2 text-xs">
            🟢 Обычная • 🔵 Движущаяся • 🟤 Ломающаяся • 🔴 Пружина
          </p>
        </div>
      </div>
    </div>
  );
}
