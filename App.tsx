import{createRoot}from 'react-dom/client'
import React,{useState}from 'react'
const CATEGORIES=['肉・魚','野菜','パン','その他']
const COLORS=['#f87171','#34d399','#fbbf24','#94a3b8']
function App(){
const[budget,setBudget]=useState(15000)
const[expenses,setExpenses]=useState<{id:number,name:string,amount:number,category:string,date:string}[]>([])
const[screen,setScreen]=useState<'home'|'add'|'history'|'settings'>('home')
const[name,setName]=useState('')
const[amount,setAmount]=useState('')
const[category,setCategory]=useState(CATEGORIES[0])
const[newBudget,setNewBudget]=useState(String(budget))
const total=expenses.reduce((s,e)=>s+e.amount,0)
const remaining=budget-total
const pct=Math.min(100,Math.round(total/budget*100))
const color=pct<60?'#10b981':pct<85?'#fbbf24':'#ef4444'
function addExpense(){
if(!name||!amount)return
setExpenses([...expenses,{id:Date.now(),name,amount:Number(amount),category,date:new Date().toLocaleDateString('ja-JP')}])
setName('');setAmount('');setScreen('home')
}
const s={btn:(c:string)=>({backgroundColor:c,color:'white',padding:'14px',borderRadius:'12px',border:'none',width:'100%',fontSize:'16px',fontWeight:'bold',cursor:'pointer',marginTop:'8px'}),input:{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid #e5e7eb',fontSize:'16px',marginTop:'8px',boxSizing:'border-box' as const}}
return(
<div style={{minHeight:'100vh',backgroundColor:'#F8F9FA',fontFamily:'sans-serif',maxWidth:'400px',margin:'0 auto',padding:'20px'}}>
{screen==='home'&&<>
<h1 style={{fontSize:'22px',fontWeight:'bold',textAlign:'center',marginBottom:'20px'}}>🍱 Food Budget</h1>
<div style={{backgroundColor:'white',borderRadius:'20px',padding:'24px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)',marginBottom:'16px',textAlign:'center'}}>
<p style={{color:'#888',fontSize:'14px'}}>今週の残り予算</p>
<h2 style={{fontSize:'40px',fontWeight:'bold',color:remaining>=0?'#10b981':'#ef4444',margin:'8px 0'}}>¥{remaining.toLocaleString()}</h2>
<p style={{color:'#aaa',fontSize:'13px'}}>予算 ¥{budget.toLocaleString()} / 使用 ¥{total.toLocaleString()}</p>
<div style={{backgroundColor:'#f3f4f6',borderRadius:'99px',height:'12px',marginTop:'16px'}}>
<div style={{backgroundColor:color,width:pct+'%',height:'100%',borderRadius:'99px',transition:'width 0.3s'}}/>
</div>
<p style={{fontSize:'13px',color:'#888',marginTop:'6px'}}>{pct}% 使用</p>
</div>
<div style={{backgroundColor:'white',borderRadius:'20px',padding:'20px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)',marginBottom:'16px'}}>
<p style={{fontWeight:'bold',marginBottom:'12px'}}>カテゴリ別</p>
{CATEGORIES.map((c,i)=>{
const t=expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)
return t>0&&<div key={c} style={{display:'flex',alignItems:'center',marginBottom:'8px'}}>
<div style={{width:'12px',height:'12px',borderRadius:'99px',backgroundColor:COLORS[i],marginRight:'8px'}}/>
<span style={{flex:1,fontSize:'14px'}}>{c}</span>
<span style={{fontSize:'14px',fontWeight:'bold'}}>¥{t.toLocaleString()}</span>
</div>
})}
{total===0&&<p style={{color:'#aaa',fontSize:'14px',textAlign:'center'}}>まだ支出がありません</p>}
</div>
<button style={s.btn('#10b981')} onClick={()=>setScreen('add')}>＋ 支出を追加</button>
<button style={{...s.btn('#6366f1'),marginTop:'8px'}} onClick={()=>setScreen('history')}>📋 履歴を見る</button>
<button style={{...s.btn('#94a3b8'),marginTop:'8px'}} onClick={()=>setScreen('settings')}>⚙️ 設定</button>
</>}
{screen==='add'&&<>
<h2 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'20px'}}>＋ 支出を追加</h2>
<p style={{fontSize:'14px',color:'#888'}}>店名・品名</p>
<input style={s.input} value={name} onChange={e=>setName(e.target.value)} placeholder="例: イオン"/>
<p style={{fontSize:'14px',color:'#888',marginTop:'12px'}}>金額（円）</p>
<input style={s.input} type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="例: 2500"/>
<p style={{fontSize:'14px',color:'#888',marginTop:'12px'}}>カテゴリ</p>
<select style={s.input} value={category} onChange={e=>setCategory(e.target.value)}>
{CATEGORIES.map(c=><option key={c}>{c}</option>)}
</select>
<button style={s.btn('#10b981')} onClick={addExpense}>保存する</button>
<button style={s.btn('#e5e7eb')} onClick={()=>setScreen('home')}>キャンセル</button>
</>}
{screen==='history'&&<>
<h2 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'20px'}}>📋 支出履歴</h2>
{expenses.length===0&&<p style={{color:'#aaa',textAlign:'center'}}>履歴がありません</p>}
{[...expenses].reverse().map(e=>(
<div key={e.id} style={{backgroundColor:'white',borderRadius:'12px',padding:'16px',marginBottom:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div>
<p style={{fontWeight:'bold',fontSize:'15px'}}>{e.name}</p>
<p style={{fontSize:'12px',color:'#aaa'}}>{e.date} · {e.category}</p>
</div>
<p style={{fontWeight:'bold',color:'#10b981',fontSize:'16px'}}>¥{e.amount.toLocaleString()}</p>
</div>
))}
<button style={s.btn('#94a3b8')} onClick={()=>setScreen('home')}>← 戻る</button>
</>}
{screen==='settings'&&<>
<h2 style={{fontSize:'20px',fontWeight:'bold',marginBottom:'20px'}}>⚙️ 設定</h2>
<p style={{fontSize:'14px',color:'#888'}}>週の予算（円）</p>
<input style={s.input} type="number" value={newBudget} onChange={e=>setNewBudget(e.target.value)}/>
<button style={s.btn('#10b981')} onClick={()=>{setBudget(Number(newBudget));setScreen('home')}}>保存する</button>
<button style={s.btn('#94a3b8')} onClick={()=>setScreen('home')}>← 戻る</button>
</>}
</div>
)
}
createRoot(document.getElementById('root')!).render(<App/>)
