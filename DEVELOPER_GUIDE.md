# PopPersona Developer Guide

Welcome to the PopPersona developer guide! This document provides an overview of the project structure, key components, and development workflow.

## Project Structure

```
src/
├── assets/               # Static assets (images, etc.)
├── components/           # Reusable UI components
│   ├── ChatInput.jsx     # Input component for chat messages
│   ├── ChatMessage.jsx   # Component for displaying chat messages
│   ├── RecommendationCard.jsx     # Individual recommendation card
│   └── RecommendationsSection.jsx # Section for displaying grouped recommendations
├── context/              # React context providers
│   └── AppContext.jsx    # Global state management
├── services/             # API and service layer
│   └── api.js            # API integration with Gemini and Qloo
└── styles/               # Global styles and Tailwind directives
    └── custom.css        # Custom CSS overrides and animations
```

## Key Components

### 1. AppContext (context/AppContext.jsx)

Manages the global state of the application including:
- Messages in the chat
- Loading states
- Recommendations
- Profile summary

### 2. Chat Components

- **ChatInput**: Handles user input with support for multi-line text and submission
- **ChatMessage**: Displays individual chat messages with animations

### 3. Recommendation Components

- **RecommendationCard**: Displays an individual recommendation with image and details
- **RecommendationsSection**: Groups and displays recommendations by category

## API Integration

The `services/api.js` file contains all API integration code:

### Gemini API
- `analyzePersonality(description)`: Analyzes user input to extract personality traits
- `generateProfileSummary(traits)`: Generates a friendly profile summary

### Qloo API
- `fetchRecommendations(interests)`: Fetches recommendations based on user interests
- `mapInterestsToQlooTags(interests)`: Maps user interests to Qloo entity types

## Styling

The application uses Tailwind CSS with custom animations and utilities defined in `styles/custom.css`. Key features include:

- Custom scrollbars
- Smooth animations with Framer Motion
- Responsive design utilities
- Custom color palette

## Development Workflow

1. **Environment Setup**
   - Node.js 18+ and npm
   - Create a `.env` file with required API keys

2. **Available Scripts**
   - `npm run dev`: Start development server
   - `npm run build`: Create production build
   - `npm run preview`: Preview production build
   - `npm run lint`: Run ESLint

## Best Practices

1. **State Management**
   - Use AppContext for global state
   - Keep component state local when possible

2. **Component Design**
   - Follow the single responsibility principle
   - Use prop types for better documentation
   - Keep components small and focused

3. **Styling**
   - Use Tailwind utility classes first
   - Extract repeated styles into components
   - Use CSS custom properties for theming

## Performance Considerations

- Lazy load heavy components
- Use React.memo() for expensive renders
- Optimize API calls with proper error handling
- Implement proper loading states

## Testing

To add tests, create a `__tests__` directory next to the component being tested. Use React Testing Library for component tests and Jest for unit tests.

## Deployment

The application is ready for deployment to any static hosting service like Vercel, Netlify, or GitHub Pages. Ensure all environment variables are properly set in your deployment configuration.
