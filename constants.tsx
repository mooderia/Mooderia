
import { ZodiacInfo, Badge, Mood } from './types';

export const ZODIACS: ZodiacInfo[] = [
  { name: 'Aries', dates: 'Mar 21 - Apr 19', symbol: '♈', description: 'The Pioneer', history: 'Aries represents the ram whose golden fleece was sought by Jason and the Argonauts.' },
  { name: 'Taurus', dates: 'Apr 20 - May 20', symbol: '♉', description: 'The Builder', history: 'In Greek mythology, Zeus transformed into a bull to win the heart of Europa.' },
  { name: 'Gemini', dates: 'May 21 - Jun 20', symbol: '♊', description: 'The Messenger', history: 'Represented by Castor and Pollux, twins who shared immortality.' },
  { name: 'Cancer', dates: 'Jun 21 - Jul 22', symbol: '♋', description: 'The Guardian', history: 'Hercules encountered the giant crab Karkinos during his 12 labors.' },
  { name: 'Leo', dates: 'Jul 23 - Aug 22', symbol: '♌', description: 'The Leader', history: 'Associated with the Nemean Lion, a beast slain by Hercules.' },
  { name: 'Virgo', dates: 'Aug 23 - Sep 22', symbol: '♍', description: 'The Critic', history: 'Often linked to Astraea, the goddess of innocence and purity.' },
  { name: 'Libra', dates: 'Sep 23 - Oct 22', symbol: '♎', description: 'The Diplomat', history: 'The only non-living symbol, representing the scales of Justice.' },
  { name: 'Scorpio', dates: 'Oct 23 - Nov 21', symbol: '♏', description: 'The Strategist', history: 'Sent by Gaia to defeat Orion after he threatened all animals.' },
  { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', symbol: '♐', description: 'The Explorer', history: 'Symbolizes Chiron, the wise centaur who taught Greek heroes.' },
  { name: 'Capricorn', dates: 'Dec 22 - Jan 19', symbol: '♑', description: 'The Achiever', history: 'Associated with Pan, the god who grew fish scales to escape Typhon.' },
  { name: 'Aquarius', dates: 'Jan 20 - Feb 18', symbol: '♒', description: 'The Reformer', history: 'Ganymede, the cup-bearer to the gods who poured water for life.' },
  { name: 'Pisces', dates: 'Feb 19 - Mar 20', symbol: '♓', description: 'The Dreamer', history: 'Aphrodite and Eros turned into fish to hide from a sea monster.' },
];

export const JOB_TITLES = [
  'Citizen', 'Student', 'Teacher', 'Artist', 'Engineer', 'Doctor', 'Chef', 'Athlete', 'Musician', 'Explorer'
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

export const DAILY_WISDOM = [
  "True happiness is found in the journey, not the destination.",
  "Your mood pet mirrors your inner light. Shine bright!",
  "Consistency is the architecture of success.",
  "Stars don't shine without a little darkness.",
  "Every citizen of Mooderia has a unique cosmic signature.",
  "Breathe. The metropolis moves fast, but you set the pace.",
  "A high streak is a testament to a resilient spirit.",
  "Kindness is the currency of the heart.",
  "Today's weather is 100% chance of potential.",
  "Growth is often silent. Keep moving.",
  "Your vibes attract your tribe in this metropolis.",
  "Don't compare your Chapter 1 to someone else's Chapter 20.",
  "Rest is not laziness; it's a necessary recharge.",
  "The quiz of life has no wrong answers, only lessons.",
  "Dream big, citizen. The sky isn't the limit, it's just the view.",
  "Emotional harmony starts with self-acceptance.",
  "Fuel your pet, fuel your soul.",
  "Communication is the bridge between two hearts.",
  "The stars are aligned for your success today.",
  "Persistence over perfection, always.",
  "The mood you choose today shapes your tomorrow.",
  "Wisdom begins in wonder.",
  "Stay curious, stay vibrant.",
  "Your energy is your most valuable asset.",
  "The city is yours to explore. Start within.",
  "Peace is the highest form of achievement.",
  "Be the reason someone smiles today in Mooderia.",
  "Small steps lead to big changes.",
  "Embrace the chaos, find your center.",
  "You are the author of your own story.",
  "Fortune favors the bold and the kind."
];

export const getTier = (likes: number) => {
  if (likes >= 10000) return { name: 'Legend', color: '#ef4444' };
  if (likes >= 8000) return { name: 'Myth', color: '#f97316' };
  if (likes >= 6000) return { name: 'Influencer', color: '#eab308' };
  if (likes >= 4000) return { name: 'Famous', color: '#22c55e' };
  if (likes >= 2000) return { name: 'Sociable', color: '#3b82f6' };
  if (likes >= 1000) return { name: 'Friendly', color: '#6366f1' };
  return { name: 'New', color: '#8b5cf6' };
};

export const STREAK_BADGES: Badge[] = [
  { id: '1', name: 'Starter', icon: '🌱', description: '3 Day Streak', threshold: 3 },
  { id: '2', name: 'Dedicated', icon: '🔥', description: '7 Day Streak', threshold: 7 },
  { id: '3', name: 'Mood Master', icon: '👑', description: '15 Day Streak', threshold: 15 },
  { id: '4', name: 'Mooderia Elite', icon: '💎', description: '30 Day Streak', threshold: 30 },
];

export const getExpNeeded = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

export const getZodiacFromDate = (month: number, day: number): string => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return 'Aries';
};

export const QUIZ_QUESTIONS = [
  { q: "What is the primary currency in Mooderia?", options: ["Gold", "Vibe Points", "Mood Coins", "Mooderia Bucks"], a: 2 },
  { q: "Which planet is associated with luck and expansion?", options: ["Mars", "Saturn", "Jupiter", "Neptune"], a: 2 },
  { q: "How many zodiac signs belong to the Fire element?", options: ["2", "3", "4", "5"], a: 1 },
  { q: "What is the symbol for Sagittarius?", options: ["The Ram", "The Archer", "The Goat", "The Lion"], a: 1 },
  { q: "Which mood color is typically associated with Sadness in the check-in?", options: ["Red", "Yellow", "Blue", "Purple"], a: 2 },
  { q: "Who is the city's psychiatrist?", options: ["Sir Clark", "Dr. Pinel", "Dr. Vibe", "Citizen X"], a: 1 },
  { q: "What is the maximum value for a pet's Hunger bar?", options: ["50", "100", "150", "200"], a: 1 },
  { q: "Which zodiac sign starts on March 21st?", options: ["Pisces", "Taurus", "Aries", "Gemini"], a: 2 },
  { q: "What happens to the pet stats when they sleep?", options: ["They drain faster", "They stay frozen", "The Rest bar fills", "They reset to zero"], a: 2 },
  { q: "In the 'Love Matcher', which sign is 'The Builder'?", options: ["Capricorn", "Taurus", "Virgo", "Aries"], a: 1 },
];
