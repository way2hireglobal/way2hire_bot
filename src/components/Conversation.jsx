// src/components/Conversation.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Carousel from './Carousel';
import './Carousel.css';
import homeCarouselItems from '../data/homeCarousel';

export default function Conversation() {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // helper to push message
  const push = useCallback((msg) => {
    setMessages(m => [...m, { id: uuidv4(), ...msg }]);
  }, []);

  // ✅ CORRECT auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // handle carousel button click
  const handlePostback = (postback) => {
    handleSend(postback);
  };

  // send message to Dialogflow
  const handleSend = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    push({ from: 'user', text });

    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
    }

    try {
      const res = await fetch('/.netlify/functions/dialogflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId: 'web-' + sessionId })
      });

      const data = await res.json();

      const replyText =
        data.text ||
        data.fulfillmentText ||
        data?.queryResult?.fulfillmentText;

      push({
        from: 'bot',
        text: replyText || 'Sorry, I did not understand that.'
      });
    } catch (err) {
      console.error(err);
      push({ from: 'bot', text: 'Error contacting server.' });
    }

    setValue('');
  }, [push]);

  // listen to Suggestions clicks
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.text) {
        handleSend(e.detail.text);
      }
    };

    window.addEventListener('chat-send', handler);
    return () => window.removeEventListener('chat-send', handler);
  }, [handleSend]);

  return (
    <div className="conversation-wrapper">
      {/* SCROLLABLE CHAT AREA */}
      <div className="chat-container" ref={scrollRef}>

        {/* Carousel */}
        <div className="carousel-section">
          <Carousel
            items={homeCarouselItems}
            onButtonClick={handlePostback}
          />
        </div>

        {/* Messages */}
        {messages.map(m => (
          <div key={m.id} className={`message ${m.from}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}

        {/* ✅ Scroll anchor (INSIDE container) */}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="composer">
        <input
          className="composer-input"
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(value)}
        />
        <button
          className="composer-send"
          onClick={() => handleSend(value)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
