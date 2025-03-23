import { config } from './config.js';
import { marked } from 'marked';
import { StoryFlow } from './storyFlow.js';
import { UIController } from './uiController.js';
import { AudioController } from './audioController.js';
import { ImageController } from './imageController.js';

class StoryTeller {
    constructor() {
        this.submitButton = document.getElementById('submitButton');
        this.resetButton = document.getElementById('resetButton');
        this.userInput = document.getElementById('userInput');
        this.storyText = document.querySelector('.story-text');
        this.playButton = document.getElementById('playButton');
        this.progressBar = document.querySelector('.progress');
        this.progressBarContainer = document.querySelector('.progress-bar');
        this.charCounter = document.querySelector('.char-counter');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.sidebarToggle = document.querySelector('.mobile-menu-toggle');
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarCollapseBtn = document.querySelector('.sidebar-collapse');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.currentTimeEl = document.querySelector('.current-time');
        this.totalTimeEl = document.querySelector('.total-time');
        this.currentClipTitle = document.querySelector('.current-clip-title');
        this.audioNavigationContainer = document.querySelector('.audio-navigation');
        this.imageNavigationContainer = document.querySelector('.image-navigation');
        this.textNavigationContainer = document.querySelector('.text-navigation');
        
        this.isPlaying = false;
        this.currentAudio = null;
        this.isDarkMode = false;
        this.audioVolume = 0.7;
        this.isFirstSubmission = true;
        
        // Initialize controllers
        this.storyFlow = new StoryFlow(this);
        this.uiController = new UIController(this);
        this.audioController = new AudioController(this);
        this.imageController = new ImageController(this);
        
        this.init();
    }
    
    init() {
        this.submitButton.addEventListener('click', () => this.generateStory());
        this.resetButton.addEventListener('click', () => this.resetAll());
        this.playButton.addEventListener('click', () => this.toggleAudio());
        this.userInput.addEventListener('input', () => this.handleInput());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.progressBarContainer.addEventListener('click', (e) => this.seekAudio(e));
        this.volumeSlider.addEventListener('click', (e) => this.changeVolume(e));
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarCollapseBtn.addEventListener('click', () => this.toggleSidebar());
        
        // Generate sample history items
        this.populateHistoryItems();
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            this.toggleTheme();
        }
        
        // Update counter initially
        this.updateCharCounter();
        
        // Make history items clickable
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.userInput.value = item.getAttribute('data-prompt') || item.textContent.trim();
                this.updateCharCounter();
            });
        });
        
        // Initialize tooltips
        this.uiController.initTooltips();
    }
    
    async generateStory() {
        try {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<div class="spinner"></div><span>Generating...</span>';
            this.storyText.classList.add('loading');
            
            // Show random loading message
            const messages = config.loadingMessages;
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Only replace content if this is the first submission
            if (this.isFirstSubmission) {
                this.storyText.textContent = randomMessage;
            } else {
                // Append loading indicator for continuations
                const loadingEl = document.createElement('div');
                loadingEl.id = 'continuation-loading';
                loadingEl.textContent = randomMessage;
                loadingEl.style.opacity = '0.7';
                loadingEl.style.fontStyle = 'italic';
                this.storyText.appendChild(loadingEl);
            }
            
            // Add to history if not already present
            this.addToHistory(this.userInput.value);
            
            // Simulate API call (replace with actual API integration)
            const response = await this.mockApiCall();
            
            this.updateUI(response);
            
            // Mark as not first submission after first generate
            this.isFirstSubmission = false;
        } catch (error) {
            console.error('Error generating story:', error);
            this.storyText.innerHTML = `<p class="error">Error generating story. Please try again.</p>`;
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = this.isFirstSubmission ? 
                '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 12l5 4v-3h9v-2H7V8z" transform="rotate(180, 12, 12)"></path></svg> Generate Story' :
                '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 12l5 4v-3h9v-2H7V8z" transform="rotate(180, 12, 12)"></path></svg> Continue Story';
            this.storyText.classList.remove('loading');
            
            // Remove continuation loading indicator if it exists
            const loadingEl = document.getElementById('continuation-loading');
            if (loadingEl) {
                loadingEl.remove();
            }
        }
    }
    
    async mockApiCall() {
        // Simulate API delay with a variable time
        const delay = 1500 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Generate a more dynamic mock response based on user input
        const userPrompt = this.userInput.value.trim();
        let storyText = "";
        let imageDescription = "";
        let audioData = null;
        
        if (userPrompt.length > 0) {
            const keywords = userPrompt.split(' ');
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            
            if (this.isFirstSubmission) {
                storyText = `# The Tale of ${randomKeyword.charAt(0).toUpperCase() + randomKeyword.slice(1)}
                
Once upon a time in a world where imagination rules, there existed a remarkable entity known as **${randomKeyword}**. 

The ${randomKeyword} was unlike anything seen before. It shimmered with possibility and whispered tales of adventure to those who would listen.

> "Nothing is impossible," the ${randomKeyword} would say, "when you believe in the power of stories."

## The Journey Begins

And so began an epic journey that would transform everything...`;
                
                imageDescription = `The magical ${randomKeyword}`;
                
                // Generate mock audio data for the first scene
                audioData = {
                    title: "Introduction",
                    duration: 180 + Math.floor(Math.random() * 120)
                };
                
                // Initialize the story flow with the first part
                this.storyFlow.initializeStory(storyText, {description: imageDescription}, audioData);
            } else {
                // Generate continuation based on user input
                storyText = `As the tale unfolded, the **${randomKeyword}** revealed its true nature. 

The world around trembled with anticipation as ${randomKeyword} stepped forward, ready to face the challenge ahead.

"This is only the beginning," whispered the ${randomKeyword}, eyes gleaming with determination.

The path ahead was uncertain, filled with shadows and light intertwined, but the journey would continue regardless.`;
                
                imageDescription = `${randomKeyword} facing challenges`;
                
                // Generate mock audio data for continuation
                // Create between 1-3 audio clips for this scene
                const numClips = 1 + Math.floor(Math.random() * 2);
                audioData = [];
                
                for (let i = 0; i < numClips; i++) {
                    audioData.push({
                        title: i === 0 ? "Continuation" : `Ambient Sound ${i}`,
                        duration: 60 + Math.floor(Math.random() * 180)
                    });
                }
                
                // Continue the existing story
                storyText = this.storyFlow.continueStory(
                    storyText, 
                    {description: imageDescription}, 
                    audioData
                );
            }
        } else {
            storyText = "Once upon a time in a digital realm, stories came alive with just a few words...";
            imageDescription = "A magical story scene";
            audioData = {
                title: "Introduction",
                duration: 120
            };
            
            this.storyFlow.initializeStory(storyText, {description: imageDescription}, audioData);
        }
        
        this.userInput.value = ""; // Clear input after generating/continuing
        this.updateCharCounter();
        
        return {
            text: storyText,
            imageDescription: imageDescription
        };
    }
    
    updateUI(response) {
        // Update text with animation
        this.storyText.style.opacity = 0;
        setTimeout(() => {
            this.storyText.innerHTML = marked(response.text);
            this.storyText.style.opacity = 1;
            this.storyText.classList.add('fade-in');
            
            // Update button text for next action
            this.submitButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 12l5 4v-3h9v-2H7V8z" transform="rotate(180, 12, 12)"></path></svg> Continue Story';
        }, 200);
        
        // Determine which scene to use
        const currentScene = this.storyFlow.getCurrentScene();
        
        // Show the latest image
        if (currentScene && currentScene.imageIndex !== null) {
            this.imageController.showImage(currentScene.imageIndex);
        }
        
        // Set up audio player with the first audio from the new scene
        if (currentScene && currentScene.audioIndices.length > 0) {
            // Reset the audio player first
            this.audioController.reset();
            
            // Play the first audio of the new scene
            this.audioController.playAudioAtIndex(currentScene.audioIndices[0]);
        }
        
        // Update text navigation UI
        this.uiController.updateTextNavigationUI();
    }
    
    handleInput() {
        this.uiController.updateCharCounter();
        const length = this.userInput.value.length;
        this.submitButton.disabled = length === 0 || length > config.maxInputLength;
    }
    
    addToHistory(prompt) {
        if (!prompt.trim()) return;
        
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            // Check if this prompt already exists
            const exists = Array.from(historyList.children).some(
                item => item.getAttribute('data-prompt') === prompt
            );
            
            if (!exists) {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.setAttribute('data-prompt', prompt);
                
                // Truncate long prompts
                const displayText = prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt;
                
                li.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ${displayText}
                `;
                
                li.addEventListener('click', () => {
                    document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
                    li.classList.add('active');
                    this.userInput.value = prompt;
                    this.updateCharCounter();
                });
                
                // Add to the top of the list
                historyList.insertBefore(li, historyList.firstChild);
            }
        }
    }
    
    populateHistoryItems() {
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            config.sampleHistoryItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.setAttribute('data-prompt', item);
                li.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ${item}
                `;
                historyList.appendChild(li);
            });
        }
    }
    
    toggleSidebar() {
        this.uiController.toggleSidebar();
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        localStorage.setItem('darkMode', this.isDarkMode);
        
        this.themeToggle.innerHTML = this.isDarkMode ? 
            '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"></path></svg>' :
            '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path></svg>';
    }
    
    toggleAudio() {
        this.audioController.toggleAudio();
    }
    
    seekAudio(event) {
        this.audioController.seekAudio(event);
    }
    
    changeVolume(event) {
        this.audioController.changeVolume(event);
    }
    
    updateCharCounter() {
        this.uiController.updateCharCounter();
    }
    
    showScene(index) {
        const scene = this.storyFlow.setCurrentScene(index);
        if (!scene) return;
        
        // Update text with animation
        this.storyText.style.opacity = 0;
        setTimeout(() => {
            // Show just the current scene's text instead of cumulative text
            this.storyText.innerHTML = marked(scene.text);
            this.storyText.style.opacity = 1;
            this.storyText.classList.add('fade-in');
        }, 200);
        
        // Show the corresponding image
        if (scene.imageIndex !== null) {
            this.imageController.showImage(scene.imageIndex);
        }
        
        // Set up audio player with the first audio from the scene
        if (scene.audioIndices.length > 0) {
            this.audioController.playAudioAtIndex(scene.audioIndices[0]);
            this.audioController.isPlaying = true;
            this.uiController.updateAudioPlayerUI(true);
        } else {
            // Reset audio if the scene has no audio clips
            this.audioController.reset();
        }
        
        // Update all navigation UIs
        this.uiController.updateTextNavigationUI();
    }
    
    resetAll() {
        this.isFirstSubmission = true;
        this.userInput.value = '';
        this.updateCharCounter();
        this.storyText.innerHTML = '';
        
        // Reset all controllers
        this.audioController.reset();
        this.imageController.reset();
        this.storyFlow.reset();
        
        // Reset button text
        this.submitButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 12l5 4v-3h9v-2H7V8z" transform="rotate(180, 12, 12)"></path></svg> Generate Story';
        
        // Deselect active history item
        document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
        
        // Also update text navigation UI
        this.uiController.updateTextNavigationUI();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new StoryTeller();
});