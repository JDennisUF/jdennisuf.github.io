class AIPromptPlayground {
    constructor() {
        this.messages = [];
        this.apiKey = '';
        this.currentModel = 'meta-llama/Meta-Llama-3-8B-Instruct';
        this.temperature = 0.7;
        this.maxTokens = 1000;
        this.theme = 'light';
        this.availableModels = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadModels().then(() => {
            this.loadSettings();
            this.loadConversationHistory();
        });
    }

    initializeElements() {
        // Main elements
        this.messagesContainer = document.getElementById('messages');
        this.promptForm = document.getElementById('promptForm');
        this.promptInput = document.getElementById('promptInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.temperatureSlider = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.maxTokensInput = document.getElementById('maxTokens');
        
        // Control elements
        this.roleSelect = document.getElementById('roleSelect');
        this.themeToggle = document.getElementById('themeToggle');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.exportChatBtn = document.getElementById('exportChat');
        this.clearInputBtn = document.getElementById('clearInput');
        this.currentModelName = document.getElementById('currentModelName');
        
        // Quick prompts
        this.quickPrompts = document.querySelectorAll('.quick-prompt');
    }

    async loadModels() {
        try {
            const response = await fetch('./ai_models.json');
            const data = await response.json();
            this.availableModels = data.models;
            this.populateModelSelect();
        } catch (error) {
            console.error('Failed to load models:', error);
            // Fallback to default model
            this.availableModels = [{
                name: 'GPT-2 (OpenAI)',
                id: 'gpt2',
                url: 'https://api-inference.huggingface.co/models/gpt2',
                tested: false,
                recommended: true
            }];
            this.populateModelSelect();
        }
    }

    populateModelSelect() {
        this.modelSelect.innerHTML = '';
        this.availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name + (model.recommended ? ' (Recommended)' : '');
            this.modelSelect.appendChild(option);
        });
    }

    loadSettings() {
        // Load from localStorage
        const savedSettings = localStorage.getItem('aiPlaygroundSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.apiKey = settings.apiKey || '';
            // Check if saved model exists in available models
            const savedModel = settings.model;
            const modelExists = savedModel && this.availableModels.some(m => m.id === savedModel);
            this.currentModel = modelExists ? savedModel : '';
            this.temperature = settings.temperature || 0.7;
            this.maxTokens = settings.maxTokens || 1000;
            this.theme = settings.theme || 'light';
        } else {
            // No saved settings, select first recommended model
            const recommendedModel = this.availableModels.find(m => m.recommended);
            this.currentModel = recommendedModel ? recommendedModel.id : (this.availableModels[0]?.id || '');
        }

        // Apply settings to UI
        this.apiKeyInput.value = this.apiKey;
        this.modelSelect.value = this.currentModel;
        this.temperatureSlider.value = this.temperature;
        this.temperatureValue.textContent = this.temperature;
        this.maxTokensInput.value = this.maxTokens;
        
        // Update model display
        this.updateModelDisplay();
        
        // Apply theme
        this.applyTheme();
    }

    updateModelDisplay() {
        if (this.currentModel) {
            const selectedModel = this.availableModels.find(m => m.id === this.currentModel);
            this.currentModelName.textContent = selectedModel ? selectedModel.name : this.currentModel;
        } else {
            this.currentModelName.textContent = 'None Selected';
        }
    }

    saveSettings() {
        const settings = {
            apiKey: this.apiKey,
            model: this.currentModel,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            theme: this.theme
        };
        localStorage.setItem('aiPlaygroundSettings', JSON.stringify(settings));
    }

    loadConversationHistory() {
        const savedMessages = localStorage.getItem('aiPlaygroundMessages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
            this.renderMessages();
        }
    }

    saveConversationHistory() {
        localStorage.setItem('aiPlaygroundMessages', JSON.stringify(this.messages));
    }

    bindEvents() {
        // Form submission
        this.promptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Settings panel toggle
        if (this.settingsBtn && this.settingsPanel) {
            this.settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSettings();
            });
        }

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target)) {
                this.settingsPanel.classList.remove('active');
            }
        });

        // Settings changes
        this.apiKeyInput.addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            this.saveSettings();
        });

        this.modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateModelDisplay();
            this.saveSettings();
        });

        this.temperatureSlider.addEventListener('input', (e) => {
            this.temperature = parseFloat(e.target.value);
            this.temperatureValue.textContent = this.temperature;
            this.saveSettings();
        });

        this.maxTokensInput.addEventListener('input', (e) => {
            this.maxTokens = parseInt(e.target.value);
            this.saveSettings();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Clear functions
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        this.clearInputBtn.addEventListener('click', () => {
            this.promptInput.value = '';
            this.promptInput.focus();
        });

        // Export chat
        this.exportChatBtn.addEventListener('click', () => {
            this.exportConversation();
        });

        // Quick prompts
        this.quickPrompts.forEach(btn => {
            btn.addEventListener('click', () => {
                this.promptInput.value = btn.dataset.prompt;
                this.promptInput.focus();
            });
        });

        // Auto-resize textarea
        this.promptInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // Keyboard shortcuts
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.handleSubmit();
            }
        });
    }

    toggleSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.toggle('active');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    autoResizeTextarea() {
        this.promptInput.style.height = 'auto';
        this.promptInput.style.height = Math.min(this.promptInput.scrollHeight, 200) + 'px';
    }

    async handleSubmit() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) return;

        // Validate input for Firefox compatibility
        if (prompt.length > 1000) {
            alert('Message too long. Please keep under 1000 characters.');
            return;
        }

        const role = this.roleSelect.value;
        
        // Add user message
        this.addMessage(role, prompt);
        
        // Clear input
        this.promptInput.value = '';
        this.autoResizeTextarea();

        // Only generate AI response for user messages
        if (role === 'user') {
            await this.generateResponse(prompt);
        }

        // Scroll to bottom
        this.scrollToBottom();
    }

    addMessage(role, content, isAI = false) {
        const message = {
            id: Date.now() + Math.random(),
            role,
            content,
            timestamp: new Date().toISOString(),
            isAI
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.saveConversationHistory();
        
        // Remove welcome message if it exists
        const welcomeMsg = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            this.renderWelcomeMessage();
        } else {
            this.messages.forEach(message => {
                this.renderMessage(message, false);
            });
        }
    }

    renderMessage(message, animate = true) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;
        if (animate) {
            messageEl.style.animation = 'fadeInUp 0.3s ease';
        }

        const roleIcons = {
            user: '👤',
            system: '⚙️',
            assistant: '🤖'
        };

        const roleLabels = {
            user: 'User',
            system: 'System',
            assistant: message.isAI ? 'AI Assistant' : 'Assistant'
        };

        messageEl.innerHTML = `
            <div class="message-header">
                <span>${roleIcons[message.role]} ${roleLabels[message.role]}</span>
                <span class="message-time">${this.formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.content)}</div>
        `;

        this.messagesContainer.appendChild(messageEl);
    }

    renderWelcomeMessage() {
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <h2>Welcome to AI Prompt Playground</h2>
                <p>Start a conversation with AI using different roles:</p>
                <ul>
                    <li><strong>System:</strong> Set instructions and context for the AI</li>
                    <li><strong>User:</strong> Ask questions or give commands</li>
                    <li><strong>Assistant:</strong> Preview AI responses or add context</li>
                </ul>
                <p class="api-note">🔑 API key required from openrouter.ai</p>
            </div>
        `;
    }

    async generateResponse(prompt) {
        this.showLoading(true);

        try {
            if (!this.apiKey) {
                throw new Error('API key required. Enter your OpenRouter API key in Settings.');
            }
            
            if (!this.currentModel) {
                throw new Error('Please select a model in Settings before sending messages.');
            }
            
            const response = await this.callHuggingFaceAPI(prompt);
            this.addMessage('assistant', response, true);
        } catch (error) {
            console.error('Error generating response:', error);
            this.addMessage('assistant', `❌ Error: ${error.message}`, true);
        } finally {
            this.showLoading(false);
        }
    }

    async callHuggingFaceAPI(prompt) {
        // Sanitize inputs for Firefox compatibility
        const sanitizedPrompt = this.sanitizeForAPI(prompt);
        const sanitizedApiKey = this.sanitizeForAPI(this.apiKey);
        console.log('Sanitized API Key:', sanitizedApiKey);
        console.log('Sanitized Prompt:', sanitizedPrompt);

        if (!sanitizedApiKey || sanitizedApiKey.length < 10) {
            throw new Error('Invalid API key format. Please check your OpenRouter API key.');
        }

        // Use new Inference Providers API format
        const payload = {
            model: this.currentModel,
            messages: [
                {
                    role: "user",
                    content: sanitizedPrompt
                }
            ],
            max_tokens: this.maxTokens,
            temperature: this.temperature
        };

        const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;
        console.log('API URL being called:', apiUrl);
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sanitizedApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = 'Unable to read error response';
            }
            
            console.error('API Error Details:', response.status, errorText);
            
            // More specific error messages
            if (response.status === 404) {
                throw new Error(`Model not found. Check your model name and API key.`);
            } else if (response.status === 403) {
                throw new Error('Invalid API key. Check your Hugging Face token.');
            } else if (response.status === 503) {
                throw new Error('Model is loading. Try again in a moment.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Get a new token from huggingface.co/settings/tokens with "Make calls to Inference API" permission.');
            } else if (response.status === 400) {
                throw new Error('Invalid request format. Check your input and API key.');
            } else {
                throw new Error(`API error (${response.status}). Check your API key and model.`);
            }
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Handle new chat completions format
        if (data.choices && data.choices.length > 0) {
            const choice = data.choices[0];
            if (choice.message) {
                // DeepSeek R1 models put content in 'reasoning' field
                const content = choice.message.content || choice.message.reasoning || '';
                if (content.trim()) {
                    return content.trim();
                }
            }
        }
        
        // Fallback for other formats
        if (Array.isArray(data) && data.length > 0) {
            const result = data[0];
            if (typeof result === 'object' && result.generated_text) {
                return result.generated_text.trim();
            } else if (typeof result === 'string') {
                return result.trim();
            }
        }
        
        return 'Sorry, I received an unexpected response format. Please try again.';
    }

    sanitizeForAPI(text) {
        if (!text) return '';
        
        // Remove or replace problematic characters for Firefox
        return text
            .replace(/[^\x00-\xFF]/g, '') // Remove non-ASCII characters
            .replace(/[\r\n\t]/g, ' ') // Replace newlines/tabs with spaces
            .trim()
            .slice(0, 2000); // Limit length
    }


    showLoading(show) {
        this.loadingIndicator.classList.toggle('active', show);
        this.sendBtn.disabled = show;
        
        if (show) {
            this.scrollToBottom();
        }
    }

    clearHistory() {
        this.messages = [];
        this.renderMessages();
        this.saveConversationHistory();
    }

    exportConversation() {
        if (this.messages.length === 0) {
            alert('No messages to export!');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            messages: this.messages,
            settings: {
                model: this.currentModel,
                temperature: this.temperature,
                maxTokens: this.maxTokens
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIPromptPlayground();
});

// Add some helpful console messages
console.log('🤖 AI Prompt Playground loaded!');
console.log('💡 Tips:');
console.log('- Get a free Hugging Face API key at: https://huggingface.co/settings/tokens');
console.log('- Use Ctrl/Cmd + Enter to send messages');
console.log('- Try different roles to see how they affect the conversation');
console.log('- Requires Hugging Face API key with write permissions');