import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import RecommendationsSection from './components/RecommendationsSection';

const LoadingDots = () => (
  <div className="flex space-x-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-cyan-600 rounded-full"
        animate={{
          y: ['0%', '50%', '0%'],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

const AppContent = () => {
  const { messages, recommendations, isLoading } = useAppContext();
  const messagesEndRef = useRef(null);
  const [hasRecommendations, setHasRecommendations] = useState(false);

  // Check if we have any recommendations
  useEffect(() => {
    const hasRecs = Object.values(recommendations).some(arr => arr.length > 0);
    setHasRecommendations(hasRecs);
  }, [recommendations]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header */}
      <header className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'>
        <div className='container mx-auto px-4 py-6'>
          <motion.h1 
            className='text-3xl font-bold'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            PopPersona
          </motion.h1>
          <motion.p 
            className='text-cyan-100 mt-1'
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your Pop Culture Twin Finder
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-6 max-w-4xl'>
        {/* Chat Interface */}
        <motion.div 
          className='bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className='p-6 h-[60vh] overflow-y-auto'>
            <div className='space-y-4'>
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLast={index === messages.length - 1}
                />
              ))}
              {isLoading && (
                <div className='flex items-center space-x-2 p-3 bg-gray-50 rounded-lg w-fit'>
                  <LoadingDots />
                  <span className='text-sm text-gray-500'>Finding your matches...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat Input */}
          <div className='border-t border-gray-200 p-4 bg-gray-50'>
            <ChatInput />
          </div>
        </motion.div>

        {/* Recommendations Section with Animation */}
        <AnimatePresence>
          {hasRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RecommendationsSection recommendations={recommendations} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 py-6 mt-12'>
        <div className='container mx-auto px-4 text-center text-gray-600'>
          <p>PopPersona &copy; {new Date().getFullYear()} - Find your pop culture twin</p>
          <p className='text-sm mt-2 text-gray-500'>
            Powered by Gemini AI and Qloo API
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
