import { secureRandomInt } from '@casino/shared';

export interface GameLogic {
  determineOutcome(randomValue: number): any;
  getPayoutMultiplier(outcome: any): number;
}

// Dice games
class DiceRollGame implements GameLogic {
  constructor(private sides: number = 6, private threshold: number = 4, private multiplier: number = 2) {}
  determineOutcome(randomValue: number) {
    const roll = Math.floor(randomValue * this.sides) + 1;
    return { roll, sides: this.sides };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.roll >= this.threshold ? this.multiplier : 0;
  }
}

// High Low
class HighLowGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const roll = Math.floor(randomValue * 100) + 1;
    return { roll };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.roll > 50 ? 1.9 : 0;
  }
}

// Odd Even
class OddEvenGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const roll = Math.floor(randomValue * 100) + 1;
    return { roll, isEven: roll % 2 === 0 };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.isEven ? 1.95 : 0;
  }
}

// Coin Flip
class CoinFlipGame implements GameLogic {
  determineOutcome(randomValue: number) {
    return { result: randomValue < 0.5 ? 'heads' : 'tails' };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.result === 'heads' ? 1.9 : 0;
  }
}

// Color Wheel
class ColorWheelGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const index = Math.floor(randomValue * colors.length);
    return { color: colors[index] };
  }
  getPayoutMultiplier(outcome: any) {
    const colorMultipliers: any = { red: 5, blue: 3, green: 3, yellow: 10, purple: 15, orange: 20 };
    return colorMultipliers[outcome.color] || 0;
  }
}

// Number Guess (simplified)
class NumberGuessGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const secret = Math.floor(randomValue * 10) + 1;
    return { secret };
  }
  getPayoutMultiplier(outcome: any) {
    // Player is considered to have guessed the number (for demo)
    return 8;
  }
}

// Slots (simplified)
class SlotGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const symbols = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];
    const reels = [
      symbols[Math.floor(randomValue * symbols.length)],
      symbols[Math.floor((randomValue * 1.1) % 1 * symbols.length)],
      symbols[Math.floor((randomValue * 2.2) % 1 * symbols.length)],
    ];
    return { reels };
  }
  getPayoutMultiplier(outcome: any) {
    const [a, b, c] = outcome.reels;
    if (a === b && b === c) {
      const symbolMultipliers: any = { '🍒': 2, '🍋': 3, '🔔': 5, '⭐': 10, '💎': 20, '7️⃣': 50 };
      return symbolMultipliers[a] || 5;
    }
    if (a === b || b === c || a === c) return 1.5;
    return 0;
  }
}

// Quick tap (simple)
class QuickTapGame implements GameLogic {
  determineOutcome(randomValue: number) {
    return { success: randomValue < 0.7 };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.success ? 1.3 : 0;
  }
}

// Mystery box
class MysteryBoxGame implements GameLogic {
  determineOutcome(randomValue: number) {
    const prizes = [0, 1, 2, 5, 10, 20, 50];
    const index = Math.floor(randomValue * prizes.length);
    return { prizeMultiplier: prizes[index] };
  }
  getPayoutMultiplier(outcome: any) {
    return outcome.prizeMultiplier;
  }
}

// Build registry for 120 games
export class GameRegistry {
  private games: Record<string, GameLogic> = {};

  constructor() {
    this.initializeGames();
  }

  private initializeGames() {
    // Generate 120 game definitions with different logic based on slug pattern
    for (let i = 1; i <= 120; i++) {
      const slug = `game-${i}`;
      const category = this.getCategoryForIndex(i);
      let logic: GameLogic;
      switch (category) {
        case 'dice':
          logic = new DiceRollGame(6, 4, 2);
          break;
        case 'wheel':
          logic = new ColorWheelGame();
          break;
        case 'cards':
          logic = new HighLowGame();
          break;
        case 'slots':
          logic = new SlotGame();
          break;
        case 'numbers':
          logic = new NumberGuessGame();
          break;
        case 'quick':
          logic = new QuickTapGame();
          break;
        case 'special':
          logic = new MysteryBoxGame();
          break;
        default:
          logic = new CoinFlipGame();
      }
      this.games[slug] = logic;
    }
  }

  private getCategoryForIndex(index: number): string {
    const categories = ['dice', 'wheel', 'cards', 'slots', 'numbers', 'quick', 'special'];
    return categories[index % categories.length];
  }

  getGame(slug: string): GameLogic | undefined {
    return this.games[slug];
  }
}
