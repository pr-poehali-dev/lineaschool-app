import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
}

const CANVAS_WIDTH = 450;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 18;
const GRAVITY = 0.3;
const JUMP_VELOCITY = -9;
const MOVE_SPEED = 4;

export default function DoodleJump() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 150,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
    dy: 0,
  });
  
  const platformsRef = useRef<Platform[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const animationRef = useRef<number>();
  const baseRef = useRef(0);
  const scoreRef = useRef(0);

  const createPlatform = (): Platform => {
    return {
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y: 0,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    };
  };

  const initGame = () => {
    const platforms: Platform[] = [];
    
    for (let i = 0; i < CANVAS_HEIGHT / 80; i++) {
      const platform = createPlatform();
      platform.y = CANVAS_HEIGHT - 50 - i * 80;
      platforms.push(platform);
    }
    
    platformsRef.current = platforms;
    
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - 150,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      dx: 0,
      dy: 0,
    };
    
    baseRef.current = 0;
    scoreRef.current = 0;
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

    const player = playerRef.current;
    const platforms = platformsRef.current;

    player.dx = 0;
    if (keysRef.current.left) {
      player.dx = -MOVE_SPEED;
    }
    if (keysRef.current.right) {
      player.dx = MOVE_SPEED;
    }

    player.dy += GRAVITY;
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) {
      player.x = CANVAS_WIDTH;
    } else if (player.x > CANVAS_WIDTH) {
      player.x = 0;
    }

    if (player.dy > 0) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        if (
          player.x < platform.x + platform.width &&
          player.x + player.width > platform.x &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + platform.height
        ) {
          player.dy = JUMP_VELOCITY;
        }
      }
    }

    if (player.y - player.height / 2 < CANVAS_HEIGHT / 2) {
      const delta = CANVAS_HEIGHT / 2 - (player.y - player.height / 2);
      player.y += delta;

      for (let i = 0; i < platforms.length; i++) {
        platforms[i].y += delta;
      }

      while (platforms[platforms.length - 1].y > 0) {
        const newPlatform = createPlatform();
        newPlatform.y = platforms[platforms.length - 1].y - 60 - Math.random() * 20;
        platforms.push(newPlatform);
      }

      for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].y > CANVAS_HEIGHT) {
          platforms.splice(i, 1);
          i--;
        }
      }

      baseRef.current += delta;
      scoreRef.current = Math.floor(baseRef.current / 10);
      setScore(scoreRef.current);
    }

    if (player.y > CANVAS_HEIGHT) {
      setGameOver(true);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('doodlejump_highscore', scoreRef.current.toString());
      }
      return;
    }

    ctx.fillStyle = '#FFFFCC';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#3CB371';
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Счёт: ${scoreRef.current}`, 10, 30);
    ctx.fillText(`Рекорд: ${highScore}`, 10, 60);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-green-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="text-3xl font-black text-green-600">
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
            className="border-4 border-green-400 rounded-2xl w-full"
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
        </div>
      </div>
    </div>
  );
}
