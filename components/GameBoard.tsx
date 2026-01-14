import React from 'react';
import { Player } from '../types';
import { BOARD_SPACES, FAST_TRACK_SPACES } from '../constants';
import { MapPin, DollarSign, Zap, ShoppingBag, Heart, Briefcase, Star, AlertTriangle, Crown, Rocket } from 'lucide-react';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerId }) => {
  const ratRacePlayers = players.filter(p => !p.hasEscaped);
  const fastTrackPlayers = players.filter(p => p.hasEscaped);
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Helper to get icon for space type
  const getSpaceIcon = (type: string, isFastTrack: boolean) => {
    const size = isFastTrack ? 'w-6 h-6' : 'w-5 h-5';
    switch (type) {
      case 'START': return <MapPin className={`${size} ${isFastTrack ? 'text-amber-600' : 'text-purple-600'}`} />;
      case 'PAYCHECK': return <DollarSign className={`${size} ${isFastTrack ? 'text-amber-600' : 'text-yellow-600'}`} />;
      case 'OPPORTUNITY': return <Zap className={`${size} text-green-600`} />;
      case 'DOODAD': return <ShoppingBag className={`${size} text-red-600`} />;
      case 'CHARITY': return <Heart className={`${size} text-pink-500`} />;
      case 'MARKET': return <span className={isFastTrack ? "text-xl" : "text-lg"}>📈</span>;
      // Fast Track Specific
      case 'BUSINESS': return <Briefcase className={`${size} text-emerald-600`} />;
      case 'DREAM': return <Star className={`${size} text-fuchsia-600 fill-fuchsia-300`} />;
      case 'AUDIT': return <AlertTriangle className={`${size} text-orange-600`} />;
      default: return null;
    }
  };

  const getSpaceColor = (type: string, isFastTrack: boolean) => {
    if (isFastTrack) {
      switch (type) {
        case 'START': return 'bg-amber-200 border-amber-500';
        case 'PAYCHECK': return 'bg-yellow-200 border-yellow-500';
        case 'BUSINESS': return 'bg-emerald-200 border-emerald-500';
        case 'DREAM': return 'bg-fuchsia-200 border-fuchsia-500 ring-2 ring-fuchsia-300';
        case 'AUDIT': return 'bg-orange-200 border-orange-500';
        case 'CHARITY': return 'bg-pink-200 border-pink-500';
        case 'MARKET': return 'bg-blue-200 border-blue-500';
        default: return 'bg-amber-100 border-amber-300';
      }
    }

    switch (type) {
      case 'START': return 'bg-purple-100 border-purple-300';
      case 'PAYCHECK': return 'bg-yellow-100 border-yellow-300';
      case 'OPPORTUNITY': return 'bg-green-100 border-green-300';
      case 'DOODAD': return 'bg-red-100 border-red-300';
      case 'CHARITY': return 'bg-pink-100 border-pink-300';
      case 'MARKET': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100';
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

  // Render a single board track
  const renderBoard = (
    spaces: string[],
    boardPlayers: Player[],
    isFastTrack: boolean,
    title: string,
    icon: React.ReactNode
  ) => {
    const isCurrentPlayerHere = currentPlayer && currentPlayer.hasEscaped === isFastTrack;

    return (
      <div className={`rounded-xl shadow-lg border p-4 transition-all duration-500 ${
        isFastTrack
          ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
          : 'bg-white border-slate-200'
      } ${isCurrentPlayerHere ? 'ring-2 ring-blue-400 ring-offset-2' : 'opacity-80'}`}>

        {/* Board Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${
            isFastTrack ? 'text-amber-800' : 'text-slate-700'
          }`}>
            {icon}
            {title}
          </h3>
          <div className="flex items-center gap-1">
            {boardPlayers.map(p => (
              <div
                key={p.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 ${
                  p.id === currentPlayerId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white'
                }`}
                title={p.name}
              >
                {p.avatar}
              </div>
            ))}
            {boardPlayers.length === 0 && (
              <span className="text-xs text-slate-400 italic">誰もいません</span>
            )}
          </div>
        </div>

        {/* Board Grid */}
        <div className={`grid gap-2 ${
          isFastTrack ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
        }`}>
          {spaces.map((spaceType, index) => (
            <div
              key={index}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${getSpaceColor(spaceType, isFastTrack)} transition-all ${
                isFastTrack ? 'min-h-[70px]' : 'min-h-[60px]'
              }`}
            >
              {/* Space Icon */}
              <div className="mb-1">{getSpaceIcon(spaceType, isFastTrack)}</div>

              {/* Space Label */}
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                isFastTrack ? 'text-slate-700' : 'text-slate-600'
              }`}>
                {getSpaceLabel(spaceType)}
              </span>

              {/* Space Number */}
              <span className="absolute top-1 left-1.5 text-[9px] text-slate-400 font-mono">
                {index + 1}
              </span>

              {/* Players on this space */}
              <div className="flex -space-x-2 mt-1 absolute bottom-1">
                {boardPlayers.filter(p => p.position === index).map(p => (
                  <div
                    key={p.id}
                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm bg-white z-10
                      ${p.id === currentPlayerId ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'opacity-80'}
                    `}
                    title={p.name}
                  >
                    {p.avatar}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Board Description */}
        <div className={`mt-3 text-center text-xs font-medium ${
          isFastTrack ? 'text-amber-700' : 'text-slate-500'
        }`}>
          {isFastTrack
            ? '💎 ここは投資家・オーナーの世界。投資額もリターンも桁違い！夢を買えば勝利！'
            : '🐹 ラットレース：不労所得が支出を超えたら脱出！'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Fast Track (Investor Board) - Always shown at top when anyone is there or as goal */}
      <div className={`transition-all duration-500 ${fastTrackPlayers.length > 0 ? '' : 'opacity-60'}`}>
        {renderBoard(
          FAST_TRACK_SPACES,
          fastTrackPlayers,
          true,
          '投資家トラック (オーナー・投資家コース)',
          <Crown className="w-5 h-5 text-amber-500 fill-amber-300" />
        )}
        {fastTrackPlayers.length === 0 && (
          <div className="text-center -mt-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              <Rocket className="w-3 h-3" />
              ラットレースを脱出するとここに移動！
            </span>
          </div>
        )}
      </div>

      {/* Rat Race Board - Always shown */}
      {renderBoard(
        BOARD_SPACES,
        ratRacePlayers,
        false,
        'ラットレース (一般コース)',
        <MapPin className="w-5 h-5 text-blue-500" />
      )}
    </div>
  );
};
