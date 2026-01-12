import React from 'react';
import { Player } from '../types';
import { BOARD_SPACES, FAST_TRACK_SPACES } from '../constants';
import { MapPin, DollarSign, Zap, ShoppingBag, Heart, Briefcase, Star, AlertTriangle } from 'lucide-react';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ players, currentPlayerId }) => {
  // Determine which board to show based on the current player
  // If the current player has escaped, show the Fast Track board
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isFastTrack = currentPlayer?.hasEscaped || false;
  
  const currentSpaces = isFastTrack ? FAST_TRACK_SPACES : BOARD_SPACES;

  // Helper to get icon for space type
  const getSpaceIcon = (type: string) => {
    switch (type) {
      case 'START': return <MapPin className={`w-5 h-5 ${isFastTrack ? 'text-amber-600' : 'text-purple-600'}`} />;
      case 'PAYCHECK': return <DollarSign className={`w-5 h-5 ${isFastTrack ? 'text-amber-600' : 'text-yellow-600'}`} />;
      case 'OPPORTUNITY': return <Zap className="w-5 h-5 text-green-600" />;
      case 'DOODAD': return <ShoppingBag className="w-5 h-5 text-red-600" />;
      case 'CHARITY': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'MARKET': return <span className="text-lg">📈</span>;
      // Fast Track Specific
      case 'BUSINESS': return <Briefcase className="w-5 h-5 text-emerald-600" />;
      case 'DREAM': return <Star className="w-5 h-5 text-fuchsia-600" />;
      case 'AUDIT': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const getSpaceColor = (type: string) => {
    if (isFastTrack) {
        switch (type) {
            case 'START': return 'bg-amber-100 border-amber-400';
            case 'PAYCHECK': return 'bg-yellow-100 border-yellow-400';
            case 'BUSINESS': return 'bg-emerald-100 border-emerald-400';
            case 'DREAM': return 'bg-fuchsia-100 border-fuchsia-400';
            case 'AUDIT': return 'bg-orange-100 border-orange-400';
            case 'CHARITY': return 'bg-pink-100 border-pink-400';
            case 'MARKET': return 'bg-blue-100 border-blue-400';
            default: return 'bg-amber-50 border-amber-200';
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
        default: return type;
    }
  }

  return (
    <div className={`w-full rounded-xl shadow-lg border p-4 mb-6 transition-colors duration-500 ${isFastTrack ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isFastTrack ? 'text-amber-800' : 'text-slate-700'}`}>
        {isFastTrack ? <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> : <MapPin className="w-5 h-5 text-blue-500" />}
        {isFastTrack ? 'ファースト・トラック (富裕層コース)' : 'ラットレース (一般コース)'}
      </h3>
      
      {/* Simple Grid Representation of a Circular Board */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {currentSpaces.map((spaceType, index) => (
          <div 
            key={index}
            className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${getSpaceColor(spaceType)} transition-all`}
          >
            {/* Space Label */}
            <div className="mb-1">{getSpaceIcon(spaceType)}</div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isFastTrack ? 'text-slate-700' : 'text-slate-600'}`}>
              {getSpaceLabel(spaceType)}
            </span>

            {/* Space Number */}
            <span className="absolute top-1 left-2 text-[10px] text-slate-400 font-mono">
              {index + 1}
            </span>

            {/* Players on this space */}
            <div className="flex -space-x-2 mt-2 absolute bottom-2">
              {players.filter(p => p.position === index && p.hasEscaped === isFastTrack).map(p => (
                <div 
                  key={p.id} 
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-lg shadow-sm bg-white z-10 
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
      {isFastTrack && (
         <div className="mt-2 text-center text-xs text-amber-700 font-medium">
             ここは富裕層の世界です。投資額もリターンも桁違いです！
         </div>
      )}
    </div>
  );
};