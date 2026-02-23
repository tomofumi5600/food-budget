import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9FA', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🍱 Food Budget</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '20px', 
        textAlign: 'center',
        width: '100%',
        maxWidth: '350px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#888' }}>今週の予算（固定表示テスト）</p>
        <h2 style={{ fontSize: '36px', color: '#10b981' }}>¥15,000</h2>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          ※この画面が表示されたら教えてください！
        </p>
      </div>
    </div>
  );
}
