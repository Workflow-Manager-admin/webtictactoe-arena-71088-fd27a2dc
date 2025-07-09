import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Kid$mart: A Business Board Game for Kids
 * - Move around the board, earn or spend money at different tiles,
 * - Buy simple items, goal is to finish with the most savings!
 * - Playable Solo (vs simple AI) or Two-Player (local hot-seat).
 */

// Style palette and color constants
const COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: "#28a745",
  bgIncome: "#e8f6e4",
  bgExpense: "#faf0e6",
  bgShop: "#fff3cd"
};

// Board tile definitions
const BOARD = [
  { type: "start", label: "Start", info: "Collect $10 on each lap!" },
  { type: "income", label: "🎉 Allowance!", amount: 10, info: "+$10" },
  { type: "expense", label: "🍦 Treats", amount: -4, info: "-$4" },
  { type: "shop", label: "🛍️ ToyShop", price: 7, item: "Toy", info: "Buy Toy $7" },
  { type: "income", label: "🎁 Gift", amount: 6, info: "+$6" },
  { type: "expense", label: "🚌 Bus Fare", amount: -2, info: "-$2" },
  { type: "income", label: "💼 Odd Job", amount: 8, info: "+$8" },
  { type: "shop", label: "🧃 SnackBar", price: 3, item: "Snack", info: "Buy Snack $3" },
  { type: "expense", label: "📚 Book", amount: -5, info: "-$5" },
  { type: "income", label: "🏆 Prize", amount: 5, info: "+$5" },
];

const BOARD_LENGTH = BOARD.length;
const INITIAL_MONEY = 15;
const WINNING_LAPS = 2; // How many laps ends the game

// PUBLIC_INTERFACE
function App() {
  // Theme management
  const [theme, setTheme] = useState("light");

  // Game State
  const [positions, setPositions] = useState([0, 0]); // player positions on board
  const [money, setMoney] = useState([INITIAL_MONEY, INITIAL_MONEY]);
  const [items, setItems] = useState([[], []]); // player inventories
  const [laps, setLaps] = useState([0, 0]);
  const [turn, setTurn] = useState(0); // 0 - P1, 1 - P2/AI
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState("Welcome to Kid$mart!");
  const [gameOver, setGameOver] = useState(false);
  const [vsAI, setVsAI] = useState(false);

  // Set theme on mount/update
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // AI turn effect
  useEffect(() => {
    if (vsAI && !gameOver && turn === 1) {
      const t = setTimeout(() => {
        handleRoll();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [vsAI, turn, gameOver]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  function resetGame() {
    setPositions([0, 0]);
    setMoney([INITIAL_MONEY, INITIAL_MONEY]);
    setItems([[], []]);
    setLaps([0, 0]);
    setTurn(0);
    setDice(null);
    setMessage("Game reset. Good luck!");
    setGameOver(false);
  }

  // PUBLIC_INTERFACE
  function startSoloMode() {
    setVsAI(true);
    resetGame();
    setMessage("Solo mode: You vs KidBot!");
  }

  // PUBLIC_INTERFACE
  function startTwoPlayerMode() {
    setVsAI(false);
    resetGame();
    setMessage("Two-Player mode: Take turns and learn!");
  }

  // PUBLIC_INTERFACE
  function handleRoll() {
    if (gameOver) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setDice(roll);

    let newPositions = [...positions];
    let newLaps = [...laps];
    let player = turn;
    let newPos = newPositions[player] + roll;

    let didLap = false;
    if (newPos >= BOARD_LENGTH) {
      newPos = newPos % BOARD_LENGTH;
      newLaps[player] += 1;
      didLap = true;
    }
    newPositions[player] = newPos;
    let lapMsg = didLap ? " - Completed a lap! (+$10)" : "";

    // Process board tile
    const square = BOARD[newPos];
    let newMoney = [...money];
    let newItems = [ [...items[0]], [...items[1]] ];
    let squareMsg = "";

    if (didLap) {
      newMoney[player] += 10; // Collect lap money
    }

    if (square.type === "income") {
      newMoney[player] += square.amount;
      squareMsg = `Found ${square.label} (+$${square.amount})!`;
    }
    else if (square.type === "expense") {
      newMoney[player] = Math.max(0, newMoney[player] + square.amount);
      squareMsg = `Paid for ${square.label} (${-square.amount} spent).`;
    }
    else if (square.type === "shop") {
      // For AI: 70% chance to buy if affordable, for human ask to buy
      if (vsAI && player === 1) {
        if (newMoney[1] >= square.price && Math.random() < 0.7) {
          newMoney[1] -= square.price;
          newItems[1].push(square.item);
          squareMsg = `KidBot bought a ${square.item}!`;
        } else {
          squareMsg = `KidBot skipped the shop.`;
        }
      } else if (!vsAI || player === 0) {
        if (newMoney[player] >= square.price) {
          // Offer to buy
          setTimeout(() => {
            if (window.confirm(`Buy ${square.item} for $${square.price}?`)) {
              const updItems = [ [...newItems[0]], [...newItems[1]] ];
              updItems[player].push(square.item);
              const updMoney = [...newMoney];
              updMoney[player] -= square.price;
              setItems(updItems);
              setMoney(updMoney);
              setMessage(`Bought ${square.item}${lapMsg && "!"}`);
            } else {
              setMessage(`You skipped the shop. ${lapMsg}`);
            }
          }, 100);
          // Pause, skip normal flow for shop prompt (to avoid state split)
          switchTurnAfterDelay(newPositions, newLaps, newMoney, newItems, player, lapMsg ? "Lap completed!" : "", true, didLap);
          return;
        } else {
          squareMsg = `Not enough to buy at the shop.`;
        }
      }
    } else if (square.type === "start") {
      // Nothing, just the start tile
      squareMsg = `Passing Start!`;
    }

    // Apply changes
    setPositions(newPositions);
    setLaps(newLaps);
    setMoney(newMoney);
    setItems(newItems);

    // Check for WIN
    let winner = null;
    if (newLaps[player] >= WINNING_LAPS) {
      winner = 
        newMoney[0] > newMoney[1]
          ? "Player 1"
          : newMoney[0] < newMoney[1]
          ? (vsAI ? "KidBot" : "Player 2")
          : "Tie";
      setGameOver(true);
      setMessage(
        `Game Over! ${winner === "Tie" ? "It's a tie! 🥇" : `${winner} wins with the most savings!`}`
      );
      return;
    }

    // Compose message
    const playerLabel = player === 0 ? "Player 1" : vsAI ? "KidBot" : "Player 2";
    const msg = `${playerLabel} rolled ${roll}. ${squareMsg} ${lapMsg}`;
    setMessage(msg);

    // Advance turn
    switchTurnAfterDelay(newPositions, newLaps, newMoney, newItems, player, msg, false, didLap);
  }

  // Helper: Advance turn after short delay for smooth flow
  function switchTurnAfterDelay(pos, laps, money, items, cur, msg, skipTurn, justLapped) {
    setTimeout(() => {
      if (gameOver) return;
      if (!skipTurn) {
        setTurn((cur) => (cur === 0 ? 1 : 0));
      }
    }, justLapped ? 650 : 350);
  }

  // Board rendering
  function renderBoard() {
    return (
      <div style={boardStyle()}>
        {BOARD.map((sq, idx) => {
          const p1 = positions[0] === idx ? "🟧" : "";
          const p2 = positions[1] === idx ? (vsAI ? "🤖" : "🟩") : "";
          let bg =
            sq.type === "income"
              ? COLORS.bgIncome
              : sq.type === "expense"
              ? COLORS.bgExpense
              : sq.type === "shop"
              ? COLORS.bgShop
              : "var(--bg-secondary, #f8f9fa)";
          return (
            <div
              key={idx}
              className="board-square"
              style={{
                background: bg,
                border: `1.5px solid var(--border-color,${COLORS.primary})`,
                borderRadius: 10,
                minHeight: 55,
                position: "relative",
                fontSize: 15,
                fontWeight: "500",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 3px",
                margin: "0",
                textAlign: "center"
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: 17 }}>{sq.label}</span>
              <span style={{ fontSize: 13, color: "#888" }}>{sq.info}</span>
              <div style={{
                position: "absolute",
                left: 7,
                top: 5,
                fontSize: 15
              }}>{p1}</div>
              <div style={{
                position: "absolute",
                right: 7,
                top: 5,
                fontSize: 15
              }}>{p2}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function boardStyle() {
    // Single row board, responsive
    const isMobile = window.innerWidth < 600;
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${BOARD_LENGTH}, minmax(48px, 1fr))`,
      gap: isMobile ? 4 : 8,
      maxWidth: isMobile ? 340 : 680,
      margin: "0 auto",
      background: "var(--bg-secondary, #f8f9fa)",
      borderRadius: 16,
      padding: isMobile ? 6 : 14,
      overflowX: isMobile ? "scroll" : "visible",
      boxShadow: "0 2px 10px #aaa1"
    };
  }

  // Responsive ui
  const isMobile = window.innerWidth < 600;

  // Helpers to display savings & items
  function renderItemSummary(p) {
    return items[p].length
      ? (
        <span style={{ fontSize: 13, color: COLORS.primary }}>
          —
          {items[p]
            .reduce((acc, x) => (acc[x] = (acc[x] || 0) + 1, acc), {})
            && Object.entries(
              items[p].reduce((acc, x) => (acc[x] = (acc[x] || 0) + 1, acc), {})
            ).map(([itm, cnt]) =>
              <span key={itm} style={{marginLeft: 2}}>{itm}×{cnt} </span>
            )}
        </span>
      )
      : <span style={{ fontSize: 12, color: "#ccc" }}>—</span>;
  }

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
        <h1 style={{ color: COLORS.primary, margin: "14px 0 8px" }}>Kid$mart</h1>
        <div style={{
          color: COLORS.secondary, fontSize: isMobile ? 16 : 18,
          marginBottom: 8, fontWeight: 500
        }}>{message}</div>

        {/* Mode selection */}
        <div style={{ margin: "8px 0 14px" }}>
          <button
            style={{
              background: vsAI ? COLORS.secondary : COLORS.primary,
              color: "#fff",
              borderRadius: 8, border: "none",
              marginRight: 6, fontWeight: "600",
              padding: isMobile ? "6px 16px" : "8px 22px",
              cursor: "pointer",
              boxShadow: vsAI ? "none" : "0 2px 8px #007bff22",
              opacity: vsAI ? 0.85 : 1
            }}
            onClick={startTwoPlayerMode}
            disabled={!vsAI}
          >2 Player</button>
          <button
            style={{
              background: vsAI ? COLORS.primary : COLORS.secondary,
              color: "#fff", borderRadius: 8,
              border: "none", fontWeight: "600",
              padding: isMobile ? "6px 16px" : "8px 22px",
              cursor: "pointer",
              boxShadow: vsAI ? "0 2px 8px #28a74544" : "none",
              opacity: vsAI ? 1 : 0.85
            }}
            onClick={startSoloMode}
            disabled={vsAI}
          >Solo</button>
        </div>

        {/* Main board */}
        <div style={{ margin: "0 0 9px" }}>
          {renderBoard()}
        </div>

        {/* Info: Money, Items, Controls */}
        <div style={{
          maxWidth: 555, margin: "0 auto 12px",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          alignItems: "center", gap: 18, justifyContent: "center"
        }}>
          <div style={{
            background: "var(--bg-secondary,#f8f9fa)",
            padding: isMobile ? "9px 9px" : "12px 32px",
            borderRadius: 12, boxShadow: "0 1px 6px #0001",
            textAlign: "center", minWidth: 110, fontSize: isMobile ? 15 : 17
          }}>
            <div>
              <span role="img" aria-label="P1">🟧</span>
              Player 1: <b>${money[0]}</b> {renderItemSummary(0)}
            </div>
            <div>
              <span role="img" aria-label={vsAI ? "AI" : "P2"}>
                {vsAI ? "🤖" : "🟩"}
              </span>
              {vsAI ? "KidBot" : "Player 2"}: <b>${money[1]}</b> {renderItemSummary(1)}
            </div>
          </div>

          <div style={{
            display: "flex", flexDirection: isMobile ? "row" : "column",
            gap: 10, alignItems: "center", justifyContent: "center"
          }}>
            <button
              className="roll-btn"
              style={{
                background: gameOver ? COLORS.secondary : COLORS.accent,
                color: "#fff", border: "none", borderRadius: 10,
                fontWeight: "bold", fontSize: isMobile ? 17 : 20,
                padding: isMobile ? "8px 26px" : "13px 45px",
                cursor: gameOver || (vsAI && turn === 1) ? "not-allowed" : "pointer",
                boxShadow: "0 2px 7px #28a74533"
              }}
              onClick={handleRoll}
              disabled={gameOver || (vsAI && turn === 1)}
            >
              {gameOver
                ? "Game Over"
                : turn === 0
                  ? `Roll Dice${vsAI ? "" : " (P1)"}`
                  : vsAI
                    ? "KidBot is moving..."
                    : "Roll Dice (P2)"}
            </button>
            <button
              className="reset-btn"
              style={{
                background: COLORS.secondary,
                color: "#fff", border: "none",
                borderRadius: 10, fontWeight: "bold",
                fontSize: isMobile ? 15 : 17,
                padding: isMobile ? "7px 14px" : "10px 22px",
                marginLeft: isMobile ? 12 : 0,
                marginTop: isMobile ? 0 : 10,
                cursor: "pointer"
              }}
              onClick={resetGame}
            >Reset</button>
          </div>
        </div>

        {/* Dice and Turn Display */}
        <div style={{
          fontSize: isMobile ? 17 : 21,
          margin: "0 0 10px",
          color: COLORS.accent,
          fontWeight: 600,
          minHeight: 28
        }}>
          {dice && !gameOver &&
            <span>{`Dice: ${"🎲".repeat(dice)} (${dice})`}</span>
          }
        </div>
        <div style={{
          fontSize: isMobile ? 14 : 17,
          color: COLORS.primary, marginBottom: 8, fontWeight: 500
        }}>
          {!gameOver ? (
            <>
              {turn === 0
                ? "Player 1's Turn 🟧"
                : (vsAI ? "KidBot's Turn 🤖" : "Player 2's Turn 🟩")}
            </>
          ) : (
            <span>
              Game complete! {money[0] > money[1]
                ? "Player 1 Wins 🟧"
                : money[1] > money[0]
                  ? (vsAI ? "KidBot Wins 🤖" : "Player 2 Wins 🟩")
                  : "It's a Tie! 🥇"}
            </span>
          )}
        </div>
        <div style={{
          marginTop: 10, color: "var(--text-secondary,#888)",
          fontSize: isMobile ? 12 : 14
        }}>
          Move around the board, earn or spend money, buy simple items.
          <br />
          Laps: Complete {WINNING_LAPS} laps! Highest savings wins.<br />
          <span style={{fontSize: 12}}>Business fun for kids — learn about saving & spending!</span>
        </div>
      </header>
    </div>
  );
}

export default App;
