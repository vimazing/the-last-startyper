export const gameInfo = {
  name: 'Typing Chud',
  description: 'TODO: Game description',

  controls: {
    navigation: [
      { keys: 'hjkl', description: 'TODO: Navigation controls' },
    ],
    game: [
      { keys: 'Space', description: 'Start game' },
      { keys: 'q', description: 'Quit game' },
    ],
  },

  rules: {
    // TODO: Define game rules
  },

  scoring: {
    formula: 'TODO: Scoring formula',
    range: '0 - 1000 points',
    penalties: [],
    examples: [],
  },

  gameOver: {
    conditions: [
      // TODO: Define game over conditions
    ],
  },

  objective: 'TODO: Game objective',
  winCondition: 'TODO: Win condition',
} as const;

export type GameInfo = typeof gameInfo;
