# GitHub Copilot Instructions for SaOYaD Portfolio

## Project Overview

This is a premium portfolio website built with modern web technologies, featuring a Progressive Web App (PWA) architecture, advanced visual effects, and GitHub API integration. The project emphasizes performance, accessibility, and modern web standards.

## Technology Stack

- **Frontend**: HTML5, CSS3 (Modern Features), Vanilla JavaScript (ES6+)
- **Hosting**: GitHub Pages
- **Architecture**: Modular, Class-based JavaScript
- **PWA**: Manifest + Service Worker
- **SEO**: Meta tags, Schema.org, Sitemap

## Project Structure

```
SaOYaD-SZN.github.io/
├── index.html          # Main HTML (Semantic HTML5)
├── styles.css          # Modern CSS with custom properties
├── script.js           # ES6+ JavaScript with class-based architecture
├── wallpaper.jpg       # Visual assets
├── logo.avif           # Brand identity (AVIF format)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── README.md           # Documentation
└── LICENSE             # MIT License
```

## Coding Standards & Guidelines

### HTML
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, etc.)
- Include proper ARIA labels and roles for accessibility
- Follow WCAG 2.1 AA standards
- Add meta tags for SEO and Open Graph/Twitter Cards
- Use JSON-LD for structured data

### CSS
- Use CSS custom properties (CSS variables) defined in `:root`
- Follow mobile-first responsive design approach (320px to 4K)
- Utilize modern CSS features:
  - CSS Grid and Flexbox for layouts
  - `clamp()` for responsive typography
  - `backdrop-filter` for glassmorphism effects
  - CSS custom scrollbar styling
- Implement smooth animations with GPU acceleration (use `transform` and `opacity`)
- Support `prefers-reduced-motion` and `prefers-color-scheme`
- Maintain consistent spacing and naming conventions
- Use BEM-like naming for complex components

### JavaScript
- Write ES6+ JavaScript with modern syntax
- Use class-based architecture for components
- Implement async/await for asynchronous operations
- Follow these patterns:
  - Debouncing for scroll/resize events
  - Throttling for performance-critical operations
  - Event delegation for dynamic content
  - Intersection Observer for scroll animations
  - LocalStorage for theme persistence
- Sanitize all user inputs to prevent XSS
- Use meaningful variable and function names
- Add comments only for complex logic
- Keep functions focused and modular

### Configuration
- All configuration constants should be in the `CONFIG` object at the top of `script.js`
- Use descriptive constant names in UPPER_SNAKE_CASE
- Keep API endpoints and keys configurable

## Key Features & Patterns

### Theme System
- Dark/Light theme with system preference detection
- Theme persisted in localStorage with key `saoyad-theme`
- Smooth transitions between themes using CSS custom properties

### Glassmorphism & Neumorphism
- Use `--glass-bg`, `--glass-border`, `--glass-hover` variables
- Apply `backdrop-filter: blur()` for glass effects
- Use neumorphic shadows defined in CSS variables

### Animations
- 60fps animations using GPU-accelerated properties
- Intersection Observer for scroll-triggered animations
- Custom cursor with trail effects
- Particle system for background effects
- Typewriter effect for hero text

### PWA Features
- Service Worker (`sw.js`) for offline support and caching
- Manifest file for app installation
- Responsive design for all screen sizes

### GitHub Integration
- Real-time stats via GitHub API
- Display repositories, contributions, and activity
- Use `CONFIG.GITHUB_USERNAME` and `CONFIG.GITHUB_API_BASE`

### Form Handling
- Real-time validation with visual feedback
- Input sanitization to prevent XSS
- Accessible error messages

## Performance Guidelines

- Lazy load images with `loading="lazy"`
- Use resource hints (`preconnect`, `dns-prefetch`)
- Minimize DOM manipulation
- Debounce/throttle event handlers
- Optimize animations for 60fps
- Use Service Worker caching strategies
- Keep bundle sizes minimal (no external dependencies)

## Accessibility Requirements

- Semantic HTML structure
- ARIA labels and roles where appropriate
- Keyboard navigation support
- Focus indicators for interactive elements
- Skip to content link
- Screen reader optimization
- Color contrast meeting WCAG AA standards
- Support for reduced motion preferences

## Security Best Practices

- Content Security Policy (CSP) headers
- Input sanitization for all user-generated content
- HTTPS enforcement
- No inline event handlers
- Secure asset loading

## Testing & Validation

- Test responsiveness on multiple screen sizes (320px to 4K)
- Verify keyboard navigation
- Check color contrast ratios
- Test with screen readers
- Validate HTML, CSS
- Test PWA functionality (offline mode, installation)
- Verify GitHub API integration

## Deployment

- Hosted on GitHub Pages
- Automated deployment on push to main branch
- No build process required (vanilla HTML/CSS/JS)

## Common Tasks

### Adding a New Section
1. Add semantic HTML in `index.html`
2. Style with CSS in `styles.css` using existing design system
3. Add interactivity in `script.js` using class-based architecture
4. Ensure responsive design and accessibility

### Modifying Theme Colors
1. Update CSS custom properties in `:root` for dark theme
2. Update light theme variables in `[data-theme="light"]`
3. Ensure sufficient color contrast for accessibility

### Adding GitHub Features
1. Use existing `CONFIG.GITHUB_USERNAME` and API base
2. Implement with async/await and error handling
3. Cache data when appropriate
4. Display loading states and handle errors gracefully

## Additional Notes

- No external JavaScript libraries/frameworks - keep it vanilla
- Maintain backwards compatibility with modern browsers
- Prioritize performance and accessibility
- Keep design consistent with pastel color scheme and glassmorphism
- All assets should be optimized (use modern formats like AVIF when possible)
- Follow the MIT License terms for any contributions
