import{createRoot}from 'react-dom/client'
import React,{useState}from 'react'
function App(){
const[count,setCount]=useState(0)
return(
<div style={{minHeight:'100vh',backgroundColor:'#F8F9FA',padding:'20px',fontFamily:'sans-serif',display:'flex',flexDirection:'column',alignItems:'center'}}>
<h1 style={{fontSize:'24px',fontWeight:'bold'}}>🍱 Food Budget</h1>
<p style={{color:'#666'}}>岡田さんの家計簿アプリ</p>
<div style={{backgroundColor:'white',padding:'30px',borderRadius:'24px',width:'100%',maxWidth:'400px',textAlign:'center'}}>
<p>今週の残り予算</p>
<h2 style={{fontSize:'32px',color:'#10b981'}}>¥10,000</h2>
<p>動作テスト: {count}</p>
<button style={{backgroundColor:'#10b981',color:'white',padding:'16px 32px',borderRadius:'50px',border:'none',fontSize:'18px',marginTop:'20px',cursor:'pointer'}} onClick={()=>setCount(count+1)}>📷 レシートを読み込む</button>
</div>
</div>
)
}
createRoot(document.getElementById('root')!).render(<App/>)
