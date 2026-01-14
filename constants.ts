import { GameCard, Player, LifeGoal } from './types';

// Life Goals - Players choose one at game start
export const LIFE_GOALS: LifeGoal[] = [
  {
    id: 'goal_travel',
    title: '世界一周の旅',
    description: '世界中を自由に旅して、様々な文化を体験する。',
    icon: '✈️',
    requiredCash: 100000,
  },
  {
    id: 'goal_charity',
    title: '学校を建てる',
    description: '発展途上国に学校を建設し、子どもたちに教育を届ける。',
    icon: '🏫',
    requiredCash: 150000,
  },
  {
    id: 'goal_forest',
    title: '森を守る',
    description: '広大な森林を購入し、自然環境を保護する。',
    icon: '🌲',
    requiredCash: 200000,
  },
  {
    id: 'goal_island',
    title: '南の島に別荘',
    description: '美しいビーチのある島に別荘を建てて家族と過ごす。',
    icon: '🏝️',
    requiredCash: 80000,
  },
  {
    id: 'goal_space',
    title: '宇宙旅行',
    description: '宇宙から地球を見下ろす体験をする。',
    icon: '🚀',
    requiredCash: 300000,
  },
];

export const BOARD_SIZE = 12;

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'あなた',
    type: 'HUMAN',
    avatar: '🧑‍🚀',
    cash: 1000,
    jobTitle: '会社員',
    salary: 2000,
    assets: [],
    liabilities: [
      { id: 'l1', name: '住宅ローン', totalAmount: 5000, monthlyPayment: 500 },
      { id: 'l2', name: '車のローン', totalAmount: 1000, monthlyPayment: 100 },
    ],
    dreams: [],
    monthlyExpenses: 1200,
    passiveIncome: 0,
    hasEscaped: false,
    position: 0,
    selectedGoal: null,
    charityTurnsRemaining: 0,
    supportBonus: 0,
  },
  {
    id: 'p2',
    name: 'マナブ',
    type: 'AI',
    avatar: '🤖',
    cash: 800,
    jobTitle: 'エンジニア',
    salary: 2500,
    assets: [],
    liabilities: [],
    dreams: [],
    monthlyExpenses: 1500,
    passiveIncome: 0,
    hasEscaped: false,
    position: 0,
    selectedGoal: null,
    charityTurnsRemaining: 0,
    supportBonus: 0,
  },
  {
    id: 'p3',
    name: 'ヒカリ',
    type: 'AI',
    avatar: '🦊',
    cash: 1200,
    jobTitle: '先生',
    salary: 1800,
    assets: [],
    liabilities: [],
    dreams: [],
    monthlyExpenses: 1000,
    passiveIncome: 0,
    hasEscaped: false,
    position: 0,
    selectedGoal: null,
    charityTurnsRemaining: 0,
    supportBonus: 0,
  },
  {
    id: 'p4',
    name: 'タクミ',
    type: 'AI',
    avatar: '🦁',
    cash: 500,
    jobTitle: 'デザイナー',
    salary: 2200,
    assets: [],
    liabilities: [],
    dreams: [],
    monthlyExpenses: 1600,
    passiveIncome: 0,
    hasEscaped: false,
    position: 0,
    selectedGoal: null,
    charityTurnsRemaining: 0,
    supportBonus: 0,
  },
];

// --- Rat Race Cards ---

export const OPPORTUNITY_CARDS: GameCard[] = [
  {
    id: 'o1',
    type: 'OPPORTUNITY',
    title: '小さなアパート',
    description: '3DKの中古マンション。安定した家賃収入が見込めます。',
    cost: 500,
    cashflow: 100,
  },
  {
    id: 'o2',
    type: 'OPPORTUNITY',
    title: '激安な戸建',
    description: 'リフォームが必要ですが、利回りは高いです。',
    cost: 300,
    cashflow: 80,
  },
  {
    id: 'o3',
    type: 'OPPORTUNITY',
    title: '株式投資 (IT企業)',
    description: '成長中のIT企業の株。配当金は少なめですが将来性あり。',
    cost: 100,
    cashflow: 10,
  },
  {
    id: 'o4',
    type: 'OPPORTUNITY',
    title: '自動販売機ビジネス',
    description: '公園の近くに自動販売機を設置します。',
    cost: 200,
    cashflow: 40,
  },
  {
    id: 'o5',
    type: 'OPPORTUNITY',
    title: 'コインランドリー',
    description: '地域密着型のコインランドリー経営。初期費用がかかります。',
    cost: 1000,
    cashflow: 250,
  }
];

export const DOODAD_CARDS: GameCard[] = [
  {
    id: 'd1',
    type: 'DOODAD',
    title: '最新ゲーム機',
    description: '欲しかった新作ゲーム機を買ってしまった！',
    cost: 50,
  },
  {
    id: 'd2',
    type: 'DOODAD',
    title: 'カフェで豪遊',
    description: '友達と高いケーキセットを注文しました。',
    cost: 20,
  },
  {
    id: 'd3',
    type: 'DOODAD',
    title: '車の修理',
    description: 'タイヤがパンクした！修理が必要です。',
    cost: 200,
  },
];

export const BOARD_SPACES = [
  'START',
  'OPPORTUNITY',
  'DOODAD',
  'OPPORTUNITY',
  'CHARITY',
  'OPPORTUNITY',
  'PAYCHECK',
  'OPPORTUNITY',
  'DOODAD',
  'MARKET',
  'OPPORTUNITY',
  'PAYCHECK'
];

// --- Fast Track Cards ---

export const FAST_TRACK_OPPORTUNITIES: GameCard[] = [
  {
    id: 'ft_o1',
    type: 'BUSINESS',
    title: 'ハンバーガーチェーン買収',
    description: '全国展開するハンバーガーチェーンのオーナーになります。',
    cost: 50000,
    cashflow: 10000,
  },
  {
    id: 'ft_o2',
    type: 'BUSINESS',
    title: 'ショッピングモール建設',
    description: '巨大なショッピングモールの建設プロジェクトに参加。',
    cost: 100000,
    cashflow: 25000,
  },
  {
    id: 'ft_o3',
    type: 'BUSINESS',
    title: '映画製作スタジオ',
    description: 'ヒット作を生み出す映画スタジオに出資します。',
    cost: 30000,
    cashflow: 8000,
  },
  {
    id: 'ft_o4',
    type: 'DREAM',
    title: 'プライベートジェット',
    description: '世界中どこへでもひとっ飛び！夢のプライベートジェットを購入。',
    cost: 150000,
    cashflow: 0, 
  },
  {
    id: 'ft_o5',
    type: 'DREAM',
    title: '南の島の別荘',
    description: '透き通る海に囲まれた豪華な別荘。',
    cost: 80000,
    cashflow: 0,
  }
];

export const FAST_TRACK_DOODADS: GameCard[] = [
  {
    id: 'ft_d1',
    type: 'AUDIT',
    title: '税務調査',
    description: '税務調査が入りました。会計士への支払いが発生。',
    cost: 5000,
  },
  {
    id: 'ft_d2',
    type: 'AUDIT',
    title: '離婚訴訟',
    description: 'パートナーとの関係が悪化...慰謝料が発生。',
    cost: 10000,
  },
  {
    id: 'ft_d3',
    type: 'AUDIT',
    title: '名誉毀損で訴えられる',
    description: 'SNSでの発言が炎上。弁護士費用がかかります。',
    cost: 8000,
  }
];

export const FAST_TRACK_SPACES = [
  'START',
  'BUSINESS',
  'AUDIT',
  'BUSINESS',
  'CHARITY',
  'BUSINESS',
  'PAYCHECK',
  'BUSINESS',
  'DREAM',
  'MARKET',
  'BUSINESS',
  'PAYCHECK'
];

// Charity cards - give to get special bonuses
export const CHARITY_CARDS: GameCard[] = [
  {
    id: 'charity_1',
    type: 'CHARITY',
    title: '地域の子ども食堂に寄付',
    description: '収入の10%を寄付すると、次の3ターン、サイコロを2個振れます！',
    cost: 0, // Will be calculated as 10% of income
    cashflow: 0,
  },
  {
    id: 'charity_2',
    type: 'CHARITY',
    title: '環境保護団体への寄付',
    description: '500を寄付すると、次の3ターン、サイコロを2個振れます！',
    cost: 500,
    cashflow: 0,
  },
];

// Support options for Fast Track players to help Rat Race players
export const SUPPORT_OPTIONS = {
  JOB: {
    title: '仕事を依頼する',
    description: 'ラットレースのプレイヤーに仕事を依頼し、彼らに収入を与えます。',
    costToInvestor: 1000,
    benefitToWorker: 800,
    benefitToInvestor: 200, // Passive income bonus
  },
  INVESTMENT: {
    title: '共同投資を持ちかける',
    description: '一緒に投資し、リターンを分配します。',
    costToInvestor: 2000,
    benefitToWorker: 500, // One-time cash
    benefitToInvestor: 300, // Passive income
  },
};