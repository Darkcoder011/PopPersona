import '@styles/custom.css';
import '@styles/tailwind.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create the root
const root = createRoot(rootElement);

// Render the app
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
