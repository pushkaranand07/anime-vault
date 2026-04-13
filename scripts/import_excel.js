const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const excelPath = 'C:\\coding\\all anime history.xlsx';
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

function importData() {
  console.log(`Reading Excel file from: ${excelPath}`);
  
  if (!fs.existsSync(excelPath)) {
    console.error(`Excel file not found at ${excelPath}`);
    return;
  }

  const wb = xlsx.readFile(excelPath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  
  // The structure seems to be:
  // Row 1: 'ANIME LIST', '__EMPTY', '__EMPTY_1', '__EMPTY_2', '__EMPTY_3'
  // But wait, the first row is actually data keys like "Anime Name ", "Anime photo ", etc.
  // We can just get JSON array, and skip the first item (which is headers).
  const rawData = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Found ${rawData.length} rows in the sheet.`);

  // If first row is headers (as determined earlier):
  // {
  //   'ANIME LIST ': 'Anime Name ',
  //   __EMPTY: 'Anime photo ',
  //   __EMPTY_1: 'Anime rating ',
  //   __EMPTY_2: 'Anime story',
  //   __EMPTY_3: 'Anime season'
  // }
  
  // Actually, some rows might not have all __EMPTY keys if they are blank.
  const animeEntries = [];
  
  // Iterate from index 1 (skipping the fake header row)
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    const name = row['ANIME LIST '];
    if (!name) continue; // Skip if no name
    
    const imageUrl = row['__EMPTY'] || '';
    const ratingStr = row['__EMPTY_1'];
    const story = row['__EMPTY_2'] || '';
    const season = row['__EMPTY_3'] || '';
    
    // Parse rating
    let rating = 0;
    if (ratingStr) {
       const parsed = parseFloat(ratingStr);
       if (!isNaN(parsed)) rating = parsed;
    }

    // Determine status from season/notes
    let status = 'completed';
    let isOngoing = false;
    const seasonLower = season.toLowerCase();
    
    if (seasonLower.includes('ongoing') || seasonLower.includes('waiting')) {
      isOngoing = true;
      status = 'watching';
    } else if (seasonLower.includes('plan')) {
      status = 'planned';
    }
    
    const entry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      imageUrl: imageUrl.trim() !== 'Anime photo' ? imageUrl.trim() : '',
      rating: rating,
      description: story.trim() !== 'Anime story' ? story.trim() : '',
      status: status,
      isOngoing: isOngoing,
      latestSeason: season.trim() !== 'Anime season' ? season.trim() : '',
      dateAdded: new Date().toISOString(),
      notes: ''
    };
    
    animeEntries.push(entry);
  }
  
  console.log(`Successfully mapped ${animeEntries.length} anime entries.`);
  
  // Write to db.json
  const dbConfig = { anime: animeEntries };
  
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(dbConfig, null, 2), 'utf8');
  
  console.log(`Data successfully written to ${dbPath}`);
}

importData();
