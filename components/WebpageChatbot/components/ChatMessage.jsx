"use client";
import React from 'react';

const ChatMessage = ({ msg }) => {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex w-full my-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm break-words backdrop-blur-md ${
          msg.error
            ? 'bg-red-500/20 text-red-200 border border-red-500/50 rounded-2xl rounded-bl-sm'
            : isUser
            ? 'bg-fuchsia-600/80 text-white rounded-2xl rounded-br-sm'
            : 'bg-white/10 text-white border border-white/20 rounded-2xl rounded-bl-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
};

export default ChatMessage;
