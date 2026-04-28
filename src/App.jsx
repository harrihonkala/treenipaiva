import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#0D0D0D",surface:"#161616",card:"#1E1E24",border:"#2C2C35",
  // Primary: teal/cyan gradient
  primary:"#00C9A7",primaryDim:"rgba(0,201,167,0.10)",primaryMid:"rgba(0,201,167,0.20)",
  primaryGrad:"linear-gradient(135deg,#00C9A7 0%,#00A896 100%)",
  // Secondary: purple
  secondary:"#7C6FE0",secondaryDim:"rgba(124,111,224,0.12)",
  // Neutral
  text:"#F2F2F7",textSub:"#8E8E9A",textMuted:"#4A4A56",
  red:"#FF453A",green:"#32D74B",orange:"#FF9F0A",
  // keep cyan alias for compatibility
  cyan:"#00C9A7",cyanDim:"rgba(0,201,167,0.10)",cyanMid:"rgba(0,201,167,0.20)",
};
const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');`;

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
body{background:${C.bg};color:${C.text};font-family:'Inter',sans-serif;overscroll-behavior:none;}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.hdr{padding:54px 20px 16px;background:${C.bg};border-bottom:1px solid ${C.border};position:sticky;top:0;z-index:50;}
.hdr-title{font-family:'Poppins',sans-serif;font-size:22px;font-weight:700;color:${C.text};letter-spacing:-0.3px;}
.hdr-date{font-size:12px;color:${C.textSub};margin-top:2px;font-weight:400;}
.content{flex:1;overflow-y:auto;padding:20px 20px 100px;}
.tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${C.surface};border-top:1px solid ${C.border};display:flex;padding:10px 0 28px;z-index:100;}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 0;cursor:pointer;background:none;border:none;color:${C.textMuted};transition:color 0.2s;}
.tab.on{color:${C.primary};}
.tab svg{width:22px;height:22px;stroke-width:1.8;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;transition:transform 0.2s;}
.tab.on svg{transform:scale(1.08);}
.tab-lbl{font-size:10px;font-weight:600;letter-spacing:0.3px;font-family:'Inter',sans-serif;}
.card{background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;margin-bottom:12px;}
.sec{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${C.textMuted};margin:24px 0 12px;font-family:'Inter',sans-serif;}
.streak-wrap{background:${C.card};border-radius:20px;border:1px solid ${C.border};padding:20px;margin-bottom:16px;}
.streak-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
.streak-num{font-family:'Poppins',sans-serif;font-size:56px;font-weight:700;color:${C.primary};line-height:1;letter-spacing:-2px;}
.streak-lbl{font-size:13px;color:${C.text};margin-top:6px;font-weight:500;}
.streak-sub{font-size:11px;color:${C.textSub};margin-top:3px;}
.streak-icon{font-size:38px;}
.week-row{display:flex;gap:6px;}
.wd{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.wd-label{font-size:10px;color:${C.textMuted};font-weight:600;letter-spacing:0.5px;}
.wd-dot{width:8px;height:8px;border-radius:50%;background:${C.border};}
.wd-dot.on{background:${C.primary};}
.wd-dot.cur{background:${C.primaryMid};border:2px solid ${C.primary};}
.cta{width:100%;background:${C.primaryGrad};color:#000;border:none;border-radius:16px;padding:18px;font-family:'Poppins',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.5px;cursor:pointer;transition:opacity 0.2s,transform 0.15s;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:16px;box-shadow:0 4px 20px rgba(0,201,167,0.25);}
.cta:active{transform:scale(0.98);opacity:0.9;}
.lw-type{display:inline-flex;align-items:center;gap:6px;background:${C.primaryDim};border:1px solid ${C.primaryMid};border-radius:20px;padding:4px 12px;font-size:11px;color:${C.primary};font-weight:600;margin-bottom:10px;}
.lw-name{font-family:'Poppins',sans-serif;font-size:18px;font-weight:600;margin-bottom:4px;}
.lw-ex{font-size:12px;color:${C.textSub};margin-bottom:14px;}
.stats-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.stat-box{background:${C.surface};border-radius:12px;padding:12px 8px;text-align:center;border:1px solid ${C.border};}
.stat-v{font-family:'Poppins',sans-serif;font-size:20px;font-weight:700;}
.stat-l{font-size:10px;color:${C.textSub};margin-top:2px;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.big-stat{background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;}
.bs-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px;}
.bs-icon.primary{background:${C.primaryDim};}
.bs-icon.secondary{background:${C.secondaryDim};}
.bs-val{font-family:'Poppins',sans-serif;font-size:32px;font-weight:700;color:${C.text};letter-spacing:-1px;line-height:1;}
.bs-lbl{font-size:11px;color:${C.textSub};margin-top:4px;}
.bs-diff{font-size:11px;font-weight:600;margin-top:6px;}
.bs-diff.pos{color:${C.green};}
.bs-diff.neg{color:${C.red};}
.bs-diff.neu{color:${C.textMuted};}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.type-card{background:${C.card};border-radius:18px;border:2px solid ${C.border};padding:20px 16px;cursor:pointer;transition:all 0.18s;}
.type-card.sel{border-color:${C.primary};background:${C.primaryDim};}
.type-emoji{font-size:28px;margin-bottom:12px;display:block;}
.type-name{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;}
.type-sub{font-size:11px;color:${C.textSub};margin-top:3px;}
.timer-bar{background:${C.surface};border-bottom:1px solid ${C.border};padding:10px 20px;display:flex;justify-content:space-between;align-items:center;margin:0 -20px 18px;position:sticky;top:0;z-index:30;}
.timer-val{font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;color:${C.primary};letter-spacing:1px;}
.timer-lbl{font-size:10px;color:${C.textMuted};letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
.end-btn{background:${C.red};color:#fff;border:none;border-radius:12px;padding:9px 20px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;cursor:pointer;}
.ex-card{background:${C.card};border-radius:16px;border:1px solid ${C.border};padding:16px;margin-bottom:10px;}
.ex-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.ex-name{font-family:'Poppins',sans-serif;font-size:15px;font-weight:600;}
.ex-del{background:none;border:none;color:${C.textMuted};font-size:18px;cursor:pointer;padding:0 4px;line-height:1;}
.prev-sets{background:${C.surface};border-radius:10px;padding:10px 12px;margin-bottom:12px;border:1px solid ${C.border};}
.prev-title{font-size:9px;color:${C.textMuted};letter-spacing:1.5px;text-transform:uppercase;font-weight:600;margin-bottom:7px;}
.prev-row{font-size:11px;color:${C.textSub};margin-bottom:4px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.prev-date{font-size:9px;color:${C.textMuted};}
.set-labels{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px;gap:6px;margin-bottom:5px;}
.sl{font-size:9px;color:${C.textMuted};text-align:center;letter-spacing:1px;text-transform:uppercase;font-weight:600;}
.set-row{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px;gap:6px;align-items:center;margin-bottom:5px;}
.set-n{font-size:11px;color:${C.textMuted};text-align:center;}
.inp{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:9px 6px;color:${C.text};font-size:14px;text-align:center;width:100%;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.15s;}
.inp:focus{border-color:${C.primary};}
.rpe-sel{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:9px 4px;color:${C.textSub};font-size:12px;width:100%;outline:none;text-align:center;font-family:'Inter',sans-serif;}
.fail-btn{background:${C.surface};border:1px solid ${C.border};border-radius:10px;font-size:10px;color:${C.textMuted};cursor:pointer;padding:9px 2px;text-align:center;transition:all 0.15s;font-weight:600;}
.fail-btn.on{background:rgba(255,69,58,0.12);border-color:${C.red};color:${C.red};}
.add-set{width:100%;background:none;border:1px dashed ${C.border};border-radius:10px;padding:10px;color:${C.textMuted};font-size:12px;cursor:pointer;margin-top:6px;font-family:'Inter',sans-serif;}
.add-ex{width:100%;background:${C.primaryDim};border:1px dashed ${C.primary};border-radius:14px;padding:15px;color:${C.primary};font-size:13px;font-weight:600;cursor:pointer;margin-top:2px;font-family:'Inter',sans-serif;}
.notes{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:14px;color:${C.text};font-size:13px;resize:none;outline:none;font-family:'Inter',sans-serif;margin-top:4px;line-height:1.5;}
.notes:focus{border-color:${C.primary};}
.save-btn{width:100%;background:${C.primaryGrad};color:#000;border:none;border-radius:16px;padding:17px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-top:16px;box-shadow:0 4px 16px rgba(0,201,167,0.2);}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);}
.modal{background:${C.surface};border-radius:24px 24px 0 0;padding:20px 20px 40px;width:100%;max-width:430px;border:1px solid ${C.border};border-bottom:none;max-height:75vh;overflow-y:auto;}
.modal-handle{width:36px;height:4px;background:${C.border};border-radius:2px;margin:0 auto 20px;}
.modal-title{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;color:${C.textSub};margin-bottom:14px;}
.modal-search{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:12px 16px;color:${C.text};font-size:14px;outline:none;font-family:'Inter',sans-serif;margin-bottom:12px;}
.modal-search:focus{border-color:${C.primary};}
.ex-opt{padding:13px 10px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:500;border:1px solid transparent;transition:all 0.15s;display:flex;justify-content:space-between;align-items:center;}
.ex-opt:active{background:${C.primaryDim};border-color:${C.primaryMid};color:${C.primary};}
.ex-opt-sub{font-size:11px;color:${C.textMuted};font-weight:400;}
.routine-card{background:${C.card};border-radius:14px;border:1px solid ${C.border};padding:14px;margin-bottom:8px;cursor:pointer;transition:border-color 0.15s;}
.routine-card:active{border-color:${C.primary};}
.routine-name{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;margin-bottom:4px;}
.routine-exs{font-size:11px;color:${C.textSub};}
.chart-wrap{background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;margin-bottom:14px;}
.chart-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
.chart-title{font-family:'Poppins',sans-serif;font-size:15px;font-weight:600;}
.chart-sub{font-size:11px;color:${C.textMuted};margin-top:2px;}
.chart-pr{font-size:13px;font-weight:600;color:${C.primary};}
.line-chart{position:relative;height:90px;margin-bottom:8px;}
.line-svg{width:100%;height:100%;overflow:visible;}
.tag-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
.tag{display:inline-flex;align-items:center;gap:5px;background:${C.surface};border:1px solid ${C.border};border-radius:20px;padding:4px 12px;font-size:11px;color:${C.textSub};font-weight:500;}
.tag.c{background:${C.primaryDim};border-color:${C.primaryMid};color:${C.primary};}
.ex-sel{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:11px 14px;color:${C.text};font-size:13px;width:100%;outline:none;font-family:'Inter',sans-serif;margin-bottom:14px;font-weight:500;}
.cal-wrap{background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;margin-bottom:14px;}
.cal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
.cal-month{font-family:'Poppins',sans-serif;font-size:17px;font-weight:600;}
.cal-nav{background:${C.surface};border:1px solid ${C.border};color:${C.text};border-radius:10px;padding:7px 16px;cursor:pointer;font-size:16px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.cal-dh{text-align:center;font-size:10px;color:${C.textMuted};font-weight:600;letter-spacing:0.5px;padding:4px 0;}
.cal-d{aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;}
.cal-d.empty{background:none;}
.cal-d.norm{color:${C.textSub};}
.cal-d.trained{background:${C.primary};color:#000;font-weight:700;}
.cal-d.today{outline:2px solid ${C.primary};color:${C.primary};}
.prof-hdr{display:flex;align-items:center;gap:16px;background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;margin-bottom:14px;}
.avatar{width:56px;height:56px;border-radius:50%;background:${C.primaryDim};border:2px solid ${C.primary};display:flex;align-items:center;justify-content:center;font-size:26px;}
.prof-name{font-family:'Poppins',sans-serif;font-size:20px;font-weight:700;}
.prof-since{font-size:11px;color:${C.textSub};margin-top:3px;}
.body-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;}
.body-box{background:${C.card};border-radius:16px;border:1px solid ${C.border};padding:16px 10px;text-align:center;}
.body-lbl{font-size:9px;color:${C.textMuted};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;font-weight:600;}
.body-inp{background:none;border:none;color:${C.primary};font-family:'Poppins',sans-serif;font-size:28px;font-weight:700;width:100%;text-align:center;outline:none;}
.body-unit{font-size:10px;color:${C.textMuted};margin-top:3px;}
.body-save{width:100%;background:${C.primaryGrad};color:#000;border:none;border-radius:14px;padding:14px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:12px;}
.run-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.run-box{background:${C.card};border-radius:18px;border:1px solid ${C.border};padding:18px;}
.run-lbl{font-size:9px;color:${C.textMuted};letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:12px;}
.run-inp{background:none;border:none;color:${C.text};font-family:'Poppins',sans-serif;font-size:36px;font-weight:700;width:100%;outline:none;}
.run-unit{font-size:11px;color:${C.textMuted};margin-top:4px;}
.pace-box{background:${C.primaryDim};border:1px solid ${C.primaryMid};border-radius:16px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.pace-v{font-family:'Poppins',sans-serif;font-size:32px;font-weight:700;color:${C.primary};}
.pace-l{font-size:10px;color:${C.textSub};letter-spacing:1px;margin-bottom:4px;}
.mob-row{display:flex;align-items:center;gap:10px;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:14px 16px;margin-bottom:8px;}
.mob-name{flex:1;font-size:13px;font-weight:500;}
.mob-inp{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:8px 10px;color:${C.text};font-size:13px;width:70px;text-align:center;outline:none;font-family:'Inter',sans-serif;}
.done-wrap{text-align:center;padding:48px 0 24px;}
.done-icon{font-size:60px;margin-bottom:18px;}
.done-title{font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;margin-bottom:8px;}
.done-sub{font-size:13px;color:${C.textSub};margin-bottom:32px;}
.hist-tabs{display:flex;gap:8px;margin-bottom:16px;}
.hist-tab{flex:1;padding:10px 6px;background:${C.card};border:1px solid ${C.border};border-radius:12px;font-size:11px;font-weight:600;color:${C.textMuted};cursor:pointer;text-align:center;letter-spacing:0.3px;transition:all 0.15s;}
.hist-tab.on{background:${C.primaryDim};border-color:${C.primary};color:${C.primary};}
.hist-row{background:${C.card};border-radius:16px;border:1px solid ${C.border};padding:14px 16px;margin-bottom:8px;}
.hist-row-top{display:flex;justify-content:space-between;align-items:flex-start;}
.hist-row-name{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;}
.hist-row-date{font-size:10px;color:${C.textMuted};}
.hist-row-sub{font-size:11px;color:${C.textSub};margin-top:3px;}
.hist-badge{display:inline-flex;align-items:center;background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:3px 8px;font-size:10px;color:${C.textMuted};margin-right:4px;margin-top:4px;}
.empty-state{text-align:center;padding:40px 16px;}
.empty-icon{font-size:40px;margin-bottom:12px;}
.empty-txt{font-size:13px;color:${C.textSub};}
.empty-sub{font-size:11px;color:${C.textMuted};margin-top:4px;}
.text-inp{flex:1;background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:13px 16px;color:${C.text};font-size:14px;outline:none;font-family:'Inter',sans-serif;}
.text-inp:focus{border-color:${C.primary};}
.icon-btn{background:none;border:none;color:${C.textMuted};cursor:pointer;padding:4px 8px;font-size:18px;}
.chart-tabs{display:flex;gap:6px;margin-bottom:14px;}
.chart-tab{padding:7px 14px;background:${C.surface};border:1px solid ${C.border};border-radius:10px;font-size:11px;font-weight:600;color:${C.textMuted};cursor:pointer;}
.chart-tab.on{background:${C.primaryDim};border-color:${C.primary};color:${C.primary};}
.lock-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;background:${C.bg};}
.lock-icon{font-size:52px;margin-bottom:24px;}
.lock-title{font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${C.textSub};margin-bottom:6px;text-align:center;}
.lock-sub{font-size:12px;color:${C.textMuted};margin-bottom:40px;text-align:center;}
.lock-input-wrap{position:relative;width:100%;max-width:280px;margin-bottom:12px;}
.lock-input{width:100%;background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:16px 48px 16px 16px;color:${C.text};font-size:16px;outline:none;font-family:'Inter',sans-serif;text-align:center;letter-spacing:2px;transition:border-color 0.2s;}
.lock-input:focus{border-color:${C.primary};}
.lock-input.err{border-color:${C.red};}
.lock-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:${C.textMuted};cursor:pointer;font-size:18px;padding:4px;}
.lock-btn{width:100%;max-width:280px;background:${C.primaryGrad};color:#000;border:none;border-radius:14px;padding:16px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:16px;}
.lock-err{font-size:12px;color:${C.red};min-height:18px;text-align:center;margin-bottom:8px;}
.edit-row{display:grid;grid-template-columns:26px 1fr 1fr 60px 44px 28px;gap:6px;align-items:center;margin-bottom:5px;}
.del-set{background:none;border:none;color:${C.textMuted};cursor:pointer;font-size:16px;padding:0 2px;line-height:1;}
.del-set:active{color:${C.red};}
.danger-btn{width:100%;background:rgba(255,69,58,0.1);color:${C.red};border:1px solid ${C.red};border-radius:14px;padding:15px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;}
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
  const lastWeekStart=new Date(weekStart);lastWeekStart.setDate(weekStart.getDate()-7);
  const week=DAYS.map((_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return workouts.some(w=>new Date(w.date).toDateString()===d.toDateString());});
  const todayIdx=(now.getDay()+6)%7;
  let streak=0;const chk=new Date(now);
  while(workouts.some(w=>new Date(w.date).toDateString()===chk.toDateString())){streak++;chk.setDate(chk.getDate()-1);}
  const last=workouts[0];
  const thisWeekW=workouts.filter(w=>new Date(w.date)>=weekStart);
  const lastWeekW=workouts.filter(w=>{const d=new Date(w.date);return d>=lastWeekStart&&d<weekStart;});
  const weekCount=week.filter(Boolean).length;
  const lastWeekCount=lastWeekW.length;
  const weekMin=Math.round(thisWeekW.reduce((a,w)=>a+(w.duration||0),0)/60);
  const lastWeekMin=Math.round(lastWeekW.reduce((a,w)=>a+(w.duration||0),0)/60);
  const countDiff=weekCount-lastWeekCount;
  const minDiff=weekMin-lastWeekMin;

  return(
    <div>
      {/* Month card */}
      <div className="streak-wrap">
        <div className="streak-top">
          <div>
            <div className="streak-num">{thisMonth.length}</div>
            <div className="streak-lbl">treeniä tässä kuussa</div>
            <div className="streak-sub">Edellinen kuukausi: {lastMonth.length} treeniä</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="streak-icon">🔥</div>
            <div style={{fontSize:12,color:C.primary,marginTop:4,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>{streak} pv putki</div>
          </div>
        </div>
        <div className="week-row">
          {DAYS.map((d,i)=>(
            <div key={i} className="wd">
              <div className="wd-label" style={i===todayIdx?{color:C.primary,fontWeight:700}:{}}>{d}</div>
              <div className={`wd-dot${week[i]?" on":i===todayIdx?" cur":""}`}/>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="cta" onClick={onStart}>
        <span style={{fontSize:18}}>＋</span> Aloita treeni <span style={{fontSize:16}}>→</span>
      </button>

      {/* Last workout */}
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
        <div className="card" style={{display:"flex",alignItems:"center",gap:16,padding:"20px 18px"}}>
          <div style={{width:52,height:52,borderRadius:14,background:C.primaryDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>🏋️</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:600,marginBottom:4}}>Ei vielä treenejä</div>
            <div style={{fontSize:12,color:C.textSub,marginBottom:10,lineHeight:1.4}}>Aloita ensimmäinen treeni ja aloita matkasi kohti tavoitteita!</div>
            <button onClick={onStart} style={{background:"none",border:`1px solid ${C.primary}`,borderRadius:20,padding:"5px 14px",color:C.primary,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Aloita treeni</button>
          </div>
        </div>
      )}

      {/* This week */}
      <div className="sec">Tällä viikolla</div>
      <div className="two-col">
        <div className="big-stat">
          <div className="bs-icon primary">📅</div>
          <div className="bs-val">{weekCount}</div>
          <div className="bs-lbl">treeniä</div>
          <div className={`bs-diff ${countDiff>0?"pos":countDiff<0?"neg":"neu"}`}>
            {countDiff>0?`+${countDiff}`:countDiff===0?"sama":countDiff} vs. viime viikko
          </div>
        </div>
        <div className="big-stat">
          <div className="bs-icon secondary">📈</div>
          <div className="bs-val">{weekMin}</div>
          <div className="bs-lbl">min yhteensä</div>
          <div className={`bs-diff ${minDiff>0?"pos":minDiff<0?"neg":"neu"}`}>
            {minDiff>0?`+${minDiff}`:minDiff===0?"sama":minDiff} min vs. viime viikko
          </div>
        </div>
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

  // 3 phases: "list" | "view" | "edit"
  const [phase,setPhase]=useState("list");
  const [viewing,setViewing]=useState(null);
  const [editData,setEditData]=useState(null);

  const openView=w=>{setViewing(w);setPhase("view");};
  const openEdit=()=>{setEditData(JSON.parse(JSON.stringify(viewing)));setPhase("edit");};
  const cancelEdit=()=>{setEditData(null);setPhase("view");};
  const saveEdit=()=>{onUpdateWorkout(editData);setViewing(editData);setEditData(null);setPhase("view");};
  const doDelete=()=>{if(window.confirm("Poistetaanko tämä treeni?")){onDeleteWorkout(viewing.id);setViewing(null);setPhase("list");}};
  const goBack=()=>{if(phase==="edit"){cancelEdit();}else{setViewing(null);setPhase("list");}};

  const updEditSet=(ei,si,f,v)=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:ex.sets.map((s,j)=>j===si?{...s,[f]:v}:s)}:ex)}));
  const delEditSet=(ei,si)=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:ex.sets.filter((_,j)=>j!==si)}:ex)}));
  const addEditSet=ei=>setEditData(d=>({...d,exercises:d.exercises.map((ex,i)=>i===ei?{...ex,sets:[...ex.sets,{kg:"",reps:"",rpe:"",fail:false}]}:ex)}));
  const delEditEx=ei=>setEditData(d=>({...d,exercises:d.exercises.filter((_,i)=>i!==ei)}));

  // Shared back button header
  const BackHeader=({title,right})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={goBack} style={{background:"none",border:"none",color:C.textSub,fontSize:22,cursor:"pointer",padding:"0 4px",lineHeight:1}}>←</button>
        <div style={{fontSize:16,fontWeight:800}}>{title}</div>
      </div>
      {right}
    </div>
  );

  // ── VIEW phase ──────────────────────────────────────────────
  if(phase==="view"&&viewing)return(
    <div>
      <BackHeader title={viewing.name||typeName(viewing.type)} right={
        <button onClick={openEdit} style={{background:C.cyanDim,border:`1px solid ${C.cyanMid}`,borderRadius:10,padding:"8px 16px",color:C.cyan,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif",letterSpacing:"0.5px"}}>✏️ Muokkaa</button>
      }/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div className="lw-type">{typeEmoji(viewing.type)} {typeName(viewing.type)}</div>
        <div className="lw-type" style={{background:"none",borderColor:C.border,color:C.textSub}}>{fmtDate(viewing.date)}</div>
        {viewing.duration&&<div className="lw-type" style={{background:"none",borderColor:C.border,color:C.textSub}}>⏱ {fmtTime(viewing.duration)}</div>}
      </div>
      {(viewing.type==="run"||viewing.type==="bike")&&viewing.km&&(
        <div className="two-col">
          <div className="big-stat"><div className="bs-val">{viewing.km}</div><div className="bs-lbl">km</div></div>
          <div className="big-stat">
            <div className="bs-val">{viewing.type==="run"?(()=>{const p=parseFloat(viewing.mins)/parseFloat(viewing.km);const m=Math.floor(p),s=Math.round((p-m)*60);return`${m}:${String(s).padStart(2,"0")}`;})():(parseFloat(viewing.km)/parseFloat(viewing.mins)*60).toFixed(1)}</div>
            <div className="bs-lbl">{viewing.type==="run"?"min/km":"km/h"}</div>
          </div>
        </div>
      )}
      {viewing.exercises&&<>
        <div className="stats-row" style={{marginBottom:16}}>
          <div className="stat-box"><div className="stat-v">{viewing.exercises.length}</div><div className="stat-l">liikettä</div></div>
          <div className="stat-box"><div className="stat-v">{viewing.exercises.reduce((a,e)=>a+e.sets.length,0)}</div><div className="stat-l">sarjaa</div></div>
          <div className="stat-box"><div className="stat-v">{viewing.exercises.reduce((a,e)=>a+e.sets.reduce((b,s)=>b+(parseFloat(s.kg)||0)*(parseInt(s.reps)||0),0),0).toFixed(0)}</div><div className="stat-l">kg volyymi</div></div>
        </div>
        {viewing.exercises.map((ex,ei)=>(
          <div key={ei} className="ex-card">
            <div className="ex-hdr"><div className="ex-name">{ex.name}</div></div>
            <div className="set-labels"><div className="sl">#</div><div className="sl">kg</div><div className="sl">toistot</div><div className="sl">RPE</div><div className="sl">Fail</div></div>
            {ex.sets.map((s,si)=>(
              <div key={si} className="set-row">
                <div className="set-n">{si+1}</div>
                <div className="inp" style={{background:"none",border:"none",color:C.text,fontSize:14,textAlign:"center",padding:"8px 6px"}}>{s.kg||"—"}</div>
                <div className="inp" style={{background:"none",border:"none",color:C.text,fontSize:14,textAlign:"center",padding:"8px 6px"}}>{s.reps||"—"}</div>
                <div className="rpe-sel" style={{background:"none",border:"none",color:s.rpe?C.textSub:C.textMuted,fontSize:12,textAlign:"center",padding:"8px 4px"}}>{s.rpe||"—"}</div>
                <div className={`fail-btn${s.fail?" on":""}`} style={{cursor:"default"}}>{s.fail?"✓ FAIL":"—"}</div>
              </div>
            ))}
          </div>
        ))}
      </>}
      {viewing.mobility&&viewing.mobility.length>0&&<>
        <div className="sec">Venyttelyt</div>
        {viewing.mobility.map((m,i)=><div key={i} className="mob-row"><div className="mob-name">{m.name}</div><div style={{fontSize:13,color:C.cyan,fontFamily:"'JetBrains Mono',monospace"}}>{m.secs} sek</div></div>)}
      </>}
      {viewing.notes&&<><div className="sec">Muistiinpanot</div><div className="card" style={{fontSize:13,color:C.textSub,fontStyle:"italic"}}>"{viewing.notes}"</div></>}
      <button className="danger-btn" style={{marginTop:8}} onClick={doDelete}>🗑️ Poista treeni</button>
    </div>
  );

  // ── EDIT phase ──────────────────────────────────────────────
  if(phase==="edit"&&editData)return(
    <div>
      <BackHeader title="Muokkaa treeniä"/>
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
    </div>
  );

  // ── LIST phase ──────────────────────────────────────────────
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
        <div key={w.id} className="hist-row" style={{cursor:"pointer"}} onClick={()=>openView(w)}>
          <div className="hist-row-top">
            <div className="hist-row-name">{typeEmoji(w.type)} {w.name||typeName(w.type)}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div className="hist-row-date">{fmtDate(w.date)}</div>
              <span style={{fontSize:11,color:C.textMuted}}>›</span>
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
              <button className="icon-btn" style={{fontSize:14,padding:"0 2px"}} onClick={e=>{e.stopPropagation();if(window.confirm("Poistetaanko tämä mittaus?"))onDeleteBody(bodyLogs.length-1-i);}}>🗑️</button>
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

function ProfileTab({bodyLogs,onSaveBody,exercises,setExercises,routines,setRoutines,workouts,onImport}){
  const [w,setW]=useState("");const [m,setM]=useState("");const [f,setF]=useState("");
  const [view,setView]=useState("profile");
  const [newEx,setNewEx]=useState("");const [newExCat,setNewExCat]=useState("Muu");
  const [newRname,setNewRname]=useState("");const [newRexs,setNewRexs]=useState([]);
  const [importMsg,setImportMsg]=useState("");
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

  const exportData=()=>{
    const data={version:1,exportDate:new Date().toISOString(),workouts,bodyLogs,exercises,routines};
    const json=JSON.stringify(data,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const date=new Date().toISOString().slice(0,10);
    a.href=url;a.download=`treenipaiva_varmuuskopio_${date}.json`;
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);URL.revokeObjectURL(url);
  };

  const importData=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.version||!data.workouts)throw new Error("Virheellinen tiedosto");
        if(!window.confirm(`Tuodaan varmuuskopio (${data.workouts.length} treeniä, viety ${fmtDate(data.exportDate)})?\n\nNYKYINEN DATA KORVATAAN.`))return;
        onImport(data);
        setImportMsg(`✅ Tuotu ${data.workouts.length} treeniä ja ${data.bodyLogs?.length||0} mittausta.`);
        setTimeout(()=>setImportMsg(""),4000);
      }catch{setImportMsg("❌ Tiedoston lukeminen epäonnistui. Varmista että se on oikea varmuuskopiotiedosto.");}
    };
    reader.readAsText(file);
    e.target.value="";
  };

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

        <div className="sec">Varmuuskopiointi</div>
        <div className="card" style={{marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>📤 Vie data</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:12}}>Tallentaa kaikki treenisi, mittaukset, liikkeet ja ohjelmat JSON-tiedostoon.</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,color:C.textMuted}}>{workouts.length} treeniä · {bodyLogs.length} mittausta</span>
          </div>
          <button className="body-save" onClick={exportData}>⬇️ Lataa varmuuskopio</button>
        </div>
        <div className="card">
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>📥 Tuo data</div>
          <div style={{fontSize:12,color:C.textSub,marginBottom:12}}>Palauta aiemmin tallennettu varmuuskopio. <span style={{color:C.red,fontWeight:600}}>Korvaa nykyisen datan.</span></div>
          <label style={{display:"block",width:"100%",background:C.cyanDim,border:`1px solid ${C.cyan}`,borderRadius:10,padding:"12px",textAlign:"center",color:C.cyan,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"1px"}}>
            📂 Valitse tiedosto
            <input type="file" accept=".json" style={{display:"none"}} onChange={importData}/>
          </label>
          {importMsg&&<div style={{fontSize:12,marginTop:10,padding:"8px 12px",background:importMsg.startsWith("✅")?`rgba(0,201,128,0.1)`:`rgba(255,68,85,0.1)`,borderRadius:8,color:importMsg.startsWith("✅")?C.green:C.red}}>{importMsg}</div>}
        </div>
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
  const importAll=data=>{
    if(data.workouts)setWorkouts(data.workouts);
    if(data.bodyLogs)setBodyLogs(data.bodyLogs);
    if(data.exercises)setExercises(data.exercises);
    if(data.routines)setRoutines(data.routines);
  };

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
          {tab==="profile"&&<ProfileTab bodyLogs={bodyLogs} onSaveBody={addBodyLog} exercises={exercises} setExercises={e=>{setExercises(e);}} routines={routines} setRoutines={r=>{setRoutines(r);}} workouts={workouts} onImport={importAll}/>}
        </div>
        <div className="tabbar">
          {TABS.map(t=><button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.icon}<span className="tab-lbl">{t.lbl}</span></button>)}
        </div>
      </div>
    </>
  );
}
