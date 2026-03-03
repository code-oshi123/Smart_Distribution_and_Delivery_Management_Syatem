// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Map & Chart Components
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { C } from "../styles/theme";

// ─── Sri Lanka Map ────────────────────────────────
export const SriLankaMap = ({ vehicles=[], gpsLogs=[], onSelect, selected, height=400, compact=false }) => {
  const [zoom, setZoom] = useState(1);

  const toXY = (lat, lng) => {
    const x = ((lng - 79.5) / 2.1) * 266 + 17;
    const y = 388 - ((lat - 5.85) / 4.5) * 368;
    return [x, y];
  };

  const V_COLOR = {
    "on-route":  "#10B981",
    "delayed":   "#EF4444",
    "completed": "#3B82F6",
    "idle":      "#94A3B8",
    "offline":   "#374151",
  };

  const CITIES = [
    { name:"Colombo",  lat:6.927, lng:79.861 },
    { name:"Kandy",    lat:7.291, lng:80.636 },
    { name:"Galle",    lat:6.053, lng:80.220 },
    { name:"Jaffna",   lat:9.667, lng:80.007 },
    { name:"Negombo",  lat:7.209, lng:79.838 },
    { name:"Matara",   lat:5.945, lng:80.535 },
    { name:"Kurunegala",lat:7.486,lng:80.362 },
    { name:"Badulla",  lat:6.989, lng:81.055 },
  ];

  return (
    <div style={{ position:"relative", background:"#0B1E3D", borderRadius:12, overflow:"hidden", height }}>
      <svg
        viewBox="0 0 300 400"
        style={{ width:"100%", height:"100%", transform:`scale(${zoom})`, transformOrigin:"center center", transition:"transform .3s ease" }}
      >
        {/* Grid lines */}
        {Array.from({length:9},(_,i)=>(
          <g key={i}>
            <line x1={i*37.5} y1={0} x2={i*37.5} y2={400} stroke="#162E54" strokeWidth=".5"/>
            <line x1={0} y1={i*50} x2={300} y2={i*50} stroke="#162E54" strokeWidth=".5"/>
          </g>
        ))}

        {/* Sri Lanka outline */}
        <path
          d="M142 35 L148 38 L155 40 L162 44 L168 50 L173 57 L177 66 L180 76 L183 88 L185 101 L186 115 L186 128 L185 141 L183 153 L181 165 L178 177 L175 189 L171 200 L167 211 L162 222 L157 232 L151 242 L145 251 L139 259 L134 267 L130 275 L127 284 L125 293 L124 302 L124 311 L125 320 L127 329 L130 338 L132 346 L133 353 L133 359 L131 365 L127 369 L122 370 L117 368 L112 363 L108 356 L106 348 L106 339 L108 329 L111 319 L114 309 L116 299 L117 289 L117 279 L116 269 L114 259 L111 249 L109 239 L108 228 L108 217 L109 206 L110 195 L112 184 L113 173 L114 162 L115 151 L116 140 L117 129 L118 118 L120 107 L123 97 L127 87 L131 78 L135 69 L138 61 L140 53 L141 46 Z"
          fill="#162E54" stroke="#1D5FA4" strokeWidth="1.5" opacity=".9"
        />

        {/* Province boundaries (simplified) */}
        <path d="M150 160 L165 155 L175 165 L165 180 L150 175 Z" fill="#1a3a6b" opacity=".3"/>

        {/* City dots */}
        {CITIES.map(city => {
          const [x,y] = toXY(city.lat, city.lng);
          return (
            <g key={city.name}>
              <circle cx={x} cy={y} r={2.5} fill="#334155"/>
              {!compact && <text x={x+6} y={y+3} fontSize="7" fill="#64748B" fontFamily="Outfit, sans-serif">{city.name}</text>}
            </g>
          );
        })}

        {/* Vehicle markers */}
        {vehicles.map(v => {
          const log = gpsLogs.find(g => g.veh === v.id);
          if (!log) return null;
          const [x,y] = toXY(log.lat, log.lng);
          const col = V_COLOR[v.status] || "#9CA3AF";
          const isSel = selected === v.id;
          const isMoving = v.status === "on-route";

          return (
            <g key={v.id} onClick={()=>onSelect&&onSelect(v)} style={{ cursor:"pointer" }}>
              {/* Selection ring */}
              {isSel && <circle cx={x} cy={y} r={24} fill={col} opacity={.12}/>}

              {/* Ping animation for moving vehicles */}
              {isMoving && (
                <circle cx={x} cy={y} r={14} fill="none" stroke={col} strokeWidth="1.5" opacity=".6">
                  <animate attributeName="r" values="8;20;8" dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values=".6;0;.6" dur="2.5s" repeatCount="indefinite"/>
                </circle>
              )}

              {/* Vehicle circle */}
              <circle cx={x} cy={y} r={18} fill={col} opacity={.18}/>
              <circle cx={x} cy={y} r={9} fill={col}/>

              {/* Vehicle ID */}
              <text x={x} y={y+3} textAnchor="middle" fontSize="6" fill="white" fontWeight="700" fontFamily="JetBrains Mono, monospace">{v.id}</text>

              {/* Plate label */}
              <rect x={x-16} y={y-26} width={32} height={11} rx="3" fill="rgba(0,0,0,.6)"/>
              <text x={x} y={y-18} textAnchor="middle" fontSize="6.5" fill="white" fontFamily="JetBrains Mono, monospace">{v.plate}</text>
            </g>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:5 }}>
        {[{l:"＋",fn:()=>setZoom(z=>Math.min(2.4,z+.25))},{l:"－",fn:()=>setZoom(z=>Math.max(.6,z-.25))},{l:"⊙",fn:()=>setZoom(1)}].map(b=>(
          <button key={b.l} onClick={b.fn}
            style={{ width:30,height:30,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.18)",borderRadius:7,color:"white",fontSize:15,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s" }}>
            {b.l}
          </button>
        ))}
      </div>

      {/* Legend */}
      {!compact && (
        <div style={{ position:"absolute", bottom:12, left:12, display:"flex", flexWrap:"wrap", gap:6, maxWidth:220 }}>
          {Object.entries(V_COLOR).map(([st,col])=>(
            <div key={st} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,.5)", borderRadius:6, padding:"3px 8px", backdropFilter:"blur(4px)" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:col }}/>
              <span style={{ fontSize:9,color:"#CBD5E1",textTransform:"capitalize" }}>{st.replace("-"," ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live indicator */}
      <div style={{ position:"absolute", top:12, left:12, display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,.5)", borderRadius:7, padding:"4px 10px", backdropFilter:"blur(4px)" }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:"#10B981",animation:"pulse-dot 1.5s infinite" }}/>
        <span style={{ fontSize:10,color:"#CBD5E1",fontWeight:600 }}>LIVE</span>
      </div>
    </div>
  );
};

// ─── Bar Chart ────────────────────────────────────
export const BarChart = ({ data=[], color=C.red, height=80, showValues=false }) => {
  const max = Math.max(...data.map(d=>d.v), 1);
  const W=290, H=height, pad=8, barW=Math.max(4,(W-pad*2)/data.length-5);
  return (
    <svg viewBox={`0 0 ${W} ${H+22}`} style={{ width:"100%", overflow:"visible" }}>
      {data.map((d,i)=>{
        const bh = Math.max(2, (d.v/max)*(H-8));
        const x = pad + i*(barW+5);
        return (
          <g key={i}>
            <rect x={x} y={H-bh} width={barW} height={bh} rx={3} fill={color} opacity={.85}/>
            <text x={x+barW/2} y={H+14} textAnchor="middle" fontSize="9" fill={C.textS} fontFamily="Outfit">{d.l}</text>
            {showValues && <text x={x+barW/2} y={H-bh-4} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">{d.v}</text>}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Line Chart ───────────────────────────────────
export const LineChart = ({ data=[], color=C.blue, height=80, showValues=false }) => {
  const max = Math.max(...data.map(d=>d.v), 1);
  const W=290, H=height, pad=10;
  const pts = data.map((d,i)=>{
    const x = pad + (data.length>1 ? (i/(data.length-1))*(W-pad*2) : (W-pad*2)/2);
    const y = H - (d.v/max)*(H-10);
    return [x,y];
  });
  const area = [...pts.map(p=>p.join(",")), `${W-pad},${H}`, `${pad},${H}`].join(" ");
  const line = pts.map(p=>p.join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H+22}`} style={{ width:"100%", overflow:"visible" }}>
      <defs>
        <linearGradient id={`lg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#lg-${color.replace("#","")})`}/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {pts.map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r={3.5} fill="white" stroke={color} strokeWidth="2"/>
          <text x={x} y={H+14} textAnchor="middle" fontSize="9" fill={C.textS} fontFamily="Outfit">{data[i].l}</text>
          {showValues && <text x={x} y={y-8} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">{data[i].v}</text>}
        </g>
      ))}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────
export const DonutChart = ({ segments=[], size=140, thickness=28, label, sublabel }) => {
  const total = segments.reduce((s,seg)=>s+seg.value, 0) || 1;
  let cumulative = 0;
  const r = (size-thickness)/2, cx=size/2, cy=size/2, circ=2*Math.PI*r;

  const arcs = segments.map(seg=>{
    const dash = (seg.value/total)*circ;
    const offset = circ - (cumulative/total)*circ;
    cumulative += seg.value;
    return { ...seg, dash, offset };
  });

  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={thickness}/>
        {arcs.map((a,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={thickness}
            strokeDasharray={`${a.dash} ${circ-a.dash}`} strokeDashoffset={-circ+a.offset} strokeLinecap="round"/>
        ))}
      </svg>
      {(label||sublabel) && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {label && <div style={{ fontSize:size*.18, fontWeight:800, color:C.text, lineHeight:1 }}>{label}</div>}
          {sublabel && <div style={{ fontSize:size*.09, color:C.textS, marginTop:2 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
};

// ─── Sparkline ────────────────────────────────────
export const Sparkline = ({ data=[], color=C.green, height=32, width=80 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*(width-4)+2;
    const y = height - ((v-min)/(max-min||1))*(height-4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height, overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      {[data[data.length-1]].map((_,i)=>{
        const x = width-2, y = height - ((data[data.length-1]-min)/(max-min||1))*(height-4) - 2;
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color}/>;
      })}
    </svg>
  );
};
