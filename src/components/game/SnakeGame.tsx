"use client";

import React, { useState, useEffect, useCallback } from 'react';

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
            <rect x="2" y="1" width="2" height="2" fill="#ff0066"/>
            <rect x="4" y="1" width="2" height="2" fill="#ff0066"/>
            <rect x="1" y="2" width="2" height="2" fill="#ff0066"/>
            <rect x="3" y="2" width="2" height="2" fill="#ff3399"/>
            <rect x="5" y="2" width="2" height="2" fill="#ff0066"/>
            <rect x="2" y="3" width="2" height="2" fill="#ff3399"/>
            <rect x="4" y="3" width="2" height="2" fill="#ff3399"/>
            <rect x="3" y="4" width="2" height="2" fill="#ff3399"/>
          </svg>
        );
      case 'smile':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="2" y="1" width="4" height="1" fill="#ffcc00"/>
            <rect x="1" y="2" width="6" height="4" fill="#ffcc00"/>
            <rect x="2" y="6" width="4" height="1" fill="#ffcc00"/>
            <rect x="2" y="3" width="1" height="1" fill="#000000"/>
            <rect x="5" y="3" width="1" height="1" fill="#000000"/>
            <rect x="2" y="5" width="4" height="1" fill="#000000"/>
          </svg>
        );
      case 'money':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="2" y="1" width="4" height="1" fill="#00cc66"/>
            <rect x="1" y="2" width="6" height="4" fill="#00cc66"/>
            <rect x="2" y="6" width="4" height="1" fill="#00cc66"/>
            <rect x="3" y="2" width="2" height="4" fill="#004d26"/>
            <rect x="2" y="3" width="4" height="2" fill="#004d26"/>
          </svg>
        );
      case 'book':
        return (
          <svg viewBox="0 0 8 8" className="w-full h-full">
            <rect x="1" y="1" width="6" height="1" fill="#3366cc"/>
            <rect x="1" y="2" width="6" height="4" fill="#3366cc"/>
            <rect x="1" y="6" width="6" height="1" fill="#3366cc"/>
            <rect x="4" y="2" width="1" height="4" fill="#1a3366"/>
            <rect x="2" y="3" width="4" height="1" fill="#1a3366"/>
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
  const [mouthOpen, setMouthOpen] = useState<boolean>(true);

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
    setMouthOpen(true);
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

  // Mouth animation effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const mouthInterval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 200);
    return () => clearInterval(mouthInterval);
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
    <div className="min-h-screen bg-black px-4 py-6">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-yellow-300 text-center mb-6">
          Gong Xi Fa Cai
        </h1>
        
        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden mx-auto border-4 border-gray-700"
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE
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
              transform: `rotate(${
                snake.direction === 'UP' ? '-90deg' :
                snake.direction === 'DOWN' ? '90deg' :
                snake.direction === 'LEFT' ? '180deg' : '0deg'
              })`
            }}
          >
            <svg viewBox="0 0 8 8" className="w-full h-full">
              <rect x="1" y="1" width="6" height="6" fill="#ffcc00"/>
              <rect x="2" y="2" width="1" height="1" fill="#000000"/>
              <rect x="5" y="2" width="1" height="1" fill="#000000"/>
              {mouthOpen && <rect x="3" y="4" width="3" height="2" fill="#000000"/>}
            </svg>
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

        {/* Control Buttons */}
        <div className="relative w-48 h-48 mx-auto mt-4">
          <button
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 text-2xl text-white"
            onClick={() => handleDirectionChange('UP')}
          >
            ▲
          </button>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 text-2xl text-white"
            onClick={() => handleDirectionChange('LEFT')}
          >
            ◀
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 text-2xl text-white"
            onClick={() => handleDirectionChange('RIGHT')}
          >
            ▶
          </button>
          <button
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 text-2xl text-white"
            onClick={() => handleDirectionChange('DOWN')}
          >
            ▼
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-sm w-full mx-4 border-4 border-gray-700">
            <h2 className="text-2xl font-bold text-red-500 text-center mb-4">Gong Xi!</h2>
            <div className="text-center">
              <p className="mb-4 text-white">Your lucky numbers are:</p>
              <div className="grid grid-cols-4 gap-4">
                {FOOD_TYPES.map(type => (
                  <div key={type} className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2">
                      <PixelSymbol type={type} />
                    </div>
                    <div className="text-white">{foodCounts[type]}</div>
                  </div>
                ))}
              </div>
              <button 
                className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg border-2 border-red-700"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;