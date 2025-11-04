# Agent Development Guidelines - Typing Chud

## React 19 Best Practices

### ⚠️ CRITICAL RULES - NO EXCEPTIONS

1. **NO useCallback** - React 19's compiler handles optimization automatically
2. **NO useMemo** - React 19's compiler handles memoization automatically  
3. **NO functions as useEffect dependencies** - Only use primitive values or state values

### Example - What NOT to do:
```typescript
// ❌ BAD - Uses useCallback
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// ❌ BAD - Function as dependency
useEffect(() => {
  handleClick();
}, [handleClick]); // Never use functions as dependencies!
```

### Example - What to do instead:
```typescript
// ✅ GOOD - Plain function
const handleClick = () => {
  doSomething();
};

// ✅ GOOD - Only value dependencies
useEffect(() => {
  handleClick();
}, [someStateValue]); // Only primitive/state values
```

## Event Handler Best Practices

### Avoid Stale Closures
When passing objects with methods to hooks, access properties directly inside handlers to avoid stale closures:

```typescript
// ❌ BAD - Destructuring creates stale references
const { gameStatus, startGame } = gameManager;
useEffect(() => {
  if (gameStatus === 'ready') startGame();
}, [gameStatus]);

// ✅ GOOD - Direct access ensures fresh values
useEffect(() => {
  if (gameManager.gameStatus === 'ready') {
    gameManager.startGame();
  }
}, [gameManager.gameStatus]);
```

### Keyboard Event Handling
Always prevent default behavior when handling game controls:

```typescript
const handler = (ev: KeyboardEvent) => {
  if (ev.code === "Space") {
    ev.preventDefault(); // Prevent button activation
    // handle space key
  }
  if (ev.key === "Escape") {
    ev.preventDefault(); // Prevent dialog close
    // handle escape key
  }
};
```

## UI/UX Considerations

### Button Focus Management
Buttons retain focus after clicking, which can interfere with keyboard controls:

```typescript
// Always blur buttons after clicking to prevent Space key from re-triggering
onClick={(e) => {
  handleAction();
  e.currentTarget.blur(); // Remove focus
}}
```

## Hook Architecture

### State Management
- Use refs for values that need persistence without re-renders
- Use state only for values that trigger UI updates
- Keep game loop data in refs to avoid unnecessary renders

```typescript
// Game loop data - use refs
const lettersRef = useRef<FallingLetter[]>([]);
const playerXRef = useRef<number>(400);

// UI state - use useState
const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
const [score, setScore] = useState(0);
```

### Effect Dependencies
Only include values that actually trigger the effect logic:

```typescript
// ✅ GOOD - Only necessary dependencies
useEffect(() => {
  gameManager.setGameMode(gameMode);
}, [gameMode]); // Only the value that changes

// ❌ BAD - Including objects/functions
useEffect(() => {
  gameManager.setGameMode(gameMode);
}, [gameMode, gameManager]); // gameManager is unnecessary
```

## Common Pitfalls & Solutions

### Problem: Game state resets unexpectedly
**Cause**: Multiple state updates or function calls in wrong order
**Solution**: Check for race conditions, ensure proper state checks before updates

### Problem: Keyboard controls not working
**Cause**: DOM element has focus (usually buttons)
**Solution**: Blur active elements, use preventDefault()

### Problem: Stale values in event handlers
**Cause**: Closure over old values when using destructuring
**Solution**: Access object properties directly inside handlers

### Problem: Infinite re-renders
**Cause**: Functions as dependencies or state updates in render
**Solution**: Remove function dependencies, move state updates to effects

## Game-Specific Patterns

### Game Mode Changes
- Only quit active games when changing modes
- Don't reset state unnecessarily
- Preserve user context when possible

```typescript
const changeGameMode = (mode: GameMode) => {
  setGameModeState(mode);
  // Only quit if actively playing
  if (gameStatus === 'started') {
    quitGame();
  }
};
```

### Animation Frame Loops
- Store animation frame IDs in refs
- Always cleanup on unmount
- Use refs for loop data to avoid re-renders

```typescript
const gameLoopRef = useRef<number | null>(null);

const startLoop = () => {
  const loop = (time: number) => {
    // Update game state
    gameLoopRef.current = requestAnimationFrame(loop);
  };
  gameLoopRef.current = requestAnimationFrame(loop);
};

const stopLoop = () => {
  if (gameLoopRef.current) {
    cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = null;
  }
};
```

## Testing & Debugging

### Browser Focus Issues
When debugging keyboard input issues:
1. Check if any DOM element has focus (inspect element, check document.activeElement)
2. Test with blur() on suspected elements
3. Try unfocusing/refocusing browser window - if this fixes it, it's a focus issue

### State Synchronization
When game state seems out of sync:
1. Check for multiple state sources (refs vs state)
2. Verify effect dependencies are correct
3. Look for race conditions in async operations
4. Add console logs at state transitions

## Code Quality Standards

### Type Safety
- Always use TypeScript types
- Avoid `any` type
- Define explicit return types for hooks

### Naming Conventions
- Hooks: `use[Feature]` (e.g., `useGame`, `useBoard`)
- Event handlers: `handle[Event]` (e.g., `handleTypedLetter`)
- Refs: `[name]Ref` (e.g., `gameLoopRef`, `containerRef`)
- Managers: `[feature]Manager` (e.g., `gameStatusManager`)

### File Organization
```
src/
├── use[Feature]/
│   ├── index.ts        # Public exports
│   └── use[Feature].ts # Hook implementation
├── types.ts            # All TypeScript types
└── index.ts            # Package exports
```

## Performance Considerations

### Minimize Re-renders
- Use refs for non-UI state
- Keep component trees shallow
- Avoid passing new objects/arrays as props

### Canvas Rendering
- Only redraw when necessary
- Use requestAnimationFrame for smooth animations
- Clear only changed regions when possible

## Remember

1. **React 19 = No useCallback/useMemo**
2. **No functions as dependencies**
3. **Blur buttons after clicking**
4. **preventDefault on game controls**
5. **Access object properties directly in handlers**
6. **Use refs for game loop data**
7. **Test focus issues by unfocusing browser**

When in doubt, keep it simple. React 19's compiler will optimize for you.