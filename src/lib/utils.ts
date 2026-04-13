import { AnimeEntry } from '@/types';
import * as XLSX from 'xlsx';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Parse XLSX file and extract anime data
export const parseXlsxFile = async (file: File): Promise<AnimeEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const anime = rows
          .filter((row) => row['Anime Name'] || row['Name'])
          .map((row) => ({
            id: generateId(),
            name: row['Anime Name'] || row['Name'] || 'Unknown',
            imageUrl: row['Image URL'] || row['ImageUrl'] || row['Poster'] || '',
            rating: parseFloat(row['Rating']) || 0,
            description: row['Description'] || row['Notes'] || '',
            status: (row['Status']?.toLowerCase() || 'planned') as AnimeEntry['status'],
            isOngoing: row['Ongoing']?.toLowerCase() === 'yes' || 
                      row['Is Ongoing']?.toLowerCase() === 'yes' ||
                      row['IsOngoing']?.toLowerCase() === 'yes' ||
                      false,
            latestSeason: row['Latest Season'] || row['Season'] || undefined,
            dateAdded: new Date().toISOString(),
            notes: row['Notes Details'] || row['Extra Notes'] || undefined,
            genres: row['Genres'] ? String(row['Genres']).split(',').map(g => g.trim()) : [],
            episodes: parseInt(row['Episodes']) || undefined,
            episodesWatched: parseInt(row['Episodes Watched']) || undefined,
          }));
        
        resolve(anime);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Export data as XLSX
export const exportAsXlsx = (anime: AnimeEntry[], filename: string = 'anime-tracker.xlsx') => {
  const data = anime.map((item) => ({
    'Anime Name': item.name,
    'Rating': item.rating,
    'Status': item.status,
    'Ongoing': item.isOngoing ? 'Yes' : 'No',
    'Latest Season': item.latestSeason || '',
    'Episodes': item.episodes || '',
    'Episodes Watched': item.episodesWatched || '',
    'Description': item.description,
    'Notes': item.notes || '',
    'Genres': item.genres?.join(', ') || '',
    'Image URL': item.imageUrl,
    'Date Added': formatDate(item.dateAdded),
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Anime');
  XLSX.writeFile(workbook, filename);
};

// Fetch anime image (fallback)
export const getDefaultAnimeImage = (name: string): string => {
  // This returns a placeholder image based on anime name
  // In a real app, you'd integrate with an API like AniList or MyAnimeList
  return `https://via.placeholder.com/300x400?text=${encodeURIComponent(name)}`;
};

// Validate anime entry
export const validateAnimeEntry = (anime: Partial<AnimeEntry>): string[] => {
  const errors: string[] = [];
  
  if (!anime.name || anime.name.trim().length === 0) {
    errors.push('Anime name is required');
  }
  
  if (anime.rating !== undefined && (anime.rating < 0 || anime.rating > 10)) {
    errors.push('Rating must be between 0 and 10');
  }
  
  if (anime.status && !['watching', 'completed', 'planned'].includes(anime.status)) {
    errors.push('Invalid status');
  }
  
  return errors;
};

// Clsx utility (simple version)
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
