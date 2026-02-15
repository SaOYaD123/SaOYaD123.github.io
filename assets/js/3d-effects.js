// 3D Card Tilt and Parallax Effects
class Card3DEffects {
  constructor() {
    this.cards = [];
    this.enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = 'ontouchstart' in window;
  }

  init() {
    if (!this.enabled) return;

    // Find all elements that should have 3D effects
    const cardSelectors = [
      '.project-card',
      '.skill-card',
      '.achievement-card',
      '.testimonial-card',
      '.stat-card'
    ];

    cardSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        this.setup3DCard(card);
      });
    });

    // Re-initialize when new content is added
    this.observeNewCards();
  }

  setup3DCard(card) {
    if (this.cards.includes(card)) return;
    
    // Add 3D classes
    card.classList.add('card-3d');
    
    // Wrap in perspective container if not already wrapped
    if (!card.parentElement.classList.contains('card-3d-container')) {
      const container = document.createElement('div');
      container.className = 'card-3d-container';
      card.parentNode.insertBefore(container, card);
      container.appendChild(card);
    }

    this.cards.push(card);

    if (this.isMobile) {
      this.setupTouchEffects(card);
    } else {
      this.setupMouseEffects(card);
    }
  }

  setupMouseEffects(card) {
    let bounds;
    let isHovering = false;

    const handleMouseEnter = () => {
      isHovering = true;
      bounds = card.getBoundingClientRect();
      card.style.transition = 'none';
    };

    const handleMouseMove = throttle((e) => {
      if (!isHovering || !bounds) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const leftX = mouseX - bounds.left;
      const topY = mouseY - bounds.top;

      const centerX = leftX - bounds.width / 2;
      const centerY = topY - bounds.height / 2;

      const rotateX = (centerY / bounds.height) * -15;
      const rotateY = (centerX / bounds.width) * 15;

      const brightness = 1 + (Math.abs(centerX) + Math.abs(centerY)) / (bounds.width + bounds.height) * 0.2;

      card.style.transform = `
        perspective(${window.CSS && CSS.supports('perspective', '1000px') ? '1000px' : ''}))
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        translateZ(20px)
        scale3d(1.02, 1.02, 1.02)
      `;

      card.style.filter = `brightness(${brightness})`;

      // Add glow effect based on mouse position
      const glowX = (leftX / bounds.width) * 100;
      const glowY = (topY / bounds.height) * 100;
      
      card.style.setProperty('--glow-x', `${glowX}%`);
      card.style.setProperty('--glow-y', `${glowY}%`);
    }, 16); // ~60fps

    const handleMouseLeave = () => {
      isHovering = false;
      card.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), filter 0.3s ease';
      card.style.transform = '';
      card.style.filter = '';
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
  }

  setupTouchEffects(card) {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchMove = throttle((e) => {
      const touch = e.touches[0];
      const bounds = card.getBoundingClientRect();
      
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      const rotateX = (deltaY / bounds.height) * -10;
      const rotateY = (deltaX / bounds.width) * 10;

      card.style.transform = `
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        translateZ(10px)
      `;
    }, 16);

    const handleTouchEnd = () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      card.style.transform = '';
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: true });
    card.addEventListener('touchend', handleTouchEnd);
  }

  observeNewCards() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const selectors = ['.project-card', '.skill-card', '.achievement-card', '.testimonial-card', '.stat-card'];
            selectors.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                this.setup3DCard(node);
              }
              if (node.querySelectorAll) {
                node.querySelectorAll(selector).forEach(card => {
                  this.setup3DCard(card);
                });
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  destroy() {
    this.cards = [];
  }
}

// Throttle utility function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.card3D = new Card3DEffects();
    window.card3D.init();
  });
} else {
  window.card3D = new Card3DEffects();
  window.card3D.init();
}
