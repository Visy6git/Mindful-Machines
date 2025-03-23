// New file to handle UI interactions, reducing app.js size
import { config } from './config.js';

export class UIController {
    constructor(storyTeller) {
        this.storyTeller = storyTeller;
    }
    
    initTooltips() {
        // This would use a tooltip library in production
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.title = element.getAttribute('data-tooltip');
        });
    }
    
    updateCharCounter() {
        const current = this.storyTeller.userInput.value.length;
        const max = config.maxInputLength;
        this.storyTeller.charCounter.textContent = `${current}/${max}`;
        
        // Add visual indicator when approaching limit
        if (current > max * 0.8) {
            this.storyTeller.charCounter.style.color = current > max ? 'red' : 'orange';
        } else {
            this.storyTeller.charCounter.style.color = '';
        }
    }
    
    toggleSidebar() {
        this.storyTeller.sidebar.classList.toggle('open');
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-mode', !this.storyTeller.isDarkMode);
        this.storyTeller.isDarkMode = !this.storyTeller.isDarkMode;
        localStorage.setItem('darkMode', this.storyTeller.isDarkMode);
        
        this.storyTeller.themeToggle.innerHTML = this.storyTeller.isDarkMode ? 
            '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"></path></svg>' :
            '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path></svg>';
    }
    
    updateAudioPlayerUI(isPlaying) {
        this.storyTeller.playButton.innerHTML = isPlaying ? 
            '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>' :
            '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    }

    updateTextNavigationUI() {
        const container = this.storyTeller.textNavigationContainer;
        container.innerHTML = '';
        
        this.storyTeller.storyFlow.scenes.forEach((scene, index) => {
            const textNav = document.createElement('div');
            textNav.className = 'text-nav-item';
            if (index === this.storyTeller.storyFlow.currentSceneIndex) {
                textNav.classList.add('active');
            }
            
            textNav.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>Scene ${index + 1}</span>
            `;
            
            textNav.addEventListener('click', () => {
                this.storyTeller.showScene(index);
            });
            
            container.appendChild(textNav);
        });
    }
}