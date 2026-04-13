// ==================== Configuration & Constants ====================
/** @type {{ GITHUB_USERNAME: string, GITHUB_API_BASE: string, TYPEWRITER_SPEED: number, TYPEWRITER_DELETE_SPEED: number, TYPEWRITER_PAUSE: number, PARTICLE_COUNT: number, THEME_KEY: string }} */
const CONFIG = {
  GITHUB_USERNAME: 'SaOYaD-SZN',
  GITHUB_API_BASE: 'https://api.github.com',
  TYPEWRITER_SPEED: 100,
  TYPEWRITER_DELETE_SPEED: 50,
  TYPEWRITER_PAUSE: 2000,
  PARTICLE_COUNT: 50,
  THEME_KEY: 'saoyad-theme',
};

/** @type {string[]} */
const TYPEWRITER_TEXTS = [
  'Full-Stack Developer',
  'Linux Enthusiast',
  'Open Source Contributor',
  'Tech Innovator',
  'Problem Solver',
];

// ==================== Utility Functions ====================
/**
 * Returns a debounced version of the provided function that delays invoking it
 * until after `wait` milliseconds have elapsed since the last invocation.
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Returns a throttled version of the provided function that invokes it at most
 * once per `limit` milliseconds.
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sanitizes a string to prevent XSS by escaping HTML special characters.
 * @param {string} str
 * @returns {string}
 */
const sanitizeHTML = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

/**
 * Sanitizes a URL for use in href/src attributes. Only allows http, https,
 * and mailto schemes. Returns an empty string for invalid or dangerous URLs.
 * @param {string} url
 * @returns {string}
 */
const sanitizeURL = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.href);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (_) {
    // Relative paths (e.g. 'logo.avif') are safe to return as-is
    if (/^[a-zA-Z0-9_./\-]+$/.test(url)) return url;
  }
  return '';
};

// ==================== Theme Manager ====================
/** Manages 4-theme selection with localStorage persistence and a theme picker panel. */
class ThemeManager {
  constructor() {
    this.themes = ['dark', 'cyberpunk', 'neon', 'pastel'];
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.setupToggle();
    this.watchSystemTheme();
  }

  getStoredTheme() {
    const stored = localStorage.getItem(CONFIG.THEME_KEY);
    return this.themes.includes(stored) ? stored : null;
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'pastel' : 'dark';
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.THEME_KEY, theme);
    this.currentTheme = theme;
    this.updateUI();
  }

  updateUI() {
    document.querySelectorAll('.theme-option').forEach(btn => {
      const isActive = btn.dataset.theme === this.currentTheme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  setupToggle() {
    const toggleBtn = document.querySelector('.theme-toggle');
    const panel = document.getElementById('theme-panel');

    if (!toggleBtn || !panel) return;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-selector')) {
        panel.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });

    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
        panel.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem(CONFIG.THEME_KEY)) {
        this.setTheme(e.matches ? 'pastel' : 'dark');
      }
    });
  }
}

// ==================== GitHub API Manager ====================
/** Handles all GitHub REST API requests with in-memory caching and fallback data. */
class GitHubAPI {
  constructor(username) {
    this.username = username;
    this.cache = {};
  }

  async fetchUserData() {
    try {
      const response = await fetch(`${CONFIG.GITHUB_API_BASE}/users/${this.username}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      this.cache.userData = data;
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return this.getFallbackUserData();
    }
  }

  async fetchRepositories() {
    try {
      const response = await fetch(`${CONFIG.GITHUB_API_BASE}/users/${this.username}/repos?per_page=100&sort=updated`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      this.cache.repositories = data;
      return data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  async fetchLanguages(repos) {
    const languageStats = {};

    repos.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] ?? 0) + 1;
      }
    });

    const totalRepos = Object.values(languageStats).reduce((a, b) => a + b, 0);
    const languagePercentages = {};

    for (const [lang, count] of Object.entries(languageStats)) {
      languagePercentages[lang] = ((count / totalRepos) * 100).toFixed(1);
    }

    return Object.entries(languagePercentages)
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
      .slice(0, 6);
  }

  getFallbackUserData() {
    return {
      name: 'SaOYaD',
      bio: '🌱 Linux Enthusiast | 💻 Full-Stack Developer | 🌐 Tech Savvy',
      avatar_url: 'logo.avif',
      location: 'Unknown',
      public_repos: 0,
      followers: 0,
      following: 0,
    };
  }

  calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0);
  }

  getFeaturedRepos(repos) {
    return repos
      .filter(repo => !repo.fork)
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 6);
  }
}

// ==================== UI Components ====================
/** Renders all portfolio sections using GitHub API data. */
class UIComponents {
  constructor(api) {
    this.api = api;
    this.typewriterIndex = 0;
    this.typewriterTextIndex = 0;
    this.typewriterDeleting = false;
  }

  startTypewriter() {
    const element = document.querySelector('.typewriter-text');
    if (!element) return;

    const type = () => {
      const currentText = TYPEWRITER_TEXTS[this.typewriterTextIndex];

      if (this.typewriterDeleting) {
        element.textContent = currentText.substring(0, this.typewriterIndex--);

        if (this.typewriterIndex < 0) {
          this.typewriterDeleting = false;
          this.typewriterTextIndex = (this.typewriterTextIndex + 1) % TYPEWRITER_TEXTS.length;
          setTimeout(type, 500);
          return;
        }
      } else {
        element.textContent = currentText.substring(0, this.typewriterIndex++);

        if (this.typewriterIndex > currentText.length) {
          this.typewriterDeleting = true;
          setTimeout(type, CONFIG.TYPEWRITER_PAUSE);
          return;
        }
      }

      setTimeout(type, this.typewriterDeleting ? CONFIG.TYPEWRITER_DELETE_SPEED : CONFIG.TYPEWRITER_SPEED);
    };

    type();
  }

  async renderHero(userData) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    heroContent.innerHTML = `
      <img src="${sanitizeURL(userData.avatar_url)}" alt="${sanitizeHTML(userData.name || 'SaOYaD')}" class="hero-avatar" loading="lazy">
      <p class="hero-greeting">Hello, I'm</p>
      <h1 class="hero-title">${sanitizeHTML(userData.name || 'SaOYaD')}</h1>
      <div class="hero-subtitle">
        <span class="typewriter-text"></span>
      </div>
      <p class="hero-description">${sanitizeHTML(userData.bio || '')}</p>
      <div class="hero-buttons">
        <a href="#projects" class="btn btn-primary">
          <span>View Projects</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <a href="#contact" class="btn btn-secondary">
          <span>Get in Touch</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </a>
      </div>
      <div class="hero-social">
        <a href="https://github.com/${CONFIG.GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        ${userData.twitter_username ? `
        <a href="https://twitter.com/${encodeURIComponent(userData.twitter_username)}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
          </svg>
        </a>
        ` : ''}
        ${userData.blog ? `
        <a href="${sanitizeURL(userData.blog)}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Website">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </a>
        ` : ''}
      </div>
    `;

    this.startTypewriter();
  }

  async renderAbout(userData, repos) {
    const aboutSection = document.querySelector('.about-section .container');
    if (!aboutSection) return;

    const totalStars = this.api.calculateTotalStars(repos);

    aboutSection.innerHTML += `
      <div class="about-content animate-on-scroll">
        <div class="about-image">
          <img src="${sanitizeURL(userData.avatar_url)}" alt="${sanitizeHTML(userData.name || 'SaOYaD')}" loading="lazy">
        </div>
        <div class="about-text">
          <h3>About Me</h3>
          <p>${sanitizeHTML(userData.bio || 'Passionate developer building amazing things.')}</p>
          <p>With a strong foundation in full-stack development and a deep passion for Linux systems, I create innovative solutions that make a difference. My journey in tech is driven by curiosity and a commitment to continuous learning.</p>
          <div class="about-stats">
            <div class="stat-item">
              <span class="stat-number">${userData.public_repos}</span>
              <span class="stat-label">Repositories</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${totalStars}</span>
              <span class="stat-label">Stars</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${userData.followers}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${userData.following}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSkills() {
    const skillsSection = document.querySelector('.skills-section .container');
    if (!skillsSection) return;

    const skills = {
      'Frontend': [
        { name: 'HTML/CSS', level: 95 },
        { name: 'JavaScript', level: 90 },
        { name: 'React', level: 85 },
        { name: 'Vue.js', level: 80 },
      ],
      'Backend': [
        { name: 'Node.js', level: 88 },
        { name: 'Python', level: 85 },
        { name: 'PHP', level: 75 },
        { name: 'Databases', level: 82 },
      ],
      'Tools & Others': [
        { name: 'Git', level: 92 },
        { name: 'Linux', level: 90 },
        { name: 'Docker', level: 85 },
        { name: 'CI/CD', level: 80 },
      ],
    };

    const skillsHTML = Object.entries(skills).map(([category, items]) => `
      <div class="skill-category animate-on-scroll card-3d">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          ${sanitizeHTML(category)}
        </h3>
        ${items.map(skill => `
          <div class="skill-item">
            <div class="skill-name">
              <span>${sanitizeHTML(skill.name)}</span>
              <span class="skill-percentage">${skill.level}%</span>
            </div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: 0%" data-width="${skill.level}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    skillsSection.innerHTML += `<div class="skills-grid">${skillsHTML}</div>`;
    this.animateSkillBars();
  }

  animateSkillBars() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBars = entry.target.querySelectorAll('.skill-progress');
          progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
              bar.style.width = width;
            }, 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) observer.observe(skillsSection);
  }

  renderProjects(repos) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    const featuredRepos = this.api.getFeaturedRepos(repos);

    projectsGrid.innerHTML = featuredRepos.map(repo => `
      <div class="project-card card-3d" data-name="${sanitizeHTML(repo.name)}" data-language="${sanitizeHTML(repo.language || '')}">
        <div class="project-image">
          <img src="wallpaper.jpg" alt="${sanitizeHTML(repo.name)}" loading="lazy">
          <div class="project-overlay">
            ${repo.html_url ? `
            <a href="${sanitizeURL(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View on GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            ` : ''}
            ${repo.homepage ? `
            <a href="${sanitizeURL(repo.homepage)}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View Live Demo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            ` : ''}
          </div>
        </div>
        <div class="project-info">
          <h3 class="project-title">${sanitizeHTML(repo.name)}</h3>
          <p class="project-description">${sanitizeHTML(repo.description || 'No description available')}</p>
          <div class="project-tech">
            ${repo.language ? `<span class="tech-tag">${sanitizeHTML(repo.language)}</span>` : ''}
            ${repo.topics ? repo.topics.slice(0, 3).map(topic => `<span class="tech-tag">${sanitizeHTML(topic)}</span>`).join('') : ''}
          </div>
          <div class="project-stats">
            <div class="project-stat">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ${repo.stargazers_count ?? 0}
            </div>
            <div class="project-stat">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="18" r="3"></circle>
                <circle cx="6" cy="6" r="3"></circle>
                <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                <line x1="6" y1="9" x2="6" y2="21"></line>
              </svg>
              ${repo.forks_count ?? 0}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.setupProjectFilters();
  }

  setupProjectFilters() {
    const projectCards = document.querySelectorAll('.project-card');
    const searchBox = document.getElementById('project-search');
    const filterButtons = document.querySelector('.filter-buttons');

    const languages = new Set();
    projectCards.forEach(card => {
      const lang = card.getAttribute('data-language');
      if (lang) languages.add(lang);
    });

    if (filterButtons) {
      filterButtons.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        ${[...languages].map(lang => `
          <button class="filter-btn" data-filter="${sanitizeHTML(lang)}">${sanitizeHTML(lang)}</button>
        `).join('')}
      `;

      filterButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          filterButtons.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');

          const filter = e.target.getAttribute('data-filter');
          projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-language') === filter) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }
      });
    }

    if (searchBox) {
      searchBox.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        projectCards.forEach(card => {
          const name = card.getAttribute('data-name').toLowerCase();
          const description = card.querySelector('.project-description').textContent.toLowerCase();
          if (name.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }, 300));
    }
  }

  async renderActivity(userData, repos) {
    const activitySection = document.querySelector('.activity-section .container');
    if (!activitySection) return;

    const totalStars = this.api.calculateTotalStars(repos);
    const languages = await this.api.fetchLanguages(repos);

    activitySection.innerHTML += `
      <div class="activity-dashboard animate-on-scroll">
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">Total Repositories</h3>
            <svg class="activity-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="activity-value">${userData.public_repos}</div>
        </div>
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">Total Stars</h3>
            <svg class="activity-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div class="activity-value">${totalStars}</div>
        </div>
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">Followers</h3>
            <svg class="activity-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="activity-value">${userData.followers}</div>
        </div>
        <div class="activity-card" style="grid-column: span 3;">
          <div class="activity-header">
            <h3 class="activity-title">Top Languages</h3>
            <svg class="activity-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div class="language-chart">
            ${languages.map(([lang, percentage]) => `
              <div class="language-item">
                <span class="language-name">${sanitizeHTML(lang)}</span>
                <div class="language-bar-container">
                  <div class="language-bar" style="width: 0%" data-width="${sanitizeHTML(percentage)}%"></div>
                </div>
                <span class="language-percentage">${sanitizeHTML(percentage)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.animateLanguageBars();
  }

  animateLanguageBars() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.language-bar');
          bars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
              bar.style.width = width;
            }, 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const activitySection = document.querySelector('.activity-section');
    if (activitySection) observer.observe(activitySection);
  }

  renderAchievements() {
    const achievementsSection = document.querySelector('.achievements-section .achievements-grid');
    if (!achievementsSection) return;

    const achievements = [
      {
        icon: '🏆',
        title: 'Open Source Contributor',
        description: 'Active contributor to open source projects',
        date: '2024',
      },
      {
        icon: '🎓',
        title: 'Self-Taught Developer',
        description: 'Mastered web development through dedication',
        date: '2023',
      },
      {
        icon: '💻',
        title: 'Full-Stack Developer',
        description: 'Proficient in both frontend and backend',
        date: '2024',
      },
      {
        icon: '🐧',
        title: 'Linux Enthusiast',
        description: 'Expert in Linux systems administration',
        date: '2023',
      },
    ];

    achievementsSection.innerHTML = achievements.map(achievement => `
      <div class="achievement-card animate-on-scroll card-3d">
        <span class="achievement-icon">${achievement.icon}</span>
        <h3 class="achievement-title">${sanitizeHTML(achievement.title)}</h3>
        <p class="achievement-description">${sanitizeHTML(achievement.description)}</p>
        <span class="achievement-date">${sanitizeHTML(achievement.date)}</span>
      </div>
    `).join('');
  }

  renderTestimonials() {
    const testimonialsSection = document.querySelector('.testimonials-section .testimonials-carousel');
    if (!testimonialsSection) return;

    const testimonials = [
      {
        text: 'Outstanding developer with excellent problem-solving skills. A pleasure to work with!',
        author: 'John Doe',
        role: 'Senior Developer',
        avatar: 'logo.avif',
        rating: 5,
      },
      {
        text: 'Delivers high-quality code and has deep knowledge of modern web technologies.',
        author: 'Jane Smith',
        role: 'Tech Lead',
        avatar: 'logo.avif',
        rating: 5,
      },
      {
        text: 'Passionate about technology and always willing to learn new things. Great team player!',
        author: 'Mike Johnson',
        role: 'Project Manager',
        avatar: 'logo.avif',
        rating: 5,
      },
    ];

    testimonialsSection.innerHTML = testimonials.map(testimonial => `
      <div class="testimonial-card animate-on-scroll">
        <p class="testimonial-text">"${sanitizeHTML(testimonial.text)}"</p>
        <div class="testimonial-author">
          <img src="${sanitizeURL(testimonial.avatar)}" alt="${sanitizeHTML(testimonial.author)}" class="author-avatar" loading="lazy">
          <div class="author-info">
            <div class="author-name">${sanitizeHTML(testimonial.author)}</div>
            <div class="author-role">${sanitizeHTML(testimonial.role)}</div>
            <div class="testimonial-rating">
              ${Array(testimonial.rating).fill('').map(() => `
                <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderContact() {
    const contactLinks = document.querySelector('.contact-links');
    if (!contactLinks) return;

    contactLinks.innerHTML = `
      <a href="https://github.com/${CONFIG.GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="contact-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>GitHub</span>
      </a>
      <a href="mailto:contact@saoyad.dev" class="contact-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>Email</span>
      </a>
    `;

    const footerSocial = document.querySelector('.footer-social');
    if (footerSocial) {
      footerSocial.innerHTML = contactLinks.innerHTML;
    }
  }
}

// ==================== Particle System ====================
/** Canvas-based particle animation system for the background. */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.animate();
    window.addEventListener('resize', debounce(() => this.resize(), 250));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }
  }

  getParticleColor() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colorMap = {
      dark: 'rgba(255, 182, 193, 0.45)',
      cyberpunk: 'rgba(0, 240, 255, 0.45)',
      neon: 'rgba(181, 55, 242, 0.45)',
      pastel: 'rgba(200, 75, 122, 0.3)',
    };
    return colorMap[theme] || colorMap.dark;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const color = this.getParticleColor();

    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ==================== Navigation ====================
/** Controls navbar scroll behaviour, active-link highlighting, mobile menu and keyboard navigation. */
class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.navScrollProgress = document.querySelector('.nav-scroll-progress');
    this.sections = document.querySelectorAll('.section, .hero-section');
    this.init();
  }

  init() {
    this.setupScrollBehavior();
    this.setupActiveLinksWithObserver();
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupNavScrollProgress();
    this.setupKeyboardNavigation();
  }

  setupScrollBehavior() {
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 100) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }, 100));
  }

  setupActiveLinksWithObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, observerOptions);

    this.sections.forEach(section => observer.observe(section));
  }

  setupNavScrollProgress() {
    if (!this.navScrollProgress) return;

    window.addEventListener('scroll', throttle(() => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      this.navScrollProgress.style.width = `${scrolled}%`;
    }, 50));
  }

  setupMobileMenu() {
    if (!this.hamburger || !this.navMenu) return;

    this.hamburger.addEventListener('click', () => {
      const isActive = this.hamburger.classList.toggle('active');
      this.navMenu.classList.toggle('active');
      this.hamburger.setAttribute('aria-expanded', String(isActive));
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const navHeight = this.navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
        }
      });
    });
  }

  setupKeyboardNavigation() {
    this.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        let targetLink = null;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            targetLink = this.navLinks[index + 1] || this.navLinks[0];
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            targetLink = this.navLinks[index - 1] || this.navLinks[this.navLinks.length - 1];
            break;
          case 'Home':
            e.preventDefault();
            targetLink = this.navLinks[0];
            break;
          case 'End':
            e.preventDefault();
            targetLink = this.navLinks[this.navLinks.length - 1];
            break;
        }

        if (targetLink) targetLink.focus();
      });
    });
  }
}

// ==================== Scroll Progress ====================
/** Updates the scroll-progress bar at the top of the page. */
class ScrollProgress {
  constructor() {
    this.progressBar = document.querySelector('.scroll-progress');
    this.init();
  }

  init() {
    window.addEventListener('scroll', throttle(() => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (this.progressBar) {
        this.progressBar.style.width = `${scrolled}%`;
      }
    }, 50));
  }
}

// ==================== Back to Top Button ====================
/** Shows/hides and animates the back-to-top floating button. */
class BackToTop {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.init();
  }

  init() {
    if (!this.button) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, 100));

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ==================== Custom Cursor ====================
/** Replaces the native mouse cursor with a custom dot + outline on pointer devices. */
class CustomCursor {
  constructor() {
    this.dot = document.querySelector('.cursor-dot');
    this.outline = document.querySelector('.cursor-outline');
    this.init();
  }

  init() {
    if (!this.dot || !this.outline || window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', (e) => {
      this.dot.style.left = `${e.clientX}px`;
      this.dot.style.top = `${e.clientY}px`;
      this.outline.style.left = `${e.clientX}px`;
      this.outline.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.style.transform = 'translate(-50%, -50%) scale(2)';
        this.outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
      });
      el.addEventListener('mouseleave', () => {
        this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
        this.outline.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });
  }
}

// ==================== 3D Tilt Effects ====================
/** Applies perspective tilt on .card-3d elements based on mouse position. */
class ThreeDEffects {
  constructor() {
    this.init();
  }

  init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', throttle((e) => {
      document.querySelectorAll('.card-3d').forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < 2) {
          const rotateX = deltaY * -7;
          const rotateY = deltaX * 7;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
          card.style.setProperty('--glow-x', `${(deltaX + 1) * 50}%`);
          card.style.setProperty('--glow-y', `${(deltaY + 1) * 50}%`);
        } else {
          card.style.transform = '';
        }
      });
    }, 16));

    document.querySelectorAll('.card-3d').forEach(card => {
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
}

// ==================== Form Validation ====================
/** Provides real-time client-side validation for the contact form. */
class FormValidator {
  constructor(form) {
    this.form = form;
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) this.submitForm();
    });

    this.form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) this.validateField(field);
      });
    });
  }

  validateField(field) {
    const error = field.parentElement.querySelector('.form-error');
    let isValid = true;
    let message = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      message = 'This field is required';
    } else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    }

    if (isValid) {
      field.classList.remove('error');
      if (error) error.textContent = '';
    } else {
      field.classList.add('error');
      if (error) error.textContent = message;
    }

    return isValid;
  }

  validateForm() {
    let isValid = true;
    this.form.querySelectorAll('input, textarea').forEach(field => {
      if (!this.validateField(field)) isValid = false;
    });
    return isValid;
  }

  submitForm() {
    const statusDiv = this.form.querySelector('.form-status');
    if (statusDiv) {
      statusDiv.className = 'form-status success';
      statusDiv.textContent = 'Message sent successfully! Thank you for reaching out.';
      this.form.reset();
      setTimeout(() => {
        statusDiv.className = 'form-status';
        statusDiv.textContent = '';
      }, 5000);
    }
  }
}

// ==================== Intersection Observer for Animations ====================
/** Observes elements and adds the `animated` class when they enter the viewport. */
class AnimationObserver {
  constructor() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px',
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    document.querySelectorAll('.section').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }
}

// ==================== Loading Screen ====================
/** Hides the full-page loading overlay once the window `load` event fires. */
class LoadingScreen {
  constructor() {
    this.loadingScreen = document.querySelector('.loading-screen');
    this.init();
  }

  init() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.classList.add('hidden');
        }
      }, 1000);
    });
  }
}

// ==================== Main Application ====================
/** Bootstraps all modules and orchestrates data fetching + rendering. */
class PortfolioApp {
  constructor() {
    this.api = new GitHubAPI(CONFIG.GITHUB_USERNAME);
    this.ui = new UIComponents(this.api);
  }

  async init() {
    new ThemeManager();
    new LoadingScreen();
    new Navigation();
    new ScrollProgress();
    new BackToTop();
    new CustomCursor();
    new ThreeDEffects();

    const canvas = document.getElementById('particles-canvas');
    if (canvas) new ParticleSystem(canvas);

    const contactForm = document.getElementById('contact-form');
    if (contactForm) new FormValidator(contactForm);

    new AnimationObserver();

    await this.loadData();
  }

  async loadData() {
    try {
      const [userData, repos] = await Promise.all([
        this.api.fetchUserData(),
        this.api.fetchRepositories(),
      ]);

      await this.ui.renderHero(userData);
      await this.ui.renderAbout(userData, repos);
      this.ui.renderSkills();
      this.ui.renderProjects(repos);
      await this.ui.renderActivity(userData, repos);
      this.ui.renderAchievements();
      this.ui.renderTestimonials();
      this.ui.renderContact();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.init();
});
