export const wordLists = {
  letters: [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z',
  ] as const,

  words: [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'guitar', 'horizon',
    'island', 'jungle', 'knight', 'lighthouse', 'mountain', 'nature', 'ocean',
    'palace', 'quantum', 'river', 'sunset', 'temple', 'universe', 'valley',
    'whisper', 'xylophone', 'yellow', 'zenith', 'admiral', 'beacon', 'castle',
    'diamond', 'element', 'fortress', 'galaxy', 'harbor', 'imagine', 'jewel',
    'kingdom', 'legend', 'mansion', 'nebula', 'onyx', 'phantom', 'quartz',
    'rainbow', 'sanctuary', 'tavern', 'utopia', 'velocity', 'wizard', 'youth',
  ] as const,

  sentences: [
    'The quick brown fox jumps over the lazy dog.',
    'Typing fast, with accuracy, is the best skill.',
    'How are you doing today?',
    'Practice makes perfect, so keep trying!',
    'Type faster every day, and improve your skills.',
    'Stay focused, avoid distractions, and type well.',
    'Keep calm, breathe deeply, and type with purpose!',
    'Coding is fun, challenging, and very rewarding.',
    'What are you typing about today?',
    'Speed, accuracy, and consistency matter the most!',
  ] as const,

  paragraphs: [
    'The quick brown fox jumps over the lazy dog, demonstrating all letters of the alphabet in one swift sentence.',
    'Practice typing every day to improve your speed and accuracy, because consistent effort leads to mastery over time.',
    'In a galaxy far, far away, a young hero learns to type with incredible speed, defending the universe one keystroke at a time.',
    'Technology advances rapidly, but the skill of typing remains essential for communication, coding, and creative expression in our digital world.',
    'Challenge yourself with increasingly difficult passages, pushing your limits and watching your words per minute soar to new heights!',
  ] as const,
};

export function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomWord(gameMode: 'letters' | 'words' | 'sentences' | 'paragraphs'): string {
  const list = wordLists[gameMode];
  return String(getRandomItem(list));
}
