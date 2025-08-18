import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";




const PuzzleGame = () => {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const showCongratulation = () => {
  Swal.fire({
      title: 'Assessment Complete!',
      html: `
        <div class="text-center">
          <div class="mb-4 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-lg mb-2">You've successfully completed all assessment sections!</p>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <p class="font-medium">Your Results:</p>
            <p>• Puzzle solved in ${moves} moves</p>
            <p>• Total time: ${formatTime(time)}</p>
          </div>
          <p class="text-gray-600">Our HR team will review your results and contact you within 3-5 business days regarding next steps.</p>
        </div>
      `,
      confirmButtonText: 'Return to Dashboard',
      confirmButtonColor: '#3b82f6',
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-xl border border-gray-200',
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-4 py-2 rounded-lg font-medium'
      }
    }).then(() => {
      navigate(`/seeker/jobs`);
    });
  };

  const onComplete = () => {
    setIsSolved(true);
    showCongratulation();
  };

  useEffect(() => {
    initializeGame();
    showCongratulation();

    const timer = setInterval(() => {
      if (!isSolved) {
        setTime(t => t + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSolved]);

  const initializeGame = () => {
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    const shuffled = shuffleArray(numbers);
    setTiles([...shuffled, null]);
    setMoves(0);
    setTime(0);
    setIsSolved(false);
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const moveTile = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (!isAdjacent) return;

    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(m => m + 1);

    const solved = newTiles.slice(0, 15).every((tile, i) => tile === i + 1) && newTiles[15] === null;
    if (solved) onComplete({ moves: moves + 1, time });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-stretch h-full">
        {/* How to Play Section */}
        <div className="lg:w-1/4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-xl font-bold">How to Play</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                  1
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Objective:</span> Arrange the tiles in order from 1 to 15.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                  2
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Moving Tiles:</span> Click adjacent tiles to move them.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                  3
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Strategy:</span> Solve row by row from top to bottom.
                </p>
              </div>
            </div>
            
            <div className="mt-auto pt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                  <li>Plan moves ahead</li>
                  <li>Be patient with last rows</li>
                  <li>Practice improves speed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board Section */}
        <div className="lg:w-2/4 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl font-bold text-center">15 Puzzle Game</h1>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {isSolved && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                <p className="font-bold text-center">Puzzle Solved!</p>
              </div>
            )}
            
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                {tiles.map((tile, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      tile === null
                        ? 'bg-gray-100 border border-gray-200'
                        : `bg-gradient-to-br ${
                            isSolved
                              ? 'from-emerald-200 to-teal-300 border-teal-300'
                              : 'from-blue-500 to-indigo-600 border-blue-400'
                          } shadow-md cursor-pointer`
                    }`}
                    onClick={() => tile !== null && moveTile(index)}
                  >
                    <span className={`text-2xl font-bold ${
                      tile ? 'text-white' : 'text-gray-400'
                    }`}>
                      {tile}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats Section */}
        <div className="lg:w-1/4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-xl font-bold">Game Stats</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium">Moves:</span>
                  <span className="text-2xl font-bold text-blue-600">{moves}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Time:</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatTime(time)}</span>
                </div>
              </div>

              {isSolved && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Completed!</h3>
                  <p className="text-sm text-green-700">
                    Solved in {moves} moves ({formatTime(time)})
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 space-y-4">
              <button
                onClick={initializeGame}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Restart Game
              </button>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Difficulty</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-yellow-400 to-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, moves)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-blue-700 mt-1">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;