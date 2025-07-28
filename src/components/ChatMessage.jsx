import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMessage = ({ message, isLast }) => {
  const isBot = message.sender === 'bot';
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef(null);

  // Add a slight delay for the animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    // Auto-scroll to the message if it's the last one
    if (isLast && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    return () => clearTimeout(timer);
  }, [isLast]);

  // Format message text with line breaks and links
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div 
          className={`max-w-3xl px-4 py-3 rounded-lg shadow-sm ${
            isBot 
              ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-tr-none'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">
              {formatMessage(message.text)}
            </p>
          </div>
          
          {message.timestamp && (
            <div className={`text-xs mt-1 text-right ${
              isBot ? 'text-gray-400' : 'text-cyan-100'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatMessage;
