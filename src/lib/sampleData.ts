import { AnimeEntry } from '@/types';
import { generateId } from './utils';

export const SAMPLE_ANIME: AnimeEntry[] = [
  {
    id: generateId(),
    name: 'Attack on Titan',
    imageUrl:
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=400&fit=crop',
    rating: 9.0,
    description:
      'In a world where humanity lives within enormous walled cities to protect themselves from gigantic man-eating humanoids called Titans, a young man decides to dedicate his life to exterminating them.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Final (2023)',
    dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes:
      'Masterpiece anime with incredible storytelling and character development.',
    genres: ['Action', 'Dark Fantasy', 'Supernatural', 'Thriller'],
    episodes: 139,
    episodesWatched: 139,
  },
  {
    id: generateId(),
    name: 'Demon Slayer',
    imageUrl:
      'https://images.unsplash.com/photo-1596727147779-a93d55bcd5e6?w=300&h=400&fit=crop',
    rating: 8.5,
    description:
      'After his family is slaughtered by demons, Tanjiro embarks on a journey to save his only surviving sister, who has been transformed into a demon herself.',
    status: 'watching',
    isOngoing: true,
    latestSeason: 'Hashira Training (2024)',
    dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Phenomenal animation quality. Absolutely worth watching.',
    genres: ['Action', 'Supernatural', 'Adventure'],
    episodes: 52,
    episodesWatched: 52,
  },
  {
    id: generateId(),
    name: 'Jujutsu Kaisen',
    imageUrl:
      'https://images.unsplash.com/photo-1578927344797-47c3e5209b38?w=300&h=400&fit=crop',
    rating: 8.8,
    description:
      'A high schooler with latent cursed power discovers his calling after swallowing the finger of a curse.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Season 2 (2023)',
    dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Engaging plot with great character arcs.',
    genres: ['Action', 'Dark Fantasy', 'Supernatural'],
    episodes: 50,
    episodesWatched: 50,
  },
  {
    id: generateId(),
    name: 'Steins;Gate',
    imageUrl:
      'https://images.unsplash.com/photo-1607604174642-c4c63e9dc1ad?w=300&h=400&fit=crop',
    rating: 9.0,
    description:
      'A group of friends discover they can send messages to the past, leading to complex time travel consequences.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Complete',
    dateAdded: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Mind-bending thriller. Highly recommended!',
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    episodes: 24,
    episodesWatched: 24,
  },
  {
    id: generateId(),
    name: 'Neon Genesis Evangelion',
    imageUrl:
      'https://images.unsplash.com/photo-1540224477063-52e59600769b?w=300&h=400&fit=crop',
    rating: 8.5,
    description:
      'Teenagers are recruited to pilot giant robots called Evangelions to protect Earth from mysterious creatures called Angels.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Complete',
    dateAdded: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    notes:
      'Classic psychological mecha. Confusing ending but definitely worth watching.',
    genres: ['Mecha', 'Psychological', 'Drama', 'Sci-Fi'],
    episodes: 26,
    episodesWatched: 26,
  },
  {
    id: generateId(),
    name: 'Fullmetal Alchemist: Brotherhood',
    imageUrl:
      'https://images.unsplash.com/photo-1577338369549-b8ebebf80e25?w=300&h=400&fit=crop',
    rating: 9.4,
    description:
      'Two brothers seek the philosopher\'s stone to restore their bodies after a failed alchemical experiment.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Complete',
    dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'All-time favorite! Perfect story, characters, and ending.',
    genres: ['Action', 'Adventure', 'Fantasy', 'Drama'],
    episodes: 64,
    episodesWatched: 64,
  },
  {
    id: generateId(),
    name: 'Death Note',
    imageUrl:
      'https://images.unsplash.com/photo-1578927329399-8f0a1a01f57f?w=300&h=400&fit=crop',
    rating: 9.0,
    description:
      'A high school student discovers a mysterious notebook that can kill anyone whose name is written in it.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Complete',
    dateAdded: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Masterpiece of psychological thriller. Mind games galore!',
    genres: ['Psychological', 'Thriller', 'Supernatural'],
    episodes: 37,
    episodesWatched: 37,
  },
  {
    id: generateId(),
    name: 'Code Geass',
    imageUrl:
      'https://images.unsplash.com/photo-1577314697633-0a97c4a6c2db?w=300&h=400&fit=crop',
    rating: 8.7,
    description:
      'A noble gets the power to command anyone to obey him. He uses this power to lead a rebellion against an oppressive empire.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Complete',
    dateAdded: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Incredible plot with awesome mecha action.',
    genres: ['Action', 'Mecha', 'School', 'Sci-Fi'],
    episodes: 50,
    episodesWatched: 50,
  },
  {
    id: generateId(),
    name: 'Your Name',
    imageUrl:
      'https://images.unsplash.com/photo-1616690959375-2baa2d6bbb11?w=300&h=400&fit=crop',
    rating: 8.4,
    description:
      'Two strangers mysteriously swap bodies and must work together to prevent a catastrophic comet.',
    status: 'completed',
    isOngoing: false,
    latestSeason: 'Movie',
    dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Beautiful romance movie with amazing visuals.',
    genres: ['Romance', 'Fantasy', 'School'],
    episodes: 1,
    episodesWatched: 1,
  },
  {
    id: generateId(),
    name: 'One Piece',
    imageUrl:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=400&fit=crop',
    rating: 8.8,
    description:
      'A young pirate sails the seas with his crew searching for the legendary treasure "One Piece".',
    status: 'watching',
    isOngoing: true,
    latestSeason: 'Ongoing (1100+ episodes)',
    dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Epic adventure series. Long but absolutely worth it!',
    genres: ['Action', 'Adventure', 'Comedy', 'Shounen'],
    episodes: 1100,
    episodesWatched: 500,
  },
];
