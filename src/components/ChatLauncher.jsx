import React, { useState } from 'react';
import Conversation from './Conversation';
import Suggestions from './Suggestions';

export default function ChatLauncher(){
  const [open, setOpen] = useState(true);

  return (
    <div className="chat-launcher">
      <div className="launcher-header">
        <div className="title">Way2Hire Assistant</div>
       
      </div>

      {open && (
        <div className="chat-container">
          <div className="intro">
            Hi — welcome to Way2Hire 👋 I’m your hiring assistant. Tell me the role you’re hiring for and I’ll find and shortlist the best candidates fast.
          </div>

          <Suggestions />

          <Conversation />
        </div>
      )}
    </div>
  );
}
