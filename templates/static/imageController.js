export class ImageController {
    constructor(storyTeller) {
        this.storyTeller = storyTeller;
        this.storyImages = [];
        this.currentImageIndex = 0;
    }
    
    addImage(description, color) {
        const imageData = {
            id: `image-${Date.now()}-${this.storyImages.length}`,
            description,
            color: color || this.getRandomColor(),
            svg: this.generateStoryImage(description, color || this.getRandomColor())
        };
        
        this.storyImages.push(imageData);
        this.updateImageNavigationUI();
        return imageData;
    }
    
    showImage(index) {
        if (index >= 0 && index < this.storyImages.length) {
            this.currentImageIndex = index;
            const imageData = this.storyImages[index];
            
            // Update the image display with animation
            const svg = document.getElementById('placeholder-image');
            svg.style.opacity = 0;
            setTimeout(() => {
                svg.innerHTML = imageData.svg;
                svg.style.opacity = 1;
                svg.classList.add('scale-in');
            }, 200);
            
            // Update navigation UI
            this.updateImageNavigationUI();
        }
    }
    
    getRandomColor() {
        const colors = ['#10a37f', '#FF5722', '#2196F3', '#9C27B0', '#FFEB3B'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    generateStoryImage(description, color) {
        // Generate a more interesting SVG based on the description
        const words = description.split(' ');
        const shapes = [];
        
        // Create unique shapes based on words in the description
        words.forEach((word, index) => {
            const angle = (index / words.length) * Math.PI * 2;
            const radius = 70;
            const x = 100 + Math.cos(angle) * radius;
            const y = 100 + Math.sin(angle) * radius;
            
            const size = 10 + (word.length * 2);
            const opacity = 0.3 + Math.random() * 0.5;
            
            if (index % 3 === 0) {
                shapes.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}">
                    <animate attributeName="r" values="${size};${size + 10};${size}" dur="${2 + Math.random() * 3}s" repeatCount="indefinite" />
                </circle>`);
            } else if (index % 3 === 1) {
                shapes.push(`<rect x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="${color}" opacity="${opacity}">
                    <animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="${5 + Math.random() * 5}s" repeatCount="indefinite" />
                </rect>`);
            } else {
                const points = [];
                for (let i = 0; i < 3; i++) {
                    const a = (i / 3) * Math.PI * 2;
                    points.push(`${x + Math.cos(a) * size},${y + Math.sin(a) * size}`);
                }
                shapes.push(`<polygon points="${points.join(' ')}" fill="${color}" opacity="${opacity}">
                    <animate attributeName="opacity" values="${opacity};${opacity + 0.2};${opacity}" dur="${2 + Math.random() * 2}s" repeatCount="indefinite" />
                </polygon>`);
            }
        });
        
        return `
            <rect x="0" y="0" width="200" height="200" fill="var(--bg-color)"/>
            <circle cx="100" cy="100" r="80" fill="${color}" opacity="0.1">
                <animate attributeName="r" values="80;90;80" dur="10s" repeatCount="indefinite" />
            </circle>
            ${shapes.join('')}
            <text x="100" y="180" text-anchor="middle" fill="var(--text-color)" font-weight="bold" font-size="10">
                ${description}
            </text>
        `;
    }
    
    updateImageNavigationUI() {
        const container = this.storyTeller.imageNavigationContainer;
        container.innerHTML = '';
        
        this.storyImages.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'image-thumbnail';
            if (index === this.currentImageIndex) {
                thumbnail.classList.add('active');
            }
            
            // Create a small thumbnail version of the SVG
            thumbnail.innerHTML = `
                <svg viewBox="0 0 200 200" width="40" height="40">
                    <rect x="0" y="0" width="200" height="200" fill="var(--bg-color)"/>
                    <circle cx="100" cy="100" r="80" fill="${image.color}" opacity="0.2"/>
                </svg>
            `;
            
            thumbnail.addEventListener('click', () => {
                this.showImage(index);
            });
            
            container.appendChild(thumbnail);
        });
    }
    
    reset() {
        this.storyImages = [];
        this.currentImageIndex = 0;
        
        // Reset the image to default
        const svg = document.getElementById('placeholder-image');
        svg.innerHTML = `
            <rect x="0" y="0" width="200" height="200" fill="var(--bg-color)"/>
            <text x="100" y="100" text-anchor="middle" fill="var(--text-color)" opacity="0.6">
                Your story image will appear here
            </text>
        `;
        
        this.updateImageNavigationUI();
    }
}