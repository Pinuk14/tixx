"use client";
import React from 'react';
import ChatWindow from './ChatWindow';
import { useChatbot } from '../hooks/useChatbot';

const ChatWidget = () => {
  const { messages, isOpen, toggleChat, sendMessage, isLoading } = useChatbot();

  return (
    <>
      <button 
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl z-[10000] text-white transition-all duration-200 hover:scale-105 hover:bg-white/20 glass shadow-lg"
        onClick={toggleChat}
        aria-label="Toggle Chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      <ChatWindow 
        isOpen={isOpen} 
        onClose={toggleChat}
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </>
  );
};

export default ChatWidget;
