"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DotGothic16 } from 'next/font/google';
import upButtonSvg from '/public/assets/button-up.png';
import downButtonSvg from '/public/assets/button-down.png';
import leftButtonSvg from '/public/assets/button-left.png';
import rightButtonSvg from '/public/assets/button-right.png';

const dotGothic16 = DotGothic16({
  subsets: ['latin'],
  weight: ['400']
});

// Marquee Component and Styles
const MarqueeStyles = () => (
  <style jsx global>{`
    .marquee-container {
      height: 88px;
      overflow: hidden;
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }
    .marquee-wrapper {
      display: inline-flex;
      position: relative;
      width: max-content;
    }
    .marquee-text {
      color: #ed007d;
      font-size: 3rem;
      font-weight: bold;
      white-space: nowrap;
      display: inline-block;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-duration: 50s;
      padding-right: 50px;
    }
    .scroll-left {
      animation-name: scrollLeft;
    }
    .scroll-right {
      animation-name: scrollRight;
    }
    @keyframes scrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes scrollRight {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
  `}</style>
);

const Marquee = ({ direction = 'left' }) => {
  const baseContent = "🐍 P R I S E 連 連";
  const group = Array(15).fill(baseContent).join(' ');
  
  return (
    <div className={"marquee-container " + dotGothic16.className} style={{ backgroundColor: 'transparent' }}>
      <MarqueeStyles />
      <div className="marquee-wrapper">
        <div className={`marquee-text ${direction === 'left' ? 'scroll-left' : 'scroll-right'}`}>
          {group}
        </div>
        <div className={`marquee-text ${direction === 'left' ? 'scroll-left' : 'scroll-right'}`}>
          {group}
        </div>
      </div>
    </div>
  );
};

// Constants
const CELL_SIZE = 20;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;
const INITIAL_SNAKE_POSITION = { x: 7, y: 8 };
const FOOD_TYPES = ['heart', 'smile', 'money', 'book'] as const;
const FOOD_LIMIT = 9;

// TypeScript types
type Position = {
  x: number;
  y: number;
};

type FoodType = typeof FOOD_TYPES[number];

type Snake = {
  head: Position;
  body: BodySegment[];
  positions: Position[];
  direction: Direction | null;
};

type BodySegment = {
  x: number;
  y: number;
  type: FoodType;
};

type Food = {
  x: number;
  y: number;
  type: FoodType;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type FoodCounts = {
  [K in FoodType]: number;
};

type ControllerImages = {
  up: string;
  down: string;
  left: string;
  right: string;
};

// Custom Button Component
interface CustomControlButtonProps {
  direction: Direction;
  onClick: (direction: Direction) => void;
  imageSrc: string;
  className?: string;
}

const CustomControlButton: React.FC<CustomControlButtonProps> = ({ 
  direction, 
  onClick, 
  imageSrc,
  className 
}) => {
  return (
    <button
      className={`
        w-20 h-20 
        rounded-xl 
        flex items-center justify-center 
        transition-transform duration-200
        hover:scale-110
        overflow-hidden
        ${className || ''}
      `}
      onClick={() => onClick(direction)}
    >
        <img 
          src={imageSrc} 
          alt={`${direction} button`}
          className="w-20 h-20 object-contain"
        />
    </button>
  );
};

// Custom controller component
interface CustomGameControllerProps {
  onDirectionChange: (direction: Direction) => void;
  controllerImages: ControllerImages;
}

const CustomGameController: React.FC<CustomGameControllerProps> = ({ 
  onDirectionChange,
  controllerImages 
}) => {
  return (
    <div className="relative w-60 h-60 mx-auto mt-6">
      {/* Up button */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <CustomControlButton 
          direction="UP" 
          onClick={onDirectionChange}
          imageSrc={controllerImages.up}
        />
      </div>
      
      {/* Horizontal buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
        <CustomControlButton 
          direction="LEFT" 
          onClick={onDirectionChange}
          imageSrc={controllerImages.left}
        />
        <CustomControlButton 
          direction="RIGHT" 
          onClick={onDirectionChange}
          imageSrc={controllerImages.right}
        />
      </div>
      
      {/* Down button */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <CustomControlButton 
          direction="DOWN" 
          onClick={onDirectionChange}
          imageSrc={controllerImages.down}
        />
      </div>

    </div>
  );
};

// Pixel Art component for Snake Head
interface SnakeHeadProps {
  direction: Direction | null;
  frame: number;
}

const SnakeHead: React.FC<SnakeHeadProps> = ({ direction, frame }) => {
  const frames = [
    // Frame 1
    <svg key="frame1" viewBox="0 0 8 8" className="w-full h-full">
      <rect x="1" y="1" width="4" height="1" fill="#4CAF50" />
      <rect x="0" y="2" width="5" height="1" fill="#4CAF50" />
      <rect x="0" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="5" width="2" height="2" fill="#4CAF50" />
      <rect x="4" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="3" width="2" height="2" fill="#FFFFFF" />
      <rect x="3" y="4" width="1" height="1" fill="#000000" />
      <rect x="5" y="5" width="3" height="1" fill="#F81700" />
    </svg>,
    
    // Frame 2
    <svg key="frame2" viewBox="0 0 8 8" className="w-full h-full">
      <rect x="1" y="1" width="4" height="1" fill="#4CAF50" />
      <rect x="0" y="2" width="5" height="1" fill="#4CAF50" />
      <rect x="0" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="5" width="2" height="2" fill="#4CAF50" />
      <rect x="4" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="3" width="2" height="2" fill="#FFFFFF" />
      <rect x="3" y="4" width="1" height="1" fill="#000000" />
      <rect x="5" y="5" width="1" height="1" fill="#F81700" />
    </svg>,
    
    // Frame 3
    <svg key="frame1" viewBox="0 0 8 8" className="w-full h-full">
      <rect x="1" y="1" width="4" height="1" fill="#4CAF50" />
      <rect x="0" y="2" width="5" height="1" fill="#4CAF50" />
      <rect x="0" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="5" width="2" height="2" fill="#4CAF50" />
      <rect x="4" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="3" width="2" height="2" fill="#FFFFFF" />
      <rect x="3" y="4" width="1" height="1" fill="#000000" />
      <rect x="5" y="5" width="3" height="1" fill="#F81700" />
    </svg>,
    
    // Frame 4
    <svg key="frame2" viewBox="0 0 8 8" className="w-full h-full">
      <rect x="1" y="1" width="4" height="1" fill="#4CAF50" />
      <rect x="0" y="2" width="5" height="1" fill="#4CAF50" />
      <rect x="0" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="5" width="2" height="2" fill="#4CAF50" />
      <rect x="4" y="3" width="2" height="4" fill="#4CAF50" />
      <rect x="2" y="3" width="2" height="2" fill="#FFFFFF" />
      <rect x="3" y="4" width="1" height="1" fill="#000000" />
      <rect x="5" y="5" width="1" height="1" fill="#F81700" />
    </svg>
  
  ];

  return (
    <div
      style={{
        transform: `
          ${direction === 'UP' ? 'rotate(-90deg)' : ''}
          ${direction === 'DOWN' ? 'rotate(90deg)' : ''}
          ${direction === 'LEFT' ? 'scaleX(-1)' : ''}
          ${direction === 'RIGHT' ? 'rotate(0deg)' : ''}
        `
      }}
    >
      {frames[frame]}
    </div>
  );
};

// Pixel Art Component for Food Symbols
interface PixelSymbolProps {
  type: FoodType;
}

const PixelSymbol: React.FC<PixelSymbolProps> = ({ type }) => {
  const renderSymbol = () => {
    switch(type) {
      case 'heart':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="0" y="3" width="1" height="1" fill="#fceb3a"/>
            <rect x="0" y="4" width="2" height="2" fill="#fbc107"/>
            <rect x="1" y="6" width="4" height="1" fill="#fbc107"/>
            <rect x="5" y="1" width="2" height="1" fill="#ffffff"/>
            <rect x="3" y="2" width="4" height="3" fill="#ffffff"/>
            <rect x="4" y="1" width="1" height="1" fill="#9a1d1d"/>
            <rect x="3" y="2" width="1" height="1" fill="#9a1d1d"/>
            <rect x="1" y="4" width="2" height="1" fill="#2e96f3"/>
            <rect x="3" y="3" width="1" height="1" fill="#2e96f3"/>
            <rect x="5" y="2" width="1" height="1" fill="#000000"/>
            <rect x="2" y="5" width="3" height="1" fill="#259688"/>
            <rect x="7" y="3" width="1" height="1" fill="#f52c6c"/>
            <rect x="5" y="4" width="1" height="2" fill="#f99802"/>
            <rect x="6" y="3" width="1" height="2" fill="#f99802"/>
            <rect x="5" y="6" width="1" height="1" fill="#f97802"/>
            <rect x="6" y="5" width="1" height="1" fill="#f97802"/>
          </svg>
        );
      case 'smile':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="1" y="3" width="6" height="4" fill="#fccdd2"/>
            <rect x="2" y="2" width="4" height="1" fill="#fccdd2"/>
            <rect x="3" y="1" width="2" height="1" fill="#fccdd2"/>
            <rect x="2" y="2" width="1" height="1" fill="#efa3a3"/>
            <rect x="1" y="3" width="1" height="2" fill="#efa3a3"/>
            <rect x="0" y="5" width="1" height="1" fill="#4caf4f"/>
            <rect x="1" y="6" width="2" height="1" fill="#4caf4f"/>
            <rect x="6" y="6" width="1" height="1" fill="#4caf4f"/>
            <rect x="0" y="4" width="1" height="1" fill="#8bc349"/>
            <rect x="1" y="5" width="2" height="1" fill="#8bc349"/>
            <rect x="3" y="6" width="1" height="1" fill="#8bc349"/>
            <rect x="5" y="6" width="1" height="1" fill="#8bc349"/>
            <rect x="6" y="5" width="2" height="1" fill="#8bc349"/>
            <rect x="7" y="4" width="1" height="1" fill="#8bc349"/>
            <rect x="4" y="2" width="1" height="1" fill="#feeced"/>
          </svg>
        );
      case 'money':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="2" y="1" width="4" height="6" fill="#fbc107"/>
            <rect x="1" y="2" width="6" height="4" fill="#fbc107"/>
            <rect x="2" y="1" width="1" height="1" fill="#f99802"/>
            <rect x="1" y="2" width="1" height="4" fill="#f99802"/>
            <rect x="2" y="6" width="1" height="1" fill="#f99802"/>
            <rect x="5" y="1" width="1" height="1" fill="#fceb3a"/>
            <rect x="6" y="2" width="1" height="1" fill="#fceb3a"/>
            <rect x="4" y="3" width="1" height="2" fill="#fceb3a"/>
          </svg>
        );
      case 'book':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="3" y="1" width="2" height="1" fill="#fbc765"/>
            <rect x="1" y="2" width="6" height="4" fill="#fbc765"/>
            <rect x="0" y="3" width="8" height="2" fill="#fbc765"/>
            <rect x="3" y="2" width="2" height="1" fill="#732102"/>
            <rect x="1" y="3" width="6" height="2" fill="#732102"/>
            <rect x="3" y="3" width="2" height="1" fill="#f97d41"/>
            <rect x="2" y="4" width="4" height="1" fill="#f97d41"/>
            <rect x="3" y="4" width="2" height="1" fill="#de4b01"/>
            <rect x="2" y="5" width="4" height="1" fill="#de4b01"/>
            <rect x="3" y="6" width="2" height="1" fill="#a63903"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {renderSymbol()}
    </div>
  );
};

const SnakeGame: React.FC = () => {
  // State declarations
  const [snake, setSnake] = useState<Snake>({
    head: INITIAL_SNAKE_POSITION,
    body: [],
    positions: [],
    direction: null
  });
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodCounts, setFoodCounts] = useState<FoodCounts>({
    heart: 0,
    smile: 0,
    money: 0,
    book: 0
  });
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [animationFrame, setAnimationFrame] = useState<number>(0);

  // Add controller images
  const controllerImages: ControllerImages = {
    up: '/assets/button-up.png',
    down: '/assets/button-down.png',
    left: '/assets/button-left.png',
    right: '/assets/button-right.png'
  };

  // Game reset function
  const resetGame = () => {
    setSnake({
      head: INITIAL_SNAKE_POSITION,
      body: [],
      positions: [],
      direction: null
    });
    setFoods([]);
    setFoodCounts({
      heart: 0,
      smile: 0,
      money: 0,
      book: 0
    });
    setGameStarted(false);
    setGameOver(false);
  };

  // Direction change handler
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (!gameStarted) setGameStarted(true);
    
    setSnake(prev => {
      const opposites: Record<Direction, Direction> = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
      };
      if (opposites[newDirection] !== prev.direction) {
        return { ...prev, direction: newDirection };
      }
      return prev;
    });
  }, [gameStarted]);

  // Food counting utility
  const getTotalFoodCount = useCallback((type: FoodType): number => {
    const eatenCount = foodCounts[type];
    const uneatenCount = foods.filter(food => food.type === type).length;
    return eatenCount + uneatenCount;
  }, [foods, foodCounts]);

  // Food spawning logic
  const spawnFood = useCallback(() => {
    const availableTypes = FOOD_TYPES.filter(type => getTotalFoodCount(type) < FOOD_LIMIT);
    if (availableTypes.length === 0) {
      return;
    }

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    if (getTotalFoodCount(type) >= FOOD_LIMIT) {
      return;
    }

    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (
      (snake.head.x === x && snake.head.y === y) ||
      snake.positions.some(pos => pos.x === x && pos.y === y) ||
      foods.some(food => food.x === x && food.y === y)
    );

    setFoods(prev => [...prev, { x, y, type }]);
  }, [snake, foods, getTotalFoodCount]);

  // Initial food spawn
  useEffect(() => {
    if (foods.length === 0) {
      for (let i = 0; i < 4; i++) {
        spawnFood();
      }
    }
  }, [spawnFood, foods.length]);

  // Head animation effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const animationInterval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4); // Cycle through 4 frames
    }, 150); // Slightly faster than game tick for smooth animation
    
    return () => clearInterval(animationInterval);
  }, [gameStarted, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameOver) {
        switch (event.key) {
          case 'ArrowUp':
            handleDirectionChange('UP');
            break;
          case 'ArrowDown':
            handleDirectionChange('DOWN');
            break;
          case 'ArrowLeft':
            handleDirectionChange('LEFT');
            break;
          case 'ArrowRight':
            handleDirectionChange('RIGHT');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, handleDirectionChange]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const newHead = { ...prev.head };
        switch (prev.direction) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
          default: return prev;
        }

        if (
          newHead.x < 0 || newHead.x >= GRID_WIDTH ||
          newHead.y < 0 || newHead.y >= GRID_HEIGHT ||
          prev.positions.some(pos => pos.x === newHead.x && pos.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }

        const foodIndex = foods.findIndex(food => food.x === newHead.x && food.y === newHead.y);
        if (foodIndex !== -1) {
          const eatenFood = foods[foodIndex];
          
          const newFoodCounts = {
            ...foodCounts,
            [eatenFood.type]: foodCounts[eatenFood.type] + 1
          };
          
          const newTotalFood = Object.values(newFoodCounts).reduce((sum, count) => sum + count, 0);
          if (newTotalFood >= 36) {
            setFoodCounts(newFoodCounts);
            setGameOver(true);
            return prev;
          }

          setFoodCounts(newFoodCounts);
          setFoods(prevFoods => {
            const newFoods = [...prevFoods];
            newFoods.splice(foodIndex, 1);
            return newFoods;
          });

          spawnFood();

          const newBody = [...prev.body, { type: eatenFood.type }] as BodySegment[];
          const newPositions = [newHead];
          for (let i = 0; i < newBody.length; i++) {
            const prevPos = i === 0 ? prev.head : prev.positions[i - 1];
            newPositions.push(prevPos);
          }

          const updatedBody = newBody.map((segment, i) => ({
            ...segment,
            x: newPositions[i + 1].x,
            y: newPositions[i + 1].y
          }));

          return {
            ...prev,
            head: newHead,
            body: updatedBody,
            positions: newPositions
          };
        }

        const newPositions = [newHead];
        for (let i = 0; i < prev.positions.length - 1; i++) {
          newPositions.push(prev.positions[i]);
        }

        const updatedBody = prev.body.map((segment, i) => ({
          ...segment,
          x: newPositions[i + 1].x,
          y: newPositions[i + 1].y
        }));

        return {
          ...prev,
          head: newHead,
          body: updatedBody,
          positions: newPositions
        };
      });
    };

    const gameLoop = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, foods, spawnFood, foodCounts]);

  // Render
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
    {/* Top marquee */}
    <div style={{ backgroundColor: 'transparent' }}>
    <Marquee direction="left" />
    </div>

    {/* Main game content */}
    <div 
      className={'flex-1 px-4 flex items-center justify-center ' + dotGothic16.className}
      style={{
        backgroundImage: `url('/assets/bg7.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000000',
      }}
    >
      <div className="max-w-sm w-full mx-auto">
        
        <div 
          className="relative overflow-hidden mx-auto"
          style={{
            width: GRID_WIDTH * CELL_SIZE + 8,
            height: GRID_HEIGHT * CELL_SIZE + 8,
            backgroundColor: '#000000',
            border: '3px solid #5bff3e'
          }}
        >
          {/* Snake body segments */}
          {snake.body.map((segment, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <PixelSymbol type={segment.type} />
            </div>
          ))}

          {/* Snake head */}
          <div
            className="absolute"
            style={{
              left: snake.head.x * CELL_SIZE,
              top: snake.head.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            <SnakeHead 
            direction={snake.direction} 
            frame={animationFrame}
            />
          </div>

          {/* Food items */}
          {foods.map((food, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <PixelSymbol type={food.type} />
            </div>
          ))}

          {/* Start game message */}
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-base bg-black bg-opacity-50">
              Press any arrow key to start
            </div>
          )}
        </div>

        {/* Use the custom controller */}
        <CustomGameController 
          onDirectionChange={handleDirectionChange}
          controllerImages={controllerImages}
        />
      </div>

      </div>
        {/* Bottom marquee */}
        <div style={{ backgroundColor: 'transparent' }}> 
        <Marquee direction="right" />
        </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <div 
            className="p-6 max-w-sm w-full mx-4"
            style={{
              backgroundColor: '#260601',
              border: '4px solid #ff71de'
            }}
          >
            <h2 
              className={"text-2xl font-bold text-center mb-4 " + dotGothic16.className}
              style={{ color: '#ffce00' }}
            >
              🐍 SSSSPLENDID 🐍
            </h2>
            <div className={"text-center " + dotGothic16.className}>
              <p 
                className="mb-4"
                style={{ color: '#e0e0e0' }}
              >
                here's your lucky numbers
              </p>
              <div className="grid grid-cols-4 gap-4">
                {FOOD_TYPES.map(type => (
                  <div key={type} className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2">
                      <PixelSymbol type={type} />
                    </div>
                    <div style={{ color: '#e0e0e0' }}>{foodCounts[type]}</div>
                  </div>
                ))}
              </div>
              <button 
                className={"mt-6 px-4 py-2 hover:bg-opacity-90 transition-all duration-200" + dotGothic16.className}
                style={{
                  backgroundColor: '#000000',
                  border: '2px solid #61f700',
                  color: '#61f700'
                }}
                onClick={resetGame}
              >
                MAY THE GOD OF LUCK BE WITH YOU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;