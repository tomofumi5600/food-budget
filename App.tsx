/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Camera, 
  History, 
  Settings, 
  ChevronRight, 
  Trash2, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Category, Budget, ExpenseItem, ReceiptData } from './types';
import { DEFAULT_WEEKLY_BUDGETS, CATEGORY_COLORS, DEFAULT_CATEGORIES } from './constants';
import { parseReceipt } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // State
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('food_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_BUDGETS;
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('food_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<ReceiptData | null>(null);
  const [view, setView] = useState<'dashboard' | 'history' | 'settings' | 'analysis'>('dashboard');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('food_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('food_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Calculations
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const weeklyExpenses = expenses.filter(e => 
    isWithinInterval(parseISO(e.date), { start: currentWeekStart, end: currentWeekEnd })
  );

  const getCategoryTotal = (category: Category) => {
    return weeklyExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const data = await parseReceipt(base64);
        setPendingReceipt(data);
        setShowReceiptModal(true);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert("解析に失敗しました。もう一度お試しください。");
      setIsProcessing(false);
    }
  };

  const confirmReceipt = () => {
    if (!pendingReceipt) return;
    
    const newItems: ExpenseItem[] = pendingReceipt.items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    }));

    setExpenses(prev => [...newItems, ...prev]);
    setShowReceiptModal(false);
    setPendingReceipt(null);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateBudget = (category: Category, amount: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, amount } : b));
  };

  const resetBudgets = () => {
    if (window.confirm('予算を初期設定に戻しますか？')) {
      setBudgets(DEFAULT_WEEKLY_BUDGETS);
    }
  };

  // Analysis Calculations
  const getWeeklyData = () => {
    const weeksMap = new Map<string, { start: Date, end: Date, total: number, categories: Record<Category, number> }>();
    
    expenses.forEach(expense => {
      const date = parseISO(expense.date);
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      const key = format(start, 'yyyy-MM-dd');
      
      if (!weeksMap.has(key)) {
        weeksMap.set(key, { 
          start, 
          end, 
          total: 0, 
          categories: { '肉・魚': 0, '野菜': 0, 'パン': 0, 'その他': 0 } 
        });
      }
      
      const weekData = weeksMap.get(key)!;
      weekData.total += expense.amount;
      weekData.categories[expense.category] += expense.amount;
    });

    return Array.from(weeksMap.values()).sort((a, b) => b.start.getTime() - a.start.getTime());
  };

  const weeklyAnalysisData = getWeeklyData();

  // Chart Data
  const chartData = budgets.map(b => {
    const spent = getCategoryTotal(b.category);
    return {
      name: b.category,
      spent,
      remaining: Math.max(0, b.amount - spent),
      budget: b.amount,
      color: CATEGORY_COLORS[b.category]
    };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Food Budget</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {format(currentWeekStart, 'M/d')} - {format(currentWeekEnd, 'M/d')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setView('analysis')}
              className={cn(
                "p-2 rounded-full transition-colors",
                view === 'analysis' ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <History size={20} />
            </button>
            <button 
              onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}
              className={cn(
                "p-2 rounded-full transition-colors",
                view === 'settings' ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {view === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-slate-500">今週の残り予算</p>
                  <button 
                    onClick={() => setView('settings')}
                    className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    予算を編集
                  </button>
                </div>
                <h2 className={cn(
                  "text-4xl font-bold tracking-tighter mb-4",
                  totalRemaining < 0 ? "text-red-500" : "text-emerald-600"
                )}>
                  ¥{totalRemaining.toLocaleString()}
                </h2>
                
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
                    className={cn(
                      "h-full transition-colors duration-500",
                      totalSpent > totalBudget ? "bg-red-500" : "bg-emerald-500"
                    )}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>支出: ¥{totalSpent.toLocaleString()}</span>
                  <span>予算: ¥{totalBudget.toLocaleString()}</span>
                </div>
              </div>
              {/* Subtle background pattern */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.03] pointer-events-none">
                <ShoppingBag size={160} />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid gap-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">カテゴリ別状況</h3>
              {chartData.map((data) => (
                <div key={data.name} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{data.name}</span>
                      <span className="text-xl font-bold tracking-tight">
                        残り ¥{data.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500">
                        ¥{data.spent.toLocaleString()} / ¥{data.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (data.spent / data.budget) * 100)}%` }}
                      style={{ backgroundColor: data.color }}
                      className="h-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Mini List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">最近の買い物</h3>
                <button 
                  onClick={() => setView('history')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  すべて見る
                </button>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
                {weeklyExpenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    データがありません。レシートを読み込んでください。
                  </div>
                ) : (
                  weeklyExpenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[expense.category] }} 
                        />
                        <div>
                          <p className="text-sm font-semibold">{expense.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            {format(parseISO(expense.date), 'MM/dd HH:mm')} • {expense.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold">¥{expense.amount.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'analysis' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">週別分析</h2>
              <button 
                onClick={() => setView('dashboard')}
                className="text-sm font-bold text-emerald-600"
              >
                戻る
              </button>
            </div>

            {weeklyAnalysisData.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-black/5">
                <p className="text-slate-400 italic">分析するデータがまだありません。</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Trend Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">支出トレンド</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...weeklyAnalysisData].reverse().slice(-4)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="start" 
                          tickFormatter={(date) => format(date, 'M/d')}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`¥${value.toLocaleString()}`, '支出']}
                          labelFormatter={(label) => `${format(label, 'M/d')}の週`}
                        />
                        <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Weekly Breakdown List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">週ごとの詳細</h3>
                  {weeklyAnalysisData.map((week) => (
                    <div key={week.start.toISOString()} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm font-bold">{format(week.start, 'yyyy年 M月d日')} 〜</p>
                          <p className="text-xs text-slate-400 font-medium">合計支出: ¥{week.total.toLocaleString()}</p>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          week.total > totalBudget ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {week.total > totalBudget ? '予算超過' : '予算内'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {DEFAULT_CATEGORIES.map(cat => (
                          <div key={cat} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</p>
                              <p className="text-sm font-bold">¥{week.categories[cat].toLocaleString()}</p>
                            </div>
                            <div 
                              className="w-1.5 h-8 rounded-full" 
                              style={{ backgroundColor: CATEGORY_COLORS[cat] }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">戻る</span>
            </button>
            <h2 className="text-2xl font-bold tracking-tight mb-6">履歴</h2>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                    >
                      {expense.category[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{expense.name}</p>
                      <p className="text-xs text-slate-400">{format(parseISO(expense.date), 'yyyy/MM/dd HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">¥{expense.amount.toLocaleString()}</p>
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">戻る</span>
            </button>
            <h2 className="text-2xl font-bold tracking-tight mb-6">予算設定</h2>
            <div className="grid gap-4">
              {budgets.map((budget) => (
                <div key={budget.category} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    {budget.category}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">¥</span>
                    <input 
                      type="number" 
                      value={budget.amount}
                      onChange={(e) => updateBudget(budget.category, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border-0 rounded-xl py-3 pl-8 pr-4 font-bold text-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
              <AlertCircle className="text-emerald-600 shrink-0" size={20} />
              <p className="text-xs text-emerald-800 leading-relaxed">
                予算を変更すると、ダッシュボードの進捗管理に即座に反映されます。
                1週間の合計予算は現在 <strong>¥{totalBudget.toLocaleString()}</strong> です。
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={() => setView('dashboard')}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
              >
                設定を保存して戻る
              </button>
              <button 
                onClick={resetBudgets}
                className="w-full py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                初期設定に戻す
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all active:scale-95",
            isProcessing ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/40"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>解析中...</span>
            </>
          ) : (
            <>
              <Camera size={20} />
              <span>レシートを読み込む</span>
            </>
          )}
        </button>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && pendingReceipt && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">レシートの確認</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{pendingReceipt.storeName || '店舗名不明'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">合計金額</p>
                  <p className="text-2xl font-black text-emerald-600">¥{pendingReceipt.total.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="overflow-y-auto p-6 space-y-4">
                {pendingReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                      >
                        {item.category[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">¥{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button 
                  onClick={confirmReceipt}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  <span>この内容で登録する</span>
                </button>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full mt-3 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
