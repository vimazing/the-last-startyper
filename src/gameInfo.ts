export const gameInfo = {
  name: 'Typing Chud',
  description: 'A fast-paced typing game where letters, words, sentences, and paragraphs fall from the top of the screen. Type to destroy them before they reach your ship. Supports dynamic mode switching for endless variety.',

  controls: {
    game: [
      { keys: 'Space', description: 'Start or restart game' },
      { keys: 'Esc', description: 'Quit game' },
      { keys: 'A-Z, 0-9, . , ! ?', description: 'Type characters to destroy falling text' },
    ],
  },

  rules: {
    gameplay: [
      'Text falls from the top of the screen at increasing speeds based on game mode',
      'Type the displayed characters to destroy them before they reach your ship',
      'Correct keystrokes create green hits; incorrect keystrokes create red misses',
      'Your ship explodes if text reaches it (death)',
      'Game continues until you quit with Esc',
    ],
    modes: [
      'Letters: Single characters fall one at a time',
      'Words: Full words fall and must be typed character by character',
      'Sentences: Multi-line sentences with perspective effect',
      'Paragraphs: 4-line paragraphs with advanced perspective and line transitions',
    ],
  },

  scoring: {
    formula: 'Base score increases with each correct keystroke, decreases with misses. Affected by mode difficulty and completion time.',
    range: '0 - 1000 points',
    mechanics: [
      { metric: 'Correct', value: '+1 point per correct character' },
      { metric: 'Incorrect', value: '-1 point per wrong character' },
      { metric: 'Death', value: 'Ship explosion resets current text, increments death counter' },
    ],
  },

  gameOver: {
    conditions: [
      { type: 'Quit', trigger: 'Press Esc during gameplay', message: 'Game paused - press Space to resume' },
    ],
  },

  objective: 'Type falling text as accurately and quickly as possible while accumulating the highest score',
  winCondition: 'Continuous play - keep going as long as you can. Higher scores indicate better typing speed and accuracy.',
  
  features: [
    'Four game modes: Letters, Words, Sentences, Paragraphs',
    'Dynamic mode switching for varied gameplay',
    'Real-time score tracking',
    'Color-coded feedback (green for hits, red for misses)',
    'Laser visual effects',
    'Ship explosion animations',
    'Perspective effects for sentences and paragraphs',
  ],

  platformIntegration: {
    modes: 'Platforms can request mode switches at runtime via changeGameMode()',
    speed: 'Customize falling speed with downwardSpeed option',
    content: 'Provide custom word lists for words/sentences/paragraphs modes',
    tracking: 'Track completion counts per mode independently',
  },
} as const;

export type GameInfo = typeof gameInfo;
