import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#0A0A0A",surface:"#141414",card:"#1C1C1C",border:"#2A2A2A",
  cyan:"#00C9B1",cyanDim:"rgba(0,201,177,0.08)",cyanMid:"rgba(0,201,177,0.18)",
  text:"#FFFFFF",textSub:"#999",textMuted:"#555",red:"#FF4455",green:"#00C980",
};
const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

const APP_PASSWORD="treeni123";
const AUTH_KEY="tp_auth";
const WORKOUTS_KEY="tp_workouts";
const BODY_KEY="tp_body";
const EXERCISES_KEY="tp_exercises";
const ROUTINES_KEY="tp_routines";

const load=(key,def)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):def;}catch{return def;}};
const save=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val));}catch{}};

const DEFAULT_EXERCISES=[
  {id:"e1",name:"Penkkipunnerrus",cat:"Rinta"},{id:"e2",name:"Vinopenkkipunnerrus",cat:"Rinta"},
  {id:"e3",name:"Kyykky",cat:"Jalat"},{id:"e4",name:"Maastaveto",cat:"Selkä"},
  {id:"e5",name:"Leuanveto",cat:"Selkä"},{id:"e6",name:"Soutu",cat:"Selkä"},
  {id:"e7",name:"Olkapääpunnerrus",cat:"Hartiat"},{id:"e8",name:"Hauiskääntö",cat:"Hauis"},
  {id:"e9",name:"Ojentajapunnerrus",cat:"Ojentaja"},{id:"e10",name:"Jalkaprässi",cat:"Jalat"},
  {id:"e11",name:"Askelkyykky",cat:"Jalat"},{id:"e12",name:"Dippi",cat:"Rinta"},
  {id:"e13",name:"Käsipunojen punnerrus",cat:"Rinta"},{id:"e14",name:"Lantionnosto",cat:"Jalat"},
];
const DEFAULT_ROUTINES=[
  {id:"r1",name:"Yläkroppa A",exercises:["e1","e6","e7","e8"]},
  {id:"r2",name:"Alakroppa",exercises:["e3","e10","e11","e14"]},
  {id:"r3",name:"Selkä & Hauis",exercises:["e4","e5","e6","e8"]},
];
const DAYS=["Ma","Ti","Ke","To","Pe","La","Su"];
const MONTHS=["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"];

const css=`
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
body{background:${C.bg};color:${C.text};font-family:'Syne',sans-serif;overscroll-behavior:none;}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.hdr{padding:54px 20px 14px;background:${C.bg};border-bottom:1px solid ${C.border};position:sticky;top:0;z-index:50;}
.hdr-title{font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.textSub};}
.hdr-date{font-size:11px;color:${C.textMuted};font-family:'JetBrains Mono',monospace;margin-top:4px;}
.content{flex:1;overflow-y:auto;padding:20px 20px 100px;}
.tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${C.surface};border-top:1px solid ${C.border};display:flex;padding:10px 0 28px;z-index:100;}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 0;cursor:pointer;background:none;border:none;color:${C.textMuted};transition:color 0.2s;}
.tab.on{color:${C.cyan};}
.tab svg{width:22px;height:22px;stroke-width:1.7;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;transition:transform 0.2s;}
.tab.on svg{transform:scale(1.1);}
.tab-lbl{font-size:10px;font-weight:600;letter-spacing:0.5px;}
.card{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;margin-bottom:12px;}
.sec{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textMuted};margin:22px 0 10px;}
.streak-wrap{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:18px;margin-bottom:14px;}
.streak-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
.streak-num{font-size:52px;font-weight:800;color:${C.cyan};line-height:1;letter-spacing:-2px;}
.streak-lbl{font-size:11px;color:${C.textSub};margin-top:6px;font-weight:500;}
.streak-sub{font-size:10px;color:${C.textMuted};margin-top:2px;}
.streak-icon{font-size:36px;}
.week-row{display:flex;gap:6px;}
.wd{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;}
.wd-label{font-size:9px;color:${C.textMuted};font-weight:700;letter-spacing:0.5px;}
.wd-dot{width:100%;height:5px;border-radius:3px;background:${C.border};}
.wd-dot.on{background:${C.cyan};}
.wd-dot.cur{background:${C.cyanMid};border:1px solid ${C.cyan};}
.cta{width:100%;background:${C.cyan};color:#000;border:none;border-radius:14px;padding:17px;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:opacity 0.2s,transform 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;}
.cta:active{transform:scale(0.98);opacity:0.88;}
.lw-type{display:inline-flex;align-items:center;gap:6px;background:${C.cyanDim};border:1px solid ${C.cyanMid};border-radius:20px;padding:4px 10px;font-size:11px;color:${C.cyan};font-weight:600;margin-bottom:8px;}
.lw-name{font-size:17px;font-weight:700;margin-bottom:3px;}
.lw-ex{font-size:12px;color:${C.textSub};margin-bottom:12px;}
.stats-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.stat-box{background:${C.surface};border-radius:10px;padding:10px 8px;text-align:center;border:1px solid ${C.border};}
.stat-v{font-size:20px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.stat-l{font-size:10px;color:${C.textSub};margin-top:2px;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.big-stat{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;}
.bs-val{font-size:34px;font-weight:800;color:${C.cyan};letter-spacing:-1px;font-family:'JetBrains Mono',monospace;}
.bs-lbl{font-size:11px;color:${C.textSub};margin-top:4px;}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.type-card{background:${C.card};border-radius:14px;border:2px solid ${C.border};padding:18px 14px;cursor:pointer;transition:all 0.18s;}
.type-card.sel{border-color:${C.cyan};background:${C.cyanDim};}
.type-emoji{font-size:28px;margin-bottom:10px;display:block;}
.type-name{font-size:14px;font-weight:700;}
.type-sub{font-size:11px;color:${C.textSub};margin-top:2px;}
.timer-bar{background:${C.surface};border-bottom:1px solid ${C.border};padding:10px 20px;display:flex;justify-content:space-between;align-items:center;margin:0 -20px 18px;position:sticky;top:0;z-index:30;}
.timer-val{font-family:'JetBrains Mono',monospace;font-size:22px;color:${C.cyan};letter-spacing:2px;}
.timer-lbl{font-size:10px;color:${C.textMuted};letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.end-btn{background:${C.red};color:#fff;border:none;border-radius:10px;padding:8px 18px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:1px;}
.ex-card{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:14px;margin-bottom:10px;}
.ex-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.ex-name{font-size:15px;font-weight:700;}
.ex-del{background:none;border:none;color:${C.textMuted};font-size:18px;cursor:pointer;padding:0 4px;line-height:1;}
.prev-sets{background:${C.surface};border-radius:8px;padding:8px 10px;margin-bottom:10px;border:1px solid ${C.border};}
.prev-title{font-size:9px;color:${C.textMuted};letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:6px;}
.prev-row{font-size:11px;color:${C.textSub};font-family:'JetBrains Mono',monospace;margin-bottom:4px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.prev-date{font-size:9px;color:${C.textMuted};}
.set-labels{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px;gap:6px;margin-bottom:5px;}
.sl{font-size:9px;color:${C.textMuted};text-align:center;letter-spacing:1px;text-transform:uppercase;font-weight:700;}
.set-row{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px;gap:6px;align-items:center;margin-bottom:5px;}
.set-n{font-size:11px;color:${C.textMuted};text-align:center;font-family:'JetBrains Mono',monospace;}
.inp{background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:8px 6px;color:${C.text};font-size:14px;text-align:center;width:100%;outline:none;font-family:'JetBrains Mono',monospace;transition:border-color 0.15s;}
.inp:focus{border-color:${C.cyan};}
.rpe-sel{background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:8px 4px;color:${C.textSub};font-size:12px;width:100%;outline:none;text-align:center;font-family:'JetBrains Mono',monospace;}
.fail-btn{background:${C.surface};border:1px solid ${C.border};border-radius:8px;font-size:10px;color:${C.textMuted};cursor:pointer;padding:8px 2px;text-align:center;transition:all 0.15s;font-weight:700;}
.fail-btn.on{background:rgba(255,68,85,0.1);border-color:${C.red};color:${C.red};}
.add-set{width:100%;background:none;border:1px dashed ${C.border};border-radius:8px;padding:9px;color:${C.textMuted};font-size:12px;cursor:pointer;margin-top:6px;font-family:'Syne',sans-serif;font-weight:600;}
.add-ex{width:100%;background:${C.cyanDim};border:1px dashed ${C.cyan};border-radius:12px;padding:14px;color:${C.cyan};font-size:13px;font-weight:700;cursor:pointer;margin-top:2px;font-family:'Syne',sans-serif;letter-spacing:1px;}
.notes{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:12px;color:${C.text};font-size:13px;resize:none;outline:none;font-family:'Syne',sans-serif;margin-top:4px;}
.notes:focus{border-color:${C.cyan};}
.save-btn{width:100%;background:${C.green};color:#000;border:none;border-radius:14px;padding:16px;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-top:16px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);}
.modal{background:${C.surface};border-radius:20px 20px 0 0;padding:20px 20px 40px;width:100%;max-width:430px;border:1px solid ${C.border};border-bottom:none;max-height:75vh;overflow-y:auto;}
.modal-handle{width:32px;height:3px;background:${C.border};border-radius:2px;margin:0 auto 18px;}
.modal-title{font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.textSub};margin-bottom:14px;}
.modal-search{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:10px 14px;color:${C.text};font-size:14px;outline:none;font-family:'Syne',sans-serif;margin-bottom:12px;}
.modal-search:focus{border-color:${C.cyan};}
.ex-opt{padding:13px 10px;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;border:1px solid transparent;transition:all 0.15s;display:flex;justify-content:space-between;align-items:center;}
.ex-opt:active{background:${C.cyanDim};border-color:${C.cyanMid};color:${C.cyan};}
.ex-opt-sub{font-size:11px;color:${C.textMuted};font-weight:400;}
.routine-card{background:${C.card};border-radius:12px;border:1px solid ${C.border};padding:14px;margin-bottom:8px;cursor:pointer;transition:border-color 0.15s;}
.routine-card:active{border-color:${C.cyan};}
.routine-name{font-size:14px;font-weight:700;margin-bottom:4px;}
.routine-exs{font-size:11px;color:${C.textSub};}
.chart-wrap{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;margin-bottom:12px;}
.chart-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
.chart-title{font-size:14px;font-weight:700;}
.chart-sub{font-size:11px;color:${C.textMuted};margin-top:2px;}
.chart-pr{font-family:'JetBrains Mono',monospace;font-size:13px;color:${C.cyan};}
.line-chart{position:relative;height:90px;margin-bottom:8px;}
.line-svg{width:100%;height:100%;overflow:visible;}
.tag-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
.tag{display:inline-flex;align-items:center;gap:5px;background:${C.surface};border:1px solid ${C.border};border-radius:20px;padding:4px 10px;font-size:11px;color:${C.textSub};font-weight:500;}
.tag.c{background:${C.cyanDim};border-color:${C.cyanMid};color:${C.cyan};}
.ex-sel{background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:10px 12px;color:${C.text};font-size:13px;width:100%;outline:none;font-family:'Syne',sans-serif;margin-bottom:14px;font-weight:600;}
.cal-wrap{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;margin-bottom:14px;}
.cal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
.cal-month{font-size:16px;font-weight:800;}
.cal-nav{background:${C.surface};border:1px solid ${C.border};color:${C.text};border-radius:8px;padding:6px 14px;cursor:pointer;font-size:14px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.cal-dh{text-align:center;font-size:9px;color:${C.textMuted};font-weight:700;letter-spacing:1px;padding:4px 0;}
.cal-d{aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;}
.cal-d.empty{background:none;}
.cal-d.norm{color:${C.textSub};}
.cal-d.trained{background:${C.cyan};color:#000;font-weight:700;}
.cal-d.today{outline:1.5px solid ${C.cyan};color:${C.cyan};}
.prof-hdr{display:flex;align-items:center;gap:16px;background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;margin-bottom:14px;}
.avatar{width:52px;height:52px;border-radius:50%;background:${C.cyanDim};border:1.5px solid ${C.cyan};display:flex;align-items:center;justify-content:center;font-size:24px;}
.prof-name{font-size:20px;font-weight:800;}
.prof-since{font-size:11px;color:${C.textSub};margin-top:3px;}
.body-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;}
.body-box{background:${C.card};border-radius:12px;border:1px solid ${C.border};padding:14px 10px;text-align:center;}
.body-lbl{font-size:9px;color:${C.textMuted};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;font-weight:700;}
.body-inp{background:none;border:none;color:${C.cyan};font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:500;width:100%;text-align:center;outline:none;}
.body-unit{font-size:10px;color:${C.textMuted};margin-top:2px;}
.body-save{width:100%;background:${C.cyan};color:#000;border:none;border-radius:10px;padding:12px;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer;margin-bottom:12px;}
.run-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.run-box{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:16px;}
.run-lbl{font-size:9px;color:${C.textMuted};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:10px;}
.run-inp{background:none;border:none;color:${C.text};font-family:'JetBrains Mono',monospace;font-size:36px;width:100%;outline:none;}
.run-unit{font-size:11px;color:${C.textMuted};margin-top:4px;}
.pace-box{background:${C.cyanDim};border:1px solid ${C.cyanMid};border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.pace-v{font-family:'JetBrains Mono',monospace;font-size:30px;color:${C.cyan};}
.pace-l{font-size:10px;color:${C.textSub};letter-spacing:1px;margin-bottom:4px;}
.mob-row{display:flex;align-items:center;gap:10px;background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:12px 14px;margin-bottom:8px;}
.mob-name{flex:1;font-size:13px;font-weight:600;}
.mob-inp{background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:7px 10px;color:${C.text};font-size:13px;width:70px;text-align:center;outline:none;font-family:'JetBrains Mono',monospace;}
.done-wrap{text-align:center;padding:48px 0 24px;}
.done-icon{font-size:56px;margin-bottom:18px;}
.done-title{font-size:22px;font-weight:800;letter-spacing:1px;margin-bottom:8px;}
.done-sub{font-size:13px;color:${C.textSub};margin-bottom:32px;}
.hist-tabs{display:flex;gap:8px;margin-bottom:16px;}
.hist-tab{flex:1;padding:10px 6px;background:${C.card};border:1px solid ${C.border};border-radius:10px;font-size:11px;font-weight:700;color:${C.textMuted};cursor:pointer;text-align:center;letter-spacing:0.5px;transition:all 0.15s;}
.hist-tab.on{background:${C.cyanDim};border-color:${C.cyan};color:${C.cyan};}
.hist-row{background:${C.card};border-radius:12px;border:1px solid ${C.border};padding:12px 14px;margin-bottom:8px;}
.hist-row-top{display:flex;justify-content:space-between;align-items:flex-start;}
.hist-row-name{font-size:13px;font-weight:700;}
.hist-row-date{font-size:10px;color:${C.textMuted};font-family:'JetBrains Mono',monospace;}
.hist-row-sub{font-size:11px;color:${C.textSub};margin-top:3px;}
.hist-badge{display:inline-flex;align-items:center;background:${C.surface};border:1px solid ${C.border};border-radius:6px;padding:2px 7px;font-size:10px;color:${C.textMuted};margin-right:4px;margin-top:4px;}
.empty-state{text-align:center;padding:40px 16px;}
.empty-icon{font-size:36px;margin-bottom:10px;}
.empty-txt{font-size:13px;color:${C.textSub};}
.empty-sub{font-size:11px;color:${C.textMuted};margin-top:4px;}
.text-inp{flex:1;background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:12px 14px;color:${C.text};font-size:14px;outline:none;font-family:'Syne',sans-serif;}
.text-inp:focus{border-color:${C.cyan};}
.icon-btn{background:none;border:none;color:${C.textMuted};cursor:pointer;padding:4px 8px;font-size:18px;}
.chart-tabs{display:flex;gap:6px;margin-bottom:14px;}
.chart-tab{padding:6px 12px;background:${C.surface};border:1px solid ${C.border};border-radius:8px;font-size:11px;font-weight:700;color:${C.textMuted};cursor:pointer;}
.chart-tab.on{background:${C.cyanDim};border-color:${C.cyan};color:${C.cyan};}
.lock-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;background:${C.bg};}
.lock-icon{font-size:52px;margin-bottom:24px;}
.lock-title{font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.textSub};margin-bottom:6px;text-align:center;}
.lock-sub{font-size:12px;color:${C.textMuted};margin-bottom:40px;text-align:center;}
.lock-input-wrap{position:relative;width:100%;max-width:280px;margin-bottom:12px;}
.lock-input{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:16px 48px 16px 16px;color:${C.text};font-size:16px;outline:none;font-family:'Syne',sans-serif;text-align:center;letter-spacing:2px;transition:border-color 0.2s;}
.lock-input:focus{border-color:${C.cyan};}
.lock-input.err{border-color:${C.red};}
.lock-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:${C.textMuted};cursor:pointer;font-size:18px;padding:4px;}
.lock-btn{width:100%;max-width:280px;background:${C.cyan};color:#000;border:none;border-radius:12px;padding:16px;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-bottom:16px;}
.lock-err{font-size:12px;color:${C.red};min-height:18px;text-align:center;margin-bottom:8px;}
.edit-row{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px 28px;gap:6px;align-items:center;margin-bottom:5px;}
.del-set{background:none;border:none;color:${C.textMuted};cursor:pointer;font-size:16px;padding:0 2px;line-height:1;}
.del-set:active{color:${C.red};}
.danger-btn{width:100%;background:rgba(255,68,85,0.1);color:${C.red};border:1px solid ${C.red};border-radius:12px;padding:14px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px;letter-spacing:1px;}
`;

const uid=()=>Math.random().toString(36).slice(2,10);
const fmtDate=d=>new Date(d).toLocaleDateString("fi-FI",{day:"numeric",month:"numeric",year:"2-digit"});
const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const typeEmoji=t=>({gym:"🏋️",home:"🏠",run:"🏃",bike:"🚴",mob:"🧘"}[t]||"💪");
const typeName=t=>({gym:"Kuntosali",home:"Kotitreeni",run:"Juoksulenkki",bike:"Pyörälenkki",mob:"Kehonhuolto"}[t]||t);

function LineChart({data,color,labels}){
  if(!data||data.length<2)return null;
  const w=300,h=80;
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>({x:(i/(data.length-1))*w,y:h-((v-min)/range)*(h-10)-5}));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const gid=`lg${color.replace(/[^a-z0-9]/gi,"")}`;
  return(
    <div className="line-chart">
      <svg className="line-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient></defs>
        <path d={path+` L${w},${h} L0,${h} Z`} fill={`url(#${gid})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="4" fill={color} stroke={C.card} strokeWidth="2"/>
      </svg>
      {labels&&<div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontSize:9,color:C.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>{labels[0]}</span>
        <span style={{fontSize:9,color:C.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>{labels[labels.length-1]}</span>
      </div>}
    </div>
  );
}

function LockScreen({onUnlock}){
  const [pw,setPw]=useState("");const [show,setShow]=useState(false);
  const [err,setErr]=useState("");const [shake,setShake]=useState(false);
  const tryUnlock=()=>{
    if(pw===APP_PASSWORD){localStorage.setItem(AUTH_KEY,"1");onUnlock();}
    else{setErr("Väärä salasana");setShake(true);setPw("");setTimeout(()=>{setShake(false);setErr("");},1500);}
  };
  return(
    <div className="lock-wrap">
      <div className="lock-icon">🔒</div>
      <div className="lock-title">Treenipäiväkirja</div>
      <div className="lock-sub">Syötä salasana jatkaaksesi</div>
      <div className="lock-input-wrap">
        <input className={`lock-input${shake?" err":""}`} type={show?"text":"password"} placeholder="••••••••"
          value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryUnlock()} autoFocus/>
        <button className="lock-toggle" onClick={()=>setShow(s=>!s)}>{show?"🙈":"👁️"}</button>
      </div>
      <div className="lock-err">{err}</div>
      <button className="lock-btn" onClick={tryUnlock}>Avaa</button>
    </div>
  );
}

function HomeTab({workouts,onStart}){
  const now=new Date();
  const thisMonth=workouts.filter(w=>{const d=new Date(w.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const lastMonth=workouts.filter(w=>{const d=new Date(w.date);const lm=new Date(now.getFullYear(),now.getMonth()-1,1);return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear();});
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-((now.getDay()+6)%7));
  const week=DAYS.map((_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return workouts.some(w=>new Date(w.date).toDateString()===d.toDateString());});
  const todayIdx=(now.getDay()+6)%7;
  let streak=0;const chk=new Date(now);
  while(workouts.some(w=>new Date(w.date).toDateString()===chk.toDateString())){streak++;chk.setDate(chk.getDate()-1);}
  const last=workouts[0];
  const weekMin=Math.round(workouts.filter(w=>new Date(w.date)>=weekStart).reduce((a,w)=>a+(w.duration||0),0)/60);
  return(
    <div>
      <div className="streak-wrap">
        <div className="streak-top">
          <div>
            <div className="streak-num">{thisMonth.length}</div>
            <div className="streak-lbl">treeniä tässä kuussa</div>
            <div className="streak-sub">Edellinen kuukausi: {lastMonth.length} treeniä</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="streak-icon">🔥</div>
            <div style={{fontSize:11,color:C.cyan,marginTop:4,fontWeight:700}}>{streak} pv putki</div>
          </div>
        </div>
        <div className="week-row">
          {DAYS.map((d,i)=>(
            <div key={i} className="wd">
              <div className="wd-label">{d}</div>
              <div className={`wd-dot${week[i]?" on":i===todayIdx?" cur":""}`}/>
            </div>
          ))}
        </div>
      </div>
      <button className="cta" onClick={onStart}>+ Aloita treeni</button>
      <div className="sec">Viimeisin treeni</div>
      {last?(
        <div className="card">
          <div className="lw-type">{typeEmoji(last.type)} {typeName(last.type)} · {fmtDate(last.date)}</div>
          <div className="lw-name">{last.name||typeName(last.type)}</div>
          {last.exercises&&<div className="lw-ex">{last.exercises.slice(0,3).map(e=>e.name).join(" · ")}{last.exercises.length>3?" · ...":""}</div>}
          <div className="stats-row">
            <div className="stat-box"><div className="stat-v">{last.exercises?.length||"-"}</div><div className="stat-l">liikettä</div></div>
            <div className="stat-box"><div className="stat-v">{last.exercises?.reduce((a,e)=>a+e.sets.length,0)||"-"}</div><div className="stat-l">sarjaa</div></div>
            <div className="stat-box"><div className="stat-v">{fmtTime(last.duration||0)}</div><div className="stat-l">kesto</div></div>
          </div>
        </div>
      ):(
        <div className="card" style={{textAlign:"center",padding:"28px 16px"}}>
          <div style={{fontSize:32,marginBottom:10}}>🏋️</div>
          <div style={{fontSize:13,color:C.textSub}}>Ei vielä treenejä.</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>Aloita ensimmäinen treeni!</div>
        </div>
      )}
      <div className="sec">Tällä viikolla</div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">{week.filter(Boolean).length}</div><div className="bs-lbl">treeniä</div></div>
        <div className="big-stat"><div className="bs-val">{weekMin||0}</div><div className="bs-lbl">min yhteensä</div></div>
      </div>
    </div>
  );
}

function WorkoutTab({workouts,exercises,routines,onSave}){
  const [phase,setPhase]=useState("select");
  const [type,setType]=useState(null);
  const [wName,setWName]=useState("");
  const [exs,setExs]=useState([]);
  const [modal,setModal]=useState(false);
  const [notes,setNotes]=useState("");
  const [secs,setSecs]=useState(0);
  const [km,setKm]=useState("");const [mins,setMins]=useState("");
  const [mobData,setMobData]=useState(["Lonkan avaus","Rintarangan kierto","Hartiat","Takareidet","Pohjelihas","Selkä","Niska"].map(n=>({name:n,secs:""})));
  const [search,setSearch]=useState("");
  const timer=useRef(null);const saved=useRef(false);

  useEffect(()=>{
    if(phase==="log"){saved.current=false;timer.current=setInterval(()=>setSecs(s=>s+1),1000);}
    return()=>clearInterval(timer.current);
  },[phase]);

  const addEx=name=>{setExs(e=>[...e,{id:uid(),name,sets:[{kg:"",reps:"",rpe:"",fail:false}]}]);setModal(false);setSearch("");};
  const loadRoutine=r=>{
    const names=r.exercises.map(eid=>exercises.find(e=>e.id===eid)?.name).filter(Boolean);
    setExs(names.map(n=>({id:uid(),name:n,sets:[{kg:"",reps:"",rpe:"",fail:false}]})));
    setWName(r.name);setModal(false);
  };
  const addSet=ei=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:[...x.sets,{kg:"",reps:"",rpe:"",fail:false}]}:x));
  const upd=(ei,si,f,v)=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:x.sets.map((s,j)=>j===si?{...s,[f]:v}:s)}:x));
  const toggleFail=(ei,si)=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:x.sets.map((s,j)=>j===si?{...s,fail:!s.fail}:s)}:x));
  const pace=()=>{if(!km||!mins)return"--:--";const p=parseFloat(mins)/parseFloat(km);const m=Math.floor(p),s=Math.round((p-m)*60);return`${m}:${String(s).padStart(2,"0")}`;};
  const speed=()=>{if(!km||!mins)return"--";return(parseFloat(km)/parseFloat(mins)*60).toFixed(1);};
  const getPrev=name=>workouts.filter(w=>w.exercises?.some(e=>e.name===name)).slice(0,3).map(w=>({date:w.date,sets:w.exercises.find(e=>e.name===name).sets}));

  const doSave=()=>{
    if(saved.current)return;saved.current=true;clearInterval(timer.current);
    const w={id:uid(),date:new Date().toISOString(),type,name:wName||typeName(type),duration:secs,notes,
      exercises:(type==="gym"||type==="home")?exs:undefined,
      km:km||undefined,mins:mins||undefined,
      mobility:(type==="mob")?mobData.filter(m=>m.secs):undefined};
    onSave(w);setPhase("done");
  };

  const TYPES=[{id:"gym",emoji:"🏋️",name:"Kuntosali",sub:"Vapaat painot & laitteet"},{id:"home",emoji:"🏠",name:"Kotitreeni",sub:"Kehonpaino & kotipainot"},{id:"run",emoji:"🏃",name:"Juoksulenkki",sub:"Ulkona tai juoksumatolla"},{id:"bike",emoji:"🚴",name:"Pyörälenkki",sub:"Maantie tai maastopyörä"},{id:"mob",emoji:"🧘",name:"Kehonhuolto",sub:"Venyttely & mobiliteetti"}];
  const filtered=exercises.filter(e=>e.name.toLowerCase().includes(search.toLowerCase()));

  if(phase==="select")return(
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:22,fontWeight:800}}>Uusi treeni</div><div style={{fontSize:12,color:C.textSub,marginTop:4}}>Valitse treenityyppi</div></div>
      <div className="type-grid">{TYPES.map(t=><div key={t.id} className={`type-card${type===t.id?" sel":""}`} onClick={()=>setType(t.id)}><span className="type-emoji">{t.emoji}</span><div className="type-name">{t.name}</div><div className="type-sub">{t.sub}</div></div>)}</div>
      {(type==="gym"||type==="home")&&routines.length>0&&<>
        <div className="sec">Valitse ohjelma (valinnainen)</div>
        {routines.map(r=>(
          <div key={r.id} className="routine-card" style={{border:`2px solid ${wName===r.name?C.cyan:C.border}`,background:wName===r.name?C.cyanDim:C.card}} onClick={()=>{
            if(wName===r.name){setWName("");setExs([]);}
            else{
              const names=r.exercises.map(eid=>exercises.find(e=>e.id===eid)?.name).filter(Boolean);
              setExs(names.map(n=>({id:uid(),name:n,sets:[{kg:"",reps:"",rpe:"",fail:false}]})));
              setWName(r.name);
            }
          }}>
            <div className="routine-name" style={{color:wName===r.name?C.cyan:C.text}}>{wName===r.name?"✓ ":""}{r.name}</div>
            <div className="routine-exs">{r.exercises.map(eid=>exercises.find(e=>e.id===eid)?.name).filter(Boolean).join(" · ")}</div>
          </div>
        ))}
        <div style={{fontSize:11,color:C.textMuted,marginBottom:8,marginTop:4}}>Tai aloita tyhjältä pohjalta →</div>
      </>}
      {type&&<button className="cta" onClick={()=>setPhase("log")}>Aloita →</button>}
    </div>
  );

  if(phase==="log")return(
    <div>
      <div className="timer-bar"><div><div className="timer-lbl">Kesto</div><div className="timer-val">{fmtTime(secs)}</div></div><button className="end-btn" onClick={doSave}>Lopeta</button></div>
      {(type==="gym"||type==="home")&&<>
        <input className="text-inp" style={{width:"100%",marginBottom:12}} placeholder="Treenin nimi (valinnainen)" value={wName} onChange={e=>setWName(e.target.value)}/>
        {exs.map((ex,ei)=>{
          const prev=getPrev(ex.name);
          return(
            <div key={ex.id} className="ex-card">
              <div className="ex-hdr"><div className="ex-name">{ex.name}</div><button className="ex-del" onClick={()=>setExs(e=>e.filter((_,i)=>i!==ei))}>✕</button></div>
              {prev.length>0&&<div className="prev-sets">
                <div className="prev-title">Edelliset {prev.length} kertaa</div>
                {prev.map((p,pi)=>(
                  <div key={pi} className="prev-row">
                    <span className="prev-date">{fmtDate(p.date)}</span>
                    {p.sets.map((s,si)=><span key={si}>{s.kg||"?"}kg×{s.reps||"?"}{si<p.sets.length-1?" ·":""}</span>)}
                  </div>
                ))}
              </div>}
              <div className="set-labels"><div className="sl">#</div><div className="sl">kg</div><div className="sl">toistot</div><div className="sl">RPE</div><div className="sl">Fail</div></div>
              {ex.sets.map((s,si)=>(
                <div key={si} className="set-row">
                  <div className="set-n">{si+1}</div>
                  <input className="inp" type="number" placeholder="—" value={s.kg} onChange={e=>upd(ei,si,"kg",e.target.value)}/>
                  <input className="inp" type="number" placeholder="—" value={s.reps} onChange={e=>upd(ei,si,"reps",e.target.value)}/>
                  <select className="rpe-sel" value={s.rpe} onChange={e=>upd(ei,si,"rpe",e.target.value)}><option value="">—</option>{[6,7,7.5,8,8.5,9,9.5,10].map(r=><option key={r}>{r}</option>)}</select>
                  <button className={`fail-btn${s.fail?" on":""}`} onClick={()=>toggleFail(ei,si)}>{s.fail?"✓":"FAIL"}</button>
                </div>
              ))}
              <button className="add-set" onClick={()=>addSet(ei)}>+ Lisää sarja</button>
            </div>
          );
        })}
        <button className="add-ex" onClick={()=>setModal(true)}>+ Lisää liike</button>
      </>}
      {type==="run"&&<>
        <div className="run-grid">
          <div className="run-box"><div className="run-lbl">Matka</div><input className="run-inp" type="number" placeholder="0.0" value={km} onChange={e=>setKm(e.target.value)}/><div className="run-unit">km</div></div>
          <div className="run-box"><div className="run-lbl">Aika</div><input className="run-inp" type="number" placeholder="00" value={mins} onChange={e=>setMins(e.target.value)}/><div className="run-unit">min</div></div>
        </div>
        {km&&mins&&<div className="pace-box"><div><div className="pace-l">Vauhti</div><div className="pace-v">{pace()}</div></div><div style={{textAlign:"right"}}><div className="pace-l">min / km</div></div></div>}
      </>}
      {type==="bike"&&<>
        <div className="run-grid">
          <div className="run-box"><div className="run-lbl">Matka</div><input className="run-inp" type="number" placeholder="0.0" value={km} onChange={e=>setKm(e.target.value)}/><div className="run-unit">km</div></div>
          <div className="run-box"><div className="run-lbl">Aika</div><input className="run-inp" type="number" placeholder="00" value={mins} onChange={e=>setMins(e.target.value)}/><div className="run-unit">min</div></div>
        </div>
        {km&&mins&&<div className="pace-box"><div><div className="pace-l">Keskinopeus</div><div className="pace-v">{speed()}</div></div><div style={{textAlign:"right"}}><div className="pace-l">km / h</div></div></div>}
      </>}
      {type==="mob"&&<div>{mobData.map((m,i)=><div key={i} className="mob-row"><div className="mob-name">{m.name}</div><input className="mob-inp" type="number" placeholder="sek" value={m.secs} onChange={e=>{const d=[...mobData];d[i]={...d[i],secs:e.target.value};setMobData(d);}}/></div>)}</div>}
      <div className="sec" style={{marginTop:20}}>Muistiinpanot</div>
      <textarea className="notes" rows={3} placeholder='esim. "jalat väsyneet, hyvä treeni"' value={notes} onChange={e=>setNotes(e.target.value)}/>
      <button className="save-btn" onClick={doSave}>Tallenna treeni</button>
      {modal&&<div className="overlay" onClick={()=>{setModal(false);setSearch("");}}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="modal-title">Lisää liike</div>
          <input className="modal-search" placeholder="Hae liikettä..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
          {routines.length>0&&!search&&<>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:C.textMuted,marginBottom:8}}>OHJELMAT</div>
            {routines.map(r=><div key={r.id} className="routine-card" onClick={()=>loadRoutine(r)}>
              <div className="routine-name">{r.name}</div>
              <div className="routine-exs">{r.exercises.map(eid=>exercises.find(e=>e.id===eid)?.name).filter(Boolean).join(" · ")}</div>
            </div>)}
            <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:C.textMuted,margin:"14px 0 8px"}}>YKSITTÄISET LIIKKEET</div>
          </>}
          {filtered.map(ex=><div key={ex.id} className="ex-opt" onClick={()=>addEx(ex.name)}><span>{ex.name}</span><span className="ex-opt-sub">{ex.cat}</span></div>)}
        </div>
      </div>}
    </div>
  );

  return(
    <div className="done-wrap">
      <div className="done-icon">✅</div>
      <div className="done-title">Treeni tallennettu!</div>
      <div className="done-sub">Hienoa työtä 💪</div>
      <div className="stats-row" style={{marginBottom:28}}>
        <div className="stat-box"><div className="stat-v">{fmtTime(secs)}</div><div className="stat-l">kesto</div></div>
        <div className="stat-box"><div className="stat-v">{exs.length||"-"}</div><div className="stat-l">liikettä</div></div>
        <div className="stat-box"><div className="stat-v">{exs.reduce((a,e)=>a+e.sets.length,0)||"-"}</div><div className="stat-l">sarjaa</div></div>
      </div>
      <button className="cta" onClick={()=>{setPhase("select");setExs([]);setSecs(0);setNotes("");setKm("");setMins("");setWName("");}}>Uusi treeni</button>
    </div>
  );
}

function StatsTab({workouts,bodyLogs}){
  const [ex,setEx]=useState("");
  const [bodyMetric,setBodyMetric]=useState("weight");
  const gymW=workouts.filter(w=>w.type==="gym"||w.type==="home");
  const runW=workouts.filter(w=>w.type==="run");
  const bikeW=workouts.filter(w=>w.type==="bike");
  const allExNames=[...new Set(gymW.flatMap(w=>w.exercises?.map(e=>e.name)||[]))];
  const selEx=ex||allExNames[0]||"";
  const exData=gymW.filter(w=>w.exercises?.some(e=>e.name===selEx)).map(w=>{const sets=w.exercises.find(e=>e.name===selEx).sets;const best=Math.max(...sets.map(s=>parseFloat(s.kg)||0));return{date:w.date,val:best};}).filter(d=>d.val>0).slice(-12);
  const runData=runW.filter(w=>w.km&&w.mins).map(w=>({date:w.date,val:parseFloat(w.mins)/parseFloat(w.km)})).slice(-12);
  const bikeData=bikeW.filter(w=>w.km&&w.mins).map(w=>({date:w.date,val:parseFloat(w.km)/parseFloat(w.mins)*60})).slice(-12);
  const bodyData=bodyLogs.slice(-12).map(l=>({date:l.date,val:bodyMetric==="weight"?l.weight:bodyMetric==="fat"?l.fat:l.muscle})).filter(d=>d.val);
  const pr=exData.length?Math.max(...exData.map(d=>d.val)):null;
  return(
    <div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">{workouts.length}</div><div className="bs-lbl">treeniä yhteensä</div></div>
        <div className="big-stat"><div className="bs-val">{pr||"—"}</div><div className="bs-lbl">kg {selEx.split(" ")[0]||""} PR</div></div>
      </div>
      <div className="sec">Liikekohtainen kehitys</div>
      <select className="ex-sel" value={selEx} onChange={e=>setEx(e.target.value)}>
        {allExNames.length>0?allExNames.map(n=><option key={n}>{n}</option>):<option>Ei vielä treenejä</option>}
      </select>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">{selEx||"—"}</div><div className="chart-sub">Paras paino per treeni (kg)</div></div>{pr&&<div className="chart-pr">PR {pr} kg</div>}</div>
        {exData.length>=2?<><LineChart data={exData.map(d=>d.val)} color={C.cyan} labels={exData.map(d=>fmtDate(d.date))}/><div className="tag-row"><div className="tag c">+{(exData[exData.length-1].val-exData[0].val).toFixed(1)} kg</div>{pr&&<div className="tag">🏆 PR: {pr} kg</div>}</div></>:<div className="empty-state"><div className="empty-icon">📈</div><div className="empty-txt">Kirjaa vähintään 2 treeniä nähdäksesi kehityksen.</div></div>}
      </div>
      <div className="sec">Juoksukehitys</div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">Juoksuvauhti</div><div className="chart-sub">min / km</div></div>{runData.length>0&&<div className="chart-pr">PR {Math.min(...runData.map(d=>d.val)).toFixed(2)}</div>}</div>
        {runData.length>=2?<LineChart data={runData.map(d=>d.val)} color={C.cyan} labels={runData.map(d=>fmtDate(d.date))}/>:<div className="empty-state"><div className="empty-icon">🏃</div><div className="empty-txt">Ei vielä tarpeeksi lenkkejä.</div></div>}
      </div>
      <div className="sec">Pyöräkehitys</div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">Keskinopeus</div><div className="chart-sub">km / h</div></div>{bikeData.length>0&&<div className="chart-pr">PR {Math.max(...bikeData.map(d=>d.val)).toFixed(1)}</div>}</div>
        {bikeData.length>=2?<LineChart data={bikeData.map(d=>d.val)} color={C.cyan} labels={bikeData.map(d=>fmtDate(d.date))}/>:<div className="empty-state"><div className="empty-icon">🚴</div><div className="empty-txt">Ei vielä tarpeeksi pyörälenkkejä.</div></div>}
      </div>
      <div className="sec">Kehon kehitys</div>
      <div className="chart-tabs">
        {[["weight","Paino"],["fat","Rasva%"],["muscle","Lihas%"]].map(([k,l])=><button key={k} className={`chart-tab${bodyMetric===k?" on":""}`} onClick={()=>setBodyMetric(k)}>{l}</button>)}
      </div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">{{weight:"Paino",fat:"Rasvaprosentti",muscle:"Lihasmassa"}[bodyMetric]}</div><div className="chart-sub">{{weight:"kg",fat:"%",muscle:"%"}[bodyMetric]}</div></div></div>
        {bodyData.length>=2?<LineChart data={bodyData.map(d=>d.val)} color={C.cyan} labels={bodyData.map(d=>fmtDate(d.date))}/>:<div className="empty-state"><div className="empty-icon">⚖️</div><div className="empty-txt">Ei vielä tarpeeksi mittauksia.</div></div>}
      </div>
    </div>
  );
}

function CalTab({workouts}){
  const [mo,setMo]=useState(new Date().getMonth());
  const yr=new Date().getFullYear();
  const days=[31,28,31,30,31,30,31,31,30,31,30,31][mo];
  const offset=(()=>{const d=new Date(yr,mo,1).getDay();return d===0?6:d-1;})();
  const today=new Date().getMonth()===mo?new Date().getDate():null;
  const monthW=workouts.filter(w=>{const d=new Date(w.date);return d.getMonth()===mo&&d.getFullYear()===yr;});
  const trainedDays=new Set(monthW.map(w=>new Date(w.date).getDate()));
  return(
    <div>
      <div className="cal-wrap">
        <div className="cal-hdr">
          <button className="cal-nav" onClick={()=>setMo(m=>Math.max(0,m-1))}>‹</button>
          <div className="cal-month">{MONTHS[mo]} {yr}</div>
          <button className="cal-nav" onClick={()=>setMo(m=>Math.min(11,m+1))}>›</button>
        </div>
        <div className="cal-grid">
          {DAYS.map(d=><div key={d} className="cal-dh">{d}</div>)}
          {Array(offset).fill(null).map((_,i)=><div key={`e${i}`} className="cal-d empty"/>)}
          {Array(days).fill(null).map((_,i)=>{const d=i+1;const isTr=trainedDays.has(d);const isTd=d===today;return<div key={d} className={`cal-d${isTd?" today":isTr?" trained":" norm"}`}>{isTr&&!isTd?"▪":d}</div>;})}
        </div>
      </div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">{monthW.length}</div><div className="bs-lbl">treeniä / kk</div></div>
        <div className="big-stat"><div className="bs-val">{Math.round(monthW.reduce((a,w)=>a+(w.duration||0),0)/60)||0}</div><div className="bs-lbl">min yhteensä</div></div>
      </div>
    </div>
  );
}

function HistoryTab({workouts,bodyLogs,onUpdateWorkout,onDeleteWorkout,onDeleteBody}){
  const [tab,setTab]=useState("workouts");
  const gymW=workouts.filter(w=>w.type==="gym"||w.type==="home");
  const allExNames=[...new Set(gymW.flatMap(w=>w.exercises?.map(e=>e.name)||[]))];
  const [selEx,setSelEx]=useState("");
  const exName=selEx||allExNames[0]||"";
  const [editing,setEditing]=useState(null); // workout being edited
  const [editData,setEditData]=useState(null);

  const startEdit=w=>{setEditing(w.id);setEditData(JSON.parse(JSON.stringify(w)));};
  const cancelEdit=()=>{setEditing(null);setEditData(null);};
  const saveEdit=()=>{onUpdateWorkout(editData);setEditing(null);setEditData(null);};

  const updEditSet=(ei,si,f,v)=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:ex.sets.map((s,j)=>j===si?{...s,[f]:v}:s)}:ex)}));
  const delEditSet=(ei,si)=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:ex.sets.filter((_,j)=>j!==si)}:ex)}));
  const addEditSet=ei=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:[...ex.sets,{kg:"",reps:"",rpe:"",fail:false}]}:ex)}));
  const delEditEx=ei=>setEditData(d=>({...d,exercises:d.exercises.filter((_,i)=>i!==ei)}));

  // Edit modal
  if(editing&&editData)return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={cancelEdit} style={{background:"none",border:"none",color:C.textSub,fontSize:22,cursor:"pointer",padding:"0 4px"}}>←</button>
        <div style={{fontSize:16,fontWeight:800}}>Muokkaa treeniä</div>
      </div>
      <input className="text-inp" style={{width:"100%",marginBottom:10}} value={editData.name||""} onChange={e=>setEditData(d=>({...d,name:e.target.value}))} placeholder="Treenin nimi"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>KESTO (min)</div>
          <input className="inp" type="number" value={Math.round((editData.duration||0)/60)} onChange={e=>setEditData(d=>({...d,duration:parseInt(e.target.value||0)*60}))}/>
        </div>
        <div><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>PÄIVÄMÄÄRÄ</div>
          <input className="inp" type="date" value={editData.date?editData.date.slice(0,10):""} onChange={e=>setEditData(d=>({...d,date:new Date(e.target.value).toISOString()}))} style={{fontSize:12}}/>
        </div>
      </div>
      {(editData.type==="run"||editData.type==="bike")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>MATKA (km)</div><input className="inp" type="number" value={editData.km||""} onChange={e=>setEditData(d=>({...d,km:e.target.value}))}/></div>
        <div><div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>AIKA (min)</div><input className="inp" type="number" value={editData.mins||""} onChange={e=>setEditData(d=>({...d,mins:e.target.value}))}/></div>
      </div>}
      {editData.exercises&&editData.exercises.map((ex,ei)=>(
        <div key={ei} className="ex-card">
          <div className="ex-hdr"><div className="ex-name">{ex.name}</div><button className="ex-del" onClick={()=>delEditEx(ei)}>✕</button></div>
          <div className="set-labels" style={{gridTemplateColumns:"26px 1fr 1fr 60px 44px 28px"}}>
            <div className="sl">#</div><div className="sl">kg</div><div className="sl">toistot</div><div className="sl">RPE</div><div className="sl">Fail</div><div className="sl"/>
          </div>
          {ex.sets.map((s,si)=>(
            <div key={si} className="edit-row">
              <div className="set-n">{si+1}</div>
              <input className="inp" type="number" value={s.kg} onChange={e=>updEditSet(ei,si,"kg",e.target.value)}/>
              <input className="inp" type="number" value={s.reps} onChange={e=>updEditSet(ei,si,"reps",e.target.value)}/>
              <select className="rpe-sel" value={s.rpe} onChange={e=>updEditSet(ei,si,"rpe",e.target.value)}><option value="">—</option>{[6,7,7.5,8,8.5,9,9.5,10].map(r=><option key={r}>{r}</option>)}</select>
              <button className={`fail-btn${s.fail?" on":""}`} onClick={()=>updEditSet(ei,si,"fail",!s.fail)}>{s.fail?"✓":"FAIL"}</button>
              <button className="del-set" onClick={()=>delEditSet(ei,si)}>✕</button>
            </div>
          ))}
          <button className="add-set" onClick={()=>addEditSet(ei)}>+ Lisää sarja</button>
        </div>
      ))}
      <div style={{fontSize:10,color:C.textMuted,marginBottom:4,marginTop:8}}>MUISTIINPANOT</div>
      <textarea className="notes" rows={2} value={editData.notes||""} onChange={e=>setEditData(d=>({...d,notes:e.target.value}))}/>
      <button className="save-btn" onClick={saveEdit}>Tallenna muutokset</button>
      <button className="danger-btn" onClick={()=>{if(window.confirm("Poistetaanko tämä treeni?")){onDeleteWorkout(editData.id);setEditing(null);setEditData(null);}}}>🗑️ Poista treeni</button>
    </div>
  );

  return(
    <div>
      <div className="hist-tabs">
        {[["workouts","Treenit"],["exercises","Liikkeet"],["body","Keho"]].map(([k,l])=>(
          <button key={k} className={`hist-tab${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==="workouts"&&(workouts.length===0?(
        <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-txt">Ei vielä treenejä.</div></div>
      ):workouts.map(w=>(
        <div key={w.id} className="hist-row" style={{cursor:"pointer"}} onClick={()=>startEdit(w)}>
          <div className="hist-row-top">
            <div className="hist-row-name">{typeEmoji(w.type)} {w.name||typeName(w.type)}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="hist-row-date">{fmtDate(w.date)}</div>
              <span style={{fontSize:12,color:C.textMuted}}>✏️</span>
            </div>
          </div>
          <div className="hist-row-sub">{w.exercises&&`${w.exercises.length} liikettä · ${w.exercises.reduce((a,e)=>a+e.sets.length,0)} sarjaa`}{(w.type==="run"||w.type==="bike")&&w.km&&`${w.km} km · ${w.mins} min`}{w.duration?` · ${fmtTime(w.duration)}`:""}</div>
          {w.exercises&&<div style={{marginTop:6}}>{w.exercises.map(e=><span key={e.name} className="hist-badge">{e.name}</span>)}</div>}
          {w.notes&&<div style={{fontSize:11,color:C.textMuted,marginTop:6,fontStyle:"italic"}}>"{w.notes}"</div>}
        </div>
      )))}
      {tab==="exercises"&&<div>
        <select className="ex-sel" value={exName} onChange={e=>setSelEx(e.target.value)}>
          {allExNames.length>0?allExNames.map(n=><option key={n}>{n}</option>):<option>Ei vielä treenejä</option>}
        </select>
        {gymW.filter(w=>w.exercises?.some(e=>e.name===exName)).map(w=>{
          const ex=w.exercises.find(e=>e.name===exName);
          return(
            <div key={w.id} className="hist-row">
              <div className="hist-row-top"><div className="hist-row-name">{exName}</div><div className="hist-row-date">{fmtDate(w.date)}</div></div>
              <div style={{marginTop:8}}>{ex.sets.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,fontSize:12,color:C.textSub,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>
                  <span style={{color:C.textMuted,minWidth:20}}>{i+1}.</span>
                  <span>{s.kg||"—"} kg × {s.reps||"—"} toistoa</span>
                  {s.rpe&&<span style={{color:C.textMuted}}>RPE {s.rpe}</span>}
                  {s.fail&&<span style={{color:C.red}}>FAIL</span>}
                </div>
              ))}</div>
            </div>
          );
        })}
        {allExNames.length===0&&<div className="empty-state"><div className="empty-icon">💪</div><div className="empty-txt">Ei vielä liikkeitä.</div></div>}
      </div>}
      {tab==="body"&&(bodyLogs.length===0?(
        <div className="empty-state"><div className="empty-icon">⚖️</div><div className="empty-txt">Ei vielä mittauksia.</div><div className="empty-sub">Lisää mittaukset Profiili-välilehdellä.</div></div>
      ):[...bodyLogs].reverse().map((l,i)=>(
        <div key={i} className="hist-row">
          <div className="hist-row-top">
            <div className="hist-row-name">Kehon mittaus</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="hist-row-date">{fmtDate(l.date)}</div>
              <button className="icon-btn" style={{fontSize:14,padding:"0 2px"}} onClick={()=>{if(window.confirm("Poistetaanko tämä mittaus?"))onDeleteBody(bodyLogs.length-1-i);}}>🗑️</button>
            </div>
          </div>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            {l.weight&&<div><div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.cyan}}>{l.weight}</div><div style={{fontSize:10,color:C.textMuted}}>kg</div></div>}
            {l.fat&&<div><div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.cyan}}>{l.fat}</div><div style={{fontSize:10,color:C.textMuted}}>rasva%</div></div>}
            {l.muscle&&<div><div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.cyan}}>{l.muscle}</div><div style={{fontSize:10,color:C.textMuted}}>lihas%</div></div>}
          </div>
        </div>
      )))}
    </div>
  );
}

function ProfileTab({bodyLogs,onSaveBody,exercises,setExercises,routines,setRoutines}){
  const [w,setW]=useState("");const [m,setM]=useState("");const [f,setF]=useState("");
  const [view,setView]=useState("profile");
  const [newEx,setNewEx]=useState("");const [newExCat,setNewExCat]=useState("Muu");
  const [newRname,setNewRname]=useState("");const [newRexs,setNewRexs]=useState([]);
  const CATS=["Rinta","Selkä","Jalat","Hartiat","Hauis","Ojentaja","Vatsa","Muu"];
  const saveBody=()=>{
    if(!w&&!m&&!f)return;
    onSaveBody({date:new Date().toISOString(),weight:w?parseFloat(w):undefined,fat:f?parseFloat(f):undefined,muscle:m?parseFloat(m):undefined});
    setW("");setM("");setF("");
    alert("Mittaukset tallennettu!");
  };
  const addExercise=()=>{if(!newEx.trim())return;setExercises(e=>[...e,{id:uid(),name:newEx.trim(),cat:newExCat}]);setNewEx("");};
  const toggleRoutineEx=id=>setNewRexs(e=>e.includes(id)?e.filter(x=>x!==id):[...e,id]);
  const saveRoutine=()=>{if(!newRname.trim()||newRexs.length===0)return;setRoutines(r=>[...r,{id:uid(),name:newRname.trim(),exercises:newRexs}]);setNewRname("");setNewRexs([]);};
  return(
    <div>
      <div className="hist-tabs">
        {[["profile","Profiili"],["exercises","Liikepankki"],["routines","Ohjelmat"]].map(([k,l])=>(
          <button key={k} className={`hist-tab${view===k?" on":""}`} onClick={()=>setView(k)}>{l}</button>
        ))}
      </div>
      {view==="profile"&&<>
        <div className="prof-hdr"><div className="avatar">💪</div><div><div className="prof-name">Omatreeni</div><div className="prof-since">Aloitettu {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</div></div></div>
        <div className="sec">Kehon mittaukset — tänään</div>
        <div className="body-grid">
          {[["Paino",w,setW,"kg"],["Lihas",m,setM,"%"],["Rasva",f,setF,"%"]].map(([lbl,val,set,unit])=>(
            <div key={lbl} className="body-box"><div className="body-lbl">{lbl}</div><input className="body-inp" placeholder="—" value={val} onChange={e=>set(e.target.value)}/><div className="body-unit">{unit}</div></div>
          ))}
        </div>
        <button className="body-save" onClick={saveBody}>Tallenna mittaukset</button>
        {bodyLogs.length===0&&<div className="empty-state"><div className="empty-icon">⚖️</div><div className="empty-txt">Ei vielä mittauksia.</div></div>}
      </>}
      {view==="exercises"&&<>
        <div className="sec">Lisää uusi liike</div>
        <input className="text-inp" style={{width:"100%",marginBottom:8}} placeholder="Liikkeen nimi" value={newEx} onChange={e=>setNewEx(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExercise()}/>
        <select className="ex-sel" value={newExCat} onChange={e=>setNewExCat(e.target.value)} style={{marginBottom:8}}>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <button className="cta" style={{marginBottom:20}} onClick={addExercise}>+ Lisää liike</button>
        <div className="sec">Kaikki liikkeet ({exercises.length})</div>
        {exercises.map(ex=>(
          <div key={ex.id} className="hist-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:13,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{ex.cat}</div></div>
            <button className="icon-btn" onClick={()=>setExercises(e=>e.filter(x=>x.id!==ex.id))}>🗑️</button>
          </div>
        ))}
      </>}
      {view==="routines"&&<>
        <div className="sec">Luo uusi ohjelma</div>
        <input className="text-inp" style={{width:"100%",marginBottom:10}} placeholder="Ohjelman nimi (esim. Jalkapäivä)" value={newRname} onChange={e=>setNewRname(e.target.value)}/>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:C.textMuted,marginBottom:8}}>VALITSE LIIKKEET</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {exercises.map(ex=>(
            <button key={ex.id} onClick={()=>toggleRoutineEx(ex.id)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${newRexs.includes(ex.id)?C.cyan:C.border}`,background:newRexs.includes(ex.id)?C.cyanDim:"none",color:newRexs.includes(ex.id)?C.cyan:C.textSub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>
              {ex.name}
            </button>
          ))}
        </div>
        <button className="cta" style={{marginBottom:20}} onClick={saveRoutine}>+ Tallenna ohjelma</button>
        <div className="sec">Tallennetut ohjelmat</div>
        {routines.length===0?<div className="empty-state"><div className="empty-icon">📋</div><div className="empty-txt">Ei vielä ohjelmia.</div></div>:
        routines.map(r=>(
          <div key={r.id} className="hist-row" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontSize:13,fontWeight:700}}>{r.name}</div><div style={{fontSize:11,color:C.textSub,marginTop:3}}>{r.exercises.map(eid=>exercises.find(e=>e.id===eid)?.name).filter(Boolean).join(" · ")}</div></div>
            <button className="icon-btn" onClick={()=>setRoutines(r2=>r2.filter(x=>x.id!==r.id))}>🗑️</button>
          </div>
        ))}
      </>}
    </div>
  );
}

const TABS=[
  {id:"home",lbl:"Koti",icon:<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>},
  {id:"workout",lbl:"Treeni",icon:<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>},
  {id:"stats",lbl:"Tilastot",icon:<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>},
  {id:"history",lbl:"Historia",icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>},
  {id:"profile",lbl:"Profiili",icon:<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>},
];
const TITLES={home:"Treenipäiväkirja",workout:"Uusi treeni",stats:"Tilastot",history:"Historia",profile:"Profiili"};

export default function App(){
  const [unlocked,setUnlocked]=useState(()=>localStorage.getItem(AUTH_KEY)==="1");
  const [tab,setTab]=useState("home");
  const [workouts,setWorkouts]=useState(()=>load(WORKOUTS_KEY,[]));
  const [bodyLogs,setBodyLogs]=useState(()=>load(BODY_KEY,[]));
  const [exercises,setExercises]=useState(()=>load(EXERCISES_KEY,DEFAULT_EXERCISES));
  const [routines,setRoutines]=useState(()=>load(ROUTINES_KEY,DEFAULT_ROUTINES));

  useEffect(()=>save(WORKOUTS_KEY,workouts),[workouts]);
  useEffect(()=>save(BODY_KEY,bodyLogs),[bodyLogs]);
  useEffect(()=>save(EXERCISES_KEY,exercises),[exercises]);
  useEffect(()=>save(ROUTINES_KEY,routines),[routines]);

  const addWorkout=w=>setWorkouts(ws=>[w,...ws]);
  const addBodyLog=l=>setBodyLogs(ls=>[...ls,l]);
  const updateWorkout=w=>setWorkouts(ws=>ws.map(x=>x.id===w.id?w:x));
  const deleteWorkout=id=>setWorkouts(ws=>ws.filter(x=>x.id!==id));
  const deleteBody=idx=>setBodyLogs(ls=>ls.filter((_,i)=>i!==ls.length-1-idx));

  if(!unlocked)return(<><style>{FONTS+css}</style><LockScreen onUnlock={()=>setUnlocked(true)}/></>);

  return(
    <>
      <style>{FONTS+css}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-title">{TITLES[tab]}</div>
          <div className="hdr-date">{new Date().toLocaleDateString("fi-FI",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div className="content">
          {tab==="home"&&<HomeTab workouts={workouts} onStart={()=>setTab("workout")}/>}
          {tab==="workout"&&<WorkoutTab workouts={workouts} exercises={exercises} routines={routines} onSave={addWorkout}/>}
          {tab==="stats"&&<StatsTab workouts={workouts} bodyLogs={bodyLogs}/>}
          {tab==="history"&&<HistoryTab workouts={workouts} bodyLogs={bodyLogs} onUpdateWorkout={updateWorkout} onDeleteWorkout={deleteWorkout} onDeleteBody={deleteBody}/>}
          {tab==="profile"&&<ProfileTab bodyLogs={bodyLogs} onSaveBody={addBodyLog} exercises={exercises} setExercises={e=>{setExercises(e);}} routines={routines} setRoutines={r=>{setRoutines(r);}}/>}
        </div>
        <div className="tabbar">
          {TABS.map(t=><button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.icon}<span className="tab-lbl">{t.lbl}</span></button>)}
        </div>
      </div>
    </>
  );
}
