# WebpageChatbot Module

A lightweight, zero-dependency, plug-and-play React chatbot component designed for hackathons. Drop it into any React project to instantly add floating chat functionality.

## Features

- **Zero External Dependencies**: Built with standard functional React components, hooks, native `fetch` API, and inline styles.
- **Self-Contained**: No external CSS files or frameworks required (no Tailwind/Bootstrap dependency).
- **Auto-Navigation**: Built-in support to redirect users to specific pages based on backend API responses.
- **Extensible**: Easily connect to any backend API (e.g., Python/Flask, Node.js, etc.).

## Installation & Setup

Simply copy the `WebpageChatbot` folder into your React project's components or modules directory.

```bash
cp -r WebpageChatbot /path/to/your/project/src/components/
```

## Basic Usage

Import the default export (`ChatWidget`) into your main App layout or page:

```jsx
import React from 'react';
import ChatWidget from './components/WebpageChatbot';

function App() {
  return (
    <div>
      <h1>My Awesome Hackathon Project</h1>
      
      {/* The ChatWidget is fixed to the bottom-right of the screen */}
      <ChatWidget />
    </div>
  );
}

export default App;
```

## API Integration

By default, the module uses a mocked API response. To connect it to your actual backend chatbot API:

1. Open `services/chatbotAPI.js`.
2. Update the `CHATBOT_API_URL` variable:
   ```javascript
   const CHATBOT_API_URL = 'http://localhost:5000/api/chat'; 
   ```
3. Update the fetch payload structure if your backend expects a different format (currently sends `{ message: "text" }`).

### Auto-Navigation Feature

If your backend chatbot determines the user should be redirected (e.g., "Take me to my dashboard"), your backend can include a `url` property in the JSON response:

```json
{
  "reply": "Redirecting you to the dashboard now!",
  "url": "/dashboard"
}
```

The `navigationHandler.js` utility will intercept this and automatically route the user to `/dashboard`.

## Project Structure

- `index.js` - Main entry point exporting the `ChatWidget`.
- `components/` - UI components (`ChatWidget`, `ChatWindow`, `ChatInput`, `ChatMessage`).
- `hooks/useChatbot.js` - Custom hook managing state, message history, and API interactions.
- `services/chatbotAPI.js` - Handles network requests via `fetch`.
- `utils/navigationHandler.js` - Handles client-side or window-level routing based on API responses.
