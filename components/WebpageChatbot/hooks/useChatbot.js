"use client";
import { useState } from 'react';
import { sendMessageToBot } from '../services/chatbotAPI';
import { handleNavigation } from '../utils/navigationHandler';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    { id: Date.now(), text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Gather context
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
      const pageContext = typeof document !== 'undefined' ? document.title : '';

      const response = await sendMessageToBot(text, currentUrl, pageContext);
      
      // Add bot reply
      const botMsg = { id: Date.now() + 1, text: response.reply, sender: 'bot' };
      setMessages((prev) => [...prev, botMsg]);

      // Handle optional navigation
      if (response.url) {
        handleNavigation(response.url);
      }
    } catch (error) {
        const errorMsg = { id: Date.now() + 1, text: 'Failed to send message.', sender: 'bot', error: true };
        setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isOpen,
    toggleChat,
    sendMessage,
    isLoading
  };
};
