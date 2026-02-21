/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Camera, History, Settings, ChevronRight, Trash2, 
  Loader2, CheckCircle2, AlertCircle, ArrowLeft, ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- インライン定数定義 (エラー回避のため) ---
const CATEGORY_COLORS: Record<string, string> = {
  '肉・魚': '#ef4444',
  '野菜': '#22c55e',
  'パン': '#f59e0b',
  'その他': '#64748b'
};

const DEFAULT_CATEGORIES = ['肉・魚', '野菜', 'パン', 'その他'];

const DEFAULT_WEEKLY_BUDGETS = [
  { category: '肉・魚', amount: 3500 },
  { category: '野菜', amount: 2000 },
  { category: 'パン', amount: 1500 },
  { category: 'その他', amount: 3000 }
];

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ダミーサービス (API連携前)
const parseReceipt = async (base64: string) => {
  return {
    storeName: "サンプル店舗",
    total: 1000,
    items: [{ name: "サンプル商品", amount: 1000, category: "その他" }]
  };
};

// --- メインコンポーネント ---
export default function App() {
  const [budgets, setBudgets] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('food_budgets') : null;
    return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_BUDGETS;
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('food_expenses') : null;
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<any>(null);
  const [view, setView] = useState('dashboard');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('food_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('food_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const weeklyExpenses = expenses.filter((e: any) => 
    isWithinInterval(parseISO(e.date), { start: currentWeekStart, end: currentWeekEnd })
  );

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + b.amount, 0);
  const totalSpent = weeklyExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setPendingReceipt({
        storeName: "スキャン成功",
        total: 1200,
        items: [{ name: "テスト食品", amount: 1200, category: "その他" }]
      });
      setShowReceiptModal(true);
      setIsProcessing(false);
    }, 2000);
  };

  const confirmReceipt = () => {
    const newItems = pendingReceipt.items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    }));
    setExpenses((prev: any) => [...newItems, ...prev]);
    setShowReceiptModal(false);
  };

  const chartData = budgets.map((b: any) => {
    const spent = weeklyExpenses.filter((e: any) => e.category === b.category).reduce((sum: number, e: any) => sum + e.amount, 0);
    return { name: b.category, spent, remaining: Math.max(0, b.amount - spent), budget: b.amount, color: CATEGORY_COLORS[b.category] };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><ShoppingBag size={20}/></div>
           <h1 className="font-bold">Food Budget</h1>
        </div>
        <button onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}><Settings size={20}/></button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border">
              <p className="text-sm text-gray-500">今週の残り予算</p>
              <h2 className="text-3xl font-bold text-emerald-600">¥{totalRemaining.toLocaleString()}</h2>
            </div>
            <div className="space-y-4">
              {chartData.map((data: any) => (
                <div key={data.name} className="bg-white p-4 rounded-2xl shadow-sm border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">{data.name}</span>
                    <span>¥{data.remaining.toLocaleString()} / ¥{data.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${(data.spent/data.budget)*100}%`, backgroundColor: data.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-sm border">
             <h2 className="font-bold mb-4">予算設定</h2>
             {budgets.map((b: any) => (
               <div key={b.category} className="mb-4">
                 <label className="text-xs text-gray-400">{b.category}</label>
                 <input type="number" value={b.amount} className="w-full bg-gray-50 p-2 rounded-lg" onChange={(e) => {
                   const val = parseInt(e.target.value);
                   setBudgets(budgets.map((x: any) => x.category === b.category ? {...x, amount: val} : x));
                 }}/>
               </div>
             ))}
             <button onClick={() => setView('dashboard')} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold">保存</button>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 text-white px-8 py-4 rounded-full shadow-xl font-bold flex items-center gap-2">
          {isProcessing ? <Loader2 className="animate-spin" /> : <Camera />}
          {isProcessing ? "解析中..." : "レシートを読み込む"}
        </button>
      </div>

      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-3xl p-6">
              <h3 className="font-bold text-xl mb-4">確認</h3>
              <p className="text-2xl font-bold text-emerald-600 mb-6">合計: ¥{pendingReceipt.total}</p>
              <button onClick={confirmReceipt} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold mb-2">登録する</button>
              <button onClick={() => setShowReceiptModal(false)} className="w-full text-gray-400 font-bold">キャンセル</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
