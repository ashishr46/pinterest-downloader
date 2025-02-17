class AnimationHandler {
    constructor() {
        this.initializeAnimations();
        this.observeElements();
    }

    initializeAnimations() {
        // Add animation classes to elements
        document.querySelectorAll('.feature-card').forEach(card => {
            card.classList.add('hardware-accelerated');
        });

        // Initialize loading states
        this.setupLoadingStates();
    }

    observeElements() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    setupLoadingStates() {
        // Add loading spinners where needed
        document.querySelectorAll('[data-loading]').forEach(el => {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            el.appendChild(spinner);
        });
    }
}

// Initialize animations
const animationHandler = new AnimationHandler(); 