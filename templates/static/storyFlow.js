// New file to handle story continuation functionality
export class StoryFlow {
    constructor(storyTeller) {
        this.storyTeller = storyTeller;
        this.storyParts = [];
        this.currentStory = "";
        this.scenes = []; // New property to track story scenes
        this.currentSceneIndex = 0; // Track current scene
    }
    
    initializeStory(text, imageData, audioData) {
        this.storyParts = [text];
        this.currentStory = text;
        
        // Initialize scenes array with first scene
        this.scenes = [{
            text,
            imageIndex: imageData ? this.storyTeller.imageController.addImage(
                imageData.description, 
                imageData.color
            ) : null,
            audioIndices: audioData ? [this.storyTeller.audioController.addAudioClip({
                title: audioData.title || "Opening Scene",
                duration: audioData.duration,
                sceneIndex: 0
            })] : []
        }];
        
        return text;
    }
    
    continueStory(newContent, imageData, audioData) {
        this.storyParts.push(newContent);
        this.currentStory = this.storyParts.join("\n\n## Continuation\n\n");
        
        // Add a new scene
        const sceneIndex = this.scenes.length;
        
        // Process image if provided
        let newImageIndex = null;
        if (imageData) {
            const image = this.storyTeller.imageController.addImage(
                imageData.description,
                imageData.color
            );
            newImageIndex = this.storyTeller.imageController.storyImages.length - 1;
        }
        
        // Process audio clips if provided
        const audioIndices = [];
        if (audioData) {
            if (Array.isArray(audioData)) {
                // Multiple audio clips
                audioData.forEach(clip => {
                    const audioIndex = this.storyTeller.audioController.addAudioClip({
                        title: clip.title || `Scene ${sceneIndex + 1} - Clip ${audioIndices.length + 1}`,
                        duration: clip.duration,
                        sceneIndex
                    });
                    audioIndices.push(audioIndex);
                });
            } else {
                // Single audio clip
                const audioIndex = this.storyTeller.audioController.addAudioClip({
                    title: audioData.title || `Scene ${sceneIndex + 1}`,
                    duration: audioData.duration,
                    sceneIndex
                });
                audioIndices.push(audioIndex);
            }
        }
        
        // Add the new scene to scenes array
        this.scenes.push({
            text: newContent,
            imageIndex: newImageIndex,
            audioIndices
        });
        
        return this.currentStory;
    }
    
    getCurrentStory() {
        return this.currentStory;
    }
    
    setCurrentScene(index) {
        if (index >= 0 && index < this.scenes.length) {
            this.currentSceneIndex = index;
            return this.scenes[index];
        }
        return null;
    }
    
    getScene(index) {
        if (index >= 0 && index < this.scenes.length) {
            return this.scenes[index];
        }
        return null;
    }
    
    getCurrentScene() {
        return this.scenes[this.scenes.length - 1];
    }
    
    getTotalScenes() {
        return this.scenes.length;
    }
    
    reset() {
        this.storyParts = [];
        this.currentStory = "";
        this.scenes = [];
    }
}