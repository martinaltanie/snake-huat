"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    @keyframes scrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes scrollRight {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    .marquee-container {
      background: transparent !important;
      height: 68px;
      overflow: hidden;
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      -webkit-background-color: transparent !important;
      -moz-background-color: transparent !important;
      background-color: transparent !important;
    }
    .marquee-wrapper {
      display: inline-flex;
      position: relative;
      width: max-content;
      background: transparent !important;
      -webkit-background-color: transparent !important;
      -moz-background-color: transparent !important;
      background-color: transparent !important;
    }
    .marquee-text {
      color: #ed007d;
      font-size: 3rem;
      font-weight: bold;
      white-space: nowrap;
      display: inline-block;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-duration: 300s;
      padding-right: 50px;
      background: transparent !important;
      -webkit-background-color: transparent !important;
      -moz-background-color: transparent !important;
      background-color: transparent !important;
    }
    .scroll-left {
      animation-name: scrollLeft;
      background: transparent !important;
    }
    .scroll-right {
      animation-name: scrollRight;
      background: transparent !important;
    }
  `}</style>
);

const Marquee = ({ direction = 'left' }) => {
  const baseContent = " ⟡𓆗 蛇 P R I S E 連 連 ";
  const group = Array(60).fill(baseContent).join(' ');
  
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

const GlobalStyles = () => (
  <style jsx global>{`
    body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      overscroll-behavior: contain;
    }

    * {
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
  `}</style>
);

// Constants
const CELL_SIZE = 20;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;
const INITIAL_SNAKE_POSITION = { x: 7, y: 7 };
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
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onClick(direction);
  };

  return (
    <button
      className={`
        w-20 h-20 
        rounded-xl 
        flex items-center justify-center 
        active:scale-150
        transition-transform duration-75
        select-none
        overflow-hidden
        ${className || ''}
      `}
      onTouchStart={handleClick}
      onMouseDown={handleClick}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        userSelect: 'none'
      }}
    >
        <img 
          src={imageSrc} 
          alt={`${direction} button`}
          className="w-20 h-20 object-contain pointer-events-none"
          draggable="false"
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
            <rect x="2" y="1" width="4" height="2" fill="#fbc107"/>
            <rect x="2" y="3" width="1" height="2" fill="#fbc107"/>
            <rect x="2" y="5" width="4" height="2" fill="#fbc107"/>
            <rect x="6" y="3" width="1" height="3" fill="#fbc107"/>
            <rect x="2" y="1" width="1" height="1" fill="#f99802"/>
            <rect x="1" y="2" width="1" height="4" fill="#f99802"/>
            <rect x="2" y="6" width="1" height="1" fill="#f99802"/>
            <rect x="5" y="3" width="1" height="2" fill="#f99802"/>
            <rect x="5" y="1" width="1" height="1" fill="#fceb3a"/>
            <rect x="6" y="2" width="1" height="1" fill="#fceb3a"/>
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

//Hold button
interface HoldButtonProps {
  onComplete: () => void;
  holdDuration?: number;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const HoldButton: React.FC<HoldButtonProps> = ({
  onComplete,
  holdDuration = 3000, // Default 3 seconds
  className = "",
  children,
  style
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const progressInterval = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent context menu during hold
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    document.addEventListener('contextmenu', preventContextMenu);
    
    setIsHolding(true);
    startTimeRef.current = Date.now();

    progressInterval.current = window.setInterval(() => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsedTime / holdDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        document.removeEventListener('contextmenu', preventContextMenu);
        endHold();
        onComplete();
      }
    }, 10);
  };

  const endHold = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <button 
        className={`
          relative overflow-hidden
          ${className}
        `}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        style={{
          ...style,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          userSelect: 'none'
        }}
      >
        {/* Progress bar background */}
        <div 
          className="absolute inset-0 bg-gray-800 opacity-50"
          style={{ transform: isHolding ? 'none' : 'translateX(-100%)' }}
        />
        
        {/* Progress bar */}
        <div 
          className="absolute inset-0 bg-green-500 opacity-50 transition-transform duration-100 ease-linear"
          style={{ 
            transform: `translateX(${progress - 100}%)`,
            transition: isHolding ? 'none' : 'transform 0.2s ease'
          }}
        />
        
        {/* Button content */}
        <div className="relative z-10">
          {children}
        </div>
      </button>
    </div>
  );
};

const SnakeGame: React.FC = () => {
  const findSnakeBounds = (head: Position, body: BodySegment[]) => {
    const allPositions = [...body, head];
    const minX = Math.min(...allPositions.map(p => p.x));
    const maxX = Math.max(...allPositions.map(p => p.x));
    const minY = Math.min(...allPositions.map(p => p.y));
    const maxY = Math.max(...allPositions.map(p => p.y));
    
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  };
  
  // State declarations
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
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
  const [gameSpeed, setGameSpeed] = useState<number>(250); // Starting speed: 250ms

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
    setGameSpeed(200);
    setGameStarted(false);
    setGameOver(false);
    setShowTitleScreen(true);
    setCountdown(null);
  };

  // Direction change handler
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (!gameStarted || countdown !== null || showTitleScreen) return;
    
    setSnake(prev => {
      const opposites: Record<Direction, Direction> = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
      };
      if (opposites[newDirection] !== prev.direction && 
        (prev.direction === null || newDirection !== prev.direction)) {
      return { ...prev, direction: newDirection };
      }
      return prev;
    });
  }, [gameStarted, countdown, showTitleScreen]);

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
    if (!gameStarted || gameOver || countdown !== null || showTitleScreen) return;

    let lastMove = Date.now();
    const moveSnake = () => {
      const now = Date.now();
      if (now - lastMove < gameSpeed) {
        return; // Skip if not enough time has passed
      }
      lastMove = now;

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
          
          // Increase game speed when food is eaten
          setGameSpeed(prevSpeed => Math.max(100, prevSpeed - 5)); // Decrease interval by 5ms, minimum 70ms

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

    const gameLoop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, countdown, showTitleScreen, foods, spawnFood, foodCounts, gameSpeed]);

  // Render
  return (
    <div 
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: `url('/assets/bg7.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000000',
      }}
    >
      <GlobalStyles />

      {/* Top Marquee */}
      <div className="w-full pb-4">
        <Marquee direction="left" />
      </div>

      {/* Main Game Content */}
      <div className={'flex-1 flex flex-col items-center justify-start ' + dotGothic16.className}>
        {/* Game Canvas */}
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

        {/* Countdown display */}
        {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-8xl font-bold animate-pulse" style={{ color: '#5bff3e' }}>
                  {countdown}
                </div>
              </div>
            )}

            {/* Title Screen */}
            {showTitleScreen && (
              <div className="fixed inset-0 flex items-center justify-center" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 50 }}>
                <div className="p-6 max-w-sm w-full mx-4"
                     style={{
                       backgroundColor: '#260601',
                       border: '4px solid #ff71de'
                     }}>
                  <h2 className={"text-4xl font-bold text-center mb-0 tracking-normal " + dotGothic16.className}
                      style={{ color: '#ffce00' }}>
                    HUAT THE SNAKE
                  </h2>
                  <h3 className="text-xl font-bold text-center mb-4 tracking-normal" style={{ color: '#ffce00' }}>
                    v1.0
                  </h3>
                    
                  {/* How to Play Section */}
                  <div className={"text-center " + dotGothic16.className}>
                    <h3 className="text-xl mb-2" style={{ color: '#5bff3e' }}>
                      How to Play
                    </h3>
                    <p className="mb-4" style={{ color: '#e0e0e0' }}>
                      Navigate the fortune land with these snake head buttons:
                    </p>

                    {/* Controller Display */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <img src={controllerImages.up} alt="Up" className="w-8 h-8" />
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 left-0">
                        <img src={controllerImages.left} alt="Left" className="w-8 h-8" />
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 right-0">
                        <img src={controllerImages.right} alt="Right" className="w-8 h-8" />
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                        <img src={controllerImages.down} alt="Down" className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Fortune Symbols */}
                    <h3 className="text-xl mb-2" style={{ color: '#5bff3e' }}>
                      Seek your fortunes
                    </h3>
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[
                        { type: 'heart', meaning: 'love' },
                        { type: 'smile', meaning: 'health' },
                        { type: 'money', meaning: 'wealth' },
                        { type: 'book', meaning: 'wisdom' }
                      ].map(({ type, meaning }) => (
                        <div key={type} className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1">
                            <PixelSymbol type={type as FoodType} />
                          </div>
                          <div style={{ color: '#e0e0e0' }}>{meaning}</div>
                        </div>
                      ))}
                    </div>

                    {/* Start Button */}
                    <button 
                      onClick={() => {
                        setShowTitleScreen(false);
                        setCountdown(3);
                        const countdownInterval = setInterval(() => {
                          setCountdown(prev => {
                            if (prev === 1) {
                              clearInterval(countdownInterval);
                              setGameStarted(true);
                              setSnake(prevSnake => ({
                                ...prevSnake,
                                direction: 'RIGHT'
                              }));
                              return null;
                            }
                            return prev ? prev - 1 : null;
                          });
                        }, 1000);
                      }}
                      className={`
                        px-4 py-2 tracking-wider 
                        ${dotGothic16.className}
                        transform transition-all duration-100
                        hover:scale-95
                        active:scale-90
                        active:brightness-150
                        hover:brightness-125
                      `}
                      style={{
                        backgroundColor: '#000000',
                        border: '2px solid #61f700',
                        color: '#61f700',
                        cursor: 'pointer'
                      }}
                    >
                      START GAME
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Controller with padding */}
        <div className="py-0">
            <CustomGameController 
              onDirectionChange={handleDirectionChange}
              controllerImages={controllerImages}
            />
        </div>
      </div>
    </div>

      {/* Bottom Marquee */}
      <div className="w-full py-0">
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
        className={"text-2xl font-bold text-center mb-4 tracking-normal " + dotGothic16.className}
        style={{ color: '#ffce00' }}
      >
         $$$MASHING MOVE$$$
      </h2>
      <div className={"text-center " + dotGothic16.className}>
        {(() => {
          const bounds = findSnakeBounds(snake.head, snake.body);
          return (
            <div className="w-full my-4">
              <div className="mx-auto" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${bounds.width}, 16px)`,
                gridTemplateRows: `repeat(${bounds.height}, 16px)`,
                gap: '1px',
                width: 'fit-content'
              }}>
                {Array.from({ length: bounds.height }, (_, y) => 
                  Array.from({ length: bounds.width }, (_, x) => {
                    const actualX = x + bounds.minX;
                    const actualY = y + bounds.minY;
                    
                    // Check if this position is the head
                    if (actualX === snake.head.x && actualY === snake.head.y) {
                      return (
                        <div key={`${x}-${y}`} className="relative" style={{ width: '16px', height: '16px' }}>
                          <SnakeHead direction={snake.direction} frame={0} />
                        </div>
                      );
                    }
                    
                    // Check if this position is part of the body
                    const bodySegment = snake.body.find(segment => 
                      segment.x === actualX && segment.y === actualY
                    );
                    
                    if (bodySegment) {
                      return (
                        <div key={`${x}-${y}`} className="relative" style={{ width: '16px', height: '16px' }}>
                          <PixelSymbol type={bodySegment.type} />
                        </div>
                      );
                    }
                    
                    // Empty cell
                    return <div key={`${x}-${y}`} style={{ width: '16px', height: '16px' }} />;
                  })
                )}
              </div>
            </div>
          );
        })()}
        <p 
          className="mb-4 tracking-wide"
          style={{ color: '#e0e0e0' }}
        >
          Go do something with these lucky figures!
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
        <HoldButton 
          onComplete={resetGame}
          holdDuration={1000} // 3 seconds hold duration
          className={"mt-6 px-4 py-3 tracking-wider " + dotGothic16.className}
          style={{
            backgroundColor: '#000000',
            border: '2px solid #61f700',
            color: '#61f700'
          }}
        >
          TAP & HOLD TO PLAY AGAIN
        </HoldButton>

        {/* Creator Attribution */}
        <div className="w-full text-center mt-6 mb-0 text-sm">
          <p style={{ color: '#ffffff' }}>
            Created by{' '}
            <a 
              href="https://www.popandstrange.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#ff71de',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              className="hover:opacity-80"
            >
              Pop & Strange
            </a>
          </p>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SnakeGame;