// src/components/Suggestions.jsx
import React from 'react';

const SUGGESTIONS = [
  'How do I get started?',
  'Can I post jobs on Way2Hire?',
  'How does Way2Hire help in hiring',
  'About Us'
];

export default function Suggestions() {
  const send = (text) => {
    window.dispatchEvent(
      new CustomEvent('chat-send', {
        detail: { text }
      })
    );
  };

  return (
    <div className="suggestions">
      <h4>Quick suggestions</h4>
      <div className="suggestions-list">
        {SUGGESTIONS.map((q, i) => (
          <button
            key={i}
            className="pill"
            onClick={() => send(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
