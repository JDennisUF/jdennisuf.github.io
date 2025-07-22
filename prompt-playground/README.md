# AI Prompt Playground

A modern web-based interface for interacting with AI models through different roles and conversation contexts.

## Features

- **Multiple AI Providers**: Currently supports Hugging Face Inference API with free tier access
- **Demo Mode**: Works without API keys using mock responses for testing
- **Role-Based Conversations**: Support for System, User, and Assistant message roles
- **Modern UI**: Responsive design with light/dark theme toggle
- **Conversation Management**: Persistent chat history with export functionality
- **Customizable Settings**: Adjustable temperature, max tokens, and model selection

## Quick Start

1. **Local Development**: Start any HTTP server in this directory:
   ```bash
   python3 -m http.server 8080
   # or
   npx serve .
   # or
   node ../server.js
   ```

2. **Demo Mode**: Open the application and start chatting immediately - no API key required!

3. **Real AI Mode**: 
   - Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)
   - Click Settings ⚙️ and enter your API key
   - Select your preferred model and start chatting

## Usage Guide

### Message Roles

- **👤 User**: Your questions, commands, and input to the AI
- **⚙️ System**: Instructions and context that guide AI behavior  
- **🤖 Assistant**: AI responses or manual assistant messages

### Settings

- **API Key**: Hugging Face token for real AI responses (optional)
- **Model**: Choose from available free models or demo mode
- **Temperature**: Controls randomness (0.1 = focused, 2.0 = creative)
- **Max Tokens**: Maximum length of AI responses

### Tips

- Use **Ctrl/Cmd + Enter** to send messages quickly
- Try different roles to see how they affect conversations
- System messages help set context: "You are a helpful coding assistant"
- Export conversations as JSON for later analysis
- Demo mode is perfect for testing the interface

## Technical Details

- **Frontend**: Pure HTML5, CSS3, JavaScript (no frameworks)
- **API**: Hugging Face Inference API
- **Storage**: LocalStorage for settings and conversation history
- **Responsive**: Mobile-friendly design
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

## Models Available

- **DialoGPT Large**: Conversational AI model (default)
- **BlenderBot 400M**: Facebook's chatbot model
- **DialoGPT Medium**: Smaller conversational model
- **Demo Mode**: Mock responses for testing

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- LocalStorage API
- Fetch API

## Privacy

- All conversations stored locally in your browser
- API keys stored securely in browser localStorage
- No data sent to third parties except chosen AI provider
- Export feature allows you to control your data

## Troubleshooting

- **No responses**: Check your API key or try demo mode
- **CORS errors**: Some models may have restrictions - try different models
- **Loading forever**: API might be busy - wait or try another model
- **Styling issues**: Hard refresh (Ctrl+F5) to clear cache