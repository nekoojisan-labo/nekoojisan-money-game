import { Player, GameCard } from '../types';

// Static hints based on card type and player status (no API required)
const STATIC_HINTS: Record<string, string[]> = {
  OPPORTUNITY: [
    '毎月の収入が増えるよ！コスト÷キャッシュフローで何ヶ月で元が取れるか計算してみよう。',
    '不労所得を増やすチャンス！でも、手持ちのお金が少なくなりすぎないように注意してね。',
    '投資のポイントは「利回り」だよ。収入÷コストで計算してみよう！',
  ],
  BUSINESS: [
    '大きなビジネスは大きな収入！でもリスクも大きいよ。手持ち資金に余裕はある？',
    'ビジネスオーナーになるチャンス！毎月の収入がどれだけ増えるか確認しよう。',
    '投資家は大きな案件を狙うもの。でも無理は禁物だよ！',
  ],
  DREAM: [
    '人生の目標に近づくチャンス！達成したら勝利だよ！',
    '夢を叶える準備はできてる？残りのお金も確認してね。',
    'ゴールが目の前！自分の目標に合っているか確認しよう。',
  ],
  DOODAD: [
    '無駄遣いは避けられないこともある...次のチャンスに備えよう！',
    'お金が減っちゃうけど、これも人生の勉強だね。',
  ],
  AUDIT: [
    '投資家にもリスクはつきもの。備えが大切だよ！',
    '予期しない出費...でも大丈夫、また稼げばいいさ！',
  ],
  CHARITY: [
    '寄付すると3ターン、サイコロを2個振れるよ！戦略的に使おう。',
    '社会貢献も大切。見返りがあるのも嬉しいね！',
  ],
};

// Calculate ROI hint
const getROIHint = (card: GameCard): string => {
  if (!card.cost || !card.cashflow || card.cashflow <= 0) return '';
  const roi = ((card.cashflow * 12) / card.cost * 100).toFixed(1);
  const paybackMonths = Math.ceil(card.cost / card.cashflow);
  return `💡 年利回り${roi}%、${paybackMonths}ヶ月で元が取れるよ！`;
};

// Get hint based on player status
const getStatusHint = (player: Player, card: GameCard): string => {
  const canAfford = player.cash >= (card.cost || 0);
  const cashAfterPurchase = player.cash - (card.cost || 0);
  const monthlyExpenses = player.monthlyExpenses;

  if (!canAfford) {
    return '😅 今は資金が足りないみたい。パスして次のチャンスを待とう！';
  }

  if (cashAfterPurchase < monthlyExpenses) {
    return '⚠️ 買うと手持ちが少なくなりすぎるかも。緊急時のために少し残しておこう。';
  }

  if (player.hasEscaped && card.type === 'DREAM') {
    return '🎯 これが君の目標だ！買えば勝利だよ！';
  }

  return '';
};

export const getCoachHint = async (player: Player, card: GameCard): Promise<string> => {
  // Get static hints based on card type
  const hints = STATIC_HINTS[card.type] || ['自分でよく考えて決めよう！'];
  const randomHint = hints[Math.floor(Math.random() * hints.length)];

  // Add ROI calculation for investment cards
  const roiHint = getROIHint(card);

  // Add status-based advice
  const statusHint = getStatusHint(player, card);

  // Combine hints
  const allHints = [randomHint, roiHint, statusHint].filter(h => h).join('\n');

  return allHints || '自分の財務状況をよく確認して判断しよう！';
};
