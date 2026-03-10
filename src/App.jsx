import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [gameMode, setGameMode] = useState("pvp"); // "pvp" (Player vs Player), "pvc" (Player vs CPU)

  const { winner, line: winningLine } = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  // Auto-play the CPU's turn
  useEffect(() => {
    if (gameMode === "pvc" && !isXTurn && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const cpuIndex = getCPUMove(board, "O", "X");
        if (cpuIndex !== null) {
          handleMove(cpuIndex, "O");
        }
      }, 600); // 600ms delay to feel natural
      return () => clearTimeout(timer);
    }
  }, [isXTurn, gameMode, board, winner, isDraw]);

  function handleMove(index, player) {
    const newBoard = [...board];
    newBoard[index] = player;

    const { winner: newWinner } = calculateWinner(newBoard);
    const newIsDraw = !newWinner && newBoard.every((square) => square !== null);

    if (newWinner) {
      setScores((prev) => ({ ...prev, [newWinner]: prev[newWinner] + 1 }));
    } else if (newIsDraw) {
      setScores((prev) => ({ ...prev, Draws: prev.Draws + 1 }));
    }

    setBoard(newBoard);
    setIsXTurn(player === "X" ? false : true);
  }

  function handleClick(index) {
    // If square is filled, game is over, or it's CPU's turn, ignore the click
    if (board[index] || winner || (gameMode === "pvc" && !isXTurn)) return;

    // In Single Player human is always X, but in PvP they take turns
    const currentPlayer = isXTurn ? "X" : "O";
    handleMove(index, currentPlayer);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
  }

  function resetScores() {
    setScores({ X: 0, O: 0, Draws: 0 });
    resetGame();
  }

  function switchMode(newMode) {
    if (gameMode !== newMode) {
      setGameMode(newMode);
      resetScores(); // Reset scores specifically when switching modes
    }
  }

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1 className="title">
          <span className="text-gradient">Tic Tac Toe</span>
        </h1>

        <div className="mode-selector">
          <button
            className={`mode-btn ${gameMode === "pvp" ? "active" : ""}`}
            onClick={() => switchMode("pvp")}
          >
            👥 2-Player (PvP)
          </button>
          <button
            className={`mode-btn ${gameMode === "pvc" ? "active" : ""}`}
            onClick={() => switchMode("pvc")}
          >
            🤖 1-Player (CPU)
          </button>
        </div>

        <div className="scoreboard">
          <div className="score-item player-x">
            <span className="player-label">{gameMode === "pvc" ? "You (X)" : "Player X"}</span>
            <span className="score-value">{scores.X}</span>
          </div>
          <div className="score-item draws">
            <span className="player-label">Draws</span>
            <span className="score-value">{scores.Draws}</span>
          </div>
          <div className="score-item player-o">
            <span className="player-label">{gameMode === "pvc" ? "CPU (O)" : "Player O"}</span>
            <span className="score-value">{scores.O}</span>
          </div>
        </div>

        <div className="status">
          {winner ? (
            <span className={`status-text winner-${winner.toLowerCase()}`}>
              Winner: {gameMode === "pvc" && winner === "O" ? "CPU" : `Player ${winner}`} 🎉
            </span>
          ) : isDraw ? (
            <span className="status-text draw">It's a Draw! 🤝</span>
          ) : (
            <span className="status-text next-player">
              Next Turn:
              <span className={`current-${isXTurn ? "x" : "o"}`}>
                {gameMode === "pvc" && !isXTurn ? " CPU" : ` ${isXTurn ? "X" : "O"}`}
              </span>
            </span>
          )}
        </div>

        <div className="board-wrapper">
          <div className="board">
            {board.map((value, index) => {
              const isWinningSquare = winningLine.includes(index);
              return (
                <button
                  key={index}
                  className={`square ${value ? `filled-${value.toLowerCase()}` : ""} ${isWinningSquare ? "winning-square" : ""}`}
                  onClick={() => handleClick(index)}
                  disabled={winner !== null || value !== null || (gameMode === "pvc" && !isXTurn)}
                  aria-label={`Square ${index}`}
                >
                  <span className={`symbol ${value ? "pop-in" : ""}`}>{value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={resetGame} className="btn-primary">
            Play Again
          </button>
          <button onClick={resetScores} className="btn-secondary">
            Reset Scores
          </button>
        </div>
      </div>

      {/* Background decorations */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: lines[i] };
    }
  }

  return { winner: null, line: [] };
}

// Simple but smart CPU Logic
function getCPUMove(board, cpuChar, playerChar) {
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const tempBoard = [...board];
      tempBoard[i] = cpuChar;
      if (calculateWinner(tempBoard).winner === cpuChar) return i;
    }
  }

  // 2. Try to block the player from winning
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const tempBoard = [...board];
      tempBoard[i] = playerChar;
      if (calculateWinner(tempBoard).winner === playerChar) return i;
    }
  }

  // 3. Take the center if available
  if (!board[4]) return 4;

  // 4. Try to take a random corner
  const corners = [0, 2, 6, 8].filter(index => !board[index]);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Try to take a random edge (fallback)
  const edges = [1, 3, 5, 7].filter(index => !board[index]);
  if (edges.length > 0) {
    return edges[Math.floor(Math.random() * edges.length)];
  }

  return null;
}

export default App;