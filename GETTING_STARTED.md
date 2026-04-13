# 🎌 Anime Tracker - Complete Getting Started Guide

Welcome to Anime Tracker! This guide walks you through every step from zero to tracking your anime watchlist.

## 📋 Table of Contents
1. [First Time? Start Here](#first-time-start-here)
2. [Installation Guide](#installation-guide)
3. [Your First Anime](#your-first-anime)
4. [Excel Import Tutorial](#excel-import-tutorial)
5. [Using All Features](#using-all-features)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)

---

## 🆕 First Time? Start Here

### What is Anime Tracker?
Anime Tracker is a beautiful web app to track all the anime you watch. Think of it as a personal IMDb just for anime!

### What Can You Do?
- 📝 Add anime you're watching, completed, or planning
- ⭐ Rate them on a 0-10 scale
- 🏷️ Organize with genres and notes
- 📊 Filter and search your collection
- 📤 Import from Excel files
- 📥 Download your list as Excel
- 🌙 Dark mode for late night watching

### Do I Need an Account?
**No!** Everything is stored locally on your computer. No account, no login, no server.

### Is It Free?
**Yes! 100% free and open source.**

---

## 💻 Installation Guide

### What You Need
1. **Node.js** - A JavaScript runtime ([Download here](https://nodejs.org))
2. **Command Line** - Terminal/Command Prompt
3. **Text Editor** - VS Code recommended ([Download here](https://code.visualstudio.com))
4. **Browser** - Chrome, Firefox, Safari, or Edge

### Step-by-Step Installation

#### For Windows Users

**Step 1: Install Node.js**
1. Visit [nodejs.org](https://nodejs.org)
2. Click "Download LTS" (the big green button)
3. Run the installer
4. Click "Next" through all screens, accept defaults
5. Click "Install"
6. Close the installer

**Step 2: Open Command Prompt**
1. Press `Win + R`
2. Type `cmd`
3. Press `Enter`

**Step 3: Navigate to Anime Tracker**
```bash
cd C:\coding\phyton\funn
```

**Step 4: Install & Run**
```bash
npm install

npm run dev
```

**Step 5: Open Browser**
- Open your browser (Chrome, Firefox, etc.)
- Go to: `http://localhost:3000`
- You should see the Anime Tracker app! 🎉

#### For Mac Users

**Step 1: Install Node.js**
```bash
# If you have Homebrew installed:
brew install node

# If not, download from nodejs.org
```

**Step 2: Open Terminal**
- Press `Cmd + Space`
- Type `terminal`
- Press `Enter`

**Step 3: Navigate & Install**
```bash
cd ~/path/to/anime-tracker
npm install
npm run dev
```

**Step 4: Open Browser**
Go to: `http://localhost:3000`

#### For Linux Users

```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Navigate and install
cd ~/anime-tracker
npm install
npm run dev
```

---

## 📝 Your First Anime

### Adding Your First Entry

1. **Click "Add Anime"** (top right button)
2. **Fill in the details:**
   - **Anime Name** *(required)*: Type the anime title
   - **Rating**: 0-10 scale (use 0 if unsure)
   - **Status**: Pick one:
     - 👀 "Watching" - Currently watching
     - ✅ "Completed" - Finished watching
     - 📋 "Planned" - Want to watch later
   - **Description**: What's it about?
   - **Image URL**: Link to poster image
   - **Notes**: Personal thoughts

3. **Click "Add Anime"** to save
4. Your anime appears in the grid!

### Quick Tips
- **Name is required**, everything else optional
- Leave **Image URL blank** if you don't have one
- Use **Notes** for things like "Love the soundtrack"
- **Status** helps organize your list

---

## 📊 Excel Import Tutorial

### Why Import?
You might already have an anime list in Excel or Google Sheets. Import it instead of typing manually!

### What Format is Needed?

Your Excel file should look like this:

| Anime Name | Rating | Status | Episodes | Description |
|---|---|---|---|---|
| Attack on Titan | 9 | completed | 139 | Epic battles |
| Demon Slayer | 8.5 | watching | 52 | Action packed |
| My Anime | 7 | planned | ? | Want to watch |

### Supported Column Names

The app is flexible! Use any of these:
- **Name**: "Anime Name", "Name", "Title"
- **Rating**: "Rating", "Score"
- **Status**: "Status", "State"
- **Ongoing**: "Ongoing", "Is Ongoing", "IsOngoing"
- **Episodes**: "Episodes", "Total Episodes"
- **Watched**: "Episodes Watched", "Watched Episodes"
- **Description**: "Description", "Synopsis", "About"
- **Image**: "Image URL", "ImageUrl", "Poster"
- **Genres**: "Genres", "Type"
- **Notes**: "Notes", "Comments", "Remarks"

### Step-by-Step Import

**1. Prepare Your Excel File**
- Open Excel or Google Sheets
- Create columns for anime data
- Add your anime entries
- Save as `.xlsx` file (Excel format)
- Close the file

**2. Import into Anime Tracker**
- Click **📤 Upload** button (top of app)
- Select your Excel file
- Wait for confirmation message
- Your anime appears in the app! 🎉

**3. Verify Your Data**
- Scroll through to confirm everything imported
- Edit any entries if needed
- Data is automatically saved

### Example Excel File

Create this step-by-step:

1. Open Excel
2. In Row 1, type headers:
   - A1: `Anime Name`
   - B1: `Rating`
   - C1: `Status`
   - D1: `Description`

3. In Row 2+, add your anime:
   - Row 2: Attack on Titan, 9, completed, Epic series
   - Row 3: Demon Slayer, 8.5, watching, Action anime
   - Row 4: Steins Gate, 9, completed, Time travel thriller

4. Save as `.xlsx` (File → Save As → .xlsx)

5. Import into Anime Tracker!

---

## 🎮 Using All Features

### Search

**Find anime quickly:**
1. Use the search box at the top
2. Type anime name or part of description
3. Results update instantly
4. Clear search to see all

**Example searches:**
- "Attack" → Find Attack on Titan
- "Action" → Find action anime
- "2024" → Find recent anime

### Filters

**Filter your list:**
1. Click **Filters** section
2. Choose filter options:
   - **Status**: Watching/Completed/Planned
   - **Ongoing**: Yes/No
   - **Rating**: Minimum rating (5+, 7+, etc.)
   - **Sort**: By name, rating, date, status

3. Click **Clear Filters** to reset

### View Modes

**Switch views:**
- **Grid View** (cards): Visual, colorful
- **List View** (table): Compact, organized
- Click grid/list icon to toggle

### Dark Mode

**Enable dark mode:**
1. Click **Sun/Moon icon** (top right)
2. Interface changes to dark theme
3. Your preference is saved
4. Perfect for night viewing! 🌙

### Edit Anime

**Change anime details:**
1. Click **Edit** button on anime card
2. Modify any field
3. Click **Update Anime**
4. Changes are saved

### Delete Anime

**Remove from list:**
1. Click **Delete** button
2. Confirm deletion
3. Anime is removed

### Export to Excel

**Backup or share your list:**
1. Click **📥 Download** button
2. File downloads as `anime-tracker.xlsx`
3. Open in Excel to view or backup
4. Perfect for sharing with friends!

### Load Sample Data

**Try with demo data:**
1. Click **⚡ Demo** button (if visible)
2. 10 sample anime load
3. Perfect for testing features!

---

## 💡 Tips & Tricks

### Organization Tips
- ✅ Use **Genres** as tags for organization
- ✅ Put **source** in notes (manga, light novel, etc.)
- ✅ Track **studio** name in notes
- ✅ Use **status** to separate current vs completed
- ✅ Rate **fairly** so sorting by rating helps

### Rating System
- ⭐⭐⭐⭐⭐ 10: Masterpiece
- ⭐⭐⭐⭐ 8-9: Excellent
- ⭐⭐⭐ 6-7: Good
- ⭐⭐ 4-5: Okay
- ⭐ 1-3: Poor

### Backup Strategy
- **Weekly**: Click **Download** to backup
- **Save copies**: Store in Google Drive/Dropbox
- **Before importing**: Always backup first
- **Version control**: Keep dated backups

### Efficiency Hacks
- **Keyboard navigation**: Use Tab to move between fields
- **Enter key**: Press Enter to submit forms
- **Quick search**: Search before filtering
- **Mobile friendly**: Works great on phones!

### Mobile Usage
- **One-handed**: Buttons positioned for thumbs
- **Responsive**: Auto-adjusts to screen size
- **Fast**: Optimized for mobile devices
- **Offline**: Works without internet!

---

## 🐛 Troubleshooting

### "npm: command not found"
**Problem**: Node.js not installed  
**Solution**:
1. Download Node.js from [nodejs.org](https://nodejs.org)
2. Install it
3. Restart command prompt/terminal
4. Try again

### "Port 3000 already in use"
**Problem**: Another app is using the port  
**Solution** (Windows):
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

Solution (Mac/Linux):
```bash
lsof -ti :3000 | xargs kill -9
npm run dev
```

### "Module not found" error
**Problem**: Dependencies missing  
**Solution**:
```bash
rm -rf node_modules
npm install
npm run dev
```

### Data not saving
**Problem**: LocalStorage issue  
**Solution**:
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- Try different browser
- Check incognito/private mode is off
- Clear browser cookies/cache

### Import failed
**Problem**: Excel file not recognized  
**Solution**:
1. Ensure file is `.xlsx` (not `.xls` or `.csv`)
2. Check column names match expected format
3. Remove empty rows between data
4. Try with fewer entries first
5. Re-save file as `.xlsx`

### Images not loading
**Problem**: Image URLs broken  
**Solution**:
- Verify URL starts with `https://`
- Check if website is still online
- Replace with new image hosting service
- Leave blank and update later

### App running slowly
**Problem**: Too many entries or browser issue  
**Solution**:
- Clear browser cache
- Close other tabs
- Try different browser
- Refresh page (F5)

### Changes not persisting across sessions
**Problem**: LocalStorage being cleared  
**Solution**:
1. Check browser settings haven't cleared storage
2. Export data weekly as backup
3. Don't use "Clear Browsing Data" on exit
4. Disable browser extensions that clear cache

---

## 📚 Additional Help

- **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md)
- **Setup Guide**: See [SETUP.md](./SETUP.md)
- **Deploy**: See [DEPLOY.md](./DEPLOY.md)
- **Features**: See [FEATURES.md](./FEATURES.md)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🎯 Next Steps

1. **✅ Install** the app (follow Installation Guide)
2. **✅ Add** your first anime
3. **✅ Explore** filters and search
4. **✅ Import** Excel file (if you have one)
5. **✅ Export** backup as Excel
6. **✅ Share** with friends
7. **✅ Deploy** to web (optional, see DEPLOY.md)

---

## 🎉 Final Tips

### Start Small
- Add 5-10 anime first
- Get comfortable with interface
- Then import larger list

### Explore Features
- Try dark mode
- Switch view modes
- Test filters
- Export and view in Excel

### Keyboard Shortcuts (Coming Soon)
- Will add keyboard shortcuts in future versions
- Suggestions welcome!

### Share Your Experience
- Tell friends about it
- Share your watchlist
- Suggest improvements

---

## ❓ Still Have Questions?

- Check the [README.md](./README.md)
- Review specific feature in [QUICKSTART.md](./QUICKSTART.md)
- Look at [SETUP.md](./SETUP.md) for advanced topics
- Check [FEATURES.md](./FEATURES.md) for roadmap

---

## 🚀 You're Ready!

```bash
npm run dev
```

Open `http://localhost:3000` and start tracking your anime!

**Happy watching!** 🎌✨

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Created with ❤️ for anime fans**
