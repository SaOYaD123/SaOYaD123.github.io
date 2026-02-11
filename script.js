// ==================== Configuration ====================
const GITHUB_USERNAME = 'SaOYaD123';
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
      this.initializeParticles();
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

  initializeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) {
      console.warn('Particles canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(108, 99, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', async () => {
  const api = new GitHubAPI(GITHUB_USERNAME);
  const ui = new PortfolioUI(api);
  await ui.initialize();
});
