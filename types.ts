export type PlayerType = 'HUMAN' | 'AI';

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
  
  // Financial Statement
  assets: Asset[];
  liabilities: Liability[];
  dreams: GameCard[]; // Collected dreams
  
  // Dynamic Stats
  monthlyExpenses: number; // Base living cost + liability payments
  passiveIncome: number;   // Sum of asset cashflow
  
  hasEscaped: boolean; // True if on Fast Track
  position: number; // Board position 0-11
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

export type GamePhase = 'SETUP' | 'ROLL' | 'MOVE' | 'ACTION' | 'DECISION' | 'END_TURN' | 'GAME_OVER';

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
}