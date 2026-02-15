// Performance Mode Controller
class PerformanceMode {
  constructor() {
    this.enabled = localStorage.getItem('saoyad-performance-mode') === 'true';
    this.toggleButton = null;
  }

  init() {
    this.createToggleButton();
    this.applyPerformanceMode();
  }

  createToggleButton() {
    // Check if button already exists
    let perfButton = document.getElementById('performance-toggle-2026');
    
    if (!perfButton) {
      perfButton = document.createElement('button');
      perfButton.id = 'performance-toggle-2026';
      perfButton.className = 'performance-toggle';
      perfButton.setAttribute('aria-label', 'Toggle performance mode');
      perfButton.title = this.enabled ? 'Disable Performance Mode' : 'Enable Performance Mode';
      perfButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${this.enabled ? 
            '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' : 
            '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
          }
        </svg>
      `;

      document.body.appendChild(perfButton);

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .performance-toggle {
          position: fixed;
          bottom: 160px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 2px solid var(--glass-border);
          color: ${this.enabled ? '#4ADE80' : '#F59E0B'};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 0 15px ${this.enabled ? 'rgba(74, 222, 128, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
        }

        .performance-toggle:hover {
          transform: scale(1.1);
        }

        .performance-toggle:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .performance-toggle {
            bottom: 140px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);

      this.toggleButton = perfButton;

      // Add click handler
      perfButton.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('saoyad-performance-mode', this.enabled ? 'true' : 'false');
    this.applyPerformanceMode();
    this.updateButtonUI();
    
    // Show notification
    this.showNotification(
      this.enabled ? 
        '⚡ Performance Mode Enabled - Animations reduced for better performance' : 
        '🎨 Full Experience Mode - All animations enabled'
    );
  }

  applyPerformanceMode() {
    if (this.enabled) {
      document.documentElement.classList.add('performance-mode');
      
      // Reduce particle count
      if (window.particleEngine) {
        window.particleEngine.config.particleCount = 10;
        window.particleEngine.config.meteorCount = 0;
        window.particleEngine.config.orbCount = 1;
      }

      // Disable cursor trail
      if (window.cursorTrail) {
        window.cursorTrail.enabled = false;
      }

      // Simplify 3D effects
      if (window.card3D) {
        window.card3D.enabled = false;
      }
    } else {
      document.documentElement.classList.remove('performance-mode');
      
      // Restore full particle count
      if (window.particleEngine) {
        const isMobile = window.innerWidth < 768;
        window.particleEngine.config.particleCount = isMobile ? 15 : 30;
        window.particleEngine.config.meteorCount = isMobile ? 1 : 3;
        window.particleEngine.config.orbCount = isMobile ? 2 : 5;
      }

      // Re-enable cursor trail
      if (window.cursorTrail) {
        const isDesktop = window.innerWidth >= 1024 && !('ontouchstart' in window);
        window.cursorTrail.enabled = isDesktop;
      }

      // Re-enable 3D effects
      if (window.card3D) {
        window.card3D.enabled = true;
      }
    }
  }

  updateButtonUI() {
    if (!this.toggleButton) return;

    this.toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${this.enabled ? 
          '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' : 
          '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
        }
      </svg>
    `;

    this.toggleButton.title = this.enabled ? 'Disable Performance Mode' : 'Enable Performance Mode';
    this.toggleButton.style.color = this.enabled ? '#4ADE80' : '#F59E0B';
    this.toggleButton.style.boxShadow = `0 0 15px ${this.enabled ? 'rgba(74, 222, 128, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`;
  }

  showNotification(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'performance-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: var(--spacing-md) var(--spacing-lg);
      color: inherit;
      font-family: var(--font-primary);
      font-size: 14px;
      z-index: 10000;
      box-shadow: var(--shadow-neumorphic);
      max-width: 90%;
      text-align: center;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// CSS for performance mode
const perfModeStyle = document.createElement('style');
perfModeStyle.textContent = `
  /* Performance Mode Styles */
  .performance-mode .fluid-background {
    animation: none !important;
    opacity: 0.1;
  }

  .performance-mode .floating,
  .performance-mode .rotate-360,
  .performance-mode .shimmer,
  .performance-mode .meteor {
    animation: none !important;
  }

  .performance-mode .card-3d {
    transform: none !important;
    transition: none !important;
  }

  .performance-mode .cursor-trail-item {
    display: none !important;
  }

  .performance-mode .profilePulse {
    animation-duration: 6s !important;
  }

  .performance-mode .bmw-drift-container {
    display: none !important;
  }

  .performance-mode .custom-cursor {
    display: none !important;
  }

  .performance-mode .glow-pulse {
    animation: none !important;
    box-shadow: none !important;
  }

  .performance-mode * {
    will-change: auto !important;
  }
`;
document.head.appendChild(perfModeStyle);

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMode = new PerformanceMode();
    window.performanceMode.init();
  });
} else {
  window.performanceMode = new PerformanceMode();
  window.performanceMode.init();
}
