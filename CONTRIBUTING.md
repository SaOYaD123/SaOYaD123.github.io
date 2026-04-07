# Contributing to SaOYaD Portfolio

Thank you for your interest in contributing! 🎉 Contributions of all kinds are welcome — bug fixes, new features, documentation improvements, and more.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Submit Issues](#how-to-submit-issues)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)

---

## 🤝 Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behavior to the repository maintainers.

---

## 🐛 How to Submit Issues

1. **Search first** — check [existing issues](../../issues) to avoid duplicates.
2. **Use a template** — select the appropriate issue template (Bug Report or Feature Request).
3. **Be detailed** — include steps to reproduce, expected vs. actual behaviour, screenshots if applicable, and your environment (OS, browser, version).

---

## 🔄 Pull Request Process

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the [coding standards](#coding-standards) below.
3. **Test** your changes across multiple browsers and screen sizes.
4. **Commit** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation only
   - `style:` — formatting, whitespace
   - `refactor:` — code restructuring without feature change
   - `chore:` — maintenance tasks
5. **Push** your branch and open a Pull Request against `main`.
6. **Describe** your changes clearly in the PR description — what it does and why.
7. **Wait for review** — a maintainer will review your PR as soon as possible.

---

## 🖥️ Development Setup

No build step is required — this is a pure HTML/CSS/JS project.

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/SaOYaD-SZN.github.io.git
cd SaOYaD-SZN.github.io

# 2. Serve locally (pick any option)
python3 -m http.server 8000
# or
npx http-server -p 8000
# or
php -S localhost:8000

# 3. Open in your browser
# http://localhost:8000
```

---

## 🎨 Coding Standards

- **HTML**: Use semantic HTML5 elements; include proper ARIA attributes.
- **CSS**: Use the existing CSS custom properties (variables); follow mobile-first responsive design.
- **JavaScript**: ES6+ syntax; class-based architecture; async/await; sanitize user input.
- **Commits**: Follow Conventional Commits format (see above).
- **Comments**: Add comments only when the logic is complex and non-obvious.
- **No external dependencies**: Keep the project dependency-free (vanilla HTML/CSS/JS).

---

## 🙏 Thank You

Every contribution — no matter how small — is appreciated. Thank you for helping make this project better!
