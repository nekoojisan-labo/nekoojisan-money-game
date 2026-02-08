import { GameCard, Player, LifeGoal, DifficultySettings, AIBehavior } from './types';

// Difficulty Settings by Age
export const DIFFICULTY_SETTINGS: DifficultySettings[] = [
  {
    id: 'kids',
    name: 'キッズモード',
    description: 'お金の基本を楽しく学ぼう！',
    ageRange: '6-10歳',
    goalMultiplier: 0.5,
    startingCashMultiplier: 2,
    expenseMultiplier: 0.5,
    eventFrequency: 'low',
  },
  {
    id: 'teen',
    name: 'ティーンモード',
    description: '投資と節約のバランスを学ぼう！',
    ageRange: '11-15歳',
    goalMultiplier: 0.8,
    startingCashMultiplier: 1.5,
    expenseMultiplier: 0.8,
    eventFrequency: 'medium',
  },
  {
    id: 'adult',
    name: 'チャレンジモード',
    description: 'リアルな経済状況で挑戦！',
    ageRange: '16歳以上',
    goalMultiplier: 1,
    startingCashMultiplier: 1,
    expenseMultiplier: 1,
    eventFrequency: 'high',
  },
];

// Interest rate settings by difficulty (monthly rate)
export const LOAN_SETTINGS: Record<string, { interestRate: number; minLoan: number; loanUnit: number; explanation: string }> = {
  kids: {
    interestRate: 0.05, // 5% per turn (simplified for kids)
    minLoan: 100,
    loanUnit: 100,
    explanation: '銀行からお金を借りると、返す時に少し多く返さないといけないよ！100円借りたら、次のターンで105円になるんだ。',
  },
  teen: {
    interestRate: 0.10, // 10% per turn
    minLoan: 500,
    loanUnit: 500,
    explanation: '銀行ローンには利息がつきます。借りたお金は毎ターン10%ずつ増えていくので、早めに返済しましょう！',
  },
  adult: {
    interestRate: 0.15, // 15% per turn (realistic challenge)
    minLoan: 1000,
    loanUnit: 1000,
    explanation: '銀行ローンは毎ターン15%の利息がかかります。複利で膨らむ前に計画的な返済を心がけましょう。',
  },
};

// AI Behavior patterns by personality
export const AI_BEHAVIORS: Record<string, AIBehavior> = {
  // エンジニア - 慎重で計算高い、協力要請は控えめ
  engineer: {
    personality: 'cautious',
    buyThreshold: 0.4,
    charityChance: 0.2,
    riskTolerance: 0.3,
    supportChance: 0.5,
    requestSupportChance: 0.2, // 自力でやりたい派
    catchphrase: 'データを分析してみると...',
  },
  // 先生 - バランス型で寄付好き、協力的
  teacher: {
    personality: 'charitable',
    buyThreshold: 0.5,
    charityChance: 0.7,
    riskTolerance: 0.4,
    supportChance: 0.8,
    requestSupportChance: 0.6, // みんなで助け合い派
    catchphrase: '子どもたちのために使いたいな',
  },
  // デザイナー - 冒険的でトレンドに敏感
  designer: {
    personality: 'aggressive',
    buyThreshold: 0.7,
    charityChance: 0.3,
    riskTolerance: 0.8,
    supportChance: 0.4,
    requestSupportChance: 0.3, // 自分でやりたい派
    catchphrase: 'このチャンス、逃せない！',
  },
  // 医者 - 安定重視、適度に協力を求める
  doctor: {
    personality: 'balanced',
    buyThreshold: 0.5,
    charityChance: 0.5,
    riskTolerance: 0.5,
    supportChance: 0.6,
    requestSupportChance: 0.5, // バランス派
    catchphrase: '長期的な視点で考えよう',
  },
  // 起業家 - ギャンブラー、一人でやりたい
  entrepreneur: {
    personality: 'gambler',
    buyThreshold: 0.9,
    charityChance: 0.1,
    riskTolerance: 0.95,
    supportChance: 0.3,
    requestSupportChance: 0.1, // 自力でビッグに！
    catchphrase: 'ビッグチャンス！全力で行く！',
  },
};

// Job Cards - players draw one at game start (20 types)
export interface JobCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  salary: number;
  monthlyExpenses: number;
  startingCash: number;
  passiveIncome: number;
  liabilities: { id: string; name: string; totalAmount: number; monthlyPayment: number }[];
  aiBehaviorKey: string; // Key to AI_BEHAVIORS for AI players
}

export const JOB_CARDS: JobCard[] = [
  // === 高収入系 ===
  {
    id: 'job_doctor',
    title: '医者',
    icon: '👨‍⚕️',
    description: '病院で働く医師。高収入だが、学生ローンが残っている。',
    salary: 3500,
    monthlyExpenses: 2000,
    startingCash: 1000,
    passiveIncome: 0,
    liabilities: [{ id: 'student_loan', name: '学生ローン', totalAmount: 10000, monthlyPayment: 500 }],
    aiBehaviorKey: 'doctor',
  },
  {
    id: 'job_lawyer',
    title: '弁護士',
    icon: '⚖️',
    description: '法律事務所勤務。高収入だが激務で支出も多い。',
    salary: 3200,
    monthlyExpenses: 1800,
    startingCash: 800,
    passiveIncome: 0,
    liabilities: [{ id: 'student_loan', name: '学生ローン', totalAmount: 8000, monthlyPayment: 400 }],
    aiBehaviorKey: 'cautious',
  },
  {
    id: 'job_pilot',
    title: 'パイロット',
    icon: '✈️',
    description: '航空会社のパイロット。高給だが訓練ローンあり。',
    salary: 3000,
    monthlyExpenses: 1500,
    startingCash: 1200,
    passiveIncome: 0,
    liabilities: [{ id: 'training_loan', name: '訓練ローン', totalAmount: 5000, monthlyPayment: 300 }],
    aiBehaviorKey: 'balanced',
  },
  // === IT・テック系 ===
  {
    id: 'job_engineer',
    title: 'エンジニア',
    icon: '💻',
    description: 'IT企業で働くプログラマー。給料は高めだが、支出も多い。',
    salary: 2500,
    monthlyExpenses: 1500,
    startingCash: 800,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'engineer',
  },
  {
    id: 'job_data_scientist',
    title: 'データサイエンティスト',
    icon: '📊',
    description: 'ビッグデータを分析。需要が高く給料も良い。',
    salary: 2800,
    monthlyExpenses: 1400,
    startingCash: 900,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'cautious',
  },
  {
    id: 'job_game_developer',
    title: 'ゲーム開発者',
    icon: '🎮',
    description: 'ゲーム会社でゲームを作る。夢のある仕事。',
    salary: 2200,
    monthlyExpenses: 1300,
    startingCash: 600,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'aggressive',
  },
  // === クリエイティブ系 ===
  {
    id: 'job_designer',
    title: 'デザイナー',
    icon: '🎨',
    description: 'クリエイティブな仕事。おしゃれに支出が多い。',
    salary: 2200,
    monthlyExpenses: 1600,
    startingCash: 500,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'designer',
  },
  {
    id: 'job_photographer',
    title: 'カメラマン',
    icon: '📸',
    description: 'フリーランスの写真家。収入は不安定だが自由。',
    salary: 1800,
    monthlyExpenses: 1000,
    startingCash: 1500,
    passiveIncome: 50,
    liabilities: [],
    aiBehaviorKey: 'aggressive',
  },
  {
    id: 'job_musician',
    title: 'ミュージシャン',
    icon: '🎸',
    description: '音楽で生計を立てる。印税収入あり。',
    salary: 1500,
    monthlyExpenses: 900,
    startingCash: 800,
    passiveIncome: 100,
    liabilities: [],
    aiBehaviorKey: 'gambler',
  },
  {
    id: 'job_youtuber',
    title: 'YouTuber',
    icon: '📹',
    description: '動画配信で収入を得る。広告収入あり。',
    salary: 1200,
    monthlyExpenses: 800,
    startingCash: 500,
    passiveIncome: 150,
    liabilities: [],
    aiBehaviorKey: 'entrepreneur',
  },
  // === 教育・公務員系 ===
  {
    id: 'job_teacher',
    title: '先生',
    icon: '👩‍🏫',
    description: '学校の先生。安定していて支出も少ない。',
    salary: 1800,
    monthlyExpenses: 1000,
    startingCash: 1200,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'teacher',
  },
  {
    id: 'job_police',
    title: '警察官',
    icon: '👮',
    description: '地域の安全を守る。安定収入。',
    salary: 2000,
    monthlyExpenses: 1100,
    startingCash: 1000,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'balanced',
  },
  {
    id: 'job_firefighter',
    title: '消防士',
    icon: '🚒',
    description: '火災から人々を守る。安定収入で尊敬される。',
    salary: 1900,
    monthlyExpenses: 1000,
    startingCash: 1100,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'charitable',
  },
  // === ビジネス系 ===
  {
    id: 'job_salesperson',
    title: '営業マン',
    icon: '🤝',
    description: '会社の営業担当。成績次第で収入アップ。',
    salary: 2000,
    monthlyExpenses: 1200,
    startingCash: 1000,
    passiveIncome: 0,
    liabilities: [{ id: 'car_loan', name: '車のローン', totalAmount: 2000, monthlyPayment: 200 }],
    aiBehaviorKey: 'balanced',
  },
  {
    id: 'job_accountant',
    title: '会計士',
    icon: '🧮',
    description: '数字に強い専門家。堅実な収入。',
    salary: 2300,
    monthlyExpenses: 1200,
    startingCash: 1500,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'cautious',
  },
  {
    id: 'job_entrepreneur',
    title: '起業家',
    icon: '🚀',
    description: 'スタートアップ経営者。夢は大きい。',
    salary: 1500,
    monthlyExpenses: 800,
    startingCash: 2000,
    passiveIncome: 100,
    liabilities: [],
    aiBehaviorKey: 'entrepreneur',
  },
  // === サービス・その他 ===
  {
    id: 'job_chef',
    title: 'シェフ',
    icon: '👨‍🍳',
    description: 'レストランの料理長。腕次第で独立も。',
    salary: 1800,
    monthlyExpenses: 1100,
    startingCash: 700,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'aggressive',
  },
  {
    id: 'job_nurse',
    title: '看護師',
    icon: '👩‍⚕️',
    description: '病院で患者をケア。安定した需要。',
    salary: 2100,
    monthlyExpenses: 1000,
    startingCash: 900,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'charitable',
  },
  {
    id: 'job_athlete',
    title: 'スポーツ選手',
    icon: '⚽',
    description: 'プロアスリート。スポンサー収入あり。',
    salary: 2500,
    monthlyExpenses: 1500,
    startingCash: 600,
    passiveIncome: 200,
    liabilities: [],
    aiBehaviorKey: 'gambler',
  },
  {
    id: 'job_mechanic',
    title: '整備士',
    icon: '🔧',
    description: '車やバイクを修理。手に職がある。',
    salary: 1600,
    monthlyExpenses: 900,
    startingCash: 1300,
    passiveIncome: 0,
    liabilities: [],
    aiBehaviorKey: 'balanced',
  },
];

// Character Templates - used to create players based on selection (name/avatar only)
export interface CharacterTemplate {
  id: string;
  name: string;
  avatar: string;
}

export const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  { id: 'char1', name: 'あなた', avatar: '🧑‍🚀' },
  { id: 'char2', name: 'マナブ', avatar: '💻' },
  { id: 'char3', name: 'ヒカリ', avatar: '👩‍🏫' },
  { id: 'char4', name: 'タクミ', avatar: '🎨' },
];

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
    bankLoan: 0,
  },
  {
    id: 'p2',
    name: 'マナブ',
    type: 'AI',
    avatar: '💻',
    cash: 800,
    jobTitle: 'エンジニア',
    salary: 2500,
    aiBehavior: AI_BEHAVIORS.engineer,
    assets: [],
    liabilities: [],
    dreams: [],
    monthlyExpenses: 1500,
    passiveIncome: 80,
    hasEscaped: false,
    position: 0,
    selectedGoal: null,
    charityTurnsRemaining: 0,
    supportBonus: 0,
    bankLoan: 0,
  },
  {
    id: 'p3',
    name: 'ヒカリ',
    type: 'AI',
    avatar: '👩‍🏫',
    cash: 1200,
    jobTitle: '先生',
    salary: 1800,
    aiBehavior: AI_BEHAVIORS.teacher,
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
    bankLoan: 0,
  },
  {
    id: 'p4',
    name: 'タクミ',
    type: 'AI',
    avatar: '🎨',
    cash: 500,
    jobTitle: 'デザイナー',
    salary: 2200,
    aiBehavior: AI_BEHAVIORS.designer,
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
    bankLoan: 0,
  },
];

// Random events that can happen (for more engaging gameplay)
export const RANDOM_EVENTS = [
  { id: 'bonus', message: '🎉 ボーナスが出た！', effect: 'cash', amount: 500 },
  { id: 'tax', message: '😱 追加の税金が発生！', effect: 'cash', amount: -200 },
  { id: 'gift', message: '🎁 親戚からお祝い金！', effect: 'cash', amount: 300 },
  { id: 'repair', message: '🔧 家電が故障した！', effect: 'cash', amount: -150 },
  { id: 'lucky', message: '🍀 宝くじに当選！', effect: 'cash', amount: 1000 },
  { id: 'medical', message: '🏥 急な医療費が発生', effect: 'cash', amount: -300 },
];

// Market events - investment gains and losses
export const MARKET_CARDS: GameCard[] = [
  // === 損失イベント ===
  {
    id: 'market_crash',
    type: 'MARKET',
    title: '📉 株価暴落',
    description: '世界的な経済危機で株価が暴落！株式資産の収益が半減...',
    cost: 0,
    cashflow: -50, // 株式資産のcashflowを50%減少
  },
  {
    id: 'vacancy',
    type: 'MARKET',
    title: '🏚️ 空室発生',
    description: '入居者が退去してしまった。修繕費がかかります。',
    cost: 100,
    cashflow: 0,
  },
  {
    id: 'business_slump',
    type: 'MARKET',
    title: '📊 景気後退',
    description: '消費者の財布のひもが固くなり、ビジネスの売上が減少。',
    cost: 0,
    cashflow: -30, // 全資産のcashflowを一時的に30%減少
  },
  {
    id: 'bankruptcy',
    type: 'MARKET',
    title: '💸 投資先倒産',
    description: '投資していた会社が倒産！資産が一つ消滅...',
    cost: 0,
    cashflow: -100, // 資産を1つ失う
  },
  {
    id: 'fraud',
    type: 'MARKET',
    title: '🦹 詐欺被害',
    description: '投資詐欺に遭ってしまった！現金を失う。',
    cost: 300,
    cashflow: 0,
  },
  // === 利益イベント ===
  {
    id: 'bull_market',
    type: 'MARKET',
    title: '📈 株価高騰',
    description: '経済好調で株価が急上昇！配当金ボーナス！',
    cost: -200, // マイナスのコスト = 現金がもらえる
    cashflow: 0,
  },
  {
    id: 'rent_increase',
    type: 'MARKET',
    title: '🏠 家賃値上げ成功',
    description: '物件の人気が高まり、家賃を値上げできた！',
    cost: 0,
    cashflow: 20, // 不動産資産のcashflowが20増加
  },
  {
    id: 'business_boom',
    type: 'MARKET',
    title: '🎊 ビジネス繁盛',
    description: 'あなたのビジネスが口コミで大人気に！',
    cost: -150,
    cashflow: 0,
  },
  {
    id: 'tax_refund',
    type: 'MARKET',
    title: '💰 税金還付',
    description: '確定申告で経費が認められ、還付金をゲット！',
    cost: -100,
    cashflow: 0,
  },
  {
    id: 'inheritance',
    type: 'MARKET',
    title: '🎁 遺産相続',
    description: '遠い親戚から思いがけない遺産が！',
    cost: -500,
    cashflow: 0,
  },
];

// AI dialog messages based on situation
export const AI_DIALOGS = {
  buy: [
    'これは買いだ！',
    '投資のチャンス！',
    'よし、購入しよう',
    'リターンが期待できそう',
  ],
  pass: [
    'うーん、今回はパス',
    'もう少し様子を見よう',
    '慎重に行こう',
    '次のチャンスを待とう',
  ],
  donate: [
    '社会に貢献したい',
    '寄付は未来への投資',
    '困っている人を助けたい',
    'いいことをすると気持ちいい',
  ],
  escape: [
    'やったー！脱出成功！',
    'ついに自由を手に入れた！',
    '投資家の仲間入りだ！',
    '新しいステージへ！',
  ],
  support: [
    '仲間を助けよう',
    'みんなで成功しよう',
    '協力すれば強くなれる',
  ],
  requestSupport: [
    '助けてください！',
    '協力してもらえませんか？',
    '一緒に頑張りましょう！',
    '仲間の力を貸して！',
  ],
  acceptSupport: [
    'ありがとう！',
    '助かります！',
    '感謝します！',
  ],
  marketGain: [
    'ラッキー！市場が味方した！',
    '投資が報われた！',
    'いい波に乗れた！',
    '好調な市場だ！',
  ],
  marketLoss: [
    'まさか...こんなことが...',
    '市場は厳しいな...',
    'これも勉強だ...',
    '次は気をつけよう...',
  ],
};

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