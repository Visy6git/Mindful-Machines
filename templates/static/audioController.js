export class AudioController {
    constructor(storyTeller) {
        this.storyTeller = storyTeller;
        this.audioClips = [];
        this.currentAudioIndex = 0;
        this.isPlaying = false;
    }
    
    addAudioClip(audioData) {
        // In real implementation, would use actual audio URL
        // For now, store metadata about the audio clip
        this.audioClips.push({
            id: `audio-${Date.now()}-${this.audioClips.length}`,
            title: audioData.title || `Clip ${this.audioClips.length + 1}`,
            duration: audioData.duration || 222, // 3:42 in seconds as default
            currentTime: 0,
            sceneIndex: audioData.sceneIndex || 0
        });
        
        this.updateAudioNavigationUI();
        return this.audioClips.length - 1; // Return index of newly added clip
    }
    
    playAudioAtIndex(index) {
        if (index >= 0 && index < this.audioClips.length) {
            this.currentAudioIndex = index;
            this.playCurrentAudio();
            
            // Highlight the active audio in the navigation
            this.updateAudioNavigationUI();
        }
    }
    
    playCurrentAudio() {
        if (this.storyTeller.currentAudio) {
            this.storyTeller.currentAudio.pause();
        }
        
        // In real implementation, would use actual audio URL
        this.storyTeller.currentAudio = new Audio();
        this.storyTeller.currentAudio.volume = this.storyTeller.audioVolume;
        
        const currentClip = this.audioClips[this.currentAudioIndex];
        
        this.storyTeller.currentAudio.addEventListener('timeupdate', () => {
            const progress = (this.storyTeller.currentAudio.currentTime / this.storyTeller.currentAudio.duration) * 100;
            this.storyTeller.progressBar.style.width = `${progress}%`;
            this.updateTimeDisplay();
            
            // Update the current clip's time for resuming later
            currentClip.currentTime = this.storyTeller.currentAudio.currentTime;
        });
        
        this.storyTeller.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.storyTeller.uiController.updateAudioPlayerUI(false);
            
            // Auto-play next clip if available
            if (this.currentAudioIndex < this.audioClips.length - 1) {
                this.currentAudioIndex++;
                this.playCurrentAudio();
                this.isPlaying = true;
                this.storyTeller.uiController.updateAudioPlayerUI(true);
            }
        });
        
        this.storyTeller.currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            // Simulate audio playback for demo
            this.simulateAudio(currentClip);
        });
        
        // Update audio navigation UI to highlight current clip
        this.updateAudioNavigationUI();
        
        // Set clip metadata in UI
        this.storyTeller.currentClipTitle.textContent = currentClip.title;
        this.storyTeller.totalTimeEl.textContent = this.formatTime(currentClip.duration);
    }
    
    toggleAudio() {
        if (this.audioClips.length === 0) {
            // No audio clips available
            return;
        }
        
        if (this.isPlaying) {
            if (this.storyTeller.currentAudio) {
                this.storyTeller.currentAudio.pause();
            }
        } else {
            if (!this.storyTeller.currentAudio) {
                this.playCurrentAudio();
            } else {
                this.storyTeller.currentAudio.play().catch(error => {
                    console.error('Error resuming audio:', error);
                    // Simulate audio playback for demo
                    const currentClip = this.audioClips[this.currentAudioIndex];
                    this.simulateAudio(currentClip, currentClip.currentTime);
                });
            }
        }
        
        this.isPlaying = !this.isPlaying;
        this.storyTeller.uiController.updateAudioPlayerUI(this.isPlaying);
    }
    
    updateTimeDisplay() {
        if (this.storyTeller.currentAudio) {
            this.storyTeller.currentTimeEl.textContent = this.formatTime(this.storyTeller.currentAudio.currentTime);
            this.storyTeller.totalTimeEl.textContent = this.formatTime(this.storyTeller.currentAudio.duration);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) seconds = 0;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }
    
    simulateAudio(clip, startTime = 0) {
        // Simulate audio progress for demo purposes
        let progress = (startTime / clip.duration) * 100;
        let currentTime = startTime;
        
        const interval = setInterval(() => {
            progress += 0.5;
            currentTime += (clip.duration / 200);
            
            this.storyTeller.progressBar.style.width = `${progress}%`;
            this.storyTeller.currentTimeEl.textContent = this.formatTime(currentTime);
            
            // Update the clip's current time for resuming later
            clip.currentTime = currentTime;
            
            if (progress >= 100 || !this.isPlaying) {
                clearInterval(interval);
                if (progress >= 100) {
                    this.isPlaying = false;
                    this.storyTeller.uiController.updateAudioPlayerUI(false);
                    
                    // Auto-play next clip if available
                    if (this.currentAudioIndex < this.audioClips.length - 1) {
                        this.currentAudioIndex++;
                        this.playCurrentAudio();
                        this.isPlaying = true;
                        this.storyTeller.uiController.updateAudioPlayerUI(true);
                    }
                }
            }
        }, 100);
    }
    
    seekAudio(event) {
        const rect = this.storyTeller.progressBarContainer.getBoundingClientRect();
        const pos = (event.clientX - rect.left) / rect.width;
        
        if (this.storyTeller.currentAudio && !isNaN(this.storyTeller.currentAudio.duration)) {
            this.storyTeller.currentAudio.currentTime = pos * this.storyTeller.currentAudio.duration;
        } else if (this.audioClips.length > 0) {
            // For demo, just update the progress bar
            const currentClip = this.audioClips[this.currentAudioIndex];
            this.storyTeller.progressBar.style.width = `${pos * 100}%`;
            this.storyTeller.currentTimeEl.textContent = this.formatTime(pos * currentClip.duration);
            currentClip.currentTime = pos * currentClip.duration;
        }
    }
    
    changeVolume(event) {
        const rect = this.storyTeller.volumeSlider.getBoundingClientRect();
        this.storyTeller.audioVolume = (event.clientX - rect.left) / rect.width;
        
        // Clamp between 0 and 1
        this.storyTeller.audioVolume = Math.max(0, Math.min(1, this.storyTeller.audioVolume));
        
        document.querySelector('.volume-level').style.width = `${this.storyTeller.audioVolume * 100}%`;
        
        if (this.storyTeller.currentAudio) {
            this.storyTeller.currentAudio.volume = this.storyTeller.audioVolume;
        }
    }
    
    updateAudioNavigationUI() {
        const container = this.storyTeller.audioNavigationContainer;
        
        // Clear existing clips
        container.innerHTML = '';
        
        if (this.audioClips.length === 0) {
            container.innerHTML = '<div class="no-audio-message">No audio clips available</div>';
            return;
        }
        
        // Group clips by scene
        const sceneMap = new Map();
        this.audioClips.forEach((clip, index) => {
            if (!sceneMap.has(clip.sceneIndex)) {
                sceneMap.set(clip.sceneIndex, []);
            }
            sceneMap.get(clip.sceneIndex).push({...clip, index});
        });
        
        // Create scene-based navigation
        sceneMap.forEach((clips, sceneIndex) => {
            const sceneDiv = document.createElement('div');
            sceneDiv.className = 'audio-scene';
            sceneDiv.innerHTML = `<div class="scene-title">Scene ${sceneIndex + 1}</div>`;
            
            const clipsContainer = document.createElement('div');
            clipsContainer.className = 'scene-clips';
            
            clips.forEach(clip => {
                const clipDiv = document.createElement('div');
                clipDiv.className = 'audio-clip';
                if (clip.index === this.currentAudioIndex) {
                    clipDiv.classList.add('active');
                }
                
                clipDiv.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <span>${clip.title}</span>
                    <span class="clip-duration">${this.formatTime(clip.duration)}</span>
                `;
                
                clipDiv.addEventListener('click', () => {
                    this.playAudioAtIndex(clip.index);
                    this.isPlaying = true;
                    this.storyTeller.uiController.updateAudioPlayerUI(true);
                });
                
                clipsContainer.appendChild(clipDiv);
            });
            
            sceneDiv.appendChild(clipsContainer);
            container.appendChild(sceneDiv);
        });
    }
    
    reset() {
        if (this.storyTeller.currentAudio) {
            this.storyTeller.currentAudio.pause();
            this.storyTeller.currentAudio = null;
        }
        this.audioClips = [];
        this.currentAudioIndex = 0;
        this.isPlaying = false;
        this.storyTeller.uiController.updateAudioPlayerUI(false);
        this.storyTeller.progressBar.style.width = '0%';
        this.storyTeller.currentTimeEl.textContent = '0:00';
        this.storyTeller.totalTimeEl.textContent = '0:00';
        this.storyTeller.currentClipTitle.textContent = 'No audio selected';
        this.updateAudioNavigationUI();
    }
}