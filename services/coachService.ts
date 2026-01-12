import { GoogleGenAI } from "@google/genai";
import { Player, GameCard } from '../types';

export const getCoachHint = async (player: Player, card: GameCard): Promise<string> => {
  if (!process.env.API_KEY) {
    return "APIキーが設定されていないため、ヒントを表示できません。 (Demo Mode)";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Determine current goal based on player status
  const currentGoal = player.hasEscaped 
    ? "Buy your DREAM to win the game!" 
    : "Passive Income > Expenses to escape the Rat Race.";

  const prompt = `
    You are a friendly, encouraging financial coach for a child playing a board game called "Money Adventure".
    
    Current Player Situation:
    - Status: ${player.hasEscaped ? "Fast Track (Rich)" : "Rat Race (Learning)"}
    - Cash: ${player.cash}
    - Monthly Cashflow: ${player.hasEscaped ? "(High Income)" : player.passiveIncome + player.salary - player.monthlyExpenses}
    - Goal: ${currentGoal}

    The player drew this card:
    - Type: ${card.type}
    - Title: ${card.title}
    - Description: ${card.description}
    - Cost: ${card.cost || 0}
    - Cashflow Increase: ${card.cashflow || 0}

    Task:
    Provide a short, 1-2 sentence hint to help the child decide what to do.
    If they are on the Fast Track and found a DREAM card, encourage them to buy it to win!
    DO NOT tell them explicitly "Buy it" or "Don't buy it" unless it's the winning move.
    Instead, ask a guiding question or highlight a key concept (ROI, cash buffer, dreams).
    Keep the tone playful and educational. Use simple Japanese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    return response.text || "今はヒントが思いつかないみたい。自分で考えてみよう！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "通信エラーでヒントが出せなかったよ。";
  }
};