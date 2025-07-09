import React, { useState } from "react";
import "./App.css";
import GameSelector from "./GameSelector";
import GameKidSmart from "./GameKidSmart";
import GameTicTacToe from "./GameTicTacToe";
import GameSnakeDice from "./GameSnakeDice";

// PUBLIC_INTERFACE
/**
 * Unified Game App - Select and play any integrated game.
 * Renders GameSelector on launch and routes to the selected game.
 */
function App() {
  const [game, setGame] = useState(null); // null = selector

  function handleSelect(key) {
    setGame(key);
  }

  function handleBack() {
    setGame(null);
  }

  if (game === "kidsmart") {
    return <GameKidSmart onBack={handleBack} />;
  }
  if (game === "tictactoe") {
    return <GameTicTacToe onBack={handleBack} />;
  }
  if (game === "snakedice") {
    return <GameSnakeDice onBack={handleBack} />;
  }

  // Show selector by default
  return <GameSelector onSelect={handleSelect} />;
}

export default App;
