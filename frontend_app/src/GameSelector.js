import React from "react";

/**
 * PUBLIC_INTERFACE
 * Welcome selector to pick a game to play.
 */
function GameSelector({ onSelect }) {
  const GAMES = [
    {
      name: "Tic Tac Toe",
      key: "tictactoe",
      icon: "❌⭕️",
      desc: "Classic strategy game for 2 players."
    },
    {
      name: "Snake & Dice",
      key: "snakedice",
      icon: "🎲🐍",
      desc: "Dice racing fun with snakes and ladders."
    },
    {
      name: "Kid$mart",
      key: "kidsmart",
      icon: "💰👦👧",
      desc: "Business board game for kids—play, buy, save!"
    }
  ];
  return (
    <div className="App">
      <header className="App-header" style={{minHeight:"unset", paddingTop: 55, maxWidth: 430, margin:"0 auto"}}>
        <h1 style={{color: "#007bff", marginBottom: "7px"}}>Game Hub</h1>
        <div style={{color: "#666", fontSize: 18, fontWeight: 500, marginBottom: 24}}>Choose a Game</div>
        <div style={{
          display: "flex", flexDirection: "column", gap: 17, width: "100%",
          alignItems: "center", justifyContent: "center"
        }}>
          {GAMES.map(g => (
            <button
              key={g.key}
              onClick={() => onSelect(g.key)}
              style={{
                width: "100%", maxWidth: 330, background: "#fff",
                color: "#007bff", border: "2px solid #007bff", borderRadius: 14,
                fontWeight: 600, fontSize: 21, padding: "19px", margin: "0 auto",
                display: "flex", alignItems: "center", gap: 18,
                boxShadow: "0 2px 9px #0001", cursor: "pointer", transition:"0.2s"
              }}
            >
              <span style={{fontSize:38}}>{g.icon}</span>
              <span>
                {g.name}
                <div style={{fontSize:13, color:"#888", fontWeight: 500}}>{g.desc}</div>
              </span>
            </button>
          ))}
        </div>
        <div style={{marginTop: 57, fontSize: 13, color: "#888"}}>
          Simple, responsive & minimal — KAVIA Demo Games.
        </div>
      </header>
    </div>
  );
}
export default GameSelector;
