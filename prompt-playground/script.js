class AIPromptPlayground {
    constructor() {
        this.messages = [];
        this.apiKey = '';
        this.currentModel = 'meta-llama/Meta-Llama-3-8B-Instruct';
        this.secondModel = '';
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
        this.secondMessagesContainer = document.getElementById('secondMessages');
        this.chatContainer = document.getElementById('chatContainer');
        this.secondMessagesPanel = document.getElementById('secondMessagesPanel');
        this.sharedQuestion = document.getElementById('sharedQuestion');
        this.questionDisplay = document.getElementById('questionDisplay');
        this.primaryModelTitle = document.getElementById('primaryModelTitle');
        this.secondModelTitle = document.getElementById('secondModelTitle');
        this.promptForm = document.getElementById('promptForm');
        this.promptInput = document.getElementById('promptInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.secondLoadingIndicator = document.getElementById('secondLoadingIndicator');
        
        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.secondModelSelect = document.getElementById('secondModelSelect');
        this.temperatureSlider = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.maxTokensInput = document.getElementById('maxTokens');
        
        // Control elements
        this.roleSelect = document.getElementById('roleSelect');
        this.themeToggle = document.getElementById('themeToggle');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.exportChatBtn = document.getElementById('exportChat');
        this.clearInputBtn = document.getElementById('clearInput');
        
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
        // Populate primary model select
        this.modelSelect.innerHTML = '';
        this.availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name + (model.recommended ? ' (Recommended)' : '');
            this.modelSelect.appendChild(option);
        });

        // Populate second model select with "None" option first
        this.secondModelSelect.innerHTML = '<option value="">None - Single Model</option>';
        this.availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name + (model.recommended ? ' (Recommended)' : '');
            this.secondModelSelect.appendChild(option);
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
            
            const savedSecondModel = settings.secondModel || '';
            const secondModelExists = !savedSecondModel || this.availableModels.some(m => m.id === savedSecondModel);
            this.secondModel = secondModelExists ? savedSecondModel : '';
            
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
        this.secondModelSelect.value = this.secondModel;
        this.temperatureSlider.value = this.temperature;
        this.temperatureValue.textContent = this.temperature;
        this.maxTokensInput.value = this.maxTokens;
        
        // Update model display
        this.updateModelDisplay();
        
        // Apply theme
        this.applyTheme();
    }

    validateModelSelection() {
        // Ensure second model is different from first model
        if (this.secondModel && this.secondModel === this.currentModel) {
            // Reset second model if it's the same as first
            this.secondModel = '';
            this.secondModelSelect.value = '';
            alert('Compare model must be different from primary model');
        }
    }

    updateModelDisplay() {
        // Update primary model title
        if (this.currentModel) {
            const selectedModel = this.availableModels.find(m => m.id === this.currentModel);
            const displayText = selectedModel ? selectedModel.name : this.currentModel;
            this.primaryModelTitle.textContent = displayText;
        } else {
            this.primaryModelTitle.textContent = 'No Model Selected';
        }
        
        // Update second model title
        if (this.secondModel) {
            const secondSelectedModel = this.availableModels.find(m => m.id === this.secondModel);
            const secondDisplayText = secondSelectedModel ? secondSelectedModel.name : this.secondModel;
            this.secondModelTitle.textContent = secondDisplayText;
        } else {
            this.secondModelTitle.textContent = 'Compare Model (Optional)';
        }
        
        this.updateDualModeUI();
    }

    updateDualModeUI() {
        if (this.secondModel && this.secondModel !== '') {
            // Enable dual mode
            this.chatContainer.classList.add('dual-mode');
            this.secondMessagesPanel.style.display = 'flex';
            this.sharedQuestion.style.display = 'block';
        } else {
            // Disable dual mode
            this.chatContainer.classList.remove('dual-mode');
            this.secondMessagesPanel.style.display = 'none';
            this.sharedQuestion.style.display = 'none';
        }
    }

    displaySharedQuestion(prompt, role) {
        const roleIcons = {
            user: '👤',
            system: '⚙️',
            assistant: '🤖'
        };

        const roleLabels = {
            user: 'User',
            system: 'System',
            assistant: 'Assistant'
        };

        this.questionDisplay.innerHTML = `
            <span>${roleIcons[role]} ${roleLabels[role]}:</span>
            <div class="question-content">${this.escapeHtml(prompt)}</div>
        `;

        // Still add to messages array for history and export
        const message = {
            id: Date.now() + Math.random(),
            role,
            content: prompt,
            timestamp: new Date().toISOString(),
            isAI: false,
            isShared: true
        };
        this.messages.push(message);
        this.saveConversationHistory();
    }

    saveSettings() {
        const settings = {
            apiKey: this.apiKey,
            model: this.currentModel,
            secondModel: this.secondModel,
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
            this.validateModelSelection();
            this.updateModelDisplay();
            this.saveSettings();
        });

        this.secondModelSelect.addEventListener('change', (e) => {
            this.secondModel = e.target.value;
            this.validateModelSelection();
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
        
        // Handle dual mode vs single mode differently
        if (this.secondModel && this.secondModel !== '') {
            // In dual mode, show question in shared area
            this.displaySharedQuestion(prompt, role);
        } else {
            // In single mode, add message normally
            this.addMessage(role, prompt, false, false);
        }
        
        // Don't clear input - keep the user's message for reference
        // this.promptInput.value = '';
        // this.autoResizeTextarea();

        // Generate AI response for user messages, but not for system/assistant messages
        if (role === 'user') {
            await this.generateResponse(prompt);
        }

        // Scroll to bottom
        this.scrollToBottom();
    }

    addMessage(role, content, isAI = false, isSecondPanel = false) {
        const message = {
            id: Date.now() + Math.random(),
            role,
            content,
            timestamp: new Date().toISOString(),
            isAI,
            isSecondPanel
        };
        
        this.messages.push(message);
        this.renderMessage(message, isSecondPanel);
        this.saveConversationHistory();
        
        // Remove welcome message if it exists
        const targetContainer = isSecondPanel ? this.secondMessagesContainer : this.messagesContainer;
        const welcomeMsg = targetContainer.querySelector('.welcome-message');
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

    renderMessage(message, isSecondPanel = false) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;
        messageEl.style.animation = 'fadeInUp 0.3s ease';

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

        const targetContainer = isSecondPanel ? this.secondMessagesContainer : this.messagesContainer;
        targetContainer.appendChild(messageEl);
        
        // Scroll to bottom of the appropriate container
        targetContainer.scrollTop = targetContainer.scrollHeight;
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
        if (this.secondModel) {
            this.showLoading(true, true); // Show loading for second model too
        }

        try {
            if (!this.apiKey) {
                throw new Error('API key required. Enter your OpenRouter API key in Settings.');
            }
            
            if (!this.currentModel) {
                throw new Error('Please select a model in Settings before sending messages.');
            }
            
            // Generate responses from both models if dual mode is enabled
            if (this.secondModel) {
                const [response1, response2] = await Promise.allSettled([
                    this.callOpenRouterAPI(prompt, this.currentModel),
                    this.callOpenRouterAPI(prompt, this.secondModel)
                ]);
                
                // Handle first model response
                if (response1.status === 'fulfilled') {
                    this.addMessage('assistant', response1.value, true, false); // false = first panel
                } else {
                    this.addMessage('assistant', `❌ Error: ${response1.reason.message}`, true, false);
                }
                
                // Handle second model response
                if (response2.status === 'fulfilled') {
                    this.addMessage('assistant', response2.value, true, true); // true = second panel
                } else {
                    this.addMessage('assistant', `❌ Error: ${response2.reason.message}`, true, true);
                }
            } else {
                const response = await this.callOpenRouterAPI(prompt, this.currentModel);
                this.addMessage('assistant', response, true, false);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            this.addMessage('assistant', `❌ Error: ${error.message}`, true, false);
        } finally {
            this.showLoading(false);
            if (this.secondModel) {
                this.showLoading(false, true);
            }
        }
    }

    buildMessageHistory(currentPrompt) {
        const messages = [];
        
        // Add all previous messages from history, filtering out dual-panel duplicates
        for (const msg of this.messages) {
            // Skip messages from second panel (they're duplicates)
            if (msg.isSecondPanel) continue;
            // Include shared messages (system/assistant) but skip shared user messages to avoid duplicates
            if (msg.isShared && msg.role === 'user') continue;
            
            messages.push({
                role: msg.role,
                content: this.sanitizeForAPI(msg.content)
            });
        }
        
        // Add the current prompt as the latest user message
        if (currentPrompt) {
            messages.push({
                role: "user",
                content: this.sanitizeForAPI(currentPrompt)
            });
        }
        
        console.log('Built message history:', messages);
        return messages;
    }

    async callOpenRouterAPI(prompt, model) {
        // Sanitize inputs for Firefox compatibility
        const sanitizedPrompt = this.sanitizeForAPI(prompt);
        const sanitizedApiKey = this.sanitizeForAPI(this.apiKey);
        console.log('Sanitized API Key:', sanitizedApiKey);
        console.log('Sanitized Prompt:', sanitizedPrompt);

        if (!sanitizedApiKey || sanitizedApiKey.length < 10) {
            throw new Error('Invalid API key format. Please check your OpenRouter API key.');
        }

        // Build conversation history for context
        const messages = this.buildMessageHistory(prompt);

        // Use OpenRouter API format
        const payload = {
            model: model,
            messages: messages,
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


    showLoading(show, isSecondPanel = false) {
        if (isSecondPanel) {
            this.secondLoadingIndicator.classList.toggle('active', show);
        } else {
            this.loadingIndicator.classList.toggle('active', show);
        }
        this.sendBtn.disabled = show;
        
        if (show) {
            this.scrollToBottom();
        }
    }

    clearHistory() {
        this.messages = [];
        this.renderMessages();
        this.secondMessagesContainer.innerHTML = `
            <div class="welcome-message">
                <h2>Compare Model Responses</h2>
                <p>Second model responses will appear here when you have selected a compare model.</p>
            </div>
        `;
        // Clear shared question area
        this.questionDisplay.innerHTML = '';
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