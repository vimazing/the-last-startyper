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
    'the quick brown fox jumps over the lazy dog',
    'practice typing to improve your speed and accuracy',
    'focus on each word and type with purpose today',
    'consistency in practice leads to better results',
    'challenge yourself with longer text passages',
  ] as const,
};

export function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomWord(gameMode: 'letters' | 'words' | 'sentences' | 'paragraphs'): string {
  const list = wordLists[gameMode];
  return String(getRandomItem(list));
}
