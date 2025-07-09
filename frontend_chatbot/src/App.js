import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Chatbot app: Minimal light-themed UI; independent from other frontend apps.
 * Components: Chat history, user input, placeholder response (not connected to backend).
 */
function App() {
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
        <header className="chatbot-header">
          <span className="chatbot-icon" aria-label="Chatbot">💬</span>
          <span className="chatbot-title">AI Chatbot</span>
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
        </span>
      </footer>
    </div>
  );
}

export default App;
