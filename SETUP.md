# 📋 Setup Guide

## Step 1: Clone or Download the Project

```bash
cd anime-tracker
npm install
```

## Step 2: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 3: First Time Setup

### Option A: Start Fresh
1. Click the **"Add Anime"** button to add your first anime
2. Fill in the details (anime name is required, other fields are optional)
3. Click **"Add Anime"** to save

### Option B: Import from Excel
1. Prepare an Excel file with your anime data (see Excel Format below)
2. Click the **Upload** button (📤 icon) in the header
3. Select your XLSX file
4. Your data will be imported automatically

## 📊 Excel Import Guide

### Column Requirements

Your Excel file should have these columns (the order doesn't matter):

- **Anime Name** (or "Name") - Required
- **Rating** - Optional, number 0-10
- **Status** - Optional, values: watching, completed, planned
- **Ongoing** (or "Is Ongoing", "IsOngoing") - Optional, Yes/No
- **Latest Season** (or "Season") - Optional, e.g., "Winter 2024"
- **Episodes** - Optional, number
- **Episodes Watched** - Optional, number
- **Description** - Optional, text
- **Notes** (or "Notes Details", "Extra Notes") - Optional, text
- **Genres** - Optional, comma-separated
- **Image URL** (or "ImageUrl", "Poster") - Optional, URL string

### Example Excel Data

```csv
Anime Name,Rating,Status,Ongoing,Latest Season,Episodes,Episodes Watched,Description,Notes,Genres,Image URL
Attack on Titan,9.0,completed,No,Final,139,139,Battle between humans and titans,Masterpiece series,Action|Fantasy|Dark,https://image.url/aot.jpg
Demon Slayer,8.5,watching,Yes,Hashira Training,52,52,Sword demon slayer adventures,Amazing animation,Action|Supernatural,https://image.url/ds.jpg
Jujutsu Kaisen,8.8,completed,No,Season 2,50,50,Sorcerers battle curses,Very engaging,Action|Fantasy,https://image.url/jjk.jpg
Steins;Gate,9.0,completed,No,Completed,24,24,Time travel thriller,Highly recommend,Sci-Fi|Drama,https://image.url/sg.jpg
Neon Genesis Evangelion,8.5,completed,No,Completed,26,26,Psychological mecha anime,Confusing ending,Eva|Psychological,https://image.url/nge.jpg
Demon Slayer Gaiden,7.5,completed,No,Ended,2,2,Mini side stories,Enjoyable,Action|Supernatural,https://image.url/dsg.jpg
Hello World,7.0,completed,No,Movie,1,1,Programming romance film,Cute story,Animation|Romance,https://image.url/hw.jpg
Code Geass,8.7,completed,No,Season 2,50,50,Superpowers and strategy,Incredible plot,Action|Mecha,https://image.url/cg.jpg
Fullmetal Alchemist Brotherhood,9.4,completed,No,Series,64,64,Alchemist brothers quest,All-time favorite,Action|Fantasy,https://image.url/fab.jpg
Death Note,9.0,completed,No,Completed,37,37,Psychological thriller,Mind games masterpiece,Psychological|Thriller,https://image.url/dn.jpg
```

### Creating an Excel File

1. **Using Excel/Google Sheets:**
   - Create a new spreadsheet
   - Add column headers in row 1
   - Add your anime data starting from row 2
   - Save as `.xlsx` file (Excel format)

2. **CSV to XLSX Conversion:**
   - Create a CSV file with the data
   - Open with Excel and save as `.xlsx`

### Tips for Quality Data

- ✅ Use complete image URLs (full http/https links)
- ✅ Keep ratings consistent (0-10 scale)
- ✅ Use consistent status values (watching, completed, planned)
- ✅ Separate genres with commas or pipes (Action, Fantasy or Action|Fantasy)
- ✅ Include descriptions for better context
- ✅ Add personal notes for your own reference

## 🎨 Using the Interface

### Adding Anime
1. Click **"Add Anime"** button
2. Fill in the form (name is required)
3. Click **"Add Anime"** to save

### Editing Anime
1. Click **"Edit"** button on an anime card
2. Modify the details
3. Click **"Update Anime"** to save changes

### Deleting Anime
1. Click **"Delete"** button on an anime card
2. Confirm the deletion

### Searching
1. Type in the search box to find anime by name or description
2. Search is real-time and case-insensitive

### Filtering
1. Click the **Filters** section to expand options
2. Use any combination of filters:
   - Status (watching, completed, planned)
   - Ongoing (yes/no)
   - Minimum rating
3. Click **"Clear Filters"** to reset

### Sorting
1. Expand the **Filters** section
2. Click sort buttons:
   - By name
   - By rating
   - By date added
   - By status
3. Click again to reverse sort direction

### Exporting Data
1. Click the **Download** button (📥 icon) in the header
2. Your anime list will be downloaded as `anime-tracker.xlsx`
3. Open with Excel or Google Sheets

### Toggling Dark Mode
1. Click the **Sun/Moon** icon in the header
2. Theme changes immediately and saves your preference

### Switching View Mode
1. Click the **Grid/List** icon in the header
2. Toggle between grid (card) and list (table) view

## 📱 Mobile Usage

The app is fully responsive:
- **Mobile**: Single column layout with full-width cards
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid

All features work the same on mobile!

## 💾 Data Backup & Recovery

### Automatic Backup
- Your data is automatically saved to browser storage
- Each time you make changes, it's saved within 1 second

### Manual Backup
1. Click the **Download** button to export as Excel
2. Save the file to your computer
3. This is your backup copy

### Restore from Backup
1. Click the **Upload** button
2. Select your previously downloaded backup file
3. Your data will be imported

## 🎯 Common Tasks

### Track Your Current Watchlist
1. Set status to "watching"
2. Update episode count as you watch
3. Change to "completed" when finished

### Organize by Genre
1. Expand Filters
2. Sort by name to group similar anime
3. Add genre tags when adding new entries

### Find Highest Rated Anime
1. Expand Filters
2. Check "Minimum Rating" = 8 or higher
3. Sort by rating (descending)

### Track Ongoing Series
1. Expand Filters
2. Click "Ongoing"
3. Use "Latest Season" field to track current season

## ⚙️ Settings & Preferences

All preferences are automatically saved:
- Dark/Light mode selection
- View mode (grid/list)
- All anime data
- Filter preferences

No account needed!

## 🐛 Troubleshooting

### Data Not Saving
- Check if localStorage is enabled in your browser
- Try exporting your data and re-importing
- Clear browser cache and try again

### Import Failed
- Verify Excel file format (.xlsx)
- Check column names match expected format
- Ensure no empty rows between data
- Try with a smaller dataset first

### Images Not Loading
- Verify image URLs are complete (https://...)
- Check if website is still accessible
- Try uploading to a different image hosting service

### Performance Issues
- Clear browser cache
- Close other tabs
- Try in a different browser
- Reduce number of anime entries (1000+ may slow down)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [XLSX Library](https://github.com/SheetJS/sheetjs)

## 🆘 Need Help?

If you encounter issues:
1. Check this guide first
2. Review the README.md
3. Check browser console for errors (F12 → Console)
4. Try clearing browser data and cache

---

**Happy tracking!** 🎌
