// Enhanced Particle System for 2026
class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.meteors = [];
    this.orbs = [];
    this.mouse = { x: null, y: null };
    this.animationFrame = null;
    this.enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;
    
    this.config = {
      particleCount: this.isMobile ? 25 : 50,
      meteorCount: this.isMobile ? 2 : 5,
      orbCount: this.isMobile ? 3 : 7,
      constellationDistance: 150,
      cursorRepelDistance: 100,
      cursorRepelForce: 0.5
    };
  }

  init() {
    if (!this.enabled || !this.canvas || !this.ctx) return;

    this.resize();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.particles = [];
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  createParticles() {
    // Create base particles
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }

    // Create meteors
    if (!this.isMobile) {
      for (let i = 0; i < this.config.meteorCount; i++) {
        this.meteors.push(new Meteor(this.canvas.width, this.canvas.height));
      }
    }

    // Create floating orbs
    for (let i = 0; i < this.config.orbCount; i++) {
      this.orbs.push(new FloatingOrb(this.canvas.width, this.canvas.height));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw constellation connections
    this.drawConstellations();

    // Update and draw particles
    this.particles.forEach(particle => {
      this.applyMouseEffect(particle);
      particle.update();
      particle.draw(this.ctx);
    });

    // Update and draw meteors
    if (!this.isMobile) {
      this.meteors.forEach(meteor => {
        meteor.update();
        meteor.draw(this.ctx);
        
        // Reset meteor when off screen
        if (meteor.y > this.canvas.height || meteor.x > this.canvas.width) {
          meteor.reset(this.canvas.width);
        }
      });
    }

    // Update and draw orbs
    this.orbs.forEach(orb => {
      orb.update();
      orb.draw(this.ctx);
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  drawConstellations() {
    this.ctx.strokeStyle = 'rgba(255, 182, 193, 0.2)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.constellationDistance) {
          const opacity = 1 - (distance / this.config.constellationDistance);
          this.ctx.strokeStyle = `rgba(255, 182, 193, ${opacity * 0.3})`;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  applyMouseEffect(particle) {
    if (this.mouse.x === null || this.mouse.y === null) return;

    const dx = particle.x - this.mouse.x;
    const dy = particle.y - this.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.config.cursorRepelDistance) {
      const force = (1 - distance / this.config.cursorRepelDistance) * this.config.cursorRepelForce;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
    }
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.particles = [];
    this.meteors = [];
    this.orbs = [];
  }
}

// Base Particle Class
class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 3 + 1;
    this.color = this.randomColor();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  randomColor() {
    const colors = [
      'rgba(255, 182, 193, 0.8)', // Pink
      'rgba(230, 230, 250, 0.8)', // Lavender
      'rgba(221, 160, 221, 0.8)', // Purple
      'rgba(152, 255, 152, 0.8)', // Mint
      'rgba(255, 218, 185, 0.8)'  // Peach
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Damping
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Bounce off edges
    if (this.x < 0 || this.x > this.canvasWidth) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, this.canvasWidth));
    }
    if (this.y < 0 || this.y > this.canvasHeight) {
      this.vy *= -1;
      this.y = Math.max(0, Math.min(this.y, this.canvasHeight));
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Meteor Class
class Meteor {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset(canvasWidth);
  }

  reset(canvasWidth) {
    this.x = Math.random() * canvasWidth;
    this.y = -50;
    this.length = Math.random() * 80 + 40;
    this.speed = Math.random() * 4 + 3;
    this.opacity = Math.random() * 0.5 + 0.5;
  }

  update() {
    this.x += this.speed;
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI / 4);

    const gradient = ctx.createLinearGradient(0, 0, 0, this.length);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, `rgba(0, 240, 255, ${this.opacity})`);
    gradient.addColorStop(1, 'transparent');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.length);
    ctx.stroke();

    ctx.restore();
  }
}

// Floating Orb Class
class FloatingOrb {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = Math.random() * 40 + 20;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.01 + 0.005;
    this.radius = Math.random() * 50 + 30;
    this.color = this.randomGlowColor();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  randomGlowColor() {
    const colors = [
      { r: 0, g: 240, b: 255 },   // Cyan
      { r: 181, g: 55, b: 242 },  // Purple
      { r: 255, g: 0, b: 110 }    // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.angle += this.speed;
    this.x = this.baseX + Math.cos(this.angle) * this.radius;
    this.y = this.baseY + Math.sin(this.angle) * this.radius;
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );
    
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`);
    gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.particleEngine = new ParticleEngine();
    window.particleEngine.init();
  });
} else {
  window.particleEngine = new ParticleEngine();
  window.particleEngine.init();
}
