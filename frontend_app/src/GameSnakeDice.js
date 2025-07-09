import React, { useState } from "react";

// Simple Snakes & Dice game
const COLORS = {
  primary: "#007bff",
  accent: "#28a745"
};
const BOARD_LEN = 20;
const SNAKES = { 11: 5, 18: 3 };
const LADDERS = { 4: 12, 8: 16 };
const WIN_TILE = BOARD_LEN - 1;

// PUBLIC_INTERFACE
function GameSnakeDice({ onBack }) {
  const [pos, setPos] = useState([0, 0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(null);
  const [msg, setMsg] = useState("Welcome to Snake & Dice!");
  const [gameOver, setGameOver] = useState(false);

  function rollDice() {
    if (gameOver) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    let next = pos[turn] + roll;
    let action = "";
    if (next in SNAKES) {
      action = `Oops! Snake! 🐍 back to ${SNAKES[next]+1}`;
      next = SNAKES[next];
    } else if (next in LADDERS) {
      action = `Yay! Ladder! 🪜 climb to ${LADDERS[next]+1}`;
      next = LADDERS[next];
    } else if (next > WIN_TILE) {
      next = pos[turn];
      action = "Cannot move, need exact roll!";
    }
    let nextPos = [ ...pos ];
    nextPos[turn] = next;
    setPos(nextPos);
    setDice(roll);

    if (next === WIN_TILE) {
      setGameOver(true);
      setMsg(`Player ${turn+1} wins! 🎉`);
    } else {
      setMsg(`Player ${turn+1} rolled ${roll}. ${action}`);
      setTurn(t => t ? 0 : 1);
    }
  }
  function resetGame() {
    setPos([0,0]);
    setTurn(0);
    setDice(null);
    setMsg("Game reset. Ready!");
    setGameOver(false);
  }
  function renderBoard() {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 4,
        maxWidth: 320,
        margin: "0 auto"
      }}>
        {Array(BOARD_LEN).fill(0).map((_, i) => (
          <div key={i} className="board-square"
            style={{
              height: 38,
              background: i===pos[0] ? "#E87A41" : i===pos[1] ? COLORS.primary : "#f8f9fa",
              color: i===pos[0]||i===pos[1] ? "#fff" : "#212529",
              border: "1.2px solid var(--border-color,#e0e0e0)",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 500,
              position: "relative"
            }}
          >
            <span>{i+1}</span>
            {i in SNAKES ? <span style={{fontSize:13}}>🐍</span> : ""}
            {i in LADDERS ? <span style={{fontSize:13}}>🪜</span> : ""}
            {i===pos[0] && <div style={{ position: "absolute", top:4, left:4, fontSize:13}}>P1</div>}
            {i===pos[1] && <div style={{ position: "absolute", bottom:4, right:4, fontSize:13}}>P2</div>}
          </div>
        ))}
      </div>
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
        <h1 style={{ color: COLORS.primary, margin: "14px 0 8px" }}>Snake & Dice</h1>
        <div style={{color: COLORS.accent, fontSize: isMobile ? 17 : 20, marginBottom: 11, fontWeight: 500}}>
          {msg}
        </div>
        {renderBoard()}
        <div style={{
          marginTop: 12, display: "flex", gap: 10, alignItems: "center", justifyContent: "center"
        }}>
          <button
            style={{
              background: gameOver ? COLORS.secondary : COLORS.accent,
              color: "#fff", borderRadius: 10, border: "none",
              fontWeight: "600", fontSize: isMobile ? 15 : 18,
              padding: isMobile ? "9px 29px" : "12px 38px", cursor: gameOver ? "not-allowed" : "pointer"
            }}
            onClick={rollDice}
            disabled={gameOver}
          >{gameOver ? "Game Over" : `Roll Dice (${turn ? "P2" : "P1"})`}</button>
          <button
            style={{
              background: COLORS.primary, color: "#fff", borderRadius: 9, border: "none",
              fontWeight: "600", fontSize: isMobile ? 13 : 15, padding: isMobile ? "7px 13px" : "9px 22px", cursor: "pointer"
            }}
            onClick={resetGame}
          >Reset</button>
        </div>
        <div style={{
          marginTop: 8, color: "var(--text-secondary,#777)",
          fontSize: isMobile ? 13 : 15
        }}>
          Snakes send you back, ladders boost you forward! First to reach the end wins.
        </div>
      </header>
    </div>
  );
}
export default GameSnakeDice;
