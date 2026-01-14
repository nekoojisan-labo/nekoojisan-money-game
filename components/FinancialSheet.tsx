import React, { useState } from 'react';
import { Player } from '../types';
import { Wallet, TrendingUp, TrendingDown, Target, ChevronDown, ChevronUp, Crown } from 'lucide-react';

interface FinancialSheetProps {
  player: Player;
  isCurrentUser: boolean;
}

export const FinancialSheet: React.FC<FinancialSheetProps> = ({ player, isCurrentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const totalExpenses = player.monthlyExpenses;
  const monthlyCashflow = (player.salary + player.passiveIncome) - totalExpenses;

  // Progress bar calculation
  const freedomRatio = totalExpenses > 0 ? player.passiveIncome / totalExpenses : 0;
  const freedomProgress = Math.min(100, Math.max(0, freedomRatio * 100));

  // Compact view (non-current players)
  if (!isCurrentUser) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{player.avatar}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-slate-700">{player.name}</span>
              {player.hasEscaped && <Crown className="w-3 h-3 text-amber-500" />}
            </div>
            <span className="text-[10px] text-slate-400">{player.type === 'AI' ? 'CPU' : 'あなた'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold text-sm ${player.hasEscaped ? 'text-amber-600' : 'text-green-600'}`}>
            ¥{player.cash.toLocaleString()}
          </div>
          {!player.hasEscaped && (
            <div className="text-[10px] text-slate-400">{Math.round(freedomProgress)}%</div>
          )}
        </div>
      </div>
    );
  }

  // Expanded view (current player)
  return (
    <div className={`rounded-xl overflow-hidden border-2 ${player.hasEscaped ? 'border-amber-400 bg-amber-50' : 'border-blue-400 bg-white'} shadow-md`}>

      {/* Header */}
      <div className={`p-3 flex items-center justify-between ${player.hasEscaped ? 'bg-amber-100' : 'bg-blue-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center border-2 ${player.hasEscaped ? 'bg-amber-50 border-amber-300' : 'bg-white border-blue-200'}`}>
            {player.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800">{player.name}</h3>
              {player.hasEscaped ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-700 font-bold">投資家</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{player.jobTitle}</span>
              )}
            </div>
            {player.selectedGoal && (
              <div className="flex items-center gap-1 text-[10px] text-purple-600">
                <Target className="w-3 h-3" />
                {player.selectedGoal.icon} {player.selectedGoal.title}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold text-lg flex items-center gap-1 ${player.hasEscaped ? 'text-amber-600' : 'text-green-600'}`}>
            <Wallet className="w-4 h-4" />
            {player.cash.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar (Rat Race only) */}
      {!player.hasEscaped && (
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="flex justify-between text-[10px] mb-1">
            <span className={`font-bold ${freedomProgress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
              脱出率 {Math.round(freedomProgress)}%
            </span>
            <span className="text-slate-400">不労所得: {player.passiveIncome} / 支出: {totalExpenses}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${freedomProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${freedomProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Charity Bonus */}
      {player.charityTurnsRemaining > 0 && (
        <div className="px-3 py-1.5 bg-pink-50 border-b border-pink-100 text-center">
          <span className="text-[10px] text-pink-600 font-bold">🎲🎲 サイコロ2個 (残り{player.charityTurnsRemaining}ターン)</span>
        </div>
      )}

      {/* Income/Expense Row */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 text-center py-2 bg-slate-50">
        <div>
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-green-500" /> 収入
          </div>
          <div className="font-bold text-sm text-slate-700">+{(player.salary + player.passiveIncome).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
            <TrendingDown className="w-3 h-3 text-red-400" /> 支出
          </div>
          <div className="font-bold text-sm text-red-500">-{totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:bg-slate-100 flex items-center justify-center gap-1 border-t border-slate-100"
      >
        {expanded ? '閉じる' : '詳細を見る'}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 text-[10px] border-t border-slate-100 bg-slate-50">
          <div className="mt-2">
            <div className="font-bold text-slate-500 mb-1">資産 ({player.assets.length})</div>
            {player.assets.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {player.assets.map(a => (
                  <span key={a.id} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                    {a.name} <span className="text-green-600">(+{a.cashflow})</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400">なし</span>
            )}
          </div>
          {player.selectedGoal && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-500 mb-1">目標達成まで</div>
              <div className={`font-bold ${player.cash >= player.selectedGoal.requiredCash ? 'text-green-600' : 'text-slate-600'}`}>
                {player.cash >= player.selectedGoal.requiredCash
                  ? '✓ 達成可能！'
                  : `あと ¥${(player.selectedGoal.requiredCash - player.cash).toLocaleString()}`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};