# Anime Tracker - Quick Start Guide ⚡

Get your anime tracker running in **30 seconds**!

## ⚡ Express Setup (Windows)

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org)
- Choose LTS version
- Run installer, accept defaults

### 2. Open Command Prompt
```
Win + R
Type: cmd
Press Enter
```

### 3. Quick Start
```batch
cd C:\coding\phyton\funn
npm install
npm run dev
```

### 4. Open Browser
Go to: `http://localhost:3000`

## ⚡ Express Setup (Mac)

### 1. Install Node.js
```bash
# Using Homebrew (install first: /bin/bash -c "$(curl -fsSL ...)"
brew install node
```

### 2. Start Development
```bash
cd ~/path/to/anime-tracker
npm install
npm run dev
```

### 3. View App
Open: `http://localhost:3000`

## ⚡ Express Setup (Linux)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start app
cd ~/anime-tracker
npm install
npm run dev
```

## 🎮 First 5 Minutes

### ✅ Step 1: Add Your First Anime
1. Click **"Add Anime"** button (top right)
2. Type anime name (e.g., "Death Note")
3. Add rating, description, status
4. Click **"Add Anime"**

### ✅ Step 2: Try Another
Repeat Step 1 with another anime

### ✅ Step 3: Explore UI
- Click **sun/moon icon** for dark mode
- Click **grid/list icon** to change view
- Drag filters to collapse

### ✅ Step 4: Search & Filter
1. Type in search box
2. Expand "Filters" section
3. Try status or rating filters

### ✅ Step 5: Export Your Data
1. Click **download icon** (📥)
2. File saves as `anime-tracker.xlsx`
3. Open in Excel to view

## 📊 Load Sample Data (Optional)

### Method 1: Manual Import
1. [Download sample file](./sample-anime.xlsx) *(create in Excel)*
2. Click **upload icon** (📤)
3. Select file
4. Done! Data auto-imports

### Method 2: Create Sample Excel File

Create file `sample-anime.xlsx`:

| Anime Name | Rating | Status | Ongoing | Description |
|-|-|-|-|-|
| Attack on Titan | 9.0 | completed | No | Humans vs Giants |
| Demon Slayer | 8.5 | watching | Yes | Action adventure |
| Steins;Gate | 9.0 | completed | No | Time travel |

Then import as shown in Method 1.

## 🆘 Common Issues

### Issue: "npm: command not found"
**Solution:** Node.js not installed
- Download from [nodejs.org](https://nodejs.org)
- Restart command prompt after installation

### Issue: "Port 3000 already in use"
**Solution:** Kill previous process
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti :3000 | xargs kill -9
```

### Issue: "Module not found"
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Data not saving
**Solution:** localStorage issue
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Try different browser
- Check if private/incognito mode

## 📚 Next Steps

After 5 minutes, explore:
- [Full Setup Guide](./SETUP.md) - Detailed instructions
- [README.md](./README.md) - Complete documentation
- [Deploy Guide](./DEPLOY.md) - Go live!

## 🚀 Production Deploy

### Quick Deploy to Vercel (Free!)

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Visit [vercel.com](https://vercel.com)
3. Sign up with GitHub
4. Import repository
5. Click Deploy → Done! 🎉

Your app is live with a public URL!

## 💡 Pro Tips

- **Dark Mode**: Always on for night watching! 🌙
- **Backup Often**: Download Excel file weekly
- **Keyboard**: Use Tab to navigate (accessibility)
- **Mobile**: App works great on phones!
- **Search**: Works while typing (real-time)

## ❓ Questions?

Check these first:
1. [SETUP.md](./SETUP.md) - Setup questions
2. [README.md](./README.md) - Feature questions
3. [DEPLOY.md](./DEPLOY.md) - Deployment questions

## 🎯 What You Can Do Now

✅ Add/Edit/Delete anime  
✅ Search your watchlist  
✅ Filter by status/rating  
✅ Import from Excel  
✅ Export to Excel  
✅ Toggle dark mode  
✅ Switch view modes  

## 🎉 Ready?

```bash
npm run dev
```

Open `http://localhost:3000` and start tracking!

Happy anime watching! 🎌✨
