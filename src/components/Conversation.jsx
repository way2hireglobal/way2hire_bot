import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Conversation(){
  const [messages, setMessages] = useState([
  ]);
  const [value, setValue] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const text = e.detail.text;
      handleSend(text);
    };
    window.addEventListener('chat-send', handler);
    return () => window.removeEventListener('chat-send', handler);
  }, [messages]);

  useEffect(() => {
  const container = document.querySelector('.chat-container');
  if (container) {
    // smooth: container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    container.scrollTop = container.scrollHeight; // instant
  }
}, [messages]);

  useEffect(() => {
    // scroll to bottom
    if(messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const push = (msg) => setMessages(m => [...m, { id: uuidv4(), ...msg }]);

  const handleSend = async (text) => {
    if(!text || !text.trim()) return;
    push({ from: 'user', text });

    // call the Netlify function
    try {
      const res = await fetch('/.netlify/functions/dialogflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // if you set an API_SECRET in Netlify, set header as well
          //'x-api-secret': process.env.REACT_APP_API_SECRET || ''
        },
        body: JSON.stringify({ text, sessionId: 'web-' + localStorage.getItem('sessionId') || undefined })
      });

      const data = await res.json();
      const reply = data.text || data.fulfillmentText || 'Sorry, no response.';
      push({ from: 'bot', text: reply });
    } catch (err) {
      push({ from: 'bot', text: 'Error contacting server.' });
      console.error(err);
    }
    setValue('');
  };

  return (
    <div className="conversation-wrapper">
      <div className="messages" ref={messagesRef}>
        {messages.map(m => (
          <div key={m.id} className={`message ${m.from}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="composer">
        <input
          placeholder="Type your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(value); }}
        />
        <button onClick={() => handleSend(value)}>Send</button>
      </div>
    </div>
  );
}
