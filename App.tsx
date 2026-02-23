import{createRoot}from 'react-dom/client'
import React,{useState,useRef}from 'react'
const CATEGORIES=['肉・魚','野菜','パン','その他']
const COLORS=['#f87171','#34d399','#fbbf24','#94a3b8']
const API_KEY=import.meta.env.VITE_GEMINI_API_KEY
function App(){
const[budget,setBudget]=useState(15000)
const[expenses,setExpenses]=useState<{id:number,name:string,amount:number,category:string,date:string}[]>([])
const[screen,setScreen]=useState<'home'|'add'|'history'|'settings'|'camera'>('home')
const[name,setName]=useState('')
const[amount,setAmount]=useState('')
const[category,setCategory]=useState(CATEGORIES[0])
const[newBudget,setNewBudget]=useState(String(budget))
const[scanning,setScanning]=useState(false)
const[scanMsg,setScanMsg]=useState('')
const fileRef=useRef<HTMLInputElement>(null)
const total=expenses.reduce((s,e)=>s+e.amount,0)
const remaining=budget-total
const pct=Math.min(100,Math.round(total/budget*100))
const color=pct<60?'#10b981':pct<85?'#fbbf24':'#ef4444'
function addExpense(){
if(!name||!amount)return
setExpenses([...expenses,{id:Date.now(),name,amount:Number(amount),category,date:new Date().toLocaleDateString('ja-JP')}])
setName('');setAmount('');setScreen('home')
}
async function scanReceipt(file:File){
setScanning(true);setScanMsg('レシートを解析中...')
const reader=new FileReader()
reader.onload=async(e)=>{
const base64=String(e.target?.result).split(',')[1]
try{
const res=a
