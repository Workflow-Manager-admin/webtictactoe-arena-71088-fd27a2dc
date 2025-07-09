import React, { useState, useEffect } from "react";
import "./App.css";

// Theme and styling color palette (from config and CSS vars)
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
  accent: '#28a745'
};

const BOARD_SIZE = 30; // Winning position
const DICE_SIDES = 6;
const SNAKES = {
  14: 4,
  19: 8,
  22: 20,
  24: 16
};
const LADDERS = {
  3: 15,
  6: 12,
  11: 26,
  17: 21
};
const SOLO_AI_DELAY = 900; // ms

// Helper to get square color for the board (minimally styled, alternating accent/secondary)
function getSquareColor(index) {
  return index % 2 === 0
    ? `var(--bg-secondary,${COLORS.secondary})`
    : `var(--border-color,${COLORS.accent})`;
}

// PUBLIC_INTERFACE
function App() {
  // Theme
  const [theme, setTheme] = useState("light");
  // Game state
  const [positions, setPositions] = useState([0, 0]);
  const [scores, setScores] = useState([0, 0]);
  const [turn, setTurn] = useState(0); // 0: Player 1, 1: Player 2/AI
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState("Welcome to Snake and Dice!");
  const [gameOver, setGameOver] = useState(false);
  const [vsAI, setVsAI] = useState(false);

  // Effect to set CSS theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Effect for AI move (solo mode)
  useEffect(() => {
    if (
      vsAI &&
      !gameOver &&
      turn === 1
    ) {
      // Let AI roll after human's move.
      const aiTimer = setTimeout(() => {
        rollDice();
      }, SOLO_AI_DELAY);
      return () => clearTimeout(aiTimer);
    }
  }, [vsAI, turn, gameOver]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  function resetGame() {
    setPositions([0, 0]);
    setScores([0, 0]);
    setTurn(0);
    setGameOver(false);
    setDice(null);
    setMessage("Game restarted. 🎲");
  }

  // PUBLIC_INTERFACE
  function startSoloMode() {
    setVsAI(true);
    resetGame();
    setMessage("Solo mode: You vs AI. Good luck!");
  }

  // PUBLIC_INTERFACE
  function startTwoPlayerMode() {
    setVsAI(false);
    resetGame();
    setMessage("Two Player mode: P1 and P2, let's roll!");
  }

  // Handle dice roll and move logic
  // PUBLIC_INTERFACE
  function rollDice() {
    if (gameOver) return;
    const diceRoll = Math.floor(Math.random() * DICE_SIDES) + 1;
    setDice(diceRoll);

    const currPos = positions[turn];
    let nextPos = currPos + diceRoll;

    let moveMessage = `Player ${turn === 0 ? "1" : (vsAI ? "AI" : "2")} rolled a ${diceRoll}. `;

    // Check for overshoot: must land exactly at BOARD_SIZE
    if (nextPos > BOARD_SIZE) {
      moveMessage += "Overshot! Stay in place.";
      updateStateAfterMove(currPos, turn, moveMessage, false);
      return;
    }

    // Ladders
    if (LADDERS[nextPos]) {
      moveMessage += `Ladder up from ${nextPos} to ${LADDERS[nextPos]}! `;
      nextPos = LADDERS[nextPos];
    }
    // Snakes
    if (SNAKES[nextPos]) {
      moveMessage += `Oh no, snake! Down from ${nextPos} to ${SNAKES[nextPos]}. `;
      nextPos = SNAKES[nextPos];
    }

    // Check win
    let isWin = false;
    if (nextPos === BOARD_SIZE) {
      moveMessage += `🎉 Player ${turn === 0 ? "1" : (vsAI ? "AI" : "2")} wins!`;
      isWin = true;
    }

    updateStateAfterMove(nextPos, turn, moveMessage, isWin);
  }

  function updateStateAfterMove(nextPos, player, msg, didWin) {
    const newPositions = [...positions];
    newPositions[player] = nextPos;

    const newScores =
      nextPos === positions[player]
        ? scores
        : scores.map((s, idx) =>
            idx === player ? s + 1 : s
          );

    setPositions(newPositions);
    setScores(newScores);
    setMessage(msg);
    setGameOver(didWin);

    if (!didWin) {
      setTurn((prev) => (prev === 0 ? 1 : 0));
    }
  }

  // Helper: render board squares with snakes/ladders
  function renderBoard() {
    const squares = [];
    // Board: 5x6 grid for 30 squares (label from 1 - BOARD_SIZE)
    for (let i = 1; i <= BOARD_SIZE; ++i) {
      // Player markers
      const p1 = positions[0] === i ? "🟧" : "";
      const p2 = positions[1] === i ? (vsAI ? "🤖" : "🟩") : "";
      // Snake/ladder
      let label = i;
      if (LADDERS[i]) label = `⬆️${i}`;
      if (SNAKES[i]) label = `🐍${i}`;
      squares.push(
        <div
          key={i}
          style={{
            background: getSquareColor(i),
            border: `1px solid var(--border-color,${COLORS.primary})`,
            color:
              LADDERS[i]
                ? COLORS.accent
                : SNAKES[i]
                  ? COLORS.primary
                  : "inherit",
            fontWeight: LADDERS[i] || SNAKES[i] ? "bold" : "normal",
            borderRadius: "8px",
            padding: 0,
            position: "relative",
            boxSizing: "border-box",
            aspectRatio: "1/1"
          }}
          className="board-square"
        >
          <span style={{ fontSize: "0.85em" }}>{label}</span>
          <div style={{
            position: "absolute",
            bottom: 2,
            left: "5%",
            fontSize: "1.2em",
            width: "90%",
            display: "flex",
            justifyContent: "space-between"
          }}>
            {/* Players */}
            <span>{p1}</span>
            <span>{p2}</span>
          </div>
        </div>
      );
    }
    return squares;
  }

  // Responsive grid: 6 columns for board
  function boardGridStyle() {
    return {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(32px, 1fr))",
      gap: 4,
      maxWidth: 400,
      margin: "0 auto",
      background: "var(--bg-secondary, #f8f9fa)",
      borderRadius: 16,
      padding: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
    };
  }

  // Responsive: text sizing & controls
  const isMobile = window.innerWidth < 600;

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: "unset" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div>
          <h1 style={{ color: COLORS.primary, margin: "14px 0 6px" }}>Snake and Dice</h1>
          <div style={{
            color: COLORS.secondary,
            fontSize: isMobile ? 16 : 18,
            marginBottom: 8,
            fontWeight: 500
          }}>
            {message}
          </div>
        </div>

        {/* Mode Switch */}
        <div style={{ margin: "8px 0 16px" }}>
          <button
            style={{
              background: vsAI ? COLORS.secondary : COLORS.primary,
              color: "#fff",
              borderRadius: 8,
              border: "none",
              marginRight: 6,
              fontWeight: "600",
              padding: isMobile ? "6px 16px" : "8px 22px",
              cursor: "pointer",
              boxShadow: vsAI ? "none" : "0 2px 8px #007bff22",
              opacity: vsAI ? 0.85 : 1
            }}
            onClick={startTwoPlayerMode}
            disabled={!vsAI}
          >
            2 Player
          </button>
          <button
            style={{
              background: vsAI ? COLORS.primary : COLORS.secondary,
              color: "#fff",
              borderRadius: 8,
              border: "none",
              fontWeight: "600",
              padding: isMobile ? "6px 16px" : "8px 22px",
              cursor: "pointer",
              boxShadow: vsAI ? "0 2px 8px #28a74544" : "none",
              opacity: vsAI ? 1 : 0.85
            }}
            onClick={startSoloMode}
            disabled={vsAI}
          >
            Solo
          </button>
        </div>

        {/* Game Board */}
        <div style={{ margin: "0 0 10px" }}>
          <div style={boardGridStyle()}>{renderBoard()}</div>
        </div>

        {/* Info and Controls */}
        <div style={{
          maxWidth: 420,
          margin: "0 auto 18px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: 16,
          justifyContent: "center"
        }}>

          <div style={{
            background: "var(--bg-secondary,#f8f9fa)",
            padding: isMobile ? "8px 13px" : "10px 30px",
            borderRadius: 14,
            boxShadow: "0 1px 7px #0001",
            textAlign: "center",
            minWidth: 110,
            fontSize: isMobile ? 15 : 17
          }}>
            <div>
              <span role="img" aria-label="P1">🟧</span>
              Player 1: <b>{scores[0]}</b>
            </div>
            <div>
              <span role="img" aria-label={vsAI ? "AI" : "P2"}>
                {vsAI ? "🤖" : "🟩"}
              </span>
              {vsAI ? "AI" : "Player 2"}: <b>{scores[1]}</b>
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            gap: 10,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <button
              className="roll-btn"
              style={{
                background: gameOver ? COLORS.secondary : COLORS.accent,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: isMobile ? 17 : 20,
                padding: isMobile ? "8px 34px" : "12px 50px",
                cursor: gameOver ? "not-allowed" : "pointer",
                boxShadow: "0 2px 7px #28a74533"
              }}
              onClick={rollDice}
              disabled={gameOver || (vsAI && turn === 1)}
            >
              {gameOver
                ? "Game Over"
                : turn === 0
                  ? `Roll Dice${vsAI ? "" : " (P1)"}`
                  : vsAI
                    ? "AI is thinking..."
                    : "Roll Dice (P2)"}
            </button>
            <button
              className="reset-btn"
              style={{
                background: COLORS.secondary,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: isMobile ? 15 : 17,
                padding: isMobile ? "7px 16px" : "10px 22px",
                marginLeft: isMobile ? 12 : 0,
                marginTop: isMobile ? 0 : 10,
                cursor: "pointer"
              }}
              onClick={resetGame}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Dice, Turn & State */}
        <div style={{
          fontSize: isMobile ? 18 : 23,
          margin: "0 0 10px",
          color: COLORS.accent,
          fontWeight: 600,
          minHeight: 32
        }}>
          {dice && !gameOver &&
            <span>{`Dice: ${"🎲".repeat(dice)} (${dice})`}</span>
          }
        </div>
        <div style={{
          fontSize: isMobile ? 16 : 19,
          color: COLORS.primary,
          marginBottom: 10,
          fontWeight: 500
        }}>
          {!gameOver ? (
            <>
              {turn === 0
                ? "Player 1's Turn 🟧"
                : (vsAI ? "AI's Turn 🤖" : "Player 2's Turn 🟩")}
            </>
          ) : (
            <span>
              {positions[0] === BOARD_SIZE
                ? "Player 1 Wins! 🟧"
                : positions[1] === BOARD_SIZE
                  ? (vsAI ? "AI Wins! 🤖" : "Player 2 Wins! 🟩")
                  : "Game Over"}
            </span>
          )}
        </div>
        <div style={{
          marginTop: 10,
          color: "var(--text-secondary,#888)",
          fontSize: isMobile ? 13 : 14
        }}>
          <span>
            Reach square {BOARD_SIZE} exactly to win.<br />
            Ladders: ⬆️, Snakes: 🐍. Overshoot? You stay in place!
          </span>
        </div>
      </header>
    </div>
  );
}

export default App;
