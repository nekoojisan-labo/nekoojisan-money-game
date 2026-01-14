export type PlayerType = 'HUMAN' | 'AI';

// Age/Difficulty levels
export type DifficultyLevel = 'kids' | 'teen' | 'adult';

export interface DifficultySettings {
  id: DifficultyLevel;
  name: string;
  description: string;
  ageRange: string;
  goalMultiplier: number; // Multiply goal required cash
  startingCashMultiplier: number;
  expenseMultiplier: number;
  eventFrequency: 'low' | 'medium' | 'high';
}

// AI Personality types based on job/character
export type AIPersonality = 'cautious' | 'balanced' | 'aggressive' | 'charitable' | 'gambler';

export interface AIBehavior {
  personality: AIPersonality;
  buyThreshold: number; // % of cash willing to spend on opportunity
  charityChance: number; // % chance to donate when able
  riskTolerance: number; // 0-1, higher = more likely to buy expensive items
  supportChance: number; // % chance to support others when on Fast Track
  requestSupportChance: number; // % chance to request support when in Rat Race
  catchphrase: string; // Character-specific dialog
}

// Life goals that players choose at game start
export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredCash: number; // Cash needed to achieve this dream (base value)
}

export interface Asset {
  id: string;
  name: string;
  cost: number;
  cashflow: number; // Monthly income generated
  downPayment?: number;
  type: 'REAL_ESTATE' | 'BUSINESS' | 'STOCK';
}

export interface Liability {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  avatar: string; // Emoji
  cash: number;
  jobTitle: string;
  salary: number;

  // AI Behavior (only for AI players)
  aiBehavior?: AIBehavior;

  // Financial Statement
  assets: Asset[];
  liabilities: Liability[];
  dreams: GameCard[]; // Collected dreams

  // Dynamic Stats
  monthlyExpenses: number; // Base living cost + liability payments
  passiveIncome: number;   // Sum of asset cashflow

  hasEscaped: boolean; // True if on Fast Track
  position: number; // Board position 0-11

  // Life goal selected at game start
  selectedGoal: LifeGoal | null;

  // Charity bonus: roll 2 dice for next N turns
  charityTurnsRemaining: number;

  // Support received from Fast Track players
  supportBonus: number; // One-time bonus from other players
}

export type CardType = 'OPPORTUNITY' | 'DOODAD' | 'MARKET' | 'CHARITY' | 'PAYCHECK' | 'BUSINESS' | 'DREAM' | 'AUDIT';

export interface GameCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  cost?: number;
  cashflow?: number;
  rule?: (player: Player) => Player; // Custom effect function
}

export interface GameLog {
  id: string;
  message: string;
  turn: number;
  timestamp: number;
}

export type GamePhase = 'SETUP' | 'GOAL_SELECT' | 'ROLL' | 'MOVE' | 'ACTION' | 'DECISION' | 'SUPPORT' | 'END_TURN' | 'GAME_OVER';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  turnCount: number;
  phase: GamePhase;
  currentCard: GameCard | null;
  diceRoll: number | null;
  logs: GameLog[];
  winner: Player | null;
  isCoachLoading: boolean;
  coachMessage: string | null;

  // Difficulty setting
  difficulty: DifficultyLevel;

  // Goal selection phase tracking
  goalSelectingPlayerIndex: number;

  // Support action (Fast Track player helping Rat Race player)
  supportTargetId: string | null;
  supportType: 'JOB' | 'INVESTMENT' | null;

  // Support request from AI Rat Race player to human Fast Track player
  supportRequest: {
    requestingPlayerId: string;
    requestingPlayerName: string;
  } | null;

  // Special event message (for more engaging gameplay)
  eventMessage: string | null;
}