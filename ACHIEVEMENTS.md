# GitHub Achievements Tracker 🏆

This repository contains automation scripts and workflows to help earn GitHub achievements, badges, and trophies.

## Achievements Checklist

| Achievement | Description | Status |
|------------|-------------|--------|
| 🦖 Commit Combo | Make multiple commits in a day | ⏳ Automated |
| 🦈 Pull Shark | Get a pull request merged | ⏳ In Progress |
| 🌌 Galaxy Brain | Answer discussions | ⏳ Manual |
| ⭐ Starstruck | Star 16+ repositories | ⏳ Use star_repos.py |
| 👥 Pair Extraordinaire | Co-author a pull request | ⏳ Manual |
| ⚡ Quickdraw | Close an issue within 24 hours | ⏳ Automated |
| 🤝 Yolo | Merge your own pull request | ⏳ Manual |
| 🤖 Actions Hero | Create a GitHub Actions workflow | ✅ Done |
| 🐛 Bug Hunter | Report a bug issue | ⏳ Manual |
| 🧹 Sweeper | Close issues across repos | ⏳ Automated |

## Automated Workflows

- **Daily Commit** (`.github/workflows/daily-commit.yml`): Runs every day to keep commit streak.
- **Create Issue** (`.github/workflows/create-issue.yml`): Manually trigger to create issues.
- **Auto Close Issue** (`.github/workflows/auto-close-issue.yml`): Auto-closes issues quickly for Quickdraw.

## Scripts

- **`star_repos.py`**: Run locally to star popular repositories.

## How to Use

1. Enable GitHub Actions in your repository settings.
2. Add a Personal Access Token as a secret named `GITHUB_TOKEN` (already available by default).
3. Run `star_repos.py` locally with your GitHub token.
4. Trigger workflows manually from the Actions tab.
