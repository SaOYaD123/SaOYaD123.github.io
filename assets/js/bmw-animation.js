// BMW M4 Drift Animation Controller
class BMWDriftAnimation {
  constructor() {
    this.container = null;
    this.carElement = null;
    this.smokeParticles = [];
    this.skidMarks = [];
    this.isAnimating = false;
    this.isMobile = window.innerWidth < 768;
    this.heroSection = document.querySelector('.hero-section');
    
    this.config = {
      animationDuration: this.isMobile ? 2500 : 3500,
      driftAngle: this.isMobile ? 0 : -15,
      smokeParticleCount: this.isMobile ? 8 : 18,
      smokeSize: { min: 10, max: 30 },
      carStartX: -100,
      carEndX: window.innerWidth + 200,
      carY: this.isMobile ? '60%' : '50%',
      enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  init() {
    if (!this.config.enabled) return;
    this.createContainer();
    this.setupIntersectionObserver();
  }

  createContainer() {
    // Create BMW drift container
    this.container = document.createElement('div');
    this.container.className = 'bmw-drift-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 5;
    `;

    // Create car element
    this.carElement = document.createElement('div');
    this.carElement.className = 'bmw-car';
    this.carElement.style.cssText = `
      position: absolute;
      width: ${this.isMobile ? '120px' : '200px'};
      height: ${this.isMobile ? '45px' : '75px'};
      left: ${this.config.carStartX}px;
      top: ${this.config.carY};
      transform: translateY(-50%) rotate(${this.config.driftAngle}deg);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Load SVG
    this.carElement.innerHTML = `
      <img src="assets/animations/bmw-m4.svg" alt="" 
           style="width: 100%; height: 100%; object-fit: contain;" />
    `;

    this.container.appendChild(this.carElement);

    // Add to hero section
    if (this.heroSection) {
      this.heroSection.style.position = 'relative';
      this.heroSection.appendChild(this.container);
    }
  }

  setupIntersectionObserver() {
    if (!this.heroSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isAnimating) {
          this.startAnimation();
        }
      });
    }, {
      threshold: 0.3
    });

    observer.observe(this.heroSection);
  }

  async startAnimation() {
    if (this.isAnimating || !this.config.enabled) return;
    
    this.isAnimating = true;
    this.carElement.style.opacity = '1';

    // Reset position
    this.carElement.style.left = `${this.config.carStartX}px`;

    // Create smoke particles
    if (!this.isMobile) {
      this.createSmokeTrail();
    }

    // Create skid marks
    this.createSkidMarks();

    // Animate car
    await this.animateCar();

    // Cleanup
    setTimeout(() => {
      this.cleanup();
      this.isAnimating = false;
    }, 1000);
  }

  async animateCar() {
    return new Promise(resolve => {
      const startTime = performance.now();
      const startX = this.config.carStartX;
      const endX = this.config.carEndX;
      const distance = endX - startX;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.config.animationDuration, 1);
        
        // Cubic-bezier easing
        const eased = this.cubicBezierEasing(progress);
        const currentX = startX + (distance * eased);

        this.carElement.style.left = `${currentX}px`;

        // Add wobble effect for drift
        if (!this.isMobile) {
          const wobble = Math.sin(progress * Math.PI * 4) * 3;
          this.carElement.style.transform = 
            `translateY(-50%) rotate(${this.config.driftAngle + wobble}deg)`;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.carElement.style.opacity = '0';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  createSmokeTrail() {
    const smokeInterval = setInterval(() => {
      if (!this.isAnimating) {
        clearInterval(smokeInterval);
        return;
      }

      for (let i = 0; i < 2; i++) {
        this.createSmokeParticle();
      }
    }, 150);
  }

  createSmokeParticle() {
    const particle = document.createElement('div');
    const size = this.randomBetween(this.config.smokeSize.min, this.config.smokeSize.max);
    
    const carRect = this.carElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    const x = carRect.left - containerRect.left - 30;
    const y = carRect.top - containerRect.top + carRect.height / 2;

    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(200, 200, 220, 0.6), transparent);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(8px);
      opacity: 1;
      transform: scale(1);
    `;

    this.container.appendChild(particle);
    this.smokeParticles.push(particle);

    // Animate smoke
    particle.animate([
      { 
        opacity: 0.6, 
        transform: `translate(0, 0) scale(1)` 
      },
      { 
        opacity: 0, 
        transform: `translate(${this.randomBetween(-40, -80)}px, ${this.randomBetween(-20, 20)}px) scale(2)` 
      }
    ], {
      duration: 1500,
      easing: 'ease-out',
      fill: 'forwards'
    }).onfinish = () => {
      particle.remove();
    };
  }

  createSkidMarks() {
    const skidMark = document.createElement('div');
    skidMark.className = 'skid-mark';
    skidMark.style.cssText = `
      position: absolute;
      left: 0;
      top: ${this.config.carY};
      width: 100%;
      height: 4px;
      background: linear-gradient(to right, 
        transparent 0%, 
        rgba(20, 20, 25, 0.4) 10%, 
        rgba(20, 20, 25, 0.7) 50%, 
        rgba(20, 20, 25, 0.4) 90%, 
        transparent 100%);
      transform: translateY(-50%) skewX(-10deg);
      opacity: 0;
      pointer-events: none;
    `;

    this.container.appendChild(skidMark);
    this.skidMarks.push(skidMark);

    // Animate skid mark
    skidMark.animate([
      { opacity: 0 },
      { opacity: 0.8, offset: 0.3 },
      { opacity: 0.8, offset: 0.7 },
      { opacity: 0 }
    ], {
      duration: this.config.animationDuration + 500,
      easing: 'ease-in-out',
      fill: 'forwards'
    }).onfinish = () => {
      skidMark.remove();
    };
  }

  cleanup() {
    // Remove any remaining particles
    this.smokeParticles.forEach(p => {
      if (p.parentNode) p.remove();
    });
    this.smokeParticles = [];

    this.skidMarks.forEach(m => {
      if (m.parentNode) m.remove();
    });
    this.skidMarks = [];
  }

  cubicBezierEasing(t) {
    // cubic-bezier(0.4, 0, 0.2, 1)
    const p0 = 0, p1 = 0.4, p2 = 0.2, p3 = 1;
    const t2 = t * t;
    const t3 = t2 * t;
    return 3 * p1 * (1 - t) * (1 - t) * t + 3 * p2 * (1 - t) * t2 + t3;
  }

  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Public method to trigger animation manually
  trigger() {
    if (!this.isAnimating) {
      this.startAnimation();
    }
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.bmwDrift = new BMWDriftAnimation();
    window.bmwDrift.init();
  });
} else {
  window.bmwDrift = new BMWDriftAnimation();
  window.bmwDrift.init();
}
