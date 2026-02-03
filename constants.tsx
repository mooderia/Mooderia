
import { Mood } from './types';

export const JOB_TITLES = [
  'Citizen', 'Student', 'Teacher', 'Artist', 'Engineer', 'Doctor', 'Chef', 'Athlete', 'Musician', 'Explorer', 'Parent'
];

export const COUNTRIES = [
  { name: 'Philippines', code: 'ph' },
  { name: 'United States', code: 'us' },
  { name: 'Japan', code: 'jp' },
  { name: 'South Korea', code: 'kr' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
  { name: 'Germany', code: 'de' },
  { name: 'France', code: 'fr' },
  { name: 'Brazil', code: 'br' },
  { name: 'India', code: 'in' },
  { name: 'China', code: 'cn' },
  { name: 'Russia', code: 'ru' },
  { name: 'Mexico', code: 'mx' },
  { name: 'Italy', code: 'it' },
  { name: 'Spain', code: 'es' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Thailand', code: 'th' },
  { name: 'Vietnam', code: 'vn' },
  { name: 'Indonesia', code: 'id' },
  { name: 'Malaysia', code: 'my' },
  { name: 'Other', code: 'un' } // un for united nations / generic
];

export const MOOD_SCORES: Record<string, number> = {
  'Wonderful': 100,
  'Excited': 85,
  'Happy': 70,
  'Normal': 50,
  'Tired': 35,
  'Angry': 15,
  'Flaming': 0
};

export const WISDOM_OF_MOODERIA = [
  "Your light shines brighter than the metropolis neon.",
  "Every small step in Mooderia leads to a giant leap of happiness.",
  "Resilience is the heartbeat of this vibrant city.",
  "Synchronize your heart with the rhythm of growth.",
  "You are the architect of your own emotional skyline.",
  "Kindness is the currency that never devalues.",
  "Breathe in the potential, exhale the digital smog.",
  "Your mood pet mirrors the beauty of your inner world.",
  "Even the tallest skyscraper started as a simple foundation.",
  "Today is a blank canvas in the metropolis of life."
];

export const DAILY_COLORS = [
  { name: 'Radiant Gold', hex: '#ffa602', meaning: 'Optimism and Wealth' },
  { name: 'Metropolis Blue', hex: '#1368ce', meaning: 'Calmness and Focus' },
  { name: 'Vibrant Crimson', hex: '#e21b3c', meaning: 'Passion and Energy' },
  { name: 'Nature Green', hex: '#26890c', meaning: 'Growth and Balance' },
  { name: 'Cosmic Purple', hex: '#46178f', meaning: 'Wisdom and Mystery' }
];

export const getExpNeeded = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

export const ZODIACS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', history: 'The fearless ram of the metropolis sky.', description: 'Vibrant energy and pioneering spirit.' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', history: 'The steady foundation of the industrial district.', description: 'Practical, reliable, and grounded.' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', history: 'The twin frequencies of communication.', description: 'Adaptable, curious, and quick-witted.' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', history: 'The protective shell of the residential zones.', description: 'Intuitive, sentimental, and nurturing.' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', history: 'The golden spotlight of the entertainment district.', description: 'Confident, charismatic, and passionate.' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', history: 'The meticulous architect of the grid.', description: 'Analytical, hardworking, and kind.' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', history: 'The balanced scales of the legal district.', description: 'Diplomatic, artistic, and social.' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', history: 'The intense mystery of the underground levels.', description: 'Brave, resourceful, and focused.' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', history: 'The archer reaching for the highest skyscrapers.', description: 'Generous, idealistic, and adventurous.' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', history: 'The persistent climber of the corporate towers.', description: 'Disciplined, responsible, and ambitious.' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', history: 'The visionary technologist of the neon future.', description: 'Original, independent, and humanitarian.' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', history: 'The dream-weaving artist of the harbor district.', description: 'Compassionate, artistic, and intuitive.' }
];

export const getZodiacFromDate = (m: number, d: number) => {
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Capricorn';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius';
  return 'Pisces';
};

// --- NEW CONSTANTS FOR REWORK ---

export const PET_BACKGROUNDS = [
  { id: 'default', name: 'White Void', price: 0, style: 'bg-white' },
  { id: 'park', name: 'Central Park', price: 5, style: 'bg-gradient-to-b from-blue-300 to-green-300' },
  { id: 'neon', name: 'Neon District', price: 10, style: 'bg-gradient-to-br from-purple-900 via-blue-900 to-black' },
  { id: 'sunset', name: 'Skyline Sunset', price: 15, style: 'bg-gradient-to-b from-orange-400 to-purple-600' },
  { id: 'cloud', name: 'Cloud Haven', price: 20, style: 'bg-gradient-to-t from-blue-100 to-white' },
  { id: 'space', name: 'Cosmic Orbit', price: 30, style: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-black' },
  { id: 'beach', name: 'Data Beach', price: 25, style: 'bg-gradient-to-b from-cyan-300 to-yellow-200' },
  { id: 'gold', name: 'Treasury', price: 50, style: 'bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600' }
];

export const TRANSLATIONS = {
  English: {
    welcome: "Welcome, Citizen!",
    home: "Home",
    mood: "Mood",
    cityHall: "City Hall",
    mails: "Mails",
    profile: "Profile",
    settings: "Settings",
    statistics: "Statistics",
    diary: "Diary",
    moodPet: "Mood Pet",
    scan: "Scan",
    teller: "Teller",
    express: "Express",
    schedule: "Schedule",
    routine: "Routine",
    wisdom: "Wisdom",
    choosePet: "Choose your Guardian",
    shop: "Shop",
    care: "Interact",
    sendMail: "Deliver Signal",
    newTask: "Slate New Task",
    newRoutine: "Slate Routine",
    startTask: "Start Task",
    complete: "Complete",
    locked: "Locked",
    buy: "Buy",
    equipped: "Equipped",
    coins: "Mood Coins",
    level: "Sync Rank",
    exp: "EXP",
    streak: "Day Streak",
    noEntries: "No entries found.",
    taskAlert: "Routine Alert",
    taskTime: "It's time for:",
    rewardTitle: "Reward Gained!",
    rewardMsg: "You gained 1 Coin and EXP!",
  },
  Filipino: {
    welcome: "Mabuhay, Mamamayan!",
    home: "Tahanan",
    mood: "Damdamin",
    cityHall: "Munisipyo",
    mails: "Sulat",
    profile: "Propayl",
    settings: "Settings",
    statistics: "Estadistika",
    diary: "Talaarawan",
    moodPet: "Alaga",
    scan: "Pagsusuri",
    teller: "Manghuhula",
    express: "Express",
    schedule: "Iskedyul",
    routine: "Rutina",
    wisdom: "Karunungan",
    choosePet: "Piliin ang Tagapag-alaga",
    shop: "Tindahan",
    care: "Makipaglaro",
    sendMail: "Ipadala",
    newTask: "Bagong Gawain",
    newRoutine: "Bagong Rutina",
    startTask: "Simulan",
    complete: "Tapusin",
    locked: "Naka-lock",
    buy: "Bilhin",
    equipped: "Gamit",
    coins: "Barya",
    level: "Antas",
    exp: "EXP",
    streak: "Sunod-sunod",
    noEntries: "Walang nakita.",
    taskAlert: "Paalala sa Rutina",
    taskTime: "Oras na para sa:",
    rewardTitle: "Gantimpala!",
    rewardMsg: "Nakatanggap ka ng 1 Barya at EXP!",
  }
};

export const t = (key: keyof typeof TRANSLATIONS['English'], lang: 'English' | 'Filipino') => {
  return TRANSLATIONS[lang][key] || TRANSLATIONS['English'][key];
};