import React from 'react';
import { Player } from '../types';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Building, Trophy, Target, Dice1, Dice6 } from 'lucide-react';

interface FinancialSheetProps {
  player: Player;
  isCurrentUser: boolean;
}

export const FinancialSheet: React.FC<FinancialSheetProps> = ({ player, isCurrentUser }) => {
  const totalIncome = player.salary + player.passiveIncome;
  const totalExpenses = player.monthlyExpenses;
  const monthlyCashflow = totalIncome - totalExpenses;
  
  // Progress bar calculation
  const freedomRatio = totalExpenses > 0 ? player.passiveIncome / totalExpenses : 0;
  const freedomProgress = Math.min(100, Math.max(0, freedomRatio * 100));

  return (
    <div className={`rounded-xl overflow-hidden border-2 transition-colors relative ${isCurrentUser ? 'bg-white border-blue-400 shadow-md ring-4 ring-blue-100' : 'bg-slate-50 border-slate-200 opacity-90 scale-95'}`}>
      
      {/* Victory Condition Header for Current User */}
      {isCurrentUser && !player.hasEscaped && (
        <div className="bg-yellow-50 border-b border-yellow-100 p-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-yellow-800">
            <Trophy className="w-3 h-3 text-yellow-600" />
            <span>ゴール条件: 不労所得 &gt; 総支出</span>
          </div>
        </div>
      )}

      {/* Fast Track Badge */}
      {player.hasEscaped && (
         <div className="bg-amber-100 border-b border-amber-200 p-2 text-center bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800">
            <span className="text-lg">🏎️</span>
            <span>ファーストトラック挑戦中！</span>
          </div>
        </div>
      )}

      {/* Life Goal Display */}
      {player.selectedGoal && (
        <div className={`px-3 py-2 border-b ${player.hasEscaped ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-purple-500" />
              <span className="font-medium text-slate-600">目標:</span>
              <span className="text-purple-600">{player.selectedGoal.icon} {player.selectedGoal.title}</span>
            </div>
            <span className={`font-bold ${player.cash >= player.selectedGoal.requiredCash ? 'text-green-600' : 'text-slate-400'}`}>
              {player.cash >= player.selectedGoal.requiredCash ? '達成可能！' : `残り ${(player.selectedGoal.requiredCash - player.cash).toLocaleString()}`}
            </span>
          </div>
        </div>
      )}

      {/* Charity Bonus Display */}
      {player.charityTurnsRemaining > 0 && (
        <div className="px-3 py-1 bg-pink-50 border-b border-pink-100">
          <div className="flex items-center justify-center gap-2 text-xs text-pink-600 font-medium">
            <span>🎲🎲</span>
            <span>サイコロ2個ボーナス: 残り{player.charityTurnsRemaining}ターン</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className={`p-3 flex items-center justify-between ${player.hasEscaped ? 'bg-amber-50' : (isCurrentUser ? 'bg-blue-50' : 'bg-slate-100')}`}>
        <div className="flex items-center gap-3">
          <div className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center shadow-sm border ${player.hasEscaped ? 'bg-amber-100 border-amber-300' : 'bg-white border-slate-100'}`}>
            {player.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">{player.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${player.hasEscaped ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                {player.hasEscaped ? '富裕層' : player.jobTitle}
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-500 gap-2">
              <span>{player.type === 'AI' ? '🤖 コンピュータ' : '👤 あなた'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-0.5">現金</div>
          <div className={`font-bold text-xl flex items-center justify-end gap-1 ${player.hasEscaped ? 'text-amber-600' : 'text-green-600'}`}>
            <Wallet className="w-4 h-4" />
            {player.cash.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar (Only visible in Rat Race) */}
      {!player.hasEscaped ? (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-slate-500">ラットレース脱出率</span>
            <span className={freedomProgress >= 100 ? "text-green-600 font-bold" : "text-blue-600"}>{Math.round(freedomProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${freedomProgress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
              style={{ width: `${freedomProgress}%` }}
            />
            {/* Goal Marker Line */}
            <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-red-400 opacity-50 z-10"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-semibold text-blue-500">
               不労所得: {player.passiveIncome.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
               目標(支出): {totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-amber-100 bg-amber-50">
           <div className="text-xs text-amber-800 font-bold text-center">
             ✨ 年間キャッシュフロー: {(monthlyCashflow * 12).toLocaleString()} ✨
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-3 text-center">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> 毎月の収入
          </div>
          <div className="font-bold text-slate-700">+{monthlyCashflow.toLocaleString()}</div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-500" /> 毎月の支出
          </div>
          <div className="font-bold text-red-400">-{totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Assets & Liabilities Summary */}
      <div className="p-3 bg-slate-50 text-xs">
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-1 text-slate-600">
            <Building className="w-3 h-3" /> 資産: {player.assets.length}個
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <PiggyBank className="w-3 h-3" /> 負債: {player.liabilities.length}個
          </div>
        </div>
        
        {/* Only show details for current user to save space */}
        {isCurrentUser && player.assets.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 mb-1">所有資産</div>
            <div className="flex flex-wrap gap-1">
              {player.assets.map(asset => (
                <span key={asset.id} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-sm mb-1 mr-1 inline-block">
                  {asset.name} <span className="text-green-600">(+{asset.cashflow})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};