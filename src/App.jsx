import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0A0A0A",
  surface: "#141414",
  card: "#1C1C1C",
  border: "#2A2A2A",
  cyan: "#00C9B1",
  cyanDim: "rgba(0,201,177,0.08)",
  cyanMid: "rgba(0,201,177,0.18)",
  text: "#FFFFFF",
  textSub: "#999",
  textMuted: "#555",
  red: "#FF4455",
  green: "#00C980",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body { background: ${C.bg}; color: ${C.text}; font-family: 'Syne', sans-serif; overscroll-behavior: none; }
.app { max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

.hdr { padding: 54px 20px 14px; background: ${C.bg}; border-bottom: 1px solid ${C.border}; position: sticky; top: 0; z-index: 50; }
.hdr-title { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ${C.textSub}; }
.hdr-date { font-size: 11px; color: ${C.textMuted}; font-family: 'JetBrains Mono', monospace; margin-top: 4px; }

.content { flex: 1; overflow-y: auto; padding: 20px 20px 100px; }

.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: ${C.surface}; border-top: 1px solid ${C.border}; display: flex; padding: 10px 0 28px; z-index: 100; }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 6px 0; cursor: pointer; background: none; border: none; color: ${C.textMuted}; transition: color 0.2s; }
.tab.on { color: ${C.cyan}; }
.tab svg { width: 22px; height: 22px; stroke-width: 1.7; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.2s; }
.tab.on svg { transform: scale(1.1); }
.tab-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }

.card { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; margin-bottom: 12px; }
.sec { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.textMuted}; margin: 22px 0 10px; }

.streak-wrap { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 18px; margin-bottom: 14px; }
.streak-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.streak-num { font-size: 52px; font-weight: 800; color: ${C.cyan}; line-height: 1; letter-spacing: -2px; }
.streak-lbl { font-size: 11px; color: ${C.textSub}; margin-top: 6px; font-weight: 500; }
.streak-icon { font-size: 36px; }
.week-row { display: flex; gap: 6px; }
.wd { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.wd-label { font-size: 9px; color: ${C.textMuted}; font-weight: 700; letter-spacing: 0.5px; }
.wd-dot { width: 100%; height: 5px; border-radius: 3px; background: ${C.border}; }
.wd-dot.on { background: ${C.cyan}; }
.wd-dot.cur { background: ${C.cyanMid}; border: 1px solid ${C.cyan}; }

.cta { width: 100%; background: ${C.cyan}; color: #000; border: none; border-radius: 14px; padding: 17px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
.cta:active { transform: scale(0.98); opacity: 0.88; }

.lw-type { display: inline-flex; align-items: center; gap: 6px; background: ${C.cyanDim}; border: 1px solid ${C.cyanMid}; border-radius: 20px; padding: 4px 10px; font-size: 11px; color: ${C.cyan}; font-weight: 600; margin-bottom: 8px; }
.lw-name { font-size: 17px; font-weight: 700; margin-bottom: 3px; }
.lw-ex { font-size: 12px; color: ${C.textSub}; margin-bottom: 12px; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.stat-box { background: ${C.surface}; border-radius: 10px; padding: 10px 8px; text-align: center; border: 1px solid ${C.border}; }
.stat-v { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.stat-l { font-size: 10px; color: ${C.textSub}; margin-top: 2px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.big-stat { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; }
.bs-val { font-size: 34px; font-weight: 800; color: ${C.cyan}; letter-spacing: -1px; font-family: 'JetBrains Mono', monospace; }
.bs-lbl { font-size: 11px; color: ${C.textSub}; margin-top: 4px; }

.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.type-card { background: ${C.card}; border-radius: 14px; border: 2px solid ${C.border}; padding: 18px 14px; cursor: pointer; transition: all 0.18s; }
.type-card.sel { border-color: ${C.cyan}; background: ${C.cyanDim}; }
.type-emoji { font-size: 28px; margin-bottom: 10px; display: block; }
.type-name { font-size: 14px; font-weight: 700; }
.type-sub { font-size: 11px; color: ${C.textSub}; margin-top: 2px; }

.timer-bar { background: ${C.surface}; border-bottom: 1px solid ${C.border}; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; margin: 0 -20px 18px; position: sticky; top: 0; z-index: 30; }
.timer-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; color: ${C.cyan}; letter-spacing: 2px; }
.timer-lbl { font-size: 10px; color: ${C.textMuted}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
.end-btn { background: ${C.red}; color: #fff; border: none; border-radius: 10px; padding: 8px 18px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 1px; }

.ex-card { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 14px; margin-bottom: 10px; }
.ex-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ex-name { font-size: 15px; font-weight: 700; }
.ex-del { background: none; border: none; color: ${C.textMuted}; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; }
.set-labels { display: grid; grid-template-columns: 26px 1fr 1fr 60px 44px; gap: 6px; margin-bottom: 5px; }
.sl { font-size: 9px; color: ${C.textMuted}; text-align: center; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
.set-row { display: grid; grid-template-columns: 26px 1fr 1fr 60px 44px; gap: 6px; align-items: center; margin-bottom: 5px; }
.set-n { font-size: 11px; color: ${C.textMuted}; text-align: center; font-family: 'JetBrains Mono', monospace; }
.inp { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 8px 6px; color: ${C.text}; font-size: 14px; text-align: center; width: 100%; outline: none; font-family: 'JetBrains Mono', monospace; transition: border-color 0.15s; }
.inp:focus { border-color: ${C.cyan}; }
.rpe-sel { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 8px 4px; color: ${C.textSub}; font-size: 12px; width: 100%; outline: none; text-align: center; font-family: 'JetBrains Mono', monospace; }
.fail-btn { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; font-size: 10px; color: ${C.textMuted}; cursor: pointer; padding: 8px 2px; text-align: center; transition: all 0.15s; font-weight: 700; letter-spacing: 0.3px; }
.fail-btn.on { background: rgba(255,68,85,0.1); border-color: ${C.red}; color: ${C.red}; }
.add-set { width: 100%; background: none; border: 1px dashed ${C.border}; border-radius: 8px; padding: 9px; color: ${C.textMuted}; font-size: 12px; cursor: pointer; margin-top: 6px; font-family: 'Syne', sans-serif; font-weight: 600; transition: all 0.15s; }
.add-ex { width: 100%; background: ${C.cyanDim}; border: 1px dashed ${C.cyan}; border-radius: 12px; padding: 14px; color: ${C.cyan}; font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 2px; font-family: 'Syne', sans-serif; letter-spacing: 1px; }

.notes { width: 100%; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 12px; color: ${C.text}; font-size: 13px; resize: none; outline: none; font-family: 'Syne', sans-serif; margin-top: 4px; }
.notes:focus { border-color: ${C.cyan}; }
.save-btn { width: 100%; background: ${C.green}; color: #000; border: none; border-radius: 14px; padding: 16px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-top: 16px; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
.modal { background: ${C.surface}; border-radius: 20px 20px 0 0; padding: 20px 20px 40px; width: 100%; max-width: 430px; border: 1px solid ${C.border}; border-bottom: none; max-height: 70vh; overflow-y: auto; }
.modal-handle { width: 32px; height: 3px; background: ${C.border}; border-radius: 2px; margin: 0 auto 18px; }
.modal-title { font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.textSub}; margin-bottom: 14px; }
.ex-opt { padding: 13px 10px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; border: 1px solid transparent; transition: all 0.15s; display: flex; justify-content: space-between; align-items: center; }
.ex-opt:active { background: ${C.cyanDim}; border-color: ${C.cyanMid}; color: ${C.cyan}; }
.ex-opt-sub { font-size: 11px; color: ${C.textMuted}; font-weight: 400; }

.chart-wrap { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; margin-bottom: 12px; }
.chart-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.chart-title { font-size: 14px; font-weight: 700; }
.chart-sub { font-size: 11px; color: ${C.textMuted}; margin-top: 2px; }
.chart-pr { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${C.cyan}; }
.line-chart { position: relative; height: 90px; margin-bottom: 8px; }
.line-svg { width: 100%; height: 100%; overflow: visible; }
.bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 80px; padding-bottom: 20px; }
.bar { flex: 1; border-radius: 3px 3px 0 0; position: relative; min-height: 3px; cursor: pointer; }
.bar-lbl { position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); font-size: 8px; color: ${C.textMuted}; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
.bar-top { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 8px; color: ${C.textSub}; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
.tag-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.tag { display: inline-flex; align-items: center; gap: 5px; background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 20px; padding: 4px 10px; font-size: 11px; color: ${C.textSub}; font-weight: 500; }
.tag.c { background: ${C.cyanDim}; border-color: ${C.cyanMid}; color: ${C.cyan}; }

.ex-sel { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 10px; padding: 10px 12px; color: ${C.text}; font-size: 13px; width: 100%; outline: none; font-family: 'Syne', sans-serif; margin-bottom: 14px; font-weight: 600; }

.cal-wrap { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; margin-bottom: 14px; }
.cal-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.cal-month { font-size: 16px; font-weight: 800; }
.cal-nav { background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text}; border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 14px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dh { text-align: center; font-size: 9px; color: ${C.textMuted}; font-weight: 700; letter-spacing: 1px; padding: 4px 0; }
.cal-d { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.cal-d.empty { background: none; }
.cal-d.norm { color: ${C.textSub}; }
.cal-d.trained { background: ${C.cyan}; color: #000; font-weight: 700; }
.cal-d.today { outline: 1.5px solid ${C.cyan}; color: ${C.cyan}; }

.prof-hdr { display: flex; align-items: center; gap: 16px; background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; margin-bottom: 14px; }
.avatar { width: 52px; height: 52px; border-radius: 50%; background: ${C.cyanDim}; border: 1.5px solid ${C.cyan}; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.prof-name { font-size: 20px; font-weight: 800; }
.prof-since { font-size: 11px; color: ${C.textSub}; margin-top: 3px; }

.body-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.body-box { background: ${C.card}; border-radius: 12px; border: 1px solid ${C.border}; padding: 14px 10px; text-align: center; }
.body-lbl { font-size: 9px; color: ${C.textMuted}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
.body-inp { background: none; border: none; color: ${C.cyan}; font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 500; width: 100%; text-align: center; outline: none; }
.body-unit { font-size: 10px; color: ${C.textMuted}; margin-top: 2px; }

.goal-card { background: ${C.card}; border-radius: 12px; border: 1px solid ${C.border}; padding: 14px; margin-bottom: 8px; }
.goal-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.goal-name { font-size: 13px; font-weight: 600; }
.goal-pct { font-family: 'JetBrains Mono', monospace; font-size: 15px; color: ${C.cyan}; }
.prog-bar { height: 3px; background: ${C.border}; border-radius: 2px; overflow: hidden; }
.prog-fill { height: 100%; background: ${C.cyan}; border-radius: 2px; }
.goal-sub { font-size: 10px; color: ${C.textMuted}; margin-top: 6px; font-family: 'JetBrains Mono', monospace; }

.run-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.run-box { background: ${C.card}; border-radius: 14px; border: 1px solid ${C.border}; padding: 16px; }
.run-lbl { font-size: 9px; color: ${C.textMuted}; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }
.run-inp { background: none; border: none; color: ${C.text}; font-family: 'JetBrains Mono', monospace; font-size: 36px; width: 100%; outline: none; }
.run-unit { font-size: 11px; color: ${C.textMuted}; margin-top: 4px; }
.pace-box { background: ${C.cyanDim}; border: 1px solid ${C.cyanMid}; border-radius: 14px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.pace-v { font-family: 'JetBrains Mono', monospace; font-size: 30px; color: ${C.cyan}; }
.pace-l { font-size: 10px; color: ${C.textSub}; letter-spacing: 1px; margin-bottom: 4px; }

.mob-row { display: flex; align-items: center; gap: 10px; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
.mob-name { flex: 1; font-size: 13px; font-weight: 600; }
.mob-inp { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 7px 10px; color: ${C.text}; font-size: 13px; width: 70px; text-align: center; outline: none; font-family: 'JetBrains Mono', monospace; }

.done-wrap { text-align: center; padding: 48px 0 24px; }
.done-icon { font-size: 56px; margin-bottom: 18px; }
.done-title { font-size: 22px; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; }
.done-sub { font-size: 13px; color: ${C.textSub}; margin-bottom: 32px; }
`;

const EXERCISES = [
  { name: "Penkkipunnerrus", cat: "Rinta" },{ name: "Kyykky", cat: "Jalat" },
  { name: "Maastaveto", cat: "Selkä" },{ name: "Leuanveto", cat: "Selkä" },
  { name: "Soutu", cat: "Selkä" },{ name: "Olkapääpunnerrus", cat: "Hartiat" },
  { name: "Hauiskääntö", cat: "Hauis" },{ name: "Ojentajapunnerrus", cat: "Ojentaja" },
  { name: "Jalkaprässi", cat: "Jalat" },{ name: "Askelkyykky", cat: "Jalat" },
];
const MOBILITY = ["Lonkan avaus","Rintarangan kierto","Hartiat","Takareidet","Pohjelihas","Selkä","Niska"];
const DAYS = ["Ma","Ti","Ke","To","Pe","La","Su"];
const MONTHS = ["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"];
const trained = [3,5,7,10,12,14,17,19,21,22,24];

function LineChart({ data, color }) {
  const w = 300, h = 80;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i/(data.length-1))*w, y: h-((v-min)/range)*(h-8)-4 }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  return (
    <div className="line-chart">
      <svg className="line-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient></defs>
        <path d={path+` L${w},${h} L0,${h} Z`} fill="url(#lg)"/>
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="4" fill={color} stroke={C.card} strokeWidth="2"/>
      </svg>
    </div>
  );
}



function HomeTab({ onStart }) {
  const week = [true,true,false,true,false,false,false];
  return (
    <div>
      <div className="streak-wrap">
        <div className="streak-top">
          <div><div className="streak-num">12</div><div className="streak-lbl">päivän treeniputki</div></div>
          <div className="streak-icon">🔥</div>
        </div>
        <div className="week-row">
          {DAYS.map((d,i) => (
            <div key={i} className="wd">
              <div className="wd-label">{d}</div>
              <div className={`wd-dot${week[i]?" on":i===4?" cur":""}`}/>
            </div>
          ))}
        </div>
      </div>
      <button className="cta" onClick={onStart}>+ Aloita treeni</button>
      <div className="sec">Viimeisin treeni</div>
      <div className="card">
        <div className="lw-type">🏋️ Kuntosali · Tänään</div>
        <div className="lw-name">Yläkroppa</div>
        <div className="lw-ex">Penkkipunnerrus · Soutu · Olkapääpunnerrus</div>
        <div className="stats-row">
          <div className="stat-box"><div className="stat-v">6</div><div className="stat-l">liikettä</div></div>
          <div className="stat-box"><div className="stat-v">18</div><div className="stat-l">sarjaa</div></div>
          <div className="stat-box"><div className="stat-v">52</div><div className="stat-l">min</div></div>
        </div>
      </div>
      <div className="sec">Tällä viikolla</div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">3</div><div className="bs-lbl">treeniä</div></div>
        <div className="big-stat"><div className="bs-val">156</div><div className="bs-lbl">min yhteensä</div></div>
      </div>
    </div>
  );
}

function WorkoutTab() {
  const [phase, setPhase] = useState("select");
  const [type, setType] = useState(null);
  const [exs, setExs] = useState([]);
  const [modal, setModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [secs, setSecs] = useState(0);
  const [km, setKm] = useState(""); const [mins, setMins] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    if (phase==="log") timer.current = setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(timer.current);
  }, [phase]);

  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const addEx = name=>{ setExs(e=>[...e,{name,sets:[{kg:"",reps:"",rpe:"",fail:false}]}]); setModal(false); };
  const addSet = ei=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:[...x.sets,{kg:"",reps:"",rpe:"",fail:false}]}:x));
  const upd = (ei,si,f,v)=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:x.sets.map((s,j)=>j===si?{...s,[f]:v}:s)}:x));
  const toggleFail = (ei,si)=>setExs(e=>e.map((x,i)=>i===ei?{...x,sets:x.sets.map((s,j)=>j===si?{...s,fail:!s.fail}:s)}:x));
  const pace = ()=>{ if(!km||!mins) return "--:--"; const p=parseFloat(mins)/parseFloat(km); const m=Math.floor(p),s=Math.round((p-m)*60); return `${m}:${String(s).padStart(2,"0")}`; };

  const TYPES=[{id:"gym",emoji:"🏋️",name:"Kuntosali",sub:"Vapaat painot & laitteet"},{id:"home",emoji:"🏠",name:"Kotitreeni",sub:"Kehonpaino & kotipainot"},{id:"run",emoji:"🏃",name:"Juoksulenkki",sub:"Ulkona tai juoksumatolla"},{id:"bike",emoji:"🚴",name:"Pyörälenkki",sub:"Maantie tai maastopyörä"},{id:"mob",emoji:"🧘",name:"Kehonhuolto",sub:"Venyttely & mobiliteetti"}];

  if (phase==="select") return (
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:22,fontWeight:800}}>Uusi treeni</div><div style={{fontSize:12,color:C.textSub,marginTop:4}}>Valitse treenityyppi</div></div>
      <div className="type-grid">
        {TYPES.map(t=><div key={t.id} className={`type-card${type===t.id?" sel":""}`} onClick={()=>setType(t.id)}><span className="type-emoji">{t.emoji}</span><div className="type-name">{t.name}</div><div className="type-sub">{t.sub}</div></div>)}
      </div>
      {type&&<button className="cta" onClick={()=>setPhase("log")}>Aloita →</button>}
    </div>
  );

  if (phase==="log") return (
    <div>
      <div className="timer-bar"><div><div className="timer-lbl">Kesto</div><div className="timer-val">{fmt(secs)}</div></div><button className="end-btn" onClick={()=>setPhase("done")}>Lopeta</button></div>
      {(type==="gym"||type==="home")&&<>
        {exs.map((ex,ei)=>(
          <div key={ei} className="ex-card">
            <div className="ex-hdr"><div className="ex-name">{ex.name}</div><button className="ex-del" onClick={()=>setExs(e=>e.filter((_,i)=>i!==ei))}>✕</button></div>
            <div className="set-labels"><div className="sl">#</div><div className="sl">kg</div><div className="sl">toistot</div><div className="sl">RPE</div><div className="sl">Fail</div></div>
            {ex.sets.map((s,si)=>(
              <div key={si} className="set-row">
                <div className="set-n">{si+1}</div>
                <input className="inp" type="number" placeholder="—" value={s.kg} onChange={e=>upd(ei,si,"kg",e.target.value)}/>
                <input className="inp" type="number" placeholder="—" value={s.reps} onChange={e=>upd(ei,si,"reps",e.target.value)}/>
                <select className="rpe-sel" value={s.rpe} onChange={e=>upd(ei,si,"rpe",e.target.value)}><option value="">—</option>{[6,7,7.5,8,8.5,9,9.5,10].map(r=><option key={r}>{r}</option>)}</select>
                <button className={`fail-btn${s.fail?" on":""}`} onClick={()=>toggleFail(ei,si)}>{s.fail?"✓FAIL":"FAIL"}</button>
              </div>
            ))}
            <button className="add-set" onClick={()=>addSet(ei)}>+ Lisää sarja</button>
          </div>
        ))}
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
        {km&&mins&&(()=>{const spd=(parseFloat(km)/parseFloat(mins)*60).toFixed(1);return(
          <div className="pace-box"><div><div className="pace-l">Keskinopeus</div><div className="pace-v">{spd}</div></div><div style={{textAlign:"right"}}><div className="pace-l">km / h</div></div></div>
        );})()}
      </>}
      {type==="mob"&&<div>{MOBILITY.map((m,i)=><div key={i} className="mob-row"><div className="mob-name">{m}</div><input className="mob-inp" type="number" placeholder="sek"/></div>)}</div>}
      <div className="sec" style={{marginTop:20}}>Muistiinpanot</div>
      <textarea className="notes" rows={3} placeholder='esim. "jalat väsyneet, hyvä treeni"' value={notes} onChange={e=>setNotes(e.target.value)}/>
      <button className="save-btn" onClick={()=>setPhase("done")}>Tallenna treeni</button>
      {modal&&<div className="overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-handle"/><div className="modal-title">Valitse liike</div>{EXERCISES.map(ex=><div key={ex.name} className="ex-opt" onClick={()=>addEx(ex.name)}><span>{ex.name}</span><span className="ex-opt-sub">{ex.cat}</span></div>)}</div></div>}
    </div>
  );

  return (
    <div className="done-wrap">
      <div className="done-icon">✅</div>
      <div className="done-title">Treeni tallennettu!</div>
      <div className="done-sub">Hienoa työtä — putki jatkuu 🔥</div>
      <div className="stats-row" style={{marginBottom:28}}>
        <div className="stat-box"><div className="stat-v">{fmt(secs)}</div><div className="stat-l">kesto</div></div>
        <div className="stat-box"><div className="stat-v">{exs.length}</div><div className="stat-l">liikettä</div></div>
        <div className="stat-box"><div className="stat-v">{exs.reduce((a,e)=>a+e.sets.length,0)}</div><div className="stat-l">sarjaa</div></div>
      </div>
      <button className="cta" onClick={()=>{setPhase("select");setExs([]);setSecs(0);setNotes("");}}>Uusi treeni</button>
    </div>
  );
}

function StatsTab() {
  const [ex, setEx] = useState("Penkkipunnerrus");
  const mos = ["T","H","M","H","T","K","H","E","S","L","M","J"];
  const bench=[60,65,67.5,70,70,72.5,75,77.5,80,82.5,85,87.5];
  const squat=[80,85,90,90,95,100,102.5,105,107.5,110,112.5,115];
  const runD=[6.8,6.5,6.3,6.4,6.1,6.0,5.9,5.8,5.7,5.6,5.5,5.4];
  const bikeD=[24.2,24.8,25.0,24.6,25.4,26.0,26.2,26.8,27.0,27.4,27.8,28.4];
  const data = ex==="Kyykky"?squat:bench;
  return (
    <div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">47</div><div className="bs-lbl">treeniä yhteensä</div></div>
        <div className="big-stat"><div className="bs-val">87.5</div><div className="bs-lbl">kg bench PR</div></div>
      </div>
      <div className="sec">Liikekohtainen kehitys</div>
      <select className="ex-sel" value={ex} onChange={e=>setEx(e.target.value)}>{EXERCISES.map(e=><option key={e.name}>{e.name}</option>)}</select>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">{ex}</div><div className="chart-sub">Paras paino per treeni (kg)</div></div><div className="chart-pr">PR {Math.max(...data)} kg</div></div>
        <LineChart data={data} color={C.cyan}/>
        <div className="tag-row"><div className="tag c">↑ +{(data[data.length-1]-data[0]).toFixed(1)} kg / 12 kk</div><div className="tag">🏆 PR: {Math.max(...data)} kg</div></div>
      </div>
      <div className="sec">Juoksukehitys</div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">Juoksuvauhti</div><div className="chart-sub">min / km</div></div><div className="chart-pr">PR 5:24</div></div>
        <LineChart data={runD} color={C.cyan}/>
        <div className="tag-row"><div className="tag c">↓ -1.4 min/km / 12 kk</div><div className="tag">🏆 PR: 5:24 min/km</div></div>
      </div>
      <div className="sec">Pyöräkehitys</div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">Keskinopeus</div><div className="chart-sub">km / h</div></div><div className="chart-pr">PR 28.4 km/h</div></div>
        <LineChart data={bikeD} color={C.cyan}/>
        <div className="tag-row"><div className="tag c">↑ +4.2 km/h / 12 kk</div><div className="tag">🏆 PR: 28.4 km/h</div></div>
      </div>
    </div>
  );
}

function CalTab() {
  const [mo, setMo] = useState(3);
  const days=[31,28,31,30,31,30,31,31,30,31,30,31][mo];
  const offset=(()=>{const d=new Date(2026,mo,1).getDay();return d===0?6:d-1;})();
  const today=mo===3?25:null;
  return (
    <div>
      <div className="cal-wrap">
        <div className="cal-hdr">
          <button className="cal-nav" onClick={()=>setMo(m=>Math.max(0,m-1))}>‹</button>
          <div className="cal-month">{MONTHS[mo]} 2026</div>
          <button className="cal-nav" onClick={()=>setMo(m=>Math.min(11,m+1))}>›</button>
        </div>
        <div className="cal-grid">
          {DAYS.map(d=><div key={d} className="cal-dh">{d}</div>)}
          {Array(offset).fill(null).map((_,i)=><div key={`e${i}`} className="cal-d empty"/>)}
          {Array(days).fill(null).map((_,i)=>{
            const d=i+1;
            const isTrained=trained.includes(d);
            const isToday=d===today;
            return <div key={d} className={`cal-d ${isToday?"today":isTrained?"trained":"norm"}`}>{isTrained&&!isToday?"▪":d}</div>;
          })}
        </div>
      </div>
      <div className="two-col">
        <div className="big-stat"><div className="bs-val">8</div><div className="bs-lbl">treeniä / kk</div></div>
        <div className="big-stat"><div className="bs-val">3</div><div className="bs-lbl">lepopäivää max</div></div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [w,setW]=useState("84.5"); const [m,setM]=useState("42.1"); const [f,setF]=useState("16.2");
  const goals=[{name:"Penkkipunnerrus 100 kg",current:87.5,target:100,pct:87},{name:"Juoksu 5 km alle 25 min",current:27.0,target:25,pct:72},{name:"Paino 82 kg",current:84.5,target:82,pct:60}];
  const weightData=[89,88,87,86.5,86,85.5,85,85,84.5,84.5,84.5,84.5];
  return (
    <div>
      <div className="prof-hdr"><div className="avatar">💪</div><div><div className="prof-name">Omatreeni</div><div className="prof-since">Aloitettu tammikuu 2026</div></div></div>
      <div className="sec">Kehon mittaukset</div>
      <div className="body-grid">
        {[["Paino",w,setW,"kg"],["Lihas",m,setM,"%"],["Rasva",f,setF,"%"]].map(([lbl,val,set,unit])=>(
          <div key={lbl} className="body-box"><div className="body-lbl">{lbl}</div><input className="body-inp" value={val} onChange={e=>set(e.target.value)}/><div className="body-unit">{unit}</div></div>
        ))}
      </div>
      <div className="sec">Painon kehitys</div>
      <div className="chart-wrap">
        <div className="chart-hdr"><div><div className="chart-title">Paino</div><div className="chart-sub">viimeiset 12 kk (kg)</div></div><div className="chart-pr">-4.5 kg</div></div>
        <LineChart data={weightData} color={C.cyan}/>
      </div>
      <div className="sec">Tavoitteet</div>
      {goals.map((g,i)=>(
        <div key={i} className="goal-card">
          <div className="goal-row"><div className="goal-name">{g.name}</div><div className="goal-pct">{g.pct}%</div></div>
          <div className="prog-bar"><div className="prog-fill" style={{width:`${g.pct}%`}}/></div>
          <div className="goal-sub">{g.current} → {g.target}</div>
        </div>
      ))}
    </div>
  );
}

const TABS=[
  {id:"home",lbl:"Koti",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>},
  {id:"workout",lbl:"Treeni",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>},
  {id:"stats",lbl:"Tilastot",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>},
  {id:"cal",lbl:"Kalenteri",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>},
  {id:"profile",lbl:"Profiili",icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>},
];
const TITLES={home:"Treenipäiväkirja",workout:"Uusi treeni",stats:"Tilastot",cal:"Kalenteri",profile:"Profiili"};

// ─── SALASANA ───────────────────────────────────────────────────
// Vaihda tämä omaksi salasanaksesi:
const APP_PASSWORD = "treeni123";
const STORAGE_KEY = "tp_auth";

const lockCss = `
.lock-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 32px; background: ${C.bg}; }
.lock-icon { font-size: 52px; margin-bottom: 24px; }
.lock-title { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ${C.textSub}; margin-bottom: 6px; text-align: center; }
.lock-sub { font-size: 12px; color: ${C.textMuted}; margin-bottom: 40px; text-align: center; }
.lock-input-wrap { position: relative; width: 100%; max-width: 280px; margin-bottom: 12px; }
.lock-input { width: 100%; background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 16px 48px 16px 16px; color: ${C.text}; font-size: 16px; outline: none; font-family: 'Syne', sans-serif; text-align: center; letter-spacing: 2px; transition: border-color 0.2s; }
.lock-input:focus { border-color: ${C.cyan}; }
.lock-input.err { border-color: ${C.red}; }
.lock-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: ${C.textMuted}; cursor: pointer; font-size: 18px; padding: 4px; }
.lock-btn { width: 100%; max-width: 280px; background: ${C.cyan}; color: #000; border: none; border-radius: 12px; padding: 16px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; margin-bottom: 16px; }
.lock-btn:active { opacity: 0.85; }
.lock-err { font-size: 12px; color: ${C.red}; min-height: 18px; text-align: center; margin-bottom: 8px; }
`;

function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  const tryUnlock = () => {
    if (pw === APP_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setErr("Väärä salasana");
      setShake(true);
      setPw("");
      setTimeout(() => { setShake(false); setErr(""); }, 1500);
    }
  };

  return (
    <>
      <style>{FONTS + lockCss}</style>
      <div className="lock-wrap">
        <div className="lock-icon">🔒</div>
        <div className="lock-title">Treenipäiväkirja</div>
        <div className="lock-sub">Syötä salasana jatkaaksesi</div>
        <div className="lock-input-wrap">
          <input
            className={`lock-input${shake ? " err" : ""}`}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryUnlock()}
            autoFocus
          />
          <button className="lock-toggle" onClick={() => setShow(s => !s)}>
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <div className="lock-err">{err}</div>
        <button className="lock-btn" onClick={tryUnlock}>Avaa</button>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <style>{FONTS+css}</style>
      <div className="app">
        <div className="hdr">
          <div className="hdr-title">{TITLES[tab]}</div>
          <div className="hdr-date">La 25. huhtikuuta 2026</div>
        </div>
        <div className="content">
          {tab==="home"&&<HomeTab onStart={()=>setTab("workout")}/>}
          {tab==="workout"&&<WorkoutTab/>}
          {tab==="stats"&&<StatsTab/>}
          {tab==="cal"&&<CalTab/>}
          {tab==="profile"&&<ProfileTab/>}
        </div>
        <div className="tabbar">
          {TABS.map(t=><button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.icon}<span className="tab-lbl">{t.lbl}</span></button>)}
        </div>
      </div>
    </>
  );
}
