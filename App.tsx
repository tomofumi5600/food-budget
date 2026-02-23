import React, { useState, useEffect } from 'react';

// --- スタイル定義 ---
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#F8F9FA',
  padding: '20px',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '24px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  width: '100%',
  maxWidth: '400px',
};

export default function App() {
  // 安全に初期値を読み込む工夫
  const [budget, setBudget] = useState(10000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(10000);

  // 画面が開いた時に一度だけ保存された数字を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('my_budget');
    if (saved) {
      const num = parseInt(saved);
      setBudget(num);
      setTempBudget(num);
    }
  }, []);

  const handleSave = () => {
    setBudget(tempBudget);
    localStorage.setItem('my_budget', tempBudget.toString());
    setIsEditing(false);
  };

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A1A1A' }}>
          🍱 Food Budget
        </h1>
      </header>

      <main style={cardStyle}>
        {isEditing ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>週の予算を設定</p>
            <input 
              type="number" 
              value={tempBudget} 
              onChange={(e) => setTempBudget(parseInt(e.target.value) || 0)}
              style={{ fontSize: '24px', width: '80%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd', textAlign: 'center' }}
            />
            <button 
              onClick={handleSave}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer', width: '100%' }}
            >
              設定を保存する
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>今週の予算</p>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>
              ¥{budget.toLocaleString()}
            </h2>
            
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              予算を変更する
            </button>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
            
            <p style={{ fontSize: '12px', color: '#999' }}>次はグラフとレシート機能を追加します！</p>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '40px', fontSize: '12px', color: '#AAA' }}>
        v1.1.1 - Safe Mode
      </footer>
    </div>
  );
}
