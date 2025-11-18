import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  width: number;
  type: 'green' | 'blue' | 'brown' | 'white';
  moving?: boolean;
  movingDirection?: number;
  broken?: boolean;
}

interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLATFORM_WIDTH = 65;
const PLATFORM_HEIGHT = 20;
const PLAYER_WIDTH = 55;
const PLAYER_HEIGHT = 55;
const GRAVITY = 0.33;
const JUMP_VELOCITY = -11;
const MOVE_SPEED = 4.5;

export default function DoodleJump() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
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
  const highestYRef = useRef(0);
  const scoreRef = useRef(0);

  const generatePlatform = (y: number): Platform => {
    const rand = Math.random();
    let type: 'green' | 'blue' | 'brown' | 'white' = 'green';
    let moving = false;
    
    if (rand < 0.7) {
      type = 'green';
    } else if (rand < 0.85) {
      type = 'blue';
      moving = true;
    } else if (rand < 0.95) {
      type = 'brown';
    } else {
      type = 'white';
    }
    
    return {
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y,
      width: PLATFORM_WIDTH,
      type,
      moving,
      movingDirection: moving ? (Math.random() > 0.5 ? 1 : -1) : undefined,
      broken: false,
    };
  };

  const initGame = () => {
    const platforms: Platform[] = [];
    
    platforms.push({
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      width: PLATFORM_WIDTH,
      type: 'green',
    });
    
    for (let i = 1; i < 12; i++) {
      platforms.push(generatePlatform(CANVAS_HEIGHT - 100 - i * 60));
    }
    
    platformsRef.current = platforms;
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - 150,
      velocityX: 0,
      velocityY: JUMP_VELOCITY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
    highestYRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
    const savedHighScore = localStorage.getItem('doodlejump_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const checkCollision = () => {
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
          if (platform.type === 'brown') {
            platform.broken = true;
            continue;
          }
          
          if (platform.type === 'white') {
            continue;
          }
          
          player.velocityY = JUMP_VELOCITY;
          break;
        }
      }
    }
  };

  const updateGame = () => {
    const player = playerRef.current;
    
    if (player.y < CANVAS_HEIGHT / 2) {
      const shift = CANVAS_HEIGHT / 2 - player.y;
      player.y = CANVAS_HEIGHT / 2;
      
      highestYRef.current += shift;
      const newScore = Math.floor(highestYRef.current / 10);
      scoreRef.current = newScore;
      setScore(newScore);
      
      platformsRef.current = platformsRef.current.map((platform) => ({
        ...platform,
        y: platform.y + shift,
      }));
      
      platformsRef.current = platformsRef.current.filter((p) => p.y < CANVAS_HEIGHT + 50);
      
      while (platformsRef.current.length < 12) {
        const minY = Math.min(...platformsRef.current.map((p) => p.y));
        platformsRef.current.push(generatePlatform(minY - 60));
      }
    }
    
    platformsRef.current.forEach((platform) => {
      if (platform.moving && platform.movingDirection) {
        platform.x += platform.movingDirection * 1.5;
        
        if (platform.x <= 0 || platform.x >= CANVAS_WIDTH - platform.width) {
          platform.movingDirection *= -1;
        }
      }
    });
    
    if (player.y > CANVAS_HEIGHT) {
      setGameOver(true);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('doodlejump_highscore', scoreRef.current.toString());
      }
    }
  };

  const gameLoop = () => {
    if (gameOver || isPaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;

    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      player.velocityX = -MOVE_SPEED;
    } else if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      player.velocityX = MOVE_SPEED;
    } else {
      player.velocityX *= 0.85;
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
    gradient.addColorStop(0, '#B4E4FF');
    gradient.addColorStop(1, '#E8F5FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    platformsRef.current.forEach((platform) => {
      if (platform.broken) {
        return;
      }
      
      if (platform.type === 'green') {
        ctx.fillStyle = '#7CB342';
      } else if (platform.type === 'blue') {
        ctx.fillStyle = '#42A5F5';
      } else if (platform.type === 'brown') {
        ctx.fillStyle = '#8D6E63';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#BDBDBD';
        ctx.lineWidth = 2;
      }
      
      ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT);
      
      if (platform.type === 'white') {
        ctx.strokeRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT);
      }
    });

    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 37, player.y + 10, 8, 8);
    
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(player.x + 27, player.y + 35, 10, 0, Math.PI);
    ctx.fill();

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
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
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (!isPaused && !gameOver) {
      gameLoop();
    }
  }, [isPaused]);

  const handleRestart = () => {
    initGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600">Счёт</div>
            <div className="text-2xl font-bold text-blue-600">{score}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Рекорд</div>
            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost" size="icon">
            <Icon name="X" size={24} />
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-blue-400 rounded-2xl w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        <div className="mt-4 space-y-2">
          {gameOver && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-red-500 mb-2">Игра окончена!</div>
              <Button onClick={handleRestart} className="w-full" size="lg">
                <Icon name="RotateCcw" size={20} className="mr-2" />
                Играть снова
              </Button>
            </div>
          )}
          
          {isPaused && !gameOver && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-500 mb-2">Пауза</div>
              <Button onClick={() => setIsPaused(false)} className="w-full" size="lg">
                <Icon name="Play" size={20} className="mr-2" />
                Продолжить
              </Button>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-600">
            <p>Управление: ← → или A D</p>
            <p>Пауза: ESC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
