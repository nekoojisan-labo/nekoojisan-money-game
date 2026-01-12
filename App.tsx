import React, { useState, useEffect, useRef } from 'react';
import { 
  Player, GameState, GamePhase, GameCard, GameLog, Asset 
} from './types';
import { 
  INITIAL_PLAYERS, BOARD_SPACES, BOARD_SIZE, FAST_TRACK_SPACES,
  OPPORTUNITY_CARDS, DOODAD_CARDS, FAST_TRACK_OPPORTUNITIES, FAST_TRACK_DOODADS
} from './constants';
import { GameBoard } from './components/GameBoard';
import { FinancialSheet } from './components/FinancialSheet';
import { Button } from './components/Button';
import { getCoachHint } from './services/coachService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Lightbulb, User, Users, RefreshCcw, TrendingUp, Trophy, Star } from 'lucide-react';

export default function App() {
  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>({
    players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)), // Deep copy to prevent reference issues on restart
    currentPlayerIndex: 0,
    turnCount: 1,
    phase: 'SETUP',
    currentCard: null,
    diceRoll: null,
    logs: [{ id: 'init', message: 'ゲームを開始しました！', turn: 1, timestamp: Date.now() }],
    winner: null,
    isCoachLoading: false,
    coachMessage: null,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  // Helper: Add Log
  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, { id: Date.now().toString(), message, turn: prev.turnCount, timestamp: Date.now() }]
    }));
  };

  // Helper: Next Phase
  const advanceTurn = () => {
    setGameState(prev => {
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const nextTurnCount = nextIndex === 0 ? prev.turnCount + 1 : prev.turnCount;
      return {
        ...prev,
        currentPlayerIndex: nextIndex,
        turnCount: nextTurnCount,
        phase: 'ROLL', // Reset to ROLL phase
        currentCard: null,
        diceRoll: null,
        coachMessage: null,
      };
    });
  };

  // Helper: Get Current Player
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.type === 'HUMAN';
  const isFastTrack = currentPlayer.hasEscaped;

  // --- Actions ---

  const startGame = () => {
    setGameState(prev => ({ ...prev, phase: 'ROLL' }));
    addLog(`${currentPlayer.name}のターンです。`);
  };

  const restartGame = () => {
    setGameState({
        players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
        currentPlayerIndex: 0,
        turnCount: 1,
        phase: 'SETUP',
        currentCard: null,
        diceRoll: null,
        logs: [{ id: 'init', message: 'ゲームを開始しました！', turn: 1, timestamp: Date.now() }],
        winner: null,
        isCoachLoading: false,
        coachMessage: null,
    });
  };

  const rollDice = () => {
    // Fast track uses 2 dice or simply moves faster (1-6 for now but semantic could be 2 dice)
    const roll = Math.ceil(Math.random() * 6);
    
    // Board logic depends on whether player is on fast track
    const currentBoard = isFastTrack ? FAST_TRACK_SPACES : BOARD_SPACES;
    const newPosition = (currentPlayer.position + roll) % currentBoard.length;
    const spaceType = currentBoard[newPosition];

    // Update position immediately
    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      updatedPlayers[prev.currentPlayerIndex].position = newPosition;
      return {
        ...prev,
        diceRoll: roll,
        players: updatedPlayers,
        phase: 'MOVE' // Intermediate phase for animation if needed, effectively going to ACTION
      };
    });

    addLog(`${currentPlayer.name}はサイコロを振って ${roll} が出た！ 「${spaceType === 'BUSINESS' ? 'ビジネス' : spaceType === 'OPPORTUNITY' ? 'チャンス' : spaceType}」に止まった。`);

    // Handle Space Logic after short delay
    setTimeout(() => {
      handleSpaceLanding(spaceType, newPosition);
    }, 1000);
  };

  const handleSpaceLanding = (type: string, position: number) => {
    const isPassingStart = position < currentPlayer.position; // Simple check
    
    // PAYCHECK Logic
    if (type === 'PAYCHECK' || position === 0) { 
      const updatedPlayers = [...gameState.players];
      const player = updatedPlayers[gameState.currentPlayerIndex];
      const monthlyCashflow = (player.salary + player.passiveIncome) - player.monthlyExpenses;
      
      const income = isFastTrack ? monthlyCashflow + 10000 : monthlyCashflow; 
      
      player.cash += income;
      
      addLog(`${currentPlayer.name}は給料日！ ${income.toLocaleString()} を受け取りました。`);
      
      setGameState(prev => ({ ...prev, players: updatedPlayers, phase: 'END_TURN' }));
      return;
    }

    if (type === 'OPPORTUNITY' || type === 'BUSINESS') {
      const deck = isFastTrack ? FAST_TRACK_OPPORTUNITIES : OPPORTUNITY_CARDS;
      const randomCard = deck[Math.floor(Math.random() * deck.length)];
      setGameState(prev => ({ ...prev, currentCard: randomCard, phase: 'DECISION' }));
      addLog(`${currentPlayer.name}は「${randomCard.title}」のチャンスを見つけました。`);
    } else if (type === 'DOODAD' || type === 'AUDIT') {
      const deck = isFastTrack ? FAST_TRACK_DOODADS : DOODAD_CARDS;
      const randomCard = deck[Math.floor(Math.random() * deck.length)];
      setGameState(prev => ({ ...prev, currentCard: randomCard, phase: 'DECISION' }));
      addLog(`${currentPlayer.name}にトラブル発生！「${randomCard.title}」`);
    } else if (type === 'DREAM') {
       // Only on Fast Track
       const randomCard = FAST_TRACK_OPPORTUNITIES.find(c => c.type === 'DREAM') || FAST_TRACK_OPPORTUNITIES[0];
       setGameState(prev => ({ ...prev, currentCard: randomCard, phase: 'DECISION' }));
       addLog(`${currentPlayer.name}は夢のアイテム「${randomCard.title}」を見つけました！`);
    } else {
      addLog(`特別なイベントは発生しませんでした。`);
      setGameState(prev => ({ ...prev, phase: 'END_TURN' }));
    }
  };

  const handleBuyAsset = () => {
    if (!gameState.currentCard) return;
    
    const cost = gameState.currentCard.cost || 0;
    const cashflow = gameState.currentCard.cashflow || 0;

    if (currentPlayer.cash < cost) {
      addLog(`資金不足で購入できません！ (必要: ${cost}, 所持: ${currentPlayer.cash})`);
      return;
    }

    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const player = updatedPlayers[prev.currentPlayerIndex];
      player.cash -= cost;
      
      // Handle Dreams vs Assets
      if (gameState.currentCard?.type === 'DREAM') {
          player.dreams.push(gameState.currentCard);
          // VICTORY!
          return { ...prev, players: updatedPlayers, phase: 'GAME_OVER', winner: player };
      } else {
          // Regular Asset
          const newAsset: Asset = {
            id: Date.now().toString(),
            name: gameState.currentCard!.title,
            cost,
            cashflow,
            type: 'BUSINESS'
          };
          player.assets.push(newAsset);
          player.passiveIncome += cashflow;
          
          // Check Rat Race Escape Condition
          if (!player.hasEscaped && player.passiveIncome > player.monthlyExpenses) {
            player.hasEscaped = true;
            player.cash += 100000; // Bonus for escaping
            player.position = 0; // Reset position for Fast Track
          }
      }

      return { ...prev, players: updatedPlayers, phase: 'END_TURN' };
    });

    if (gameState.currentCard.type === 'DREAM') {
        addLog(`🏆 ${currentPlayer.name} が夢を叶えてゲームに勝利しました！！`);
    } else {
        if (!currentPlayer.hasEscaped && (currentPlayer.passiveIncome + cashflow) > currentPlayer.monthlyExpenses) {
            addLog(`🎉 おめでとう！！ ${currentPlayer.name} はラットレースを脱出した！ ファーストトラックへ移動します！`);
        } else {
            addLog(`${currentPlayer.name}は「${gameState.currentCard.title}」を購入しました！(不労所得 +${cashflow})`);
        }
    }
  };

  const handlePayDoodad = () => {
    if (!gameState.currentCard) return;
    const cost = gameState.currentCard.cost || 0;

    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const player = updatedPlayers[prev.currentPlayerIndex];
      player.cash -= cost;
      return { ...prev, players: updatedPlayers, phase: 'END_TURN' };
    });
    addLog(`${currentPlayer.name}は${cost}を支払いました。`);
  };

  const handlePass = () => {
    addLog(`${currentPlayer.name}は見送りました。`);
    setGameState(prev => ({ ...prev, phase: 'END_TURN' }));
  };

  // --- Coach AI Logic ---
  const askCoach = async () => {
    if (!gameState.currentCard) return;
    
    setGameState(prev => ({ ...prev, isCoachLoading: true, coachMessage: null }));
    
    try {
      const message = await getCoachHint(currentPlayer, gameState.currentCard);
      setGameState(prev => ({ ...prev, isCoachLoading: false, coachMessage: message }));
    } catch (e) {
      setGameState(prev => ({ ...prev, isCoachLoading: false, coachMessage: 'エラーが発生しました' }));
    }
  };

  // --- AI Turn Automation ---
  useEffect(() => {
    if (!isHumanTurn && gameState.phase !== 'GAME_OVER') {
      const aiThinkingTime = 1500;
      
      if (gameState.phase === 'ROLL') {
        setTimeout(() => rollDice(), aiThinkingTime);
      } else if (gameState.phase === 'DECISION' && gameState.currentCard) {
        setTimeout(() => {
          // Simple AI logic
          const card = gameState.currentCard!;
          if (['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(card.type)) {
            const cost = card.cost || 0;
            if (currentPlayer.cash >= cost) {
              handleBuyAsset();
            } else {
              handlePass();
            }
          } else if (['DOODAD', 'AUDIT'].includes(card.type)) {
            handlePayDoodad();
          } else {
             handlePass();
          }
        }, aiThinkingTime);
      } else if (gameState.phase === 'END_TURN') {
        setTimeout(() => advanceTurn(), 1000);
      }
    }
  }, [gameState.phase, gameState.currentPlayerIndex]);


  // --- Render ---

  if (gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-500 bg-opacity-10 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-4xl font-extrabold text-green-600 mb-2">Money Adventure</h1>
          <p className="text-slate-500 mb-8">みんなで協力してラットレースを脱出しよう！</p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg text-left">
              <h3 className="font-bold text-slate-700 mb-2">あそびかた</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>サイコロを振ってボードを進もう</li>
                <li>「チャンス」マスで資産を買おう</li>
                <li><span className="font-bold text-red-500">不労所得 &gt; 総支出</span> でクリア！</li>
              </ul>
            </div>
            <Button size="lg" onClick={startGame} className="w-full">
              ゲームスタート！
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME OVER SCREEN ---
  if (gameState.phase === 'GAME_OVER' && gameState.winner) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-yellow-400 p-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-yellow-400 to-yellow-600 animate-pulse"></div>
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center z-10 border-4 border-yellow-300 transform scale-100 hover:scale-105 transition-transform">
                <div className="text-8xl mb-4 animate-bounce">🏆</div>
                <h1 className="text-4xl font-extrabold text-yellow-600 mb-2">WINNER!</h1>
                <p className="text-2xl text-slate-700 font-bold mb-6">
                    優勝者は {gameState.winner.name} です！
                </p>
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
                    <p className="text-slate-500 text-sm mb-2">叶えた夢</p>
                    <p className="text-xl font-bold text-purple-600 flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 fill-purple-600" />
                        {gameState.winner.dreams[0]?.title || "最高の人生"}
                    </p>
                </div>
                <Button size="lg" onClick={restartGame} className="w-full animate-pulse shadow-xl">
                    もう一度遊ぶ
                </Button>
            </div>
             {/* Confetti-like decoration elements could go here */}
        </div>
      );
  }

  return (
    <div className={`min-h-screen pb-20 md:pb-0 transition-colors duration-1000 ${isFastTrack ? 'bg-amber-50' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐢</span>
          <h1 className="font-bold text-slate-700 hidden sm:block">Money Adventure</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
            ターン {gameState.turnCount}
          </div>
          <div className="flex -space-x-2">
            {gameState.players.map(p => (
              <div key={p.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-slate-200 text-sm ${p.hasEscaped ? 'ring-2 ring-amber-400 bg-amber-100' : ''}`} title={p.name}>
                {p.avatar}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:grid md:grid-cols-12 md:gap-6">
        
        {/* Left Col: Board & Actions */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <GameBoard players={gameState.players} currentPlayerId={currentPlayer.id} />

          {/* Action Area */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-5 [background-size:16px_16px] ${isFastTrack ? 'bg-[radial-gradient(#d97706_1px,transparent_1px)]' : 'bg-[radial-gradient(#444cf7_1px,transparent_1px)]'}`}></div>

            {gameState.phase === 'ROLL' && (
              <div className="text-center z-10 animate-in fade-in zoom-in duration-300">
                <div className="text-6xl mb-6 animate-bounce">🎲</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {isHumanTurn ? 'あなたの番です' : `${currentPlayer.name}の番です`}
                </h2>
                <p className="text-slate-500 mb-6">
                   {isFastTrack ? 'ファーストトラックを突き進め！' : 'サイコロを振って運命を決めよう！'}
                </p>
                {isHumanTurn && (
                  <Button size="lg" onClick={rollDice} className={isFastTrack ? "shadow-xl shadow-amber-200 bg-amber-500 hover:bg-amber-600 border-amber-700" : "shadow-xl shadow-green-200"}>
                    サイコロを振る
                  </Button>
                )}
                {!isHumanTurn && (
                  <p className="text-sm text-slate-400">考え中...</p>
                )}
              </div>
            )}

            {gameState.phase === 'DECISION' && gameState.currentCard && (
              <div className="w-full max-w-md z-10 animate-in slide-in-from-bottom duration-500">
                <div className={`border-t-8 rounded-xl bg-white shadow-2xl overflow-hidden ${['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(gameState.currentCard.type) ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(gameState.currentCard.type) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {gameState.currentCard.type === 'OPPORTUNITY' ? 'チャンス！' : 
                         gameState.currentCard.type === 'BUSINESS' ? 'ビッグビジネス！' :
                         gameState.currentCard.type === 'DREAM' ? '夢の実現' :
                         '支払い...'}
                      </span>
                      {gameState.currentCard.cost && (
                        <span className="text-xl font-bold text-slate-800">
                           -{gameState.currentCard.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{gameState.currentCard.title}</h3>
                    <p className="text-slate-600 mb-6">{gameState.currentCard.description}</p>
                    
                    {gameState.currentCard.cashflow && gameState.currentCard.cashflow > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg mb-6 flex items-center gap-2 text-green-700 font-bold border border-green-200">
                        <TrendingUp className="w-5 h-5" />
                        毎月の収入が +{gameState.currentCard.cashflow.toLocaleString()} 増えます！
                      </div>
                    )}

                    {/* Coach AI Section */}
                    {isHumanTurn && (
                      <div className="mb-6">
                        {!gameState.coachMessage ? (
                          <button 
                            onClick={askCoach}
                            disabled={gameState.isCoachLoading}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:bg-purple-50 px-3 py-2 rounded transition-colors w-full justify-center border border-dashed border-purple-300"
                          >
                            <Lightbulb className={`w-4 h-4 ${gameState.isCoachLoading ? 'animate-pulse' : ''}`} />
                            {gameState.isCoachLoading ? 'コーチが考え中...' : 'AIコーチにヒントを聞く'}
                          </button>
                        ) : (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 relative">
                            <div className="absolute -top-3 -left-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="text-xs">🤖</span> コーチからのヒント
                            </div>
                            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{gameState.coachMessage}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {isHumanTurn ? (
                        <>
                          <Button variant="outline" onClick={handlePass}>
                            パスする
                          </Button>
                          {['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(gameState.currentCard.type) ? (
                            <Button onClick={handleBuyAsset} disabled={currentPlayer.cash < (gameState.currentCard.cost || 0)}>
                              {gameState.currentCard.type === 'DREAM' ? '夢を買う！' : '購入する'}
                            </Button>
                          ) : (
                             <Button variant="danger" onClick={handlePayDoodad}>
                              支払う
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="col-span-2 text-center text-slate-400 text-sm py-2">
                          {currentPlayer.name}が判断しています...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState.phase === 'END_TURN' && (
              <div className="text-center z-10">
                <h3 className="text-xl font-bold text-slate-700 mb-4">ターン終了</h3>
                {isHumanTurn && (
                  <Button onClick={advanceTurn} className="mx-auto">
                    次の人へ
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Stats & Logs */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6 mt-6 md:mt-0">
          
          {/* Current Player Sheet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">財務シート</h3>
            </div>
            <div className="space-y-4">
              {gameState.players.map(player => (
                <FinancialSheet 
                  key={player.id} 
                  player={player} 
                  isCurrentUser={player.id === currentPlayer.id} 
                />
              ))}
            </div>
          </div>

          {/* Game Log */}
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col max-h-[300px]">
            <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              ゲームログ
            </div>
            <div ref={scrollRef} className="p-4 overflow-y-auto space-y-3 flex-1 bg-white scrollbar-hide">
              {gameState.logs.map((log) => (
                <div key={log.id} className="text-sm border-l-2 border-slate-200 pl-3 py-1">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ターン {log.turn}</span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar (Only visible when actions needed on mobile) */}
      {isHumanTurn && gameState.phase === 'ROLL' && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
           <Button size="lg" onClick={rollDice} className="w-full shadow-lg">
              🎲 サイコロを振る
           </Button>
        </div>
      )}
    </div>
  );
}