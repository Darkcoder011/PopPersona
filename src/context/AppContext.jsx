import { createContext, useContext, useState, useCallback } from 'react';
import { 
  analyzePersonality, 
  getRecommendations, 
  generateProfileSummary,
  getDefaultEntityTypes 
} from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm your Pop Culture Twin Finder. Tell me about your personality, interests, and preferences, and I'll find your perfect pop culture matches!", 
      sender: 'bot' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({
    movie: [],
    tv_show: [],
    book: [],
    brand: [],
    person: []
  });
  const [profileSummary, setProfileSummary] = useState('');

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const addMessage = (text, sender = 'user') => {
    setMessages(prev => [...prev, { id: generateId(), text, sender }]);
  };

  const processUserInput = async (input) => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    addMessage(input, 'user');
    addMessage('Analyzing your personality and finding your perfect pop culture matches...', 'bot');
    
    try {
      // Step 1: Analyze personality with Gemini
      const analysis = await analyzePersonality(input);
      
      // Step 2: Get default entity types for recommendations
      const entityTypes = getDefaultEntityTypes();
      
      // Step 3: Fetch recommendations for each entity type
      const recommendationsPromises = entityTypes.map(entityType => 
        getRecommendations(entityType, 3)  // Get 3 recommendations per type
      );
      
      const results = await Promise.all(recommendationsPromises);
      
      // Combine results
      const newRecommendations = { ...recommendations };
      entityTypes.forEach((entityType, index) => {
        newRecommendations[entityType] = results[index] || [];
      });
      
      setRecommendations(newRecommendations);
      
      // Step 4: Generate profile summary
      const summary = await generateProfileSummary(
        analysis.traits, 
        analysis.interests
      );
      
      setProfileSummary(summary);
      
      // Add summary to chat
      addMessage(summary, 'bot');
      
      // Add a message about the recommendations
      const hasRecommendations = Object.values(newRecommendations).some(arr => arr.length > 0);
      if (hasRecommendations) {
        addMessage("Here are your personalized pop culture recommendations!", 'bot');
      } else {
        addMessage("I couldn't fetch any recommendations at the moment, but here's a summary of your pop culture profile:", 'bot');
      }
      
    } catch (error) {
      console.error('Error processing input:', error);
      addMessage("Oops! Something went wrong while processing your request. Please try again.", 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const mapInterestsToEntities = (interests) => {
    // This is a simplified mapping - in a real app, you'd want to make this more sophisticated
    const entityMap = {
      movie: ['film', 'cinema', 'movies', 'actor', 'actress', 'director'],
      tv_show: ['tv', 'television', 'series', 'show', 'episode', 'netflix', 'hbo'],
      book: ['book', 'novel', 'reading', 'author', 'literature'],
      brand: ['brand', 'fashion', 'clothing', 'tech', 'gadget'],
      person: ['celebrity', 'influencer', 'artist', 'musician', 'actor', 'actress']
    };

    const entities = [];
    
    interests.forEach(interest => {
      for (const [entity, keywords] of Object.entries(entityMap)) {
        if (keywords.some(keyword => interest.toLowerCase().includes(keyword))) {
          if (!entities.includes(entity)) {
            entities.push(entity);
          }
        }
      }
    });

    return entities.length > 0 ? entities : ['movie', 'tv_show', 'book'];
  };

  return (
    <AppContext.Provider 
      value={{
        messages,
        isLoading,
        recommendations,
        profileSummary,
        processUserInput,
        addMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
