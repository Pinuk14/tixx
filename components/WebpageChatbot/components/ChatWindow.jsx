"use client";
import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatWindow = ({ messages, isOpen, onClose, onSendMessage, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 w-80 h-[450px] flex flex-col z-[9999] rounded-2xl overflow-hidden glass shadow-2xl">
      <div className="flex justify-between items-center px-4 py-3 font-bold text-white border-b border-white/20 bg-white/5">
        <span>Assistant</span>
        <button 
          onClick={onClose} 
          className="text-white hover:text-white/70 text-xl leading-none transition-colors px-1" 
          aria-label="Close Chat"
        >
          &times;
        </button>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isLoading && (
          <div className="self-start px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-white/70 bg-white/10 border border-white/10 backdrop-blur-sm mt-1">
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWindow;
