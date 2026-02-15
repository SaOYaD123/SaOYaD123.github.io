// Enhanced Multi-Theme System for 2026
class EnhancedThemeManager {
  constructor() {
    this.themes = {
      dark: {
        name: 'Dark Mode',
        primary: '#FFB6C1',
        background: '#1A0B2E',
        surface: 'rgba(255, 255, 255, 0.05)',
        text: '#E6E6FA'
      },
      light: {
        name: 'Light Mode',
        primary: '#FFB6C1',
        background: '#f5f5ff',
        surface: 'rgba(255, 255, 255, 0.6)',
        text: '#2C1C3E'
      },
      cyberpunk: {
        name: 'Cyberpunk',
        primary: '#00F0FF',
        background: '#0D0221',
        surface: 'rgba(0, 240, 255, 0.1)',
        text: '#00F0FF',
        accent: '#FF006E'
      },
      neon: {
        name: 'Neon Nights',
        primary: '#B537F2',
        background: '#0A0E27',
        surface: 'rgba(181, 55, 242, 0.1)',
        text: '#E0B0FF',
        accent: '#00F0FF'
      },
      pastel: {
        name: 'Pastel Dreams',
        primary: '#FFB6C1',
        background: '#FFF5F7',
        surface: 'rgba(255, 182, 193, 0.2)',
        text: '#6B4E71'
      },
      midnight: {
        name: 'Midnight Blue',
        primary: '#4A90E2',
        background: '#0C1445',
        surface: 'rgba(74, 144, 226, 0.1)',
        text: '#B0C4DE'
      }
    };

    this.currentTheme = this.getStoredTheme() || this.getAutoTheme();
    this.themeKey = 'saoyad-theme-2026';
    this.autoThemeEnabled = localStorage.getItem('saoyad-auto-theme') !== 'false';
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupThemePicker();
    this.setupAutoTheme();
    this.setupEasterEggs();
  }

  getStoredTheme() {
    return localStorage.getItem(this.themeKey);
  }

  getAutoTheme() {
    if (!this.autoThemeEnabled) {
      return 'dark';
    }

    const hour = new Date().getHours();
    
    // Time-based theme selection
    if (hour >= 6 && hour < 12) {
      return 'pastel'; // Morning - Pastel Dreams
    } else if (hour >= 12 && hour < 17) {
      return 'light'; // Afternoon - Light Mode
    } else if (hour >= 17 && hour < 21) {
      return 'neon'; // Evening - Neon Nights
    } else {
      return 'midnight'; // Night - Midnight Blue
    }
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName] || this.themes.dark;
    
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(this.themeKey, themeName);
    this.currentTheme = themeName;

    // Apply custom properties if theme has them
    if (theme.primary) {
      document.documentElement.style.setProperty('--theme-primary', theme.primary);
    }
    if (theme.background) {
      document.documentElement.style.setProperty('--theme-background', theme.background);
    }
    if (theme.surface) {
      document.documentElement.style.setProperty('--theme-surface', theme.surface);
    }
    if (theme.text) {
      document.documentElement.style.setProperty('--theme-text', theme.text);
    }
    if (theme.accent) {
      document.documentElement.style.setProperty('--theme-accent', theme.accent);
    }

    // Update theme picker if it exists
    this.updateThemePickerUI();
  }

  setupThemePicker() {
    // Check if theme picker already exists
    let themePicker = document.getElementById('theme-picker-2026');
    
    if (!themePicker) {
      themePicker = document.createElement('div');
      themePicker.id = 'theme-picker-2026';
      themePicker.className = 'theme-picker';
      themePicker.innerHTML = `
        <button class="theme-picker-toggle" aria-label="Theme picker" title="Choose Theme">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
          </svg>
        </button>
        <div class="theme-picker-menu">
          ${Object.keys(this.themes).map(key => `
            <button class="theme-option" data-theme="${key}">
              <span class="theme-color" style="background: ${this.themes[key].primary}"></span>
              <span class="theme-name">${this.themes[key].name}</span>
            </button>
          `).join('')}
          <div class="theme-divider"></div>
          <label class="theme-auto-toggle">
            <input type="checkbox" id="auto-theme-toggle" ${this.autoThemeEnabled ? 'checked' : ''}>
            <span>Auto Theme (Time-based)</span>
          </label>
        </div>
      `;

      document.body.appendChild(themePicker);

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .theme-picker {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 1000;
        }

        .theme-picker-toggle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 2px solid var(--glass-border);
          color: var(--primary-pink);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-glow-pink);
        }

        .theme-picker-toggle:hover {
          transform: scale(1.1) rotate(180deg);
          box-shadow: var(--shadow-glow-purple);
        }

        .theme-picker-menu {
          position: absolute;
          bottom: 60px;
          right: 0;
          min-width: 200px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .theme-picker:hover .theme-picker-menu,
        .theme-picker-menu:hover {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .theme-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-primary);
        }

        .theme-option:hover {
          background: var(--glass-hover);
        }

        .theme-option.active {
          background: var(--glass-hover);
          border-left: 3px solid var(--primary-pink);
        }

        .theme-color {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--glass-border);
        }

        .theme-name {
          flex: 1;
          text-align: left;
          font-size: 14px;
        }

        .theme-divider {
          height: 1px;
          background: var(--glass-border);
          margin: var(--spacing-sm) 0;
        }

        .theme-auto-toggle {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          font-size: 12px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .theme-picker {
            bottom: 80px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Setup event listeners
    const toggle = themePicker.querySelector('.theme-picker-toggle');
    const options = themePicker.querySelectorAll('.theme-option');
    const autoToggle = themePicker.querySelector('#auto-theme-toggle');

    options.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        this.autoThemeEnabled = false;
        localStorage.setItem('saoyad-auto-theme', 'false');
        if (autoToggle) autoToggle.checked = false;
        this.applyTheme(theme);
      });
    });

    if (autoToggle) {
      autoToggle.addEventListener('change', (e) => {
        this.autoThemeEnabled = e.target.checked;
        localStorage.setItem('saoyad-auto-theme', e.target.checked ? 'true' : 'false');
        if (e.target.checked) {
          this.applyTheme(this.getAutoTheme());
        }
      });
    }
  }

  updateThemePickerUI() {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      if (option.getAttribute('data-theme') === this.currentTheme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  setupAutoTheme() {
    if (this.autoThemeEnabled) {
      // Check every hour if auto theme should change
      setInterval(() => {
        if (this.autoThemeEnabled) {
          const autoTheme = this.getAutoTheme();
          if (autoTheme !== this.currentTheme) {
            this.applyTheme(autoTheme);
          }
        }
      }, 60000 * 60); // Every hour
    }
  }

  setupEasterEggs() {
    // Rainbow theme on logo clicks
    let logoClickCount = 0;
    let logoClickTimer = null;
    
    const logo = document.querySelector('.nav-logo img');
    if (logo) {
      logo.addEventListener('click', () => {
        logoClickCount++;
        
        if (logoClickTimer) clearTimeout(logoClickTimer);
        
        if (logoClickCount >= 5) {
          this.activateRainbowTheme();
          logoClickCount = 0;
        }
        
        logoClickTimer = setTimeout(() => {
          logoClickCount = 0;
        }, 2000);
      });
    }

    // Console drift command
    window.drift = () => {
      if (window.bmwDrift) {
        console.log('🏎️ Initiating drift sequence...');
        window.bmwDrift.trigger();
      } else {
        console.log('🏎️ BMW M4 not ready yet!');
      }
    };

    // Konami code for BMW parade
    this.setupKonamiCode();
  }

  activateRainbowTheme() {
    console.log('🌈 Rainbow mode activated!');
    
    // Temporarily override theme with rainbow colors
    const rainbowColors = [
      '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
      '#0000FF', '#4B0082', '#9400D3'
    ];
    
    let colorIndex = 0;
    const rainbowInterval = setInterval(() => {
      document.documentElement.style.setProperty('--primary-pink', rainbowColors[colorIndex]);
      colorIndex = (colorIndex + 1) % rainbowColors.length;
    }, 300);

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(rainbowInterval);
      this.applyTheme(this.currentTheme);
      console.log('🌈 Rainbow mode deactivated');
    }, 10000);
  }

  setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          this.activateBMWParade();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  activateBMWParade() {
    console.log('🏁 BMW M4 PARADE ACTIVATED! 🏁');
    
    if (!window.bmwDrift) {
      console.log('BMW drift animation not available');
      return;
    }

    // Trigger multiple BMW animations with delays
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        window.bmwDrift.trigger();
      }, i * 1000);
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.enhancedTheme = new EnhancedThemeManager();
    window.enhancedTheme.init();
  });
} else {
  window.enhancedTheme = new EnhancedThemeManager();
  window.enhancedTheme.init();
}
