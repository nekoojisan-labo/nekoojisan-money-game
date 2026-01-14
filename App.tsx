import React, { useState, useEffect, useRef } from 'react';
import {
  Player, GameState, GamePhase, GameCard, GameLog, Asset, LifeGoal, DifficultyLevel
} from './types';
import {
  INITIAL_PLAYERS, BOARD_SPACES, BOARD_SIZE, FAST_TRACK_SPACES,
  OPPORTUNITY_CARDS, DOODAD_CARDS, FAST_TRACK_OPPORTUNITIES, FAST_TRACK_DOODADS,
  LIFE_GOALS, CHARITY_CARDS, SUPPORT_OPTIONS, DIFFICULTY_SETTINGS, AI_DIALOGS, RANDOM_EVENTS
} from './constants';
import { GameBoard } from './components/GameBoard';
import { FinancialSheet } from './components/FinancialSheet';
import { Button } from './components/Button';
import { getCoachHint } from './services/coachService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Lightbulb, User, Users, RefreshCcw, TrendingUp, Trophy, Star, Heart, Handshake, Target, Sparkles, MessageCircle } from 'lucide-react';

// Helper to get random dialog
const getRandomDialog = (category: keyof typeof AI_DIALOGS): string => {
  const dialogs = AI_DIALOGS[category];
  return dialogs[Math.floor(Math.random() * dialogs.length)];
};

// Apply difficulty settings to players
const applyDifficultyToPlayers = (players: Player[], difficulty: DifficultyLevel): Player[] => {
  const settings = DIFFICULTY_SETTINGS.find(d => d.id === difficulty)!;
  return players.map(p => ({
    ...p,
    cash: Math.floor(p.cash * settings.startingCashMultiplier),
    monthlyExpenses: Math.floor(p.monthlyExpenses * settings.expenseMultiplier),
  }));
};

// Apply difficulty to goals
const applyDifficultyToGoals = (goals: LifeGoal[], difficulty: DifficultyLevel): LifeGoal[] => {
  const settings = DIFFICULTY_SETTINGS.find(d => d.id === difficulty)!;
  return goals.map(g => ({
    ...g,
    requiredCash: Math.floor(g.requiredCash * settings.goalMultiplier),
  }));
};

export default function App() {
  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>({
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
    difficulty: 'teen',
    goalSelectingPlayerIndex: 0,
    supportTargetId: null,
    supportType: null,
    supportRequest: null,
    eventMessage: null,
  });

  // AI speech bubble state
  const [aiSpeech, setAiSpeech] = useState<{ name: string; message: string } | null>(null);

  // Sell modal state
  const [showSellModal, setShowSellModal] = useState(false);

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

  // Helper: Check escape condition for a player
  const checkEscapeCondition = (player: Player): boolean => {
    return !player.hasEscaped && player.passiveIncome >= player.monthlyExpenses;
  };

  // Helper: Check if player achieved their life goal
  const checkGoalAchieved = (player: Player): boolean => {
    if (!player.selectedGoal || !player.hasEscaped) return false;
    return player.cash >= player.selectedGoal.requiredCash;
  };

  // Helper: Next Phase
  const advanceTurn = () => {
    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const currentIdx = prev.currentPlayerIndex;
      const player = updatedPlayers[currentIdx];

      // Decrement charity turns
      if (player.charityTurnsRemaining > 0) {
        player.charityTurnsRemaining--;
      }

      // Double-check escape condition at turn end
      if (checkEscapeCondition(player)) {
        player.hasEscaped = true;
        player.cash += 100000;
        player.position = 0;
      }

      const nextIndex = (currentIdx + 1) % prev.players.length;
      const nextTurnCount = nextIndex === 0 ? prev.turnCount + 1 : prev.turnCount;
      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextIndex,
        turnCount: nextTurnCount,
        phase: 'ROLL',
        currentCard: null,
        diceRoll: null,
        coachMessage: null,
        supportTargetId: null,
        supportType: null,
      };
    });
  };

  // Helper: Get Current Player
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer?.type === 'HUMAN';
  const isFastTrack = currentPlayer?.hasEscaped || false;

  // Get Rat Race players (for support actions)
  const ratRacePlayers = gameState.players.filter(p => !p.hasEscaped && p.id !== currentPlayer?.id);

  // Get Fast Track players (for requesting support)
  const fastTrackPlayers = gameState.players.filter(p => p.hasEscaped && p.id !== currentPlayer?.id);

  // Check if human is on Fast Track (can respond to support requests)
  const humanFastTrackPlayer = gameState.players.find(p => p.type === 'HUMAN' && p.hasEscaped);

  // --- Actions ---

  // Show AI speech bubble temporarily
  const showAiSpeech = (name: string, message: string) => {
    setAiSpeech({ name, message });
    setTimeout(() => setAiSpeech(null), 2500);
  };

  // Set difficulty and start game
  const selectDifficulty = (difficulty: DifficultyLevel) => {
    const adjustedPlayers = applyDifficultyToPlayers(JSON.parse(JSON.stringify(INITIAL_PLAYERS)), difficulty);
    setGameState(prev => ({
      ...prev,
      difficulty,
      players: adjustedPlayers,
      phase: 'GOAL_SELECT',
      goalSelectingPlayerIndex: 0,
    }));
  };

  const startGoalSelection = () => {
    setGameState(prev => ({ ...prev, phase: 'GOAL_SELECT', goalSelectingPlayerIndex: 0 }));
  };

  // Get adjusted goals based on difficulty
  const adjustedGoals = applyDifficultyToGoals(LIFE_GOALS, gameState.difficulty);

  const selectGoal = (goal: LifeGoal) => {
    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const selectingPlayer = updatedPlayers[prev.goalSelectingPlayerIndex];
      selectingPlayer.selectedGoal = goal;

      addLog(`${selectingPlayer.name}は「${goal.title}」を人生の目標に選びました！`);

      const nextIndex = prev.goalSelectingPlayerIndex + 1;
      if (nextIndex >= prev.players.length) {
        // All players have selected, start the game
        return {
          ...prev,
          players: updatedPlayers,
          phase: 'ROLL',
          goalSelectingPlayerIndex: 0,
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        goalSelectingPlayerIndex: nextIndex,
      };
    });
  };

  // AI auto-selects goal (with personality influence)
  useEffect(() => {
    if (gameState.phase === 'GOAL_SELECT') {
      const selectingPlayer = gameState.players[gameState.goalSelectingPlayerIndex];
      if (selectingPlayer && selectingPlayer.type === 'AI') {
        setTimeout(() => {
          const goals = applyDifficultyToGoals(LIFE_GOALS, gameState.difficulty);
          // AI personality influences goal choice
          const behavior = selectingPlayer.aiBehavior;
          let selectedGoal;
          if (behavior?.personality === 'aggressive' || behavior?.personality === 'gambler') {
            // Pick more expensive goals
            const expensiveGoals = [...goals].sort((a, b) => b.requiredCash - a.requiredCash);
            selectedGoal = expensiveGoals[Math.floor(Math.random() * 2)]; // Top 2 expensive
          } else if (behavior?.personality === 'cautious') {
            // Pick cheaper goals
            const cheapGoals = [...goals].sort((a, b) => a.requiredCash - b.requiredCash);
            selectedGoal = cheapGoals[Math.floor(Math.random() * 2)]; // Top 2 cheap
          } else {
            selectedGoal = goals[Math.floor(Math.random() * goals.length)];
          }
          selectGoal(selectedGoal);
        }, 1000);
      }
    }
  }, [gameState.phase, gameState.goalSelectingPlayerIndex]);

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
      difficulty: 'teen',
      goalSelectingPlayerIndex: 0,
      supportTargetId: null,
      supportType: null,
      eventMessage: null,
    });
    setAiSpeech(null);
  };

  // AI decision making based on personality
  const makeAiDecision = (player: Player, card: GameCard): 'buy' | 'pass' | 'donate' => {
    const behavior = player.aiBehavior;
    if (!behavior) return Math.random() > 0.5 ? 'buy' : 'pass';

    const cost = card.cost || 0;
    const cashRatio = cost / player.cash;

    if (card.type === 'CHARITY') {
      return Math.random() < behavior.charityChance ? 'donate' : 'pass';
    }

    if (['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(card.type)) {
      // Check if can afford
      if (player.cash < cost) return 'pass';

      // Risk tolerance check
      if (cashRatio > behavior.buyThreshold) {
        // Only buy if risk tolerance allows
        return Math.random() < behavior.riskTolerance ? 'buy' : 'pass';
      }
      return 'buy';
    }

    return 'pass';
  };

  const rollDice = () => {
    // Check if player has charity bonus (2 dice)
    const useDoubleDice = currentPlayer.charityTurnsRemaining > 0;
    const roll1 = Math.ceil(Math.random() * 6);
    const roll2 = useDoubleDice ? Math.ceil(Math.random() * 6) : 0;
    const roll = useDoubleDice ? roll1 + roll2 : roll1;

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
        phase: 'MOVE'
      };
    });

    const diceMessage = useDoubleDice
      ? `${currentPlayer.name}はサイコロを2個振って ${roll1}+${roll2}=${roll} が出た！`
      : `${currentPlayer.name}はサイコロを振って ${roll} が出た！`;
    addLog(`${diceMessage} 「${getSpaceLabel(spaceType)}」に止まった。`);

    // Handle Space Logic after short delay
    setTimeout(() => {
      handleSpaceLanding(spaceType, newPosition);
    }, 1000);
  };

  const getSpaceLabel = (type: string): string => {
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

  const handleSpaceLanding = (type: string, position: number) => {
    // PAYCHECK Logic
    if (type === 'PAYCHECK' || position === 0) {
      const updatedPlayers = [...gameState.players];
      const player = updatedPlayers[gameState.currentPlayerIndex];
      const monthlyCashflow = (player.salary + player.passiveIncome) - player.monthlyExpenses;

      // Add support bonus if any
      const supportBonus = player.supportBonus;
      player.supportBonus = 0; // Reset after use

      const income = isFastTrack ? monthlyCashflow + 10000 + supportBonus : monthlyCashflow + supportBonus;

      player.cash += income;

      if (supportBonus > 0) {
        addLog(`${currentPlayer.name}は給料日！ ${income.toLocaleString()} を受け取りました（支援ボーナス含む）。`);
      } else {
        addLog(`${currentPlayer.name}は給料日！ ${income.toLocaleString()} を受け取りました。`);
      }

      // Check if goal achieved
      if (checkGoalAchieved(player)) {
        setGameState(prev => ({ ...prev, players: updatedPlayers, phase: 'GAME_OVER', winner: player }));
        addLog(`🎉 ${player.name}が人生の目標「${player.selectedGoal?.title}」を達成しました！`);
        return;
      }

      setGameState(prev => ({ ...prev, players: updatedPlayers, phase: 'END_TURN' }));
      return;
    }

    if (type === 'CHARITY') {
      const charityCard = CHARITY_CARDS[Math.floor(Math.random() * CHARITY_CARDS.length)];
      setGameState(prev => ({ ...prev, currentCard: charityCard, phase: 'DECISION' }));
      addLog(`${currentPlayer.name}は寄付のチャンスです！`);
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
      // Check if player can achieve their life goal here
      if (currentPlayer.selectedGoal && currentPlayer.cash >= currentPlayer.selectedGoal.requiredCash) {
        // Create a card for the player's goal
        const goalCard: GameCard = {
          id: 'goal_achievement',
          type: 'DREAM',
          title: currentPlayer.selectedGoal.title,
          description: `人生の目標を達成！${currentPlayer.selectedGoal.description}`,
          cost: currentPlayer.selectedGoal.requiredCash,
          cashflow: 0,
        };
        setGameState(prev => ({ ...prev, currentCard: goalCard, phase: 'DECISION' }));
        addLog(`${currentPlayer.name}は人生の目標「${currentPlayer.selectedGoal.title}」を達成できます！`);
      } else {
        const randomCard = FAST_TRACK_OPPORTUNITIES.find(c => c.type === 'DREAM') || FAST_TRACK_OPPORTUNITIES[0];
        setGameState(prev => ({ ...prev, currentCard: randomCard, phase: 'DECISION' }));
        addLog(`${currentPlayer.name}は夢のアイテム「${randomCard.title}」を見つけました！`);
      }
    } else {
      addLog(`特別なイベントは発生しませんでした。`);
      setGameState(prev => ({ ...prev, phase: 'END_TURN' }));
    }
  };

  const handleDonate = () => {
    if (!gameState.currentCard) return;

    // Calculate donation amount (10% of income or fixed)
    const totalIncome = currentPlayer.salary + currentPlayer.passiveIncome;
    const donationAmount = gameState.currentCard.cost === 0
      ? Math.floor(totalIncome * 0.1)
      : gameState.currentCard.cost;

    if (currentPlayer.cash < donationAmount) {
      addLog(`資金不足で寄付できません！`);
      setGameState(prev => ({ ...prev, phase: 'END_TURN' }));
      return;
    }

    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const player = updatedPlayers[prev.currentPlayerIndex];
      player.cash -= donationAmount;
      player.charityTurnsRemaining = 3; // 3 turns of double dice

      return { ...prev, players: updatedPlayers, phase: 'END_TURN' };
    });

    addLog(`${currentPlayer.name}は${donationAmount}を寄付しました！次の3ターン、サイコロを2個振れます！`);
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
        if (!player.hasEscaped && player.passiveIncome >= player.monthlyExpenses) {
          player.hasEscaped = true;
          player.cash += 100000;
          player.position = 0;
        }
      }

      return { ...prev, players: updatedPlayers, phase: 'END_TURN' };
    });

    if (gameState.currentCard.type === 'DREAM') {
      addLog(`🏆 ${currentPlayer.name} が夢を叶えてゲームに勝利しました！！`);
    } else {
      if (!currentPlayer.hasEscaped && (currentPlayer.passiveIncome + cashflow) >= currentPlayer.monthlyExpenses) {
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

  // --- Support Actions (Fast Track helping Rat Race) ---
  const initiateSupport = () => {
    if (!isFastTrack || ratRacePlayers.length === 0) return;
    setGameState(prev => ({ ...prev, phase: 'SUPPORT' }));
  };

  const executeSupport = (targetId: string, supportType: 'JOB' | 'INVESTMENT') => {
    const support = SUPPORT_OPTIONS[supportType];
    if (currentPlayer.cash < support.costToInvestor) {
      addLog(`資金不足で支援できません！`);
      return;
    }

    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const investor = updatedPlayers[prev.currentPlayerIndex];
      const worker = updatedPlayers.find(p => p.id === targetId);

      if (!worker) return prev;

      investor.cash -= support.costToInvestor;
      investor.passiveIncome += support.benefitToInvestor;

      if (supportType === 'JOB') {
        worker.supportBonus += support.benefitToWorker;
      } else {
        worker.cash += support.benefitToWorker;
      }

      return {
        ...prev,
        players: updatedPlayers,
        phase: 'END_TURN',
        supportTargetId: null,
        supportType: null,
      };
    });

    const targetPlayer = gameState.players.find(p => p.id === targetId);
    if (supportType === 'JOB') {
      addLog(`${currentPlayer.name}が${targetPlayer?.name}に仕事を依頼しました！`);
    } else {
      addLog(`${currentPlayer.name}が${targetPlayer?.name}と共同投資しました！`);
    }
  };

  const skipSupport = () => {
    setGameState(prev => ({ ...prev, phase: 'END_TURN' }));
  };

  // --- Support Request Response (Human Fast Track player responding to AI request) ---
  const acceptSupportRequest = (supportType: 'JOB' | 'INVESTMENT') => {
    if (!gameState.supportRequest || !humanFastTrackPlayer) return;

    const support = SUPPORT_OPTIONS[supportType];
    if (humanFastTrackPlayer.cash < support.costToInvestor) {
      addLog(`資金不足で支援できません！`);
      declineSupportRequest();
      return;
    }

    const requestingPlayerId = gameState.supportRequest.requestingPlayerId;
    const requestingPlayer = gameState.players.find(p => p.id === requestingPlayerId);

    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const investor = updatedPlayers.find(p => p.id === humanFastTrackPlayer.id)!;
      const worker = updatedPlayers.find(p => p.id === requestingPlayerId);

      if (!worker || !investor) return { ...prev, supportRequest: null };

      investor.cash -= support.costToInvestor;
      investor.passiveIncome += support.benefitToInvestor;

      if (supportType === 'JOB') {
        worker.supportBonus += support.benefitToWorker;
      } else {
        worker.cash += support.benefitToWorker;
      }

      return { ...prev, players: updatedPlayers, supportRequest: null };
    });

    if (supportType === 'JOB') {
      addLog(`${humanFastTrackPlayer.name}が${requestingPlayer?.name}に仕事を依頼しました！`);
    } else {
      addLog(`${humanFastTrackPlayer.name}が${requestingPlayer?.name}と共同投資しました！`);
    }
    showAiSpeech(requestingPlayer?.name || '', getRandomDialog('acceptSupport'));

    // AI continues their turn (roll dice)
    setTimeout(() => {
      rollDice();
    }, 1500);
  };

  const declineSupportRequest = () => {
    setGameState(prev => ({ ...prev, supportRequest: null }));
    // AI continues their turn (roll dice)
    setTimeout(() => {
      rollDice();
    }, 500);
  };

  // --- Sell Asset ---
  const handleSellAsset = (assetId: string) => {
    setGameState(prev => {
      const updatedPlayers = [...prev.players];
      const player = updatedPlayers[prev.currentPlayerIndex];
      const assetIndex = player.assets.findIndex(a => a.id === assetId);

      if (assetIndex === -1) return prev;

      const asset = player.assets[assetIndex];
      // Sell at 80% of original cost
      const sellPrice = Math.floor(asset.cost * 0.8);

      player.cash += sellPrice;
      player.passiveIncome -= asset.cashflow;
      player.assets.splice(assetIndex, 1);

      return { ...prev, players: updatedPlayers };
    });

    const asset = currentPlayer.assets.find(a => a.id === assetId);
    if (asset) {
      const sellPrice = Math.floor(asset.cost * 0.8);
      addLog(`${currentPlayer.name}は「${asset.name}」を${sellPrice}で売却しました。`);
    }

    setShowSellModal(false);
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
    if (!isHumanTurn && gameState.phase !== 'GAME_OVER' && currentPlayer) {
      const aiThinkingTime = 1500;
      const behavior = currentPlayer.aiBehavior;

      if (gameState.phase === 'ROLL') {
        setTimeout(() => {
          const isAiFastTrack = currentPlayer.hasEscaped;
          const requestChance = behavior?.requestSupportChance || 0.3;

          // AI in Rat Race: Maybe request support from human Fast Track player
          if (!isAiFastTrack && humanFastTrackPlayer && Math.random() < requestChance) {
            showAiSpeech(currentPlayer.name, getRandomDialog('requestSupport'));
            setGameState(prev => ({
              ...prev,
              supportRequest: {
                requestingPlayerId: currentPlayer.id,
                requestingPlayerName: currentPlayer.name,
              }
            }));
            return; // Wait for human response
          }

          // AI in Fast Track: Maybe offer support before rolling
          if (isAiFastTrack && ratRacePlayers.length > 0) {
            const supportChance = behavior?.supportChance || 0.5;
            if (Math.random() < supportChance) {
              const target = ratRacePlayers[Math.floor(Math.random() * ratRacePlayers.length)];
              const supportType = Math.random() > 0.5 ? 'JOB' : 'INVESTMENT';
              const support = SUPPORT_OPTIONS[supportType];
              if (currentPlayer.cash >= support.costToInvestor) {
                showAiSpeech(currentPlayer.name, getRandomDialog('support'));
                executeSupport(target.id, supportType);
                // Then roll dice after support
                setTimeout(() => rollDice(), 1500);
                return;
              }
            }
          }

          // Normal roll
          if (behavior && Math.random() > 0.6) {
            showAiSpeech(currentPlayer.name, behavior.catchphrase);
          }
          rollDice();
        }, aiThinkingTime);
      } else if (gameState.phase === 'DECISION' && gameState.currentCard) {
        setTimeout(() => {
          const card = gameState.currentCard!;

          if (['DOODAD', 'AUDIT'].includes(card.type)) {
            handlePayDoodad();
            return;
          }

          const decision = makeAiDecision(currentPlayer, card);

          if (decision === 'donate') {
            const totalIncome = currentPlayer.salary + currentPlayer.passiveIncome;
            const donationAmount = card.cost === 0 ? Math.floor(totalIncome * 0.1) : card.cost;
            if (currentPlayer.cash >= donationAmount) {
              showAiSpeech(currentPlayer.name, getRandomDialog('donate'));
              handleDonate();
            } else {
              showAiSpeech(currentPlayer.name, getRandomDialog('pass'));
              handlePass();
            }
          } else if (decision === 'buy') {
            showAiSpeech(currentPlayer.name, getRandomDialog('buy'));
            handleBuyAsset();
          } else {
            showAiSpeech(currentPlayer.name, getRandomDialog('pass'));
            handlePass();
          }
        }, aiThinkingTime);
      } else if (gameState.phase === 'SUPPORT') {
        setTimeout(() => {
          const supportChance = behavior?.supportChance || 0.5;
          if (ratRacePlayers.length > 0 && Math.random() < supportChance) {
            const target = ratRacePlayers[Math.floor(Math.random() * ratRacePlayers.length)];
            const supportType = Math.random() > 0.5 ? 'JOB' : 'INVESTMENT';
            const support = SUPPORT_OPTIONS[supportType];
            if (currentPlayer.cash >= support.costToInvestor) {
              showAiSpeech(currentPlayer.name, getRandomDialog('support'));
              executeSupport(target.id, supportType);
            } else {
              skipSupport();
            }
          } else {
            skipSupport();
          }
        }, aiThinkingTime);
      } else if (gameState.phase === 'END_TURN') {
        setTimeout(() => advanceTurn(), 800);
      }
    }
  }, [gameState.phase, gameState.currentPlayerIndex]);


  // --- Render ---

  if (gameState.phase === 'SETUP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-green-600 mb-1">Money Adventure</h1>
            <p className="text-slate-500 text-sm">お金の冒険に出かけよう！</p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-3 text-center">難易度を選んでね</h3>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_SETTINGS.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => selectDifficulty(diff.id)}
                  className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                    diff.id === 'kids' ? 'border-green-300 bg-green-50 hover:border-green-500' :
                    diff.id === 'teen' ? 'border-blue-300 bg-blue-50 hover:border-blue-500' :
                    'border-purple-300 bg-purple-50 hover:border-purple-500'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {diff.id === 'kids' ? '🌱' : diff.id === 'teen' ? '🌿' : '🌳'}
                  </div>
                  <div className="font-bold text-sm text-slate-700">{diff.name}</div>
                  <div className="text-[10px] text-slate-500">{diff.ageRange}</div>
                </button>
              ))}
            </div>
          </div>

          {/* How to Play */}
          <div className="p-3 bg-slate-50 rounded-lg text-left">
            <h3 className="font-bold text-slate-700 mb-2 text-sm">あそびかた</h3>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">🎯</span>
                <span>最初に<span className="font-bold text-purple-600">人生の目標</span>を選ぼう</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">🎲</span>
                <span>サイコロを振って「チャンス」マスで資産を買おう</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">🏃</span>
                <span><span className="font-bold text-amber-600">不労所得 ≧ 支出</span> で投資家コースへ脱出！</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-500">❤️</span>
                <span>寄付すると<span className="font-bold text-pink-600">サイコロ2個</span>ボーナス！</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">🏆</span>
                <span>投資家コースで<span className="font-bold text-green-600">目標達成</span>したら勝利！</span>
              </li>
            </ul>
          </div>

          {/* Characters Preview */}
          <div className="mt-4 flex justify-center gap-2">
            {INITIAL_PLAYERS.map(p => (
              <div key={p.id} className="text-center">
                <div className="text-2xl">{p.avatar}</div>
                <div className="text-[9px] text-slate-500">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- GOAL SELECTION ---
  if (gameState.phase === 'GOAL_SELECT') {
    const selectingPlayer = gameState.players[gameState.goalSelectingPlayerIndex];
    const isHumanSelecting = selectingPlayer?.type === 'HUMAN';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{selectingPlayer?.avatar}</div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {selectingPlayer?.name}の人生の目標
            </h2>
            <p className="text-slate-500 text-sm">投資家コースでこの目標を達成すると勝利！</p>
          </div>

          {isHumanSelecting ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adjustedGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => selectGoal(goal)}
                  className="p-3 border-2 border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-purple-600">{goal.title}</h3>
                      <span className="text-[10px] text-amber-600 font-bold">必要: ¥{goal.requiredCash.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{goal.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="animate-bounce text-4xl mb-3">🎯</div>
              <p className="text-slate-500 text-sm">{selectingPlayer?.name}が目標を選んでいます...</p>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-4 flex justify-center gap-1">
            {gameState.players.map((p, i) => (
              <div
                key={p.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  i < gameState.goalSelectingPlayerIndex ? 'bg-green-100 text-green-600' :
                  i === gameState.goalSelectingPlayerIndex ? 'bg-purple-100 ring-2 ring-purple-400' :
                  'bg-slate-100 text-slate-400'
                }`}
              >
                {i < gameState.goalSelectingPlayerIndex ? '✓' : p.avatar}
              </div>
            ))}
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
            <p className="text-slate-500 text-sm mb-2">達成した目標</p>
            <p className="text-xl font-bold text-purple-600 flex items-center justify-center gap-2">
              <span className="text-2xl">{gameState.winner.selectedGoal?.icon || '⭐'}</span>
              {gameState.winner.selectedGoal?.title || gameState.winner.dreams[0]?.title || "最高の人生"}
            </p>
          </div>
          <Button size="lg" onClick={restartGame} className="w-full animate-pulse shadow-xl">
            もう一度遊ぶ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 md:pb-0 transition-colors duration-1000 ${isFastTrack ? 'bg-amber-50' : 'bg-slate-50'}`}>
      {/* AI Speech Bubble */}
      {aiSpeech && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 px-4 py-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-sm text-slate-700">{aiSpeech.name}:</span>
            <span className="text-sm text-slate-600">「{aiSpeech.message}」</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-3 py-2 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h1 className="font-bold text-slate-700 text-sm hidden sm:block">Money Adventure</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-2 py-1 rounded-full text-[10px] font-medium text-slate-600">
            ターン {gameState.turnCount}
          </div>
          <div className="flex -space-x-1.5">
            {gameState.players.map(p => (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-sm transition-all ${
                  p.id === currentPlayer?.id ? 'ring-2 ring-blue-400 scale-110 z-10' :
                  p.hasEscaped ? 'bg-amber-100' : 'bg-slate-100'
                }`}
                title={`${p.name} (¥${p.cash.toLocaleString()})`}
              >
                {p.avatar}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Bottom Action Bar for ROLL phase (non-blocking) */}
      {gameState.phase === 'ROLL' && !showSellModal && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-blue-200 shadow-lg p-3">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-3">
              {/* Current player info */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentPlayer?.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-slate-700">
                    {isHumanTurn ? 'あなたの番' : `${currentPlayer?.name}の番`}
                  </div>
                  {currentPlayer?.charityTurnsRemaining > 0 && (
                    <span className="text-[10px] text-pink-600 font-bold">🎲🎲 ボーナス中</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {isHumanTurn ? (
                <div className="flex items-center gap-2">
                  {currentPlayer?.assets && currentPlayer.assets.length > 0 && (
                    <button
                      onClick={() => setShowSellModal(true)}
                      className="px-2 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 font-medium"
                    >
                      売却
                    </button>
                  )}
                  {isFastTrack && ratRacePlayers.length > 0 && (
                    <button
                      onClick={initiateSupport}
                      className="px-2 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                    >
                      支援
                    </button>
                  )}
                  <Button size="lg" onClick={rollDice} className="px-6">
                    🎲 サイコロを振る
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-slate-400 animate-pulse">考え中...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Move notification (small toast) */}
      {gameState.phase === 'MOVE' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200">
            {gameState.diceRoll === 1 && <Dice1 className="w-5 h-5" />}
            {gameState.diceRoll === 2 && <Dice2 className="w-5 h-5" />}
            {gameState.diceRoll === 3 && <Dice3 className="w-5 h-5" />}
            {gameState.diceRoll === 4 && <Dice4 className="w-5 h-5" />}
            {gameState.diceRoll === 5 && <Dice5 className="w-5 h-5" />}
            {gameState.diceRoll === 6 && <Dice6 className="w-5 h-5" />}
            {(gameState.diceRoll || 0) > 6 && <span className="font-bold">{gameState.diceRoll}</span>}
            <span className="font-bold text-sm">{gameState.diceRoll} が出た！</span>
            <span className="text-xs opacity-80">{currentPlayer?.name}移動中...</span>
          </div>
        </div>
      )}

      {/* Sell Asset Modal (full modal when selling) */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-800">資産を売却</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 text-center">売却価格は購入価格の80%です</p>

            <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
              {currentPlayer?.assets.map(asset => {
                const sellPrice = Math.floor(asset.cost * 0.8);
                return (
                  <div key={asset.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-left">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm">{asset.name}</div>
                        <div className="text-[10px] text-slate-500">
                          収入: +{asset.cashflow}/月
                        </div>
                      </div>
                      <button
                        onClick={() => handleSellAsset(asset.id)}
                        className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 font-bold"
                      >
                        ¥{sellPrice.toLocaleString()}で売却
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" onClick={() => setShowSellModal(false)} className="w-full">
              戻る
            </Button>
          </div>
        </div>
      )}

      {/* Support Request Modal (AI asking human for help) */}
      {gameState.supportRequest && humanFastTrackPlayer && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="text-4xl mb-3">🙏</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">協力のお願い</h3>
              <p className="text-sm text-slate-600 mb-4">
                <span className="font-bold">{gameState.supportRequest.requestingPlayerName}</span>
                があなたに協力を求めています
              </p>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => acceptSupportRequest('JOB')}
                  disabled={humanFastTrackPlayer.cash < SUPPORT_OPTIONS.JOB.costToInvestor}
                  className="w-full p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-medium"
                >
                  <div className="text-sm">仕事を依頼する</div>
                  <div className="text-[10px] text-blue-500">
                    -{SUPPORT_OPTIONS.JOB.costToInvestor} → 相手に給料日ボーナス
                  </div>
                </button>
                <button
                  onClick={() => acceptSupportRequest('INVESTMENT')}
                  disabled={humanFastTrackPlayer.cash < SUPPORT_OPTIONS.INVESTMENT.costToInvestor}
                  className="w-full p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 font-medium"
                >
                  <div className="text-sm">共同投資する</div>
                  <div className="text-[10px] text-green-500">
                    -{SUPPORT_OPTIONS.INVESTMENT.costToInvestor} → 相手に現金
                  </div>
                </button>
              </div>

              <Button variant="outline" onClick={declineSupportRequest} className="w-full">
                今回はパス
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal for DECISION, SUPPORT, END_TURN */}
      {(gameState.phase === 'DECISION' || gameState.phase === 'SUPPORT' || gameState.phase === 'END_TURN') && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 animate-in zoom-in-95 duration-200">

            {gameState.phase === 'SUPPORT' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Handshake className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">仲間を支援</h3>
                </div>

                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                  {ratRacePlayers.map(player => (
                    <div key={player.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{player.avatar}</span>
                        <span className="font-bold text-sm">{player.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => executeSupport(player.id, 'JOB')}
                          disabled={currentPlayer?.cash < SUPPORT_OPTIONS.JOB.costToInvestor}
                          className="p-1.5 text-[10px] bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          仕事依頼 (-{SUPPORT_OPTIONS.JOB.costToInvestor})
                        </button>
                        <button
                          onClick={() => executeSupport(player.id, 'INVESTMENT')}
                          disabled={currentPlayer?.cash < SUPPORT_OPTIONS.INVESTMENT.costToInvestor}
                          className="p-1.5 text-[10px] bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          共同投資 (-{SUPPORT_OPTIONS.INVESTMENT.costToInvestor})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={skipSupport} className="w-full">
                  パス
                </Button>
              </div>
            )}

            {gameState.phase === 'DECISION' && gameState.currentCard && (
              <div className="text-center">
                {/* Card Type Badge */}
                <span className={`inline-block text-xs font-bold px-2 py-1 rounded mb-2 ${
                  gameState.currentCard.type === 'CHARITY' ? 'bg-pink-100 text-pink-700' :
                  ['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(gameState.currentCard.type) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {gameState.currentCard.type === 'OPPORTUNITY' ? 'チャンス！' :
                   gameState.currentCard.type === 'BUSINESS' ? 'ビジネス！' :
                   gameState.currentCard.type === 'DREAM' ? '夢' :
                   gameState.currentCard.type === 'CHARITY' ? '寄付' :
                   '支払い'}
                </span>

                <h3 className="text-lg font-bold text-slate-800 mb-1">{gameState.currentCard.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{gameState.currentCard.description}</p>

                {/* Cost & Benefit */}
                <div className="flex justify-center gap-4 mb-3 text-sm">
                  {gameState.currentCard.cost !== undefined && gameState.currentCard.cost > 0 && (
                    <span className="text-red-600 font-bold">コスト: -{gameState.currentCard.cost.toLocaleString()}</span>
                  )}
                  {gameState.currentCard.cashflow && gameState.currentCard.cashflow > 0 && (
                    <span className="text-green-600 font-bold">収入: +{gameState.currentCard.cashflow.toLocaleString()}/月</span>
                  )}
                </div>

                {gameState.currentCard.type === 'CHARITY' && (
                  <p className="text-xs text-pink-600 mb-3">💕 3ターンサイコロ2個ボーナス！</p>
                )}

                {/* Coach Hint (compact) */}
                {isHumanTurn && gameState.currentCard.type !== 'CHARITY' && !['DOODAD', 'AUDIT'].includes(gameState.currentCard.type) && (
                  <div className="mb-3">
                    {!gameState.coachMessage ? (
                      <button
                        onClick={askCoach}
                        disabled={gameState.isCoachLoading}
                        className="text-[10px] text-purple-600 hover:underline"
                      >
                        <Lightbulb className={`w-3 h-3 inline mr-1 ${gameState.isCoachLoading ? 'animate-pulse' : ''}`} />
                        {gameState.isCoachLoading ? '考え中...' : 'AIコーチに聞く'}
                      </button>
                    ) : (
                      <div className="bg-purple-50 p-2 rounded text-[10px] text-left text-slate-600 border border-purple-200">
                        🤖 {gameState.coachMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {isHumanTurn ? (
                    <>
                      <Button variant="outline" onClick={handlePass} className="text-sm">
                        パス
                      </Button>
                      {gameState.currentCard.type === 'CHARITY' ? (
                        <Button onClick={handleDonate} disabled={currentPlayer.cash < (gameState.currentCard.cost === 0 ? Math.floor((currentPlayer.salary + currentPlayer.passiveIncome) * 0.1) : gameState.currentCard.cost)} className="bg-pink-500 hover:bg-pink-600 text-sm">
                          寄付する
                        </Button>
                      ) : ['OPPORTUNITY', 'BUSINESS', 'DREAM'].includes(gameState.currentCard.type) ? (
                        <Button onClick={handleBuyAsset} disabled={currentPlayer.cash < (gameState.currentCard.cost || 0)} className="text-sm">
                          購入
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={handlePayDoodad} className="text-sm">
                          支払う
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="col-span-2 text-slate-400 text-xs py-2">
                      {currentPlayer?.name}が判断中...
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState.phase === 'END_TURN' && (
              <div className="text-center">
                <div className="text-3xl mb-2">✓</div>
                <h3 className="text-lg font-bold text-slate-700 mb-3">ターン終了</h3>
                {isHumanTurn && (
                  <Button onClick={advanceTurn}>
                    次の人へ →
                  </Button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Main Content - Always visible */}
      <main className="max-w-7xl mx-auto p-3 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Left: Game Board */}
        <div className="lg:col-span-7">
          <GameBoard players={gameState.players} currentPlayerId={currentPlayer?.id || ''} />
        </div>

        {/* Right: Player Sheets & Log */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-2">

          {/* Player Sheets - Compact Grid */}
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.map(player => (
              <FinancialSheet
                key={player.id}
                player={player}
                isCurrentUser={player.id === currentPlayer?.id}
              />
            ))}
          </div>

          {/* Game Log - Compact */}
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
              <span>ゲームログ</span>
              <span className="text-slate-400">ターン {gameState.turnCount}</span>
            </div>
            <div ref={scrollRef} className="p-2 overflow-y-auto max-h-[120px] space-y-1 text-xs">
              {gameState.logs.slice(-5).map((log) => (
                <div key={log.id} className="text-slate-600 border-l-2 border-slate-200 pl-2 py-0.5">
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
