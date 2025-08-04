// // PuzzleGame.jsx
import { useState, useEffect } from 'react';

const PuzzleGame = () => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const onComplete = () => {};
  // Initialize game on mount
  useEffect(() => {
    initializeGame();

    // Timer interval increments every second
    const timer = setInterval(() => setTime(t => t + 1), 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);

  const initializeGame = () => {
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    const shuffled = shuffleArray(numbers);
    setTiles([...shuffled, null]); // null is the empty tile
    setMoves(0);
    setTime(0);
  };

  // Fisher-Yates shuffle for a proper shuffle
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const moveTile = (index) => {
    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    // Check if the clicked tile is adjacent to the empty tile
    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (!isAdjacent) return;

    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(m => m + 1);

    // Check if puzzle is solved: tiles 1-15 in order, last is null
    const solved = newTiles.slice(0, 15).every((tile, i) => tile === i + 1) && newTiles[15] === null;

    if (solved) {
      onComplete({ moves: moves + 1, time }); // moves + 1 because we just moved
    }
  };

  return (
    <div className="puzzle-game">
      <div className="puzzle-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 80px)',
        gridGap: '8px',
        justifyContent: 'center',
      }}>
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`puzzle-tile ${tile === null ? 'empty' : ''}`}
            onClick={() => tile !== null && moveTile(index)}
            style={{
              height: 80,
              width: 80,
              lineHeight: '80px',
              textAlign: 'center',
              backgroundColor: tile === null ? '#ddd' : '#3498db',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              userSelect: 'none',
              cursor: tile === null ? 'default' : 'pointer',
              borderRadius: 6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            }}
          >
            {tile}
          </div>
        ))}
      </div>

      <div className="puzzle-stats" style={{ marginTop: 20, textAlign: 'center' }}>
        <p>Moves: {moves}</p>
        <p>Time: {time}s</p>
        <button
          onClick={initializeGame}
          style={{
            marginTop: 10,
            padding: '8px 16px',
            fontSize: 16,
            borderRadius: 6,
            cursor: 'pointer',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default PuzzleGame;
