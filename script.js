// Particle System Class
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#ff6b9d', '#c44569', '#f8b500', '#ff6b35', '#feca57'];
        this.shapes = ['heart', 'circle', 'star'];
        this.animationFrame = null;
        this.isPaused = false;
        
        // Responsive particle count based on device
        this.updateParticleCount();
        this.resize();
        this.init();
        
        // Throttled resize handler for better performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateParticleCount();
                this.resize();
                this.reinitParticles();
            }, 250);
        });
    }
    
    updateParticleCount() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024 && window.innerWidth >= 768;
        const pixelRatio = window.devicePixelRatio || 1;
        
        if (isMobile) {
            this.particleCount = Math.floor(50 / pixelRatio);
        } else if (isTablet) {
            this.particleCount = Math.floor(75 / pixelRatio);
        } else {
            this.particleCount = Math.floor(100 / pixelRatio);
        }
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set actual size in memory (scaled for DPI)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale the context back down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Reset transform and scale the drawing context
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }
    
    reinitParticles() {
        this.particles = [];
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 8 + 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            shape: this.shapes[Math.floor(Math.random() * this.shapes.length)],
            opacity: Math.random() * 0.8 + 0.2,
            glow: Math.random() * 20 + 10,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
    }
    
    drawHeart(x, y, size, color, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = this.particles.find(p => p.x === x && p.y === y)?.glow || 15;
        
        this.ctx.beginPath();
        const topCurveHeight = size * 0.3;
        this.ctx.moveTo(x, y + topCurveHeight);
        this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
        this.ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
        this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawCircle(x, y, size, color, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = this.particles.find(p => p.x === x && p.y === y)?.glow || 15;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawStar(x, y, size, color, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = this.particles.find(p => p.x === x && p.y === y)?.glow || 15;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const nextX = x + Math.cos(angle) * size;
            const nextY = y + Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(nextX, nextY);
            } else {
                this.ctx.lineTo(nextX, nextY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    update() {
        const rect = this.canvas.getBoundingClientRect();
        
        // Clear the canvas (already scaled in resize)
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            
            if (particle.x < 0 || particle.x > rect.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > rect.height) {
                particle.vy *= -1;
            }
            
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            switch (particle.shape) {
                case 'heart':
                    this.drawHeart(0, 0, particle.size, particle.color, particle.opacity);
                    break;
                case 'circle':
                    this.drawCircle(0, 0, particle.size, particle.color, particle.opacity);
                    break;
                case 'star':
                    this.drawStar(0, 0, particle.size, particle.color, particle.opacity);
                    break;
            }
            
            this.ctx.restore();
        });
    }
    
    animate() {
        if (!this.isPaused) {
            this.update();
        }
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Animation Manager Class
class AnimationManager {
    constructor() {
        this.currentEffect = 'fade';
        this.isPlaying = true;
        this.speed = 1;
        this.elements = {
            title: document.getElementById('main-title'),
            subtitle: document.getElementById('subtitle'),
            message: document.getElementById('message-text'),
            heart: document.getElementById('main-heart')
        };
        
        this.effects = {
            fade: this.fadeEffect.bind(this),
            typewriter: this.typewriterEffect.bind(this),
            morph: this.morphEffect.bind(this),
            scale: this.scaleEffect.bind(this),
            rotate: this.rotateEffect.bind(this),
            combined: this.combinedEffect.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.startAnimation();
    }
    
    removeAllEffects() {
        Object.values(this.elements).forEach(element => {
            if (element) {
                element.className = element.className.replace(/\w+-effect/g, '');
                element.style.animation = '';
                element.style.opacity = '';
                element.style.transform = '';
            }
        });
        
        // Restore message text if it was modified
        if (this.elements.message && this.elements.message.dataset.originalHTML) {
            this.elements.message.innerHTML = this.elements.message.dataset.originalHTML;
            delete this.elements.message.dataset.originalHTML;
        }
    }
    
    fadeEffect() {
        this.removeAllEffects();
        
        // Elegant fade-in with stagger
        const textElements = [this.elements.title, this.elements.subtitle, this.elements.message];
        textElements.forEach((element, index) => {
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    element.classList.add('fade-effect');
                    element.style.opacity = '';
                    element.style.transform = '';
                }, index * 300 / this.speed);
            }
        });
        
        // Heart gets a subtle pulse
        if (this.elements.heart) {
            this.elements.heart.classList.add('fade-effect');
        }
    }
    
    typewriterEffect() {
        this.removeAllEffects();
        
        // Store original HTML if not already stored
        if (this.elements.message && !this.elements.message.dataset.originalHTML) {
            this.elements.message.dataset.originalHTML = this.elements.message.innerHTML;
        }
        
        // Store original text lengths before modifying
        const titleText = this.elements.title ? this.elements.title.textContent : '';
        const subtitleText = this.elements.subtitle ? this.elements.subtitle.textContent : '';
        const titleLength = titleText.length;
        const subtitleLength = subtitleText.length;
        
        // Handle title with typewriter
        if (this.elements.title) {
            this.elements.title.textContent = '';
            this.elements.title.classList.add('typewriter-effect');
            
            let charIndex = 0;
            const typeTitle = () => {
                if (charIndex < titleLength) {
                    this.elements.title.textContent += titleText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeTitle, 50 / this.speed);
                } else {
                    this.elements.title.classList.remove('typewriter-effect');
                    this.elements.title.style.borderRight = 'none';
                }
            };
            setTimeout(() => typeTitle(), 200 / this.speed);
        }
        
        // Handle subtitle with typewriter
        if (this.elements.subtitle) {
            const subtitleDelay = (titleLength * 50 + 500) / this.speed;
            setTimeout(() => {
                this.elements.subtitle.textContent = '';
                this.elements.subtitle.classList.add('typewriter-effect');
                
                let charIndex = 0;
                const typeSubtitle = () => {
                    if (charIndex < subtitleLength) {
                        this.elements.subtitle.textContent += subtitleText.charAt(charIndex);
                        charIndex++;
                        setTimeout(typeSubtitle, 40 / this.speed);
                    } else {
                        this.elements.subtitle.classList.remove('typewriter-effect');
                        this.elements.subtitle.style.borderRight = 'none';
                    }
                };
                typeSubtitle();
            }, subtitleDelay);
        }
        
        // Handle message with word-by-word reveal (better for responsive)
        if (this.elements.message) {
            const messageElement = this.elements.message;
            const originalHTML = messageElement.dataset.originalHTML || messageElement.innerHTML;
            
            // Parse HTML to preserve line breaks
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            
            // Process each node to preserve structure
            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const words = text.split(/(\s+)/);
                    return words.map(word => ({ type: 'text', content: word }));
                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                    return [{ type: 'break' }];
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const children = Array.from(node.childNodes);
                    return children.flatMap(processNode);
                }
                return [];
            };
            
            const nodes = Array.from(tempDiv.childNodes);
            const tokens = nodes.flatMap(processNode);
            
            messageElement.innerHTML = '';
            messageElement.style.opacity = '1';
            
            let tokenIndex = 0;
            const typeMessage = () => {
                if (tokenIndex < tokens.length) {
                    const token = tokens[tokenIndex];
                    if (token.type === 'break') {
                        messageElement.appendChild(document.createElement('br'));
                        tokenIndex++;
                        setTimeout(typeMessage, 50 / this.speed);
                    } else if (token.content.trim() || token.content === ' ') {
                        const span = document.createElement('span');
                        span.textContent = token.content;
                        span.style.opacity = '0';
                        span.style.animation = 'fadeInWord 0.2s ease-in forwards';
                        messageElement.appendChild(span);
                        tokenIndex++;
                        setTimeout(typeMessage, 25 / this.speed);
                    } else {
                        tokenIndex++;
                        setTimeout(typeMessage, 10 / this.speed);
                    }
                }
            };
            
            const messageDelay = ((titleLength * 50) + (subtitleLength * 40) + 1000) / this.speed;
            setTimeout(() => {
                typeMessage();
            }, messageDelay);
        }
    }
    
    morphEffect() {
        this.removeAllEffects();
        // Subtle morph only on title and heart
        if (this.elements.title) {
            this.elements.title.classList.add('morph-effect');
        }
        if (this.elements.heart) {
            this.elements.heart.classList.add('morph-effect');
        }
        // Subtitle and message get fade
        if (this.elements.subtitle) {
            this.elements.subtitle.style.animation = 'fadeIn 1.5s ease-in-out';
        }
        if (this.elements.message) {
            this.elements.message.style.animation = 'fadeIn 1.5s ease-in-out';
        }
    }
    
    scaleEffect() {
        this.removeAllEffects();
        // Only scale title and heart, not the message
        if (this.elements.title) {
            this.elements.title.classList.add('scale-effect');
        }
        if (this.elements.heart) {
            this.elements.heart.classList.add('scale-effect');
        }
        // Subtitle and message get fade
        if (this.elements.subtitle) {
            this.elements.subtitle.style.animation = 'fadeIn 1.5s ease-in-out';
        }
        if (this.elements.message) {
            this.elements.message.style.animation = 'fadeIn 1.5s ease-in-out';
        }
    }
    
    rotateEffect() {
        this.removeAllEffects();
        // Only rotate heart, not text
        if (this.elements.heart) {
            this.elements.heart.classList.add('rotate-effect');
        }
        // Text gets elegant fade
        const textElements = [this.elements.title, this.elements.subtitle, this.elements.message];
        textElements.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.style.animation = 'fadeInUp 1s ease-out';
                }, index * 200);
            }
        });
    }
    
    combinedEffect() {
        this.removeAllEffects();
        // Elegant combined effect - title and heart
        if (this.elements.title) {
            this.elements.title.classList.add('combined-effect');
        }
        if (this.elements.heart) {
            this.elements.heart.classList.add('combined-effect');
        }
        // Subtitle and message get staggered fade
        if (this.elements.subtitle) {
            setTimeout(() => {
                this.elements.subtitle.style.animation = 'fadeInUp 1s ease-out';
            }, 300);
        }
        if (this.elements.message) {
            setTimeout(() => {
                this.elements.message.style.animation = 'fadeInUp 1.2s ease-out';
            }, 600);
        }
    }
    
    setEffect(effectName) {
        if (this.effects[effectName]) {
            this.currentEffect = effectName;
            this.effects[effectName]();
        }
    }
    
    startAnimation() {
        if (this.isPlaying) {
            this.effects[this.currentEffect]();
        }
    }
    
    pauseAnimation() {
        this.isPlaying = false;
        this.removeAllEffects();
    }
    
    resumeAnimation() {
        this.isPlaying = true;
        this.startAnimation();
    }
    
    setSpeed(speed) {
        this.speed = speed;
        if (this.isPlaying) {
            this.startAnimation();
        }
    }
}

// Stage Manager Class
class StageManager {
    constructor() {
        this.currentStage = 1;
        this.totalStages = 3;
        this.stages = [
            document.getElementById('stage1'),
            document.getElementById('stage2'),
            document.getElementById('stage3')
        ];
        this.progressFill = document.getElementById('progress-fill');
        this.stageIndicators = document.querySelectorAll('.stage-indicator');
        this.animationManager = null;
        this.particleSystem = null;
        
        this.init();
    }
    
    init() {
        this.startStageSequence();
    }
    
    startStageSequence() {
        // Stage 1: VS Code typing (3 seconds)
        setTimeout(() => {
            this.nextStage();
        }, 3000);
        
        // Stage 2: Run sequence (4 seconds)
        setTimeout(() => {
            this.nextStage();
            this.initStage3();
        }, 7000);
    }
    
    nextStage() {
        if (this.currentStage < this.totalStages) {
            this.stages[this.currentStage - 1].classList.remove('active');
            this.currentStage++;
            this.stages[this.currentStage - 1].classList.add('active');
            this.updateProgress();
            this.updateIndicators();
        }
    }
    
    updateProgress() {
        const progress = (this.currentStage / this.totalStages) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    updateIndicators() {
        this.stageIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index + 1 === this.currentStage);
        });
    }
    
    initStage3() {
        // Initialize particle system
        const canvas = document.getElementById('particle-canvas');
        if (canvas) {
            this.particleSystem = new ParticleSystem(canvas);
            this.particleSystem.animate();
        }
        
        // Initialize animation manager
        this.animationManager = new AnimationManager();
        
        // Initialize controls
        this.initControls();
    }
    
    initControls() {
        const playPauseBtn = document.getElementById('play-pause');
        const speedBtn = document.getElementById('speed-control');
        const effectBtn = document.getElementById('effect-cycle');
        const musicBtn = document.getElementById('music-toggle');
        const animBtns = document.querySelectorAll('.anim-btn');
        const audio = document.getElementById('background-music');
        
        let isPlaying = true;
        let currentSpeed = 1;
        let currentEffectIndex = 0;
        const effects = ['fade', 'typewriter', 'morph', 'scale', 'rotate', 'combined'];
        
        // Play/Pause button
        playPauseBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
            
            if (isPlaying) {
                this.animationManager.resumeAnimation();
            } else {
                this.animationManager.pauseAnimation();
            }
        });
        
        // Speed control
        speedBtn.addEventListener('click', () => {
            currentSpeed = currentSpeed === 1 ? 2 : currentSpeed === 2 ? 0.5 : 1;
            speedBtn.textContent = currentSpeed === 2 ? '⚡⚡' : currentSpeed === 0.5 ? '🐌' : '⚡';
            this.animationManager.setSpeed(currentSpeed);
        });
        
        // Effect cycle
        effectBtn.addEventListener('click', () => {
            currentEffectIndex = (currentEffectIndex + 1) % effects.length;
            this.animationManager.setEffect(effects[currentEffectIndex]);
            effectBtn.textContent = '✨';
            setTimeout(() => {
                effectBtn.textContent = '✨';
            }, 200);
        });
        
        // Music toggle
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(e => console.log('Audio play failed:', e));
                musicBtn.textContent = '🔇';
            } else {
                audio.pause();
                musicBtn.textContent = '🎵';
            }
        });
        
        // Animation buttons
        animBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const effect = btn.dataset.effect;
                this.animationManager.setEffect(effect);
                
                // Update active button
                animBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Set initial active button
        animBtns[0].classList.add('active');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const stageManager = new StageManager();
    
    // Add some interactive effects
    document.addEventListener('click', (e) => {
        // Create ripple effect on click
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 107, 157, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    });
    
    // Add ripple animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Enhanced touch support for mobile
let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };

document.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    if (e.touches.length > 0) {
        touchStartPos.x = e.touches[0].clientX;
        touchStartPos.y = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const touchEndTime = Date.now();
    const timeDiff = touchEndTime - touchStartTime;
    
    // Only trigger click if it was a quick tap (not a swipe)
    if (timeDiff < 300 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const xDiff = Math.abs(touch.clientX - touchStartPos.x);
        const yDiff = Math.abs(touch.clientY - touchStartPos.y);
        
        // Only trigger if movement was less than 10px (tap, not swipe)
        if (xDiff < 10 && yDiff < 10) {
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target) {
                // Create a proper click event
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                target.dispatchEvent(clickEvent);
            }
        }
    }
}, { passive: true });

// Prevent double-tap zoom on buttons
const preventDoubleTapZoom = (element) => {
    let lastTouchEnd = 0;
    element.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
};

// Apply to all interactive buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        preventDoubleTapZoom(button);
    });
});

// Optimize scroll performance
let ticking = false;
function optimizeScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Scroll optimization logic can go here
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', optimizeScroll, { passive: true });