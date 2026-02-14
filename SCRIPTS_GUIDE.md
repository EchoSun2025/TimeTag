# TimeTag Development Scripts

This folder contains convenient scripts to run, build, and manage the project.

## 🚀 Development Scripts

### `START_DEV.bat` / `START_DEV.ps1`
**One-click start development server**

**What it does:**
1. Checks if Node.js is installed
2. Starts Vite + Electron development server
3. Opens Electron window automatically
4. Enables hot reload for instant updates

**Usage:**
- Double-click `START_DEV.bat` (Windows)
- Or run `.\START_DEV.ps1` in PowerShell

**When to use:**
- Every time you want to develop
- To test your changes
- Daily development work

---

## 📦 Build Scripts

### `BUILD.bat`
**Build production version**

**What it does:**
1. Lets you choose build target (Windows/Linux/Both)
2. Compiles TypeScript
3. Bundles React app
4. Packages Electron app
5. Outputs to `dist/` folder

**Usage:**
- Double-click `BUILD.bat`
- Select: 1 (Windows), 2 (Linux), or 3 (Both)
- Wait 2-3 minutes for build to complete

**Output:**
- Windows: `dist/TimeTag-1.0.0-Portable.exe` (~75MB)
- Linux: `dist/TimeTag-1.0.0.AppImage` (~80MB)

**When to use:**
- When features are complete and ready to test
- Before releasing a new version
- To create Linux version for company

---

## 🔧 Git Scripts

### `GIT_COMMIT.bat` / `GIT_COMMIT.ps1`
**Quick commit and push to GitHub**

**What it does:**
1. Shows current changes
2. Asks for commit message
3. Stages all changes (`git add .`)
4. Commits with your message
5. Pushes to GitHub automatically

**Usage:**
- Double-click `GIT_COMMIT.bat`
- Enter commit message (e.g., "feat: Add drag and drop")
- Press Enter

**When to use:**
- After completing a feature
- At the end of each work session
- Before switching to another task

---

## 📋 Quick Reference

| Task | Script | Time |
|------|--------|------|
| Start development | `START_DEV.bat` | 10s |
| Build Windows | `BUILD.bat` → 1 | 2-3min |
| Build Linux | `BUILD.bat` → 2 | 2-3min |
| Commit to Git | `GIT_COMMIT.bat` | 5s |

---

## 💡 Typical Workflow

### Daily Development
```
1. Double-click START_DEV.bat
2. Code and test
3. Double-click GIT_COMMIT.bat
4. Enter "feat: Add XXX feature"
```

### Before Testing on Linux
```
1. Double-click BUILD.bat
2. Select option 2 (Linux)
3. Wait for build
4. Copy dist/TimeTag-1.0.0.AppImage to Linux machine
5. Run: chmod +x TimeTag-1.0.0.AppImage && ./TimeTag-1.0.0.AppImage
```

---

## 🐛 Troubleshooting

### START_DEV.bat doesn't work
**Problem:** "Node.js not found"
**Solution:** Install Node.js from https://nodejs.org/

**Problem:** Port 5173 already in use
**Solution:** 
1. Close other Vite servers
2. Or change port in `vite.config.ts`

### BUILD.bat fails
**Problem:** "npm ERR! Missing script"
**Solution:** Make sure you're in the correct directory

**Problem:** Build takes too long
**Solution:** This is normal (2-3 minutes for first build)

### GIT_COMMIT.bat says "not a git repository"
**Problem:** Git not initialized
**Solution:** Run `git init` in project folder

---

## 🎯 Best Practices

### When to Commit
✅ After completing a feature
✅ After fixing a bug
✅ At end of work session
❌ While code is broken
❌ With half-finished features

### Good Commit Messages
✅ "feat: Add time block drag and drop"
✅ "fix: Timeline zoom not working"
✅ "style: Improve tag button colors"
❌ "update"
❌ "changes"
❌ "asdfasdf"

### Commit Message Prefixes
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` UI/design changes
- `refactor:` Code restructuring
- `perf:` Performance improvement
- `test:` Add tests
- `chore:` Maintenance tasks

---

## 🔐 Security Notes

These scripts are safe to use because:
- They only run commands you would manually type
- No external downloads or installations
- All operations are local to your project
- Git operations require your credentials

---

## 📚 Advanced Usage

### Custom npm Scripts
You can add more scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build:win": "...",
    "build:linux": "...",
    "test": "vitest",        // Add testing
    "lint:fix": "eslint --fix", // Auto-fix linting
    "clean": "rimraf dist dist-electron node_modules" // Clean build
  }
}
```

Then create corresponding `.bat` files.

---

## 🎊 Quick Start

**First time setup:**
1. `npm install` (already done)
2. Double-click `START_DEV.bat`
3. Start coding!

**Daily workflow:**
1. Double-click `START_DEV.bat`
2. Code features
3. Test in Electron window
4. Double-click `GIT_COMMIT.bat`
5. Repeat!

**Before release:**
1. Double-click `BUILD.bat`
2. Select option 3 (Both platforms)
3. Test built applications
4. Create GitHub release
