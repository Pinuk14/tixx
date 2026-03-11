"use client";
import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form 
      className="flex p-3 border-t border-white/20 bg-white/5 backdrop-blur-sm" 
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={disabled}
        className="flex-1 py-2 px-4 bg-black/20 border border-white/20 rounded-full outline-none text-sm text-white placeholder-white/50 focus:border-white/40 focus:bg-black/40 transition-colors"
      />
      <button 
        type="submit" 
        disabled={disabled || !inputText.trim()} 
        className={`ml-2 px-4 py-2 rounded-full font-bold transition-all duration-200 text-sm ${
          disabled || !inputText.trim() 
            ? 'bg-white/10 text-white/30 cursor-not-allowed border border-transparent' 
            : 'bg-fuchsia-600/80 text-white hover:bg-fuchsia-500 border border-fuchsia-400/30 hover:scale-105 shadow-lg'
        }`}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
