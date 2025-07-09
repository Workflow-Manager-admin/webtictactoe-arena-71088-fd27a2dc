import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// PUBLIC_INTERFACE
/**
 * App-wide theme toggle. Switch between light and dark, persist via localStorage and html attr.
 */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Try to load from localStorage, fallback to prefers-color-scheme, default light
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);
  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((th) => (th === "light" ? "dark" : "light"));
  }
  return [theme, toggleTheme];
}

/**
 * PUBLIC_INTERFACE
 * Chatbot app: Minimal light-themed UI; independent from other frontend apps.
 * Components: Chat history, user input, placeholder response (not connected to backend).
 */
function App() {
  // THEME HOOK
  const [theme, toggleTheme] = useTheme();

  // State holds history as {sender: "user"|"bot", text: "..." }
  const [history, setHistory] = useState([
    { sender: "bot", text: "Hi! I’m your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  function handleChange(e) {
    setInput(e.target.value);
  }
  function handleSend() {
    if (!input.trim()) return;
    const message = { sender: "user", text: input.trim() };
    setHistory((h) => [...h, message]);
    setInput("");
    // Simulate bot reply
    setTimeout(() => {
      setHistory((h) => [
        ...h,
        {
          sender: "bot",
          text: "This is a placeholder response! (AI logic to be added)"
        }
      ]);
    }, 600);
    inputRef.current.focus();
  }
  function handleInputKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chatbot-outer">
      <div className="chatbot-card">
        <header className="chatbot-header" style={{ position: 'relative' }}>
          <span className="chatbot-icon" aria-label="Chatbot">💬</span>
          <span className="chatbot-title">AI Chatbot</span>
          {/* Theme toggle button */}
          <button
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={toggleTheme}
            style={{
              position: "absolute",
              right: 12, top: 14, zIndex: 1,
              background: "var(--surface)",
              border: `1.2px solid var(--border)`,
              borderRadius: 8,
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 18,
              padding: "3px 13px 3px 8px",
              cursor: "pointer",
              boxShadow: "0 1px 7px #0069be0a",
              transition: "filter 0.2s"
            }}
          >
            {theme === "light" ? (
              <span role="img" aria-label="Switch to dark mode">🌙</span>
            ) : (
              <span role="img" aria-label="Switch to light mode">☀️</span>
            )}
            <span style={{
              marginLeft: 5,
              fontSize: 13,
              verticalAlign: "middle"
            }}>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </header>
        <main className="chatbot-history" aria-live="polite">
          {history.map((msg, idx) => (
            <div
              className={`chatbot-msg ${msg.sender === "user" ? "user" : "bot"}`}
              key={idx}
            >
              <span className="msg-bubble">{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </main>
        <form
          className="chatbot-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          autoComplete="off"
        >
          <textarea
            className="chatbot-input"
            placeholder="Type your message…"
            value={input}
            onChange={handleChange}
            onKeyDown={handleInputKey}
            rows={1}
            ref={inputRef}
            aria-label="Your message"
            spellCheck={true}
          />
          <button
            type="submit"
            className="chatbot-send"
            style={{ background: input.trim() ? "var(--primary)" : "var(--secondary)" }}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>
      <footer className="chatbot-footer">
        <span>
          <b style={{ color: "var(--primary)" }}>KAVIA Demo</b> &middot; AI Chatbot
          <span aria-hidden="true" style={{ marginLeft: 6, opacity: 0.55 }}>
            · {theme.charAt(0).toUpperCase()+theme.slice(1)} theme
          </span>
        </span>
      </footer>
    </div>
  );
}

export default App;
