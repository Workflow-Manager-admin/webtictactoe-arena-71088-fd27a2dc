import React, { useState } from "react";

// PUBLIC_INTERFACE
function GameTicTacToe({ onBack }) {
  const COLORS = {
    primary: "#007bff",
    secondary: "#6c757d"
  };

  // X always goes first!
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXisNext] = useState(true);
  const [status, setStatus] = useState("Next: X");
  const [gameOver, setGameOver] = useState(false);

  function calculateWinner(sq) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let [a,b,c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[b] === sq[c]) return sq[a];
    }
    return null;
  }
  function handleClick(i) {
    if (board[i] || gameOver) return;
    const boardCopy = [...board];
    boardCopy[i] = xIsNext ? "X" : "O";
    const winner = calculateWinner(boardCopy);
    if (winner) {
      setStatus(`Winner: ${winner}`);
      setGameOver(true);
    } else if (boardCopy.every(x => x)) {
      setStatus("Draw");
      setGameOver(true);
    } else {
      setXisNext(!xIsNext);
      setStatus(`Next: ${xIsNext ? "O" : "X"}`);
    }
    setBoard(boardCopy);
  }
  function resetGame() {
    setBoard(Array(9).fill(null));
    setXisNext(true);
    setStatus("Next: X");
    setGameOver(false);
  }
  function renderSquare(i) {
    return (
      <button
        key={i}
        className="board-square"
        style={{
          width: 64, height: 64, fontSize: 34, fontWeight: 700, background: "#fff",
          color: "#212529", border: "1.5px solid var(--border-color,#eee)", borderRadius: 8, margin: 2
        }}
        onClick={() => handleClick(i)}
        aria-label={`Square ${i+1}, value ${board[i] ?? "empty"}`}
        disabled={!!board[i] || gameOver}
      >
        {board[i]}
      </button>
    );
  }
  const isMobile = window.innerWidth < 600;
  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: "unset" }}>
        {onBack &&
          <button
            className="theme-toggle"
            onClick={onBack}
            aria-label="Back to game selector"
            style={{ left: 20, right: "auto", top: 20, position: "absolute", background: "#eee", color: "#444", fontSize: 20, padding: "8px 17px" }}
          >←</button>
        }
        <h1 style={{ color: COLORS.primary, margin: "14px 0 8px" }}>Tic Tac Toe</h1>
        <div style={{color: COLORS.secondary, fontSize: isMobile ? 18 : 21, marginBottom: 13, fontWeight: 500}}>
          {status}
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: isMobile ? 3 : 9,
          width: isMobile ? 206 : 220,
          margin: "0 auto"
        }}>
          {Array(9).fill(0).map((_, i) => renderSquare(i))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button
            style={{
              background: COLORS.primary, color: "#fff", borderRadius: 9, border: "none",
              fontWeight: "600", fontSize: isMobile ? 15 : 19, padding: isMobile ? "8px 31px" : "12px 37px", cursor: "pointer"
            }}
            onClick={resetGame}
          >Reset</button>
        </div>
        <div style={{marginTop: 18, fontSize: 13, color: "var(--text-secondary, #777)"}}>
          {`Classic two-player mode on one device. First to align 3 in a row wins.`}
        </div>
      </header>
    </div>
  );
}

export default GameTicTacToe;
