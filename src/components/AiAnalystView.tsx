import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';
import { ReconciliationMetrics, Transaction } from '../types';

interface AiAnalystViewProps {
  chatHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ role: 'user' | 'assistant'; text: string }>>>;
  chatPrompt: string;
  setChatPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleAskAI: (customQuery?: string) => Promise<void>;
  metrics: ReconciliationMetrics;
  transactions: Transaction[];
  activeClientName: string;
  isAiLoading: boolean;
}

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({
  chatHistory,
  setChatHistory,
  chatPrompt,
  setChatPrompt,
  handleAskAI,
  metrics,
  transactions,
  activeClientName,
  isAiLoading,
}) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  const quickPrompts = [
    {
      label: '💡 Why is the reconciliation off?',
      query: `Why is the current reconciliation difference $${Math.abs(metrics.difference).toFixed(2)} for ${activeClientName}? Explain what adjustments or missing items are causing it.`,
    },
    {
      label: '🔍 Investigate duplicate ledger entries',
      query: 'Identify and analyze any duplicate transactions in the general ledger and explain what action I should take.',
    },
    {
      label: '📋 Suggest adjusting journal entries',
      query: 'What adjusting journal entries should I post to the general ledger to clear the unmatched bank fees and bring the variance to zero?',
    },
    {
      label: '⏱️ Explain Deposits in Transit & Outstanding Checks',
      query: 'Summarize the timing differences (Deposits in Transit vs Outstanding Checks) in this reconciliation under U.S. GAAP.',
    },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Gemini AI Accounting Analyst</span>
          </h2>
          <p className="text-xs text-white/60">
            Trained on U.S. GAAP standards, double-entry bookkeeping, and ASC 305 cash reconciliation rules.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-white/[0.06] border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-sm shadow-purple-400" />
          <span className="text-purple-300 font-mono font-medium">Model: Gemini 3.7 Flash</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            id={`btn-quick-prompt-${idx}`}
            onClick={() => handleAskAI(p.query)}
            disabled={isAiLoading}
            className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/12 rounded-2xl text-xs text-white/80 hover:text-white transition cursor-pointer disabled:opacity-40 backdrop-blur-sm shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-xl">
        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={idx} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-2xl rounded-3xl p-5 text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 border border-white/20' 
                    : 'bg-white/[0.05] border border-white/12 text-white/90 shadow-sm backdrop-blur-sm'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 mb-2.5 border-b border-white/10 pb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini CPA Advisory</span>
                  </div>
                )}
                <div className="whitespace-pre-line space-y-2 font-sans">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isAiLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/12 rounded-3xl p-4.5 text-xs text-white/70 flex items-center space-x-3 backdrop-blur-sm">
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
              <span>Gemini is analyzing reconciliation schedule and ledger records...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="flex items-center space-x-3 bg-white/[0.04] backdrop-blur-xl border border-white/15 rounded-3xl p-2 shrink-0 shadow-lg">
        <input 
          id="input-ai-chat-prompt"
          type="text" 
          value={chatPrompt}
          onChange={e => setChatPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !isAiLoading) {
              handleAskAI();
            }
          }}
          placeholder="Ask AI about unmatched items, debit/credit journal entries, or variance causes..." 
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder-white/40"
          disabled={isAiLoading}
        />
        <button 
          id="btn-send-ai-prompt"
          onClick={() => handleAskAI()}
          disabled={isAiLoading || !chatPrompt.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-semibold transition shadow-md shadow-indigo-500/20 border border-white/20 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
