import { GoogleGenerativeAI } from '@google/generative-ai';

// API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBs_YOa0m9dAhDKw45esHSlXbZ3WIDP6MI';
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY || 'qzuLeMriOgE8HuaHslZkpSs5fTu-VU4-iukY6dD6J8k';
const QLOO_BASE_URL = 'https://hackathon.api.qloo.com/v2';

// Qloo API Configuration
const QLOO_INTEREST_ID = 'FCE8B172-4795-43E4-B222-3B550DC05FD9'; // Fixed interest ID for hackathon
const SUPPORTED_ENTITY_TYPES = [
  'movie', 'tv_show', 'book', 'brand', 'person', 
  'podcast', 'artist', 'destination', 'place'
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  }
});

// Helper function to safely parse JSON from text
const safeJsonParse = (text) => {
  try {
    // First try to parse as is
    return JSON.parse(text);
  } catch (e) {
    try {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // If that fails, try to find a JSON object in the text
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (innerError) {
      console.error('Failed to parse JSON:', innerError);
      throw new Error('Failed to parse Gemini response: ' + innerError.message);
    }
  }
};

// Extract personality traits and interests using Gemini
export const analyzePersonality = async (userInput, retries = 3) => {
  // Default response to use in case of errors
  const defaultResponse = {
    interests: ['movies', 'music', 'technology'],
    traits: ['curious', 'creative', 'analytical'],
    preferences: {
      genres: ['science fiction', 'drama'],
      themes: ['innovation', 'adventure']
    }
  };

  // If we're out of retries, return the default response
  if (retries <= 0) {
    console.log('Using fallback response after max retries');
    return defaultResponse;
  }

  try {
    const prompt = `Analyze the following personality description and extract key interests, personality traits, and preferences. 
    Return a JSON object with the following structure:
    {
      "interests": ["interest1", "interest2", ...],
      "traits": ["trait1", "trait2", ...],
      "preferences": {
        "genres": [],
        "themes": []
      }
    }
    
    Make sure to return only valid JSON. Do not include any markdown formatting or additional text.
    
    User description: ${userInput}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error('Empty or invalid response from Gemini API');
    }
    
    const text = response.text();
    console.log('Gemini raw response:', text); // Debug log
    
    if (!text) {
      throw new Error('Empty response text from Gemini API');
    }
    
    // Parse the response
    const parsedResponse = safeJsonParse(text);
    
    // Validate the response structure
    if (!parsedResponse.interests || !parsedResponse.traits || !parsedResponse.preferences) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    return parsedResponse;
    
  } catch (error) {
    console.error('Error analyzing personality:', error);
    
    // If this is a retryable error, wait and retry
    const isRetryable = error.message.includes('overloaded') || 
                       error.message.includes('503') ||
                       error.message.includes('Failed to parse');
    
    if (isRetryable && retries > 0) {
      const delay = 2000 * (4 - retries); // Exponential backoff
      console.log(`Retrying in ${delay}ms... attempts left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzePersonality(userInput, retries - 1);
    }
    
    // If we can't retry or this isn't a retryable error, return the default response
    console.log('Using fallback response due to error:', error.message);
    return defaultResponse;
  }
};

// Get default entity types for recommendations
export const getDefaultEntityTypes = () => ['movie', 'tv_show', 'book', 'brand', 'person'];

// Get a fallback image URL based on entity type
const getFallbackImage = (entityType, name = '') => {
  const baseUrl = 'https://ui-avatars.com/api/';
  const colors = {
    movie: '1e40af',
    tv_show: '4338ca',
    book: '7c3aed',
    brand: '059669',
    person: '9d174d',
    podcast: '9a3412',
    artist: '713f12',
    destination: '164e63',
    place: '1e40af'
  };
  
  const color = colors[entityType] || '6b7280';
  const text = name ? encodeURIComponent(name.substring(0, 2).toUpperCase()) : entityType.charAt(0).toUpperCase();
  
  return `${baseUrl}?name=${text}&background=${color}&color=fff&size=200&bold=true&rounded=true&length=2`;
};

// Get recommendations from Qloo API
export const getRecommendations = async (entityType, limit = 3) => {
  try {
    // Validate entity type
    if (!SUPPORTED_ENTITY_TYPES.includes(entityType)) {
      console.warn(`Unsupported entity type: ${entityType}`);
      return [];
    }

    // Limit the number of results to prevent too many requests
    const safeLimit = Math.min(limit, 5); // Max 5 items per type
    
    const response = await fetch(
      `${QLOO_BASE_URL}/insights?filter.type=urn:entity:${entityType}&signal.interests.entities=${QLOO_INTEREST_ID}&take=${safeLimit}`,
      {
        headers: {
          'X-Api-Key': QLOO_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`Access forbidden for entity type: ${entityType}`);
      } else {
        console.error(`Qloo API error (${response.status}):`, response.statusText);
      }
      return [];
    }

    const data = await response.json();
    
    // Transform response to consistent format
    let items = [];
    
    if (data?.success && Array.isArray(data.results?.entities)) {
      items = data.results.entities;
    } else if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.data)) {
      items = data.data;
    }
    
    // Limit the number of items and add fallback image
    return items.slice(0, safeLimit).map(item => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      name: item.name || `Untitled ${entityType}`,
      type: entityType,
      image: item.image_url || getFallbackImage(entityType, item.name),
      description: item.description || '',
      // Include any other relevant fields
      ...item
    }));
  } catch (error) {
    console.error(`Error fetching ${entityType} recommendations:`, error);
    return [];
  }
};

// Generate a friendly profile summary using Gemini
export const generateProfileSummary = async (traits, interests) => {
  try {
    const prompt = `Create a friendly, engaging paragraph that introduces a "Pop Culture Twin" profile based on these traits and interests. 
    Make it fun and conversational, as if you're introducing someone to their perfect pop culture match.
    
    Traits: ${traits.join(', ')}
    Interests: ${interests.join(', ')}
    
    Keep it under 150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating profile summary:', error);
    return "Here's your personalized pop culture twin profile based on your unique personality and interests!";
  }
};
