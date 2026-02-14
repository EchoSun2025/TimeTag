# TimeTag - Quick Start Guide

## ✅ Project Created Successfully!

Your TimeTag project has been set up with a **stable, production-ready tech stack** designed for long-term development.

---

## 📦 Installation Status

Dependencies are currently being installed. This takes **2-3 minutes**.

**Check if done**: Look for "added XXX packages" message in terminal.

---

## 🚀 Once Installation Completes

### Start Development Server

```bash
cd D:\00working\20260214_TimeTracker_V2
npm run dev
```

**What happens:**
1. Vite dev server starts on `localhost:5173`
2. Electron window opens automatically
3. You see the TimeTag interface
4. DevTools are open for debugging

**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
Electron window launched
```

---

## 🎯 What You See

**Layout:**
- **Left 1/3**: Timeline with hour markers (8am-9pm)
- **Right Top**: Date selector and total hours
- **Right Middle**: Colorful tag buttons
- **Right Bottom**: Week overview grid

**Current Features:**
- ✅ Zoom in/out timeline (-/+ buttons or Alt+Wheel)
- ✅ Navigate dates (< > Today buttons)
- ✅ Toggle tags (click to gray out)
- ✅ Switch 5-day/7-day week view

---

## 🛠️ Development Commands

```bash
# Type checking (find TypeScript errors)
npm run type-check

# Lint code (find code quality issues)
npm run lint

# Build Windows portable version
npm run build:win

# Build Linux AppImage
npm run build:linux
```

---

## 📂 Project Structure - Where to Code

### Components (UI)
```
src/components/
├── Timeline.tsx       ← Time blocks, drag/drop (next to implement)
├── DayControl.tsx     ← Date picker, statistics
├── TagsSection.tsx    ← Tag filtering
└── WeekOverview.tsx   ← Week statistics
```

### State Management
```
src/stores/
└── appStore.ts        ← Global state (Zustand)
```

### Database
```
src/lib/
├── db.ts              ← IndexedDB setup (Dexie)
└── utils.ts           ← Helper functions
```

### Types
```
src/types/
└── index.ts           ← TypeScript interfaces
```

---

## 🔧 Tech Stack (Optimized for Debugging)

### Why These Choices?

**React + TypeScript**
- Type safety catches bugs before runtime
- Excellent IDE autocomplete
- Easy to refactor safely

**Vite**
- Instant hot reload (save → see changes in <1s)
- Clear error messages
- Fast build times

**Zustand**
- Simple API (no boilerplate)
- Easy to inspect state
- Better than Redux for smaller apps

**Dexie (IndexedDB)**
- TypeScript support
- Query syntax like SQL
- Built-in debugging tools

**Tailwind CSS**
- No CSS files to manage
- Utility classes = easy to understand
- JIT compiler = small bundle size

**Electron**
- Mature, stable
- Great DevTools
- Cross-platform builds from Windows

---

## 🐛 Debugging Tools

### 1. React DevTools (Built-in)
- Inspect component props/state
- See component re-renders
- Time travel debugging

### 2. Console Logging
```typescript
console.log('Current state:', useAppStore.getState());
```

### 3. TypeScript Compiler
```bash
npm run type-check
```
Shows all type errors before runtime.

### 4. Vite Error Overlay
When you have an error, Vite shows:
- File name and line number
- Code snippet
- Error message
- Stack trace

### 5. Database Inspection
```typescript
// In DevTools console
const records = await db.records.toArray();
console.log(records);
```

---

## 📝 Next Features to Implement

### Priority 1: Time Block Creation
**File**: `src/components/Timeline.tsx`

**What to add:**
1. Double-click handler to open "New Record" modal
2. Modal component for description + tag selection
3. Save to IndexedDB
4. Render time block on timeline

### Priority 2: Drag & Drop
**Install**: `@dnd-kit/core` is already in package.json

**What to add:**
1. Make time blocks draggable
2. Drop handler to update time
3. Visual feedback during drag
4. Save new time to database

### Priority 3: Time Rounding
**File**: `src/lib/utils.ts` (roundTime function exists)

**What to add:**
1. Toggle button in header
2. Apply rounding when saving records
3. Update statistics display

---

## 🎨 Design System

### Colors (Google Material)
```
Work:     #4285F4 (Blue)
Study:    #34A853 (Green)
Meeting:  #EA4335 (Red)
Break:    #FBBC04 (Yellow)
Exercise: #00ACC1 (Teal)
Reading:  #A142F4 (Purple)
Meal:     #F9AB00 (Orange)
Social:   #E91E63 (Pink)
Other:    #5E6FE1 (Indigo)
```

### Typography
- Headers: System fonts (Segoe UI, etc.)
- Times: Monospace (Menlo, Monaco)
- Body: Sans-serif

### Spacing
- Use Tailwind spacing scale: p-4, m-2, gap-3
- Consistent padding: px-4 py-3

---

## 🚢 Building Production Version

### Windows (Your Dev Machine)
```bash
npm run build:win
```
**Output**: `dist/TimeTag-1.0.0-Portable.exe` (~75MB)

### Linux (For Company System)
```bash
npm run build:linux
```
**Output**: `dist/TimeTag-1.0.0.AppImage` (~80MB)

**No dependencies needed on Linux!**
- AppImage is self-contained
- Just copy and run
- No sudo required
- No internet required

---

## 💡 Pro Tips

### Fast Development Loop
1. Keep `npm run dev` running
2. Edit files in VSCode
3. Save (Ctrl+S)
4. See changes instantly in Electron window
5. Use DevTools to inspect state

### Avoid These Mistakes
- ❌ Don't edit files in `dist/` or `dist-electron/` (auto-generated)
- ❌ Don't import from `node_modules` directly
- ❌ Don't forget to save files (changes won't appear)
- ✅ Always use TypeScript types
- ✅ Use Tailwind classes instead of custom CSS
- ✅ Keep components small and focused

### Performance Tips
- Use `React.memo()` for heavy components
- Debounce expensive operations
- Use IndexedDB indexes for queries
- Test with real data (1000+ records)

---

## 📞 What to Do If...

### "npm run dev" fails
1. Check if port 5173 is in use
2. Delete `node_modules` and run `npm install` again
3. Check for errors in terminal

### Electron window doesn't open
1. Check `electron/main.ts` for syntax errors
2. Run `npm run build:electron` first
3. Look for error messages in terminal

### Changes don't appear
1. Check if file is saved (Ctrl+S)
2. Check browser console for errors
3. Try refreshing: View → Reload (Ctrl+R)

### TypeScript errors
1. Run `npm run type-check`
2. Fix reported errors
3. Restart TypeScript server (Ctrl+Shift+P → "Restart TS Server")

---

## 🎓 Learning Path

### Day 1-2: Get Familiar
- Run the app
- Click around
- Read component code
- Understand data flow

### Day 3-5: Simple Changes
- Change colors
- Modify text
- Add console.logs
- Experiment with state

### Week 2: Add Features
- Implement time block creation
- Add drag & drop
- Connect to database

### Week 3+: Advanced
- Optimize performance
- Add keyboard shortcuts
- Implement mini window
- Build production version

---

## ✨ Why This Setup Works

**1. TypeScript catches errors early**
- No "undefined is not a function" at runtime
- IDE shows errors as you type
- Refactoring is safe

**2. Vite makes development fast**
- Changes appear instantly
- No waiting for rebuilds
- Clear error messages

**3. Zustand keeps state simple**
- No Redux boilerplate
- Easy to understand
- Simple to debug

**4. Components are modular**
- Each file does one thing
- Easy to find code
- Safe to modify

**5. Tailwind avoids CSS hell**
- No naming conflicts
- No unused styles
- Easy to make consistent

---

**Ready to start?**

```bash
# Check if installation is done
# Look for "added XXX packages" in terminal

# Then run:
npm run dev
```

**Next steps after first run:**
1. Explore the interface
2. Read `PROJECT_SETUP.md` for detailed docs
3. Start with simple changes (modify text, colors)
4. Then move to implementing new features

**Good luck! The foundation is solid and ready for long-term development.** 🚀
