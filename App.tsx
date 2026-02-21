import React, { useState } from 'react';

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
  padding: '30px',
  borderRadius: '24px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  width: '100%',
  maxWidth: '400px',
  textAlign: 'center'
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
  padding: '16px 32px',
  borderRadius: '50px',
  border: 'none',
  fontWeight: 'bold',
  fontSize: '18px',
  marginTop: '20px',
  cursor: 'pointer',
  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
};

// --- メインアプリ ---
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A1A1A' }}>
          🍱 Food Budget
        </h1>
        <p style={{ color: '#666' }}>岡田さんの家計簿アプリ</p>
      </header>

      <main style={cardStyle}>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>今週の残り予算</p>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>
          ¥10,000
        </h2>
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', marginBottom: '4px' }}>動作テスト: {count}</p>
          <div style={{ width: '100%', backgroundColor: '#eee', height: '8px', borderRadius: '4px' }}>
            <div style={{ width: '70%', backgroundColor: '#10b981', height: '100%', borderRadius: '4px' }}></div>
          </div>
        </div>

        <button 
          style={buttonStyle}
          onClick={() => setCount(count + 1)}
        >
          📷 レシートを読み込む
        </button>
      </main>

      <footer style={{ marginTop: '40px', fontSize: '12px', color: '#AAA' }}>
        v1.0.0 Ready
      </footer>
    </div>
  );
}
