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

// --- メインアプリ ---
export default function App() {
  // 予算を保存する場所（スマホのメモリに保存するようにします）
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('my_budget');
    return saved ? parseInt(saved) : 10000; // 保存がなければ10,000円
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  // 予算が変更されたらスマホに保存する
  useEffect(() => {
    localStorage.setItem('my_budget', budget.toString());
  }, [budget]);

  const handleSave = () => {
    setBudget(tempBudget);
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
          // 設定モード
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>週の予算を設定</p>
            <input 
              type="number" 
              value={tempBudget} 
              onChange={(e) => setTempBudget(parseInt(e.target.value))}
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
          // 表示モード
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>今週の残り予算</p>
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
            
            <button style={{ backgroundColor: '#10b981', color: 'white', padding: '16px 32px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'not-allowed', opacity: 0.6, width: '100%' }}>
              📷 レシート読み込み(準備中)
            </button>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '40px', fontSize: '12px', color: '#AAA' }}>
        v1.1.0 - Budget Settings
      </footer>
    </div>
  );
}
