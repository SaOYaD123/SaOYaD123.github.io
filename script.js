// ==================== Configuration ====================
const GITHUB_USERNAME = 'SaOYaD-SZN';
const GITHUB_API_BASE = 'https://api.github.com';

// ==================== GitHub API Functions ====================
class GitHubAPI {
  constructor(username) {
    this.username = username;
    this.cache = {};
  }

  async fetchUserData() {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${this.username}`);
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
      const response = await fetch(`${GITHUB_API_BASE}/users/${this.username}/repos?per_page=100&sort=updated`);
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
    let totalBytes = 0;

    try {
      // Fetch language data for top 20 most recently updated repos (to avoid rate limiting)
      const reposToCheck = repos.slice(0, 20);
      
      for (const repo of reposToCheck) {
        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }
      }

      // Calculate percentages based on repo count
      const totalRepos = Object.values(languageStats).reduce((a, b) => a + b, 0);
      const languagePercentages = {};
      
      for (const [lang, count] of Object.entries(languageStats)) {
        languagePercentages[lang] = ((count / totalRepos) * 100).toFixed(1);
      }

      // Sort by percentage
      return Object.entries(languagePercentages)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
        .slice(0, 6); // Top 6 languages
    } catch (error) {
      console.error('Error calculating languages:', error);
      return [['JavaScript', '100']];
    }
  }

  getFallbackUserData() {
    return {
      name: 'SaOYaD',
      bio: '🌱 Linux Enthusiast | 💻 Full-Stack Developer | 🌐 Tech Savvy',
      avatar_url: 'logo.avif',
      location: 'Unknown',
      company: null,
      public_repos: 0,
      followers: 0,
      following: 0
    };
  }

  calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
  }

  getFeaturedRepos(repos) {
    // Sort by stars and get top repos
    return repos
      .filter(repo => !repo.fork) // Exclude forks
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6); // Top 6 repos
  }
}

// ==================== UI Components ====================
class PortfolioUI {
  constructor(api) {
    this.api = api;
    this.typewriterIndex = 0;
    this.typewriterTexts = [
      'Linux Enthusiast 🐧',
      'Full-Stack Developer 💻',
      'Open Source Contributor 🌟',
      'Tech Explorer 🚀'
    ];
    this.currentTextIndex = 0;
  }

  async initialize() {
    this.showLoadingScreen();
    
    try {
      // Fetch all data
      const userData = await this.api.fetchUserData();
      const repositories = await this.api.fetchRepositories();
      const languages = await this.api.fetchLanguages(repositories);
      const totalStars = this.api.calculateTotalStars(repositories);
      const featuredRepos = this.api.getFeaturedRepos(repositories);

      // Render all sections
      this.renderHeroSection(userData, repositories.length, totalStars);
      this.renderAboutSection(userData, languages);
      this.renderProjectsSection(featuredRepos);
      this.renderActivitySection(userData, repositories, totalStars);
      this.renderConnectSection();

      // Initialize animations
      this.initializeAnimations();
      this.startTypewriterEffect();

      // Hide loading screen
      setTimeout(() => this.hideLoadingScreen(), 500);
    } catch (error) {
      console.error('Error initializing portfolio:', error);
      this.hideLoadingScreen();
    }
  }

  showLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }

  renderHeroSection(userData, repoCount, totalStars) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) {
      console.warn('Hero content element not found');
      return;
    }

    const avatarUrl = userData.avatar_url || 'logo.avif';
    const name = userData.name || userData.login || 'SaOYaD';
    const bio = userData.bio || '🌱 Linux Enthusiast | 💻 Full-Stack Developer';

    heroContent.innerHTML = `
      <div class="profile-image-container">
        <img src="${avatarUrl}" alt="${name}" class="profile-image">
      </div>
      <h1 class="hero-name">${name}</h1>
      <p class="hero-tagline">
        <span class="typewriter-text"></span>
      </p>
      <p class="hero-bio">${bio}</p>
      
      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-number" data-target="${repoCount}">0</span>
          <span class="stat-label">Repositories</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-target="${totalStars}">0</span>
          <span class="stat-label">Total Stars</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" data-target="${userData.followers || 0}">0</span>
          <span class="stat-label">Followers</span>
        </div>
      </div>

      <div class="cta-buttons">
        <a href="https://github.com/${this.api.username}" target="_blank" class="btn btn-primary">
          View GitHub Profile
        </a>
        <a href="#projects" class="btn btn-secondary">
          View Projects
        </a>
      </div>
    `;

    // Animate stat numbers
    this.animateNumbers();
  }

  renderAboutSection(userData, languages) {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) {
      console.warn('About section element not found');
      return;
    }

    const location = userData.location ? `📍 ${userData.location}` : '';
    const company = userData.company ? `🏢 ${userData.company}` : '';

    aboutSection.innerHTML = `
      <div class="container">
        <h2 class="section-title scroll-reveal">About Me</h2>
        <p class="section-subtitle scroll-reveal">Get to know more about my journey and skills</p>
        
        <div class="about-content scroll-reveal">
          <div class="about-text">
            <p>${userData.bio || '🌱 Linux Enthusiast who loves tinkering with technology.'}</p>
            <p>🌐 Social Butterfly active on Discord and various tech communities.</p>
            <p>💽 Tech Savvy, currently diving deep into modern web development.</p>
            <p>💻 Aspiring Full-Stack Developer passionate about creating innovative solutions.</p>
            ${location ? `<p>${location}</p>` : ''}
            ${company ? `<p>${company}</p>` : ''}
          </div>
          
          <div class="languages-chart">
            <h3 style="color: var(--primary-gold); margin-bottom: 20px;">Top Languages</h3>
            ${this.renderLanguages(languages)}
          </div>
        </div>
      </div>
    `;
  }

  renderLanguages(languages) {
    if (!languages || languages.length === 0) {
      return '<p style="color: var(--text-secondary);">Loading language data...</p>';
    }

    return languages.map(([lang, percentage]) => `
      <div class="language-item">
        <div class="language-header">
          <span class="language-name">${lang}</span>
          <span class="language-percentage">${percentage}%</span>
        </div>
        <div class="language-bar">
          <div class="language-bar-fill" data-width="${percentage}"></div>
        </div>
      </div>
    `).join('');
  }

  renderProjectsSection(repos) {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) {
      console.warn('Projects section element not found');
      return;
    }

    const projectsHTML = repos.length > 0 ? repos.map(repo => this.createProjectCard(repo)).join('') : 
      '<p style="text-align: center; color: var(--text-secondary);">No repositories found.</p>';

    projectsSection.innerHTML = `
      <div class="container">
        <h2 class="section-title scroll-reveal">Featured Projects</h2>
        <p class="section-subtitle scroll-reveal">Check out some of my recent work</p>
        
        <div class="projects-grid">
          ${projectsHTML}
        </div>
      </div>
    `;
  }

  createProjectCard(repo) {
    const description = repo.description || 'No description available';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const homepage = repo.homepage;

    return `
      <div class="project-card scroll-reveal">
        <div class="project-header">
          <h3 class="project-title">${repo.name}</h3>
          <span class="project-language">
            <span class="language-dot"></span>
            ${language}
          </span>
        </div>
        
        <p class="project-description">${description}</p>
        
        <div class="project-stats">
          <span class="stat">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            ${stars}
          </span>
          <span class="stat">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            </svg>
            ${forks}
          </span>
        </div>
        
        <div class="project-links">
          <a href="${repo.html_url}" target="_blank" class="project-link">View Code</a>
          ${homepage ? `<a href="${homepage}" target="_blank" class="project-link">Live Demo</a>` : ''}
        </div>
      </div>
    `;
  }

  renderActivitySection(userData, repositories, totalStars) {
    const activitySection = document.getElementById('activity');
    if (!activitySection) {
      console.warn('Activity section element not found');
      return;
    }

    const totalRepos = repositories.length;
    const publicRepos = repositories.filter(r => !r.private).length;
    const forkedRepos = repositories.filter(r => r.fork).length;

    activitySection.innerHTML = `
      <div class="container">
        <h2 class="section-title scroll-reveal">GitHub Activity</h2>
        <p class="section-subtitle scroll-reveal">My contribution statistics</p>
        
        <div class="activity-grid">
          <div class="activity-card scroll-reveal">
            <div class="activity-icon">📊</div>
            <span class="activity-value">${totalRepos}</span>
            <span class="activity-label">Total Repositories</span>
          </div>
          
          <div class="activity-card scroll-reveal">
            <div class="activity-icon">⭐</div>
            <span class="activity-value">${totalStars}</span>
            <span class="activity-label">Total Stars</span>
          </div>
          
          <div class="activity-card scroll-reveal">
            <div class="activity-icon">👥</div>
            <span class="activity-value">${userData.followers || 0}</span>
            <span class="activity-label">Followers</span>
          </div>
          
          <div class="activity-card scroll-reveal">
            <div class="activity-icon">🔄</div>
            <span class="activity-value">${forkedRepos}</span>
            <span class="activity-label">Forked Repos</span>
          </div>
        </div>
      </div>
    `;
  }

  renderConnectSection() {
    const connectSection = document.getElementById('connect');
    if (!connectSection) {
      console.warn('Connect section element not found');
      return;
    }

    connectSection.innerHTML = `
      <div class="container">
        <h2 class="section-title scroll-reveal">Let's Connect</h2>
        <p class="section-subtitle scroll-reveal">Find me on these platforms</p>
        
        <div class="social-links scroll-reveal">
          <a href="https://github.com/${this.api.username}" target="_blank" class="social-link" title="GitHub">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub">
          </a>
          <a href="https://discord.gg/2aRd2B52qZ" target="_blank" class="social-link" title="Discord">
            <img src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/discord.svg" alt="Discord">
          </a>
          <a href="https://www.youtube.com/@Silver_Lining_Skies" target="_blank" class="social-link" title="YouTube">
            <img src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/youtube.svg" alt="YouTube">
          </a>
          <a href="https://x.com/SaOYaD123" target="_blank" class="social-link" title="Twitter/X">
            <img src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg" alt="Twitter">
          </a>
          <a href="https://www.reddit.com/user/SaOYaD/" target="_blank" class="social-link" title="Reddit">
            <img src="https://www.iconpacks.net/icons/5/free-reddit-circle-logo-icon-16620.png" alt="Reddit">
          </a>
        </div>
      </div>
    `;
  }

  // ==================== Animations ====================
  animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60 fps
      let current = 0;

      const updateNumber = () => {
        current += increment;
        if (current < target) {
          stat.textContent = Math.floor(current);
          requestAnimationFrame(updateNumber);
        } else {
          stat.textContent = target;
        }
      };

      // Start animation when element is visible
      setTimeout(updateNumber, 500);
    });
  }

  startTypewriterEffect() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (!typewriterElement) {
      console.warn('Typewriter element not found');
      return;
    }

    let currentText = '';
    let isDeleting = false;
    let textIndex = 0;
    let charIndex = 0;

    const type = () => {
      const fullText = this.typewriterTexts[textIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        currentText = fullText.substring(0, charIndex + 1);
        charIndex++;
      }

      typewriterElement.textContent = currentText;

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === fullText.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % this.typewriterTexts.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };

    type();
  }

  initializeAnimations() {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    // Animate language bars
    setTimeout(() => {
      document.querySelectorAll('.language-bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = `${width}%`;
      });
    }, 500);
  }
}

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', async () => {
  const api = new GitHubAPI(GITHUB_USERNAME);
  const ui = new PortfolioUI(api);
  await ui.initialize();
  
  // Initialize scroll progress
  initScrollProgress();
  
  // Initialize enhanced particles with mouse interaction
  initEnhancedParticles();
  
  // Add stagger animation to project cards
  addStaggerAnimation();
  
  // Initialize custom cursor
  initCustomCursor();
  
  // Initialize 3D tilt effects
  init3DTiltEffects();
  
  // Initialize magnetic buttons
  initMagneticEffects();
  
  // Initialize ripple effects
  initRippleEffects();
  
  // Initialize parallax scrolling
  initParallaxEffects();
  
  // Initialize sakura petals
  initSakuraPetals();
  
  // Initialize sparkles
  initSparkles();
});

// ==================== Custom Cursor ====================
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  if (!cursor || !cursorDot || !cursorOutline) return;
  
  // Only enable on devices with fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'default';
    return;
  }
  
  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;
  
  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });
  
  // Smooth follow for outline
  function animateOutline() {
    const speed = 0.15;
    outlineX += (mouseX - outlineX) * speed;
    outlineY += (mouseY - outlineY) * speed;
    
    cursorOutline.style.left = outlineX + 'px';
    cursorOutline.style.top = outlineY + 'px';
    
    requestAnimationFrame(animateOutline);
  }
  animateOutline();
  
  // Expand on hover over interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .social-link, .stat-item, .activity-card');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('expand');
      cursorOutline.classList.add('expand');
    });
    
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('expand');
      cursorOutline.classList.remove('expand');
    });
  });
}

// ==================== 3D Tilt Effects ====================
function init3DTiltEffects() {
  // Disable on mobile/touch devices
  if (window.matchMedia('(max-width: 768px)').matches) return;
  
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('tilt-active');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilt-active');
      card.style.transform = '';
    });
    
    card.addEventListener('mousemove', (e) => {
      if (!card.classList.contains('tilt-active')) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
  });
}

// ==================== Magnetic Effects ====================
function initMagneticEffects() {
  // Disable on mobile/touch devices
  if (window.matchMedia('(max-width: 768px)').matches) return;
  
  const magneticElements = document.querySelectorAll('.social-link, .btn');
  
  magneticElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('magnetic-active');
    });
    
    el.addEventListener('mouseleave', () => {
      el.classList.remove('magnetic-active');
      el.style.transform = '';
    });
    
    el.addEventListener('mousemove', (e) => {
      if (!el.classList.contains('magnetic-active')) return;
      
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
}

// ==================== Ripple Effects ====================
function initRippleEffects() {
  const buttons = document.querySelectorAll('.btn, .project-link');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      this.classList.add('ripple');
      
      setTimeout(() => {
        this.classList.remove('ripple');
      }, 600);
    });
  });
}

// ==================== Parallax Effects ====================
function initParallaxEffects() {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        parallaxScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  function parallaxScroll() {
    const scrolled = window.pageYOffset;
    
    // Parallax for floating shapes - preserve CSS animations
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
      const speed = 0.1 + (index * 0.05);
      const yPos = -(scrolled * speed);
      // Use CSS variable to combine with existing animation
      shape.style.setProperty('--parallax-y', `${yPos}px`);
    });
    
    // Parallax for hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      const yPos = scrolled * 0.3;
      heroContent.style.transform = `translateY(${yPos}px)`;
      heroContent.style.opacity = Math.max(0, 1 - (scrolled / 600));
    }
  }
}

// ==================== Scroll Progress Indicator ====================
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  });
}

// ==================== Enhanced Particle System ====================
function initEnhancedParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
  let mouse = { x: null, y: null, radius: 150 };
  
  // Track mouse position
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  class EnhancedParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.color = this.getRandomColor();
    }
    
    getRandomColor() {
      const colors = [
        'rgba(255, 182, 193, ',  // sakura pink
        'rgba(230, 230, 250, ',  // lavender
        'rgba(221, 160, 221, ',  // soft purple
        'rgba(152, 255, 152, ',  // mint
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      // Mouse interaction
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        } else {
          // Return to base position
          if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx * 0.05;
          }
          if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy * 0.05;
          }
        }
      }
      
      // Normal movement
      this.baseX += this.speedX;
      this.baseY += this.speedY;
      
      // Wrap around edges
      if (this.baseX > canvas.width) this.baseX = 0;
      if (this.baseX < 0) this.baseX = canvas.width;
      if (this.baseY > canvas.height) this.baseY = 0;
      if (this.baseY < 0) this.baseY = canvas.height;
    }
    
    draw() {
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color + '0.5)';
    }
  }
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new EnhancedParticle());
  }
  
  // Connect particles
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.3;
          ctx.strokeStyle = `rgba(255, 182, 193, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    connectParticles();
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ==================== Stagger Animation for Cards ====================
function addStaggerAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add delay based on index
        const cards = entry.target.parentElement.children;
        const cardIndex = Array.from(cards).indexOf(entry.target);
        entry.target.style.animationDelay = `${cardIndex * 0.1}s`;
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });
  
  // Observe project cards
  document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
  });
}

// ==================== Sakura Petals Animation ====================
function initSakuraPetals() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  const container = document.querySelector('.sakura-container');
  if (!container) return;
  
  const petalCount = window.innerWidth < 768 ? 15 : 30;
  
  function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';
    
    // Random starting position
    petal.style.left = Math.random() * 100 + '%';
    
    // Random size
    const size = 10 + Math.random() * 10;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    
    // Random animation duration
    const duration = 10 + Math.random() * 20;
    petal.style.animationDuration = duration + 's';
    
    // Random delay
    petal.style.animationDelay = Math.random() * 10 + 's';
    
    container.appendChild(petal);
    
    // Remove petal after animation completes and recreate
    setTimeout(() => {
      petal.remove();
      createPetal();
    }, duration * 1000);
  }
  
  // Create initial petals
  for (let i = 0; i < petalCount; i++) {
    setTimeout(() => createPetal(), i * 300);
  }
}

// ==================== Sparkles Animation ====================
function initSparkles() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  const container = document.querySelector('.sparkles-container');
  if (!container) return;
  
  // Create sparkles on mouse move
  let lastSparkleTime = 0;
  const sparkleInterval = 100; // milliseconds between sparkles
  
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkleTime < sparkleInterval) return;
    lastSparkleTime = now;
    
    // Only create sparkle 30% of the time to avoid too many
    if (Math.random() > 0.3) return;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = e.clientX + (Math.random() * 40 - 20) + 'px';
    sparkle.style.top = e.clientY + (Math.random() * 40 - 20) + 'px';
    sparkle.style.animationDelay = Math.random() * 0.5 + 's';
    
    container.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => sparkle.remove(), 2000);
  });
  
  // Also create random sparkles across the screen
  function createRandomSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.animationDuration = (1 + Math.random() * 2) + 's';
    
    container.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 3000);
  }
  
  // Create random sparkles periodically
  setInterval(() => {
    if (Math.random() > 0.5) {
      createRandomSparkle();
    }
  }, 1000);
}