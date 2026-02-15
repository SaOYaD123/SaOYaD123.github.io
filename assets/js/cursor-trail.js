// Custom Cursor with BMW M4 Trail
class CursorTrail {
  constructor() {
    this.cursorDot = null;
    this.cursorOutline = null;
    this.trail = [];
    this.trailLength = 8;
    this.mouse = { x: 0, y: 0 };
    this.isDesktop = window.innerWidth >= 1024 && !('ontouchstart' in window);
    this.enabled = this.isDesktop && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (!this.enabled) {
      // Hide custom cursor on mobile/reduced motion
      const customCursor = document.querySelector('.custom-cursor');
      if (customCursor) customCursor.style.display = 'none';
      return;
    }

    this.setupCursorElements();
    this.createTrail();
    this.setupEventListeners();
    this.animate();
  }

  setupCursorElements() {
    this.cursorDot = document.querySelector('.cursor-dot');
    this.cursorOutline = document.querySelector('.cursor-outline');

    if (!this.cursorDot || !this.cursorOutline) {
      console.warn('Cursor elements not found');
      return;
    }

    // Style cursor dot
    this.cursorDot.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--neon-cyan);
      border-radius: 50%;
      pointer-events: none;
      z-index: var(--z-cursor);
      transform: translate(-50%, -50%);
      transition: width 0.2s, height 0.2s, background 0.2s;
      box-shadow: 0 0 10px var(--neon-cyan);
    `;

    // Style cursor outline
    this.cursorOutline.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid var(--neon-cyan);
      border-radius: 50%;
      pointer-events: none;
      z-index: var(--z-cursor);
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, border-color 0.3s;
      opacity: 0.5;
    `;
  }

  createTrail() {
    for (let i = 0; i < this.trailLength; i++) {
      const trailElement = document.createElement('div');
      trailElement.className = 'cursor-trail-item';
      trailElement.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, var(--neon-purple), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: ${9998 - i};
        transform: translate(-50%, -50%);
        opacity: ${(this.trailLength - i) / this.trailLength * 0.5};
        filter: blur(2px);
      `;
      document.body.appendChild(trailElement);
      this.trail.push({
        element: trailElement,
        x: 0,
        y: 0
      });
    }
  }

  setupEventListeners() {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Smooth cursor movement
    const smoothMove = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;

      if (this.cursorDot) {
        this.cursorDot.style.left = `${currentX}px`;
        this.cursorDot.style.top = `${currentY}px`;
      }

      if (this.cursorOutline) {
        this.cursorOutline.style.left = `${targetX}px`;
        this.cursorOutline.style.top = `${targetY}px`;
      }

      requestAnimationFrame(smoothMove);
    };
    smoothMove();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [role="button"]');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (this.cursorDot) {
          this.cursorDot.style.width = '16px';
          this.cursorDot.style.height = '16px';
          this.cursorDot.style.background = 'var(--neon-pink)';
        }
        if (this.cursorOutline) {
          this.cursorOutline.style.width = '60px';
          this.cursorOutline.style.height = '60px';
          this.cursorOutline.style.borderColor = 'var(--neon-pink)';
        }
      });

      el.addEventListener('mouseleave', () => {
        if (this.cursorDot) {
          this.cursorDot.style.width = '8px';
          this.cursorDot.style.height = '8px';
          this.cursorDot.style.background = 'var(--neon-cyan)';
        }
        if (this.cursorOutline) {
          this.cursorOutline.style.width = '40px';
          this.cursorOutline.style.height = '40px';
          this.cursorOutline.style.borderColor = 'var(--neon-cyan)';
        }
      });
    });

    // Click animation
    document.addEventListener('mousedown', () => {
      if (this.cursorOutline) {
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.cursorOutline) {
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      this.createClickBurst();
    });
  }

  animate() {
    if (!this.enabled) return;

    // Update trail positions
    for (let i = this.trail.length - 1; i > 0; i--) {
      this.trail[i].x += (this.trail[i - 1].x - this.trail[i].x) * 0.3;
      this.trail[i].y += (this.trail[i - 1].y - this.trail[i].y) * 0.3;

      this.trail[i].element.style.left = `${this.trail[i].x}px`;
      this.trail[i].element.style.top = `${this.trail[i].y}px`;
    }

    // Update first trail item to follow mouse
    if (this.trail.length > 0) {
      this.trail[0].x = this.mouse.x;
      this.trail[0].y = this.mouse.y;
      this.trail[0].element.style.left = `${this.mouse.x}px`;
      this.trail[0].element.style.top = `${this.mouse.y}px`;
    }

    requestAnimationFrame(() => this.animate());
  }

  createClickBurst() {
    // Create burst particles on click
    const particleCount = 8;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 100;
      
      particle.style.cssText = `
        position: fixed;
        left: ${this.mouse.x}px;
        top: ${this.mouse.y}px;
        width: 6px;
        height: 6px;
        background: var(--neon-cyan);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px var(--neon-cyan);
      `;

      document.body.appendChild(particle);
      particles.push(particle);

      // Animate particle
      const animation = particle.animate([
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(${Math.cos(angle) * velocity - 50}px, ${Math.sin(angle) * velocity - 50}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      animation.onfinish = () => {
        particle.remove();
      };
    }
  }

  destroy() {
    this.trail.forEach(item => {
      item.element.remove();
    });
    this.trail = [];
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cursorTrail = new CursorTrail();
    window.cursorTrail.init();
  });
} else {
  window.cursorTrail = new CursorTrail();
  window.cursorTrail.init();
}
