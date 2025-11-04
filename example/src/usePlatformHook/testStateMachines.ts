import type { GameMode } from '@vimazing/typing-chud';

export type ModeTransition = {
  fromMode: GameMode;
  threshold: number;
  targetMode: GameMode;
  description: string;
};

export type ScoreTransition = {
  scoreThreshold: number;
  targetMode: GameMode;
  description: string;
};

export type TestScenario = {
  id: string;
  name: string;
  description: string;
  initialMode: GameMode;
  transitions?: ModeTransition[];
  scoreTransitions?: ScoreTransition[];
};

export const testScenarios: Record<string, TestScenario> = {
   scoreBasedProgression: {
     id: 'scoreBasedProgression',
     name: 'Score-Based Progression',
     description: 'Change modes based on score: score 10 → words, score 50 → sentences, score 100 → paragraphs. Tests delayed application until current item completes.',
     initialMode: 'letters',
     scoreTransitions: [
       {
         scoreThreshold: 10,
         targetMode: 'words',
         description: 'At score 10, request switch to words',
       },
       {
         scoreThreshold: 50,
         targetMode: 'sentences',
         description: 'At score 50, request switch to sentences',
       },
       {
         scoreThreshold: 100,
         targetMode: 'paragraphs',
         description: 'At score 100, request switch to paragraphs',
       },
     ],
   },

   progressive: {
    id: 'progressive',
    name: 'Progressive Mode Ladder',
    description: 'Automatically progress through all modes: 10 letters → 10 words → 5 sentences → 3 paragraphs',
    initialMode: 'letters',
    transitions: [
      {
        fromMode: 'letters',
        threshold: 10,
        targetMode: 'words',
        description: 'After 10 letters, switch to words',
      },
      {
        fromMode: 'words',
        threshold: 10,
        targetMode: 'sentences',
        description: 'After 10 words, switch to sentences',
      },
      {
        fromMode: 'sentences',
        threshold: 5,
        targetMode: 'paragraphs',
        description: 'After 5 sentences, switch to paragraphs',
      },
    ],
  },

  lettersOnly: {
    id: 'lettersOnly',
    name: 'Letters Only',
    description: 'Stay in letters mode (baseline)',
    initialMode: 'letters',
    transitions: [],
  },

  wordsOnly: {
    id: 'wordsOnly',
    name: 'Words Only',
    description: 'Start in words mode (baseline)',
    initialMode: 'words',
    transitions: [],
  },

  sentencesOnly: {
    id: 'sentencesOnly',
    name: 'Sentences Only',
    description: 'Start in sentences mode (baseline)',
    initialMode: 'sentences',
    transitions: [],
  },

  paragraphsOnly: {
    id: 'paragraphsOnly',
    name: 'Paragraphs Only',
    description: 'Start in paragraphs mode (baseline)',
    initialMode: 'paragraphs',
    transitions: [],
  },

  rapidTransitions: {
    id: 'rapidTransitions',
    name: 'Rapid Transitions',
    description: 'Quick transitions: 3 letters → 3 words → 2 sentences → 1 paragraph',
    initialMode: 'letters',
    transitions: [
      {
        fromMode: 'letters',
        threshold: 3,
        targetMode: 'words',
        description: 'After 3 letters, switch to words',
      },
      {
        fromMode: 'words',
        threshold: 3,
        targetMode: 'sentences',
        description: 'After 3 words, switch to sentences',
      },
      {
        fromMode: 'sentences',
        threshold: 2,
        targetMode: 'paragraphs',
        description: 'After 2 sentences, switch to paragraphs',
      },
    ],
  },

  backAndForth: {
    id: 'backAndForth',
    name: 'Back and Forth',
    description: 'Oscillate between modes: 5 letters ↔ 5 words ↔ 5 letters',
    initialMode: 'letters',
    transitions: [
      {
        fromMode: 'letters',
        threshold: 5,
        targetMode: 'words',
        description: 'After 5 letters, switch to words',
      },
      {
        fromMode: 'words',
        threshold: 5,
        targetMode: 'letters',
        description: 'After 5 words, switch back to letters',
      },
    ],
  },
};

export function getScenario(id: string): TestScenario {
  return testScenarios[id] || testScenarios.progressive;
}

export function getScenarioNames(): { id: string; name: string }[] {
  return Object.entries(testScenarios).map(([id, scenario]) => ({
    id,
    name: scenario.name,
  }));
}
