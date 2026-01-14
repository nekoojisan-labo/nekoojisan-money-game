import React, { useState } from 'react';
import { Player } from '../types';
import { BOARD_SPACES, FAST_TRACK_SPACES } from '../constants';
import { MapPin, DollarSign, Zap, ShoppingBag, Heart, Briefcase, Star, AlertTriangle, Crown, Rocket, ChevronDown, ChevronUp } from 'lucide-react';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerId }) => {
  const ratRacePlayers = players.filter(p => !p.hasEscaped);
  const fastTrackPlayers = players.filter(p => p.hasEscaped);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isCurrentPlayerOnFastTrack = currentPlayer?.hasEscaped || false;

  // Collapse inactive board by default
  const [showInactiveBoard, setShowInactiveBoard] = useState(false);

  // Helper to get icon for space type
  const getSpaceIcon = (type: string) => {
    const size = 'w-4 h-4';
    switch (type) {
      case 'START': return <MapPin className={`${size} text-purple-600`} />;
      case 'PAYCHECK': return <DollarSign className={`${size} text-green-600`} />;
      case 'OPPORTUNITY': return <Zap className={`${size} text-blue-600`} />;
      case 'DOODAD': return <ShoppingBag className={`${size} text-red-500`} />;
      case 'CHARITY': return <Heart className={`${size} text-pink-500`} />;
      case 'MARKET': return <span className="text-sm">📈</span>;
      case 'BUSINESS': return <Briefcase className={`${size} text-emerald-600`} />;
      case 'DREAM': return <Star className={`${size} text-fuchsia-500 fill-fuchsia-200`} />;
      case 'AUDIT': return <AlertTriangle className={`${size} text-orange-500`} />;
      default: return null;
    }
  };

  const getSpaceColor = (type: string, isFastTrack: boolean) => {
    if (isFastTrack) {
      switch (type) {
        case 'START': return 'bg-amber-100 border-amber-400';
        case 'PAYCHECK': return 'bg-green-100 border-green-400';
        case 'BUSINESS': return 'bg-emerald-100 border-emerald-400';
        case 'DREAM': return 'bg-fuchsia-100 border-fuchsia-400';
        case 'AUDIT': return 'bg-orange-100 border-orange-400';
        case 'CHARITY': return 'bg-pink-100 border-pink-400';
        case 'MARKET': return 'bg-blue-100 border-blue-400';
        default: return 'bg-amber-50 border-amber-200';
      }
    }
    switch (type) {
      case 'START': return 'bg-purple-100 border-purple-400';
      case 'PAYCHECK': return 'bg-green-100 border-green-400';
      case 'OPPORTUNITY': return 'bg-blue-100 border-blue-400';
      case 'DOODAD': return 'bg-red-100 border-red-400';
      case 'CHARITY': return 'bg-pink-100 border-pink-400';
      case 'MARKET': return 'bg-cyan-100 border-cyan-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getSpaceLabel = (type: string) => {
    switch (type) {
      case 'OPPORTUNITY': return 'チャンス';
      case 'DOODAD': return '無駄遣い';
      case 'PAYCHECK': return '給料日';
      case 'BUSINESS': return 'ビジネス';
      case 'DREAM': return '夢';
      case 'AUDIT': return '監査';
      case 'MARKET': return '市場';
      case 'CHARITY': return '寄付';
      case 'START': return 'スタート';
      default: return type;
    }
  };

  // Compact board renderer
  const renderCompactBoard = (
    spaces: string[],
    boardPlayers: Player[],
    isFastTrack: boolean,
    isActive: boolean
  ) => {
    return (
      <div className={`grid grid-cols-6 gap-1.5 ${isActive ? '' : 'opacity-60'}`}>
        {spaces.map((spaceType, index) => {
          const playersHere = boardPlayers.filter(p => p.position === index);
          const hasPlayers = playersHere.length > 0;

          return (
            <div
              key={index}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-1.5 min-h-[52px] transition-all ${getSpaceColor(spaceType, isFastTrack)} ${hasPlayers ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
            >
              {/* Space Icon */}
              <div className="mb-0.5">{getSpaceIcon(spaceType)}</div>

              {/* Space Label */}
              <span className="text-[8px] font-bold text-slate-600 leading-tight text-center">
                {getSpaceLabel(spaceType)}
              </span>

              {/* Space Number */}
              <span className="absolute top-0.5 left-1 text-[8px] text-slate-400 font-mono">
                {index + 1}
              </span>

              {/* Players on this space */}
              {hasPlayers && (
                <div className="absolute -bottom-1 -right-1 flex -space-x-1">
                  {playersHere.map(p => (
                    <div
                      key={p.id}
                      className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs shadow bg-white ${p.id === currentPlayerId ? 'ring-2 ring-blue-500' : ''}`}
                      title={p.name}
                    >
                      {p.avatar}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Active board (current player's board)
  const activeBoard = isCurrentPlayerOnFastTrack ? (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          投資家トラック
        </h3>
        <div className="flex items-center gap-1">
          {fastTrackPlayers.map(p => (
            <span key={p.id} className={`text-lg ${p.id === currentPlayerId ? 'ring-2 ring-blue-400 rounded-full' : ''}`}>{p.avatar}</span>
          ))}
        </div>
      </div>
      {renderCompactBoard(FAST_TRACK_SPACES, fastTrackPlayers, true, true)}
      <p className="text-[10px] text-amber-600 text-center mt-2 font-medium">
        夢マスで目標達成すれば勝利！
      </p>
    </div>
  ) : (
    <div className="bg-white rounded-xl border-2 border-slate-300 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500" />
          ラットレース
        </h3>
        <div className="flex items-center gap-1">
          {ratRacePlayers.map(p => (
            <span key={p.id} className={`text-lg ${p.id === currentPlayerId ? 'ring-2 ring-blue-400 rounded-full' : ''}`}>{p.avatar}</span>
          ))}
        </div>
      </div>
      {renderCompactBoard(BOARD_SPACES, ratRacePlayers, false, true)}
      <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">
        不労所得 ≧ 支出 で脱出！
      </p>
    </div>
  );

  // Inactive board (collapsible)
  const inactiveBoard = isCurrentPlayerOnFastTrack ? (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setShowInactiveBoard(!showInactiveBoard)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          ラットレース ({ratRacePlayers.length}人)
        </span>
        {showInactiveBoard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showInactiveBoard && (
        <div className="p-2 border-t border-slate-200">
          {renderCompactBoard(BOARD_SPACES, ratRacePlayers, false, false)}
        </div>
      )}
    </div>
  ) : (
    <div className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
      <button
        onClick={() => setShowInactiveBoard(!showInactiveBoard)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs text-amber-600 hover:bg-amber-100 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Crown className="w-3 h-3" />
          投資家トラック ({fastTrackPlayers.length}人)
          {fastTrackPlayers.length === 0 && <span className="text-amber-400">- 脱出後のコース</span>}
        </span>
        {showInactiveBoard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showInactiveBoard && (
        <div className="p-2 border-t border-amber-200">
          {renderCompactBoard(FAST_TRACK_SPACES, fastTrackPlayers, true, false)}
          {fastTrackPlayers.length === 0 && (
            <p className="text-[10px] text-amber-500 text-center mt-1 flex items-center justify-center gap-1">
              <Rocket className="w-3 h-3" />
              ラットレースを脱出するとここへ！
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {activeBoard}
      {inactiveBoard}
    </div>
  );
};
