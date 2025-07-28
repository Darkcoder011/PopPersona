import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const { isLoading, processUserInput } = useAppContext();
  const inputRef = useRef(null);

  // Focus the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    processUserInput(input);
    setInput('');
  };

  // Allow Shift+Enter for new lines, Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden shadow-sm bg-white">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your personality, interests, and preferences..."
              className="w-full px-4 py-3 focus:outline-none resize-none min-h-[60px] max-h-32"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 sm:px-6 h-full py-3 flex items-center justify-center ${
              isLoading || !input.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            } text-white font-medium transition-colors`}
            aria-label="Find matches"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner"></div>
                <span className="hidden sm:inline">Finding...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">Find Matches</span>
                <svg 
                  className="w-5 h-5 sm:ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Example: "I love science fiction movies, reading fantasy novels, and I'm always up for an adventure!"
          </p>
          <span className="text-xs text-gray-400">
            {input.length}/500
          </span>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
