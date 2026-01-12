import { GameCard, Player } from './types';

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