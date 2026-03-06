// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — UI Components (Mobile-First v3)
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { C, STATUS_CFG, PRIO_CFG } from "../styles/theme";

// ── Shared breakpoint hook (used by pages too) ──────
export function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 640);
    window.addEventListener("resize", fn, { passive:true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// ── Badge ────────────────────────────────────────────
export const Badge = ({ status, priority, custom, size="sm" }) => {
  let bg, fg, label;
  if (priority)     { bg=PRIO_CFG[priority]?.bg;  fg=PRIO_CFG[priority]?.fg;  label=PRIO_CFG[priority]?.label; }
  else if (custom)  { bg=custom.bg; fg=custom.fg; label=custom.label; }
  else              { bg=STATUS_CFG[status]?.bg||"#F1F5F9"; fg=STATUS_CFG[status]?.fg||"#475569"; label=STATUS_CFG[status]?.label||status; }
  const dot = STATUS_CFG[status]?.dot;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:bg,color:fg,
      padding:size==="sm"?"2px 8px":"4px 12px",borderRadius:20,
      fontSize:size==="sm"?10:12,fontWeight:700,letterSpacing:.4,textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {dot&&<span style={{width:5,height:5,borderRadius:"50%",background:dot,flexShrink:0}}/>}
      {label}
    </span>
  );
};

// ── Card ─────────────────────────────────────────────
export const Card = ({ children, style={}, className="", onClick, padding=16 }) => (
  <div className={className} onClick={onClick}
    style={{background:C.surface,borderRadius:14,boxShadow:C.shadowS,border:`1px solid ${C.border}`,padding,...style}}>
    {children}
  </div>
);

// ── KPI Card ─────────────────────────────────────────
export const KPICard = ({ label, value, sub, icon, color, trend, trendUp=true }) => (
  <Card className="hover-lift" style={{borderLeft:`4px solid ${color}`,cursor:"default"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:6,lineHeight:1.3}}>{label}</div>
        <div style={{fontSize:"clamp(22px,5vw,32px)",fontWeight:800,color:C.text,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{value}</div>
        {sub&&<div style={{fontSize:11,color:C.textS,marginTop:4,lineHeight:1.3}}>{sub}</div>}
      </div>
      <div style={{background:color+"18",borderRadius:10,padding:10,fontSize:"clamp(18px,4vw,22px)",flexShrink:0,marginLeft:6}}>{icon}</div>
    </div>
    {trend&&(
      <div style={{marginTop:10,fontSize:11,fontWeight:600,color:trendUp?C.green:C.amber,display:"flex",alignItems:"center",gap:4}}>
        {trendUp?"▲":"▼"} {trend}
      </div>
    )}
  </Card>
);

// ── Button ───────────────────────────────────────────
export const Btn = ({ children, onClick, variant="primary", size="md", style={}, disabled=false, full=false }) => {
  const [hov, setHov] = useState(false);
  const sizes = {
    xs:{fontSize:11,padding:"5px 10px",minHeight:28,borderRadius:7},
    sm:{fontSize:12,padding:"7px 14px",minHeight:34,borderRadius:8},
    md:{fontSize:13,padding:"10px 20px",minHeight:40,borderRadius:9},
    lg:{fontSize:14,padding:"12px 26px",minHeight:46,borderRadius:10},
  };
  const vars = {
    primary: {background:hov?C.redD:C.red,     color:"#fff",boxShadow:`0 2px 10px ${C.red}35`},
    secondary:{background:hov?"#1a3a6b":C.navy,  color:"#fff"},
    success: {background:hov?"#047857":C.green,  color:"#fff"},
    warning: {background:hov?"#b45309":C.amber,  color:"#fff"},
    danger:  {background:hov?"#b91c1c":"#DC2626",color:"#fff"},
    outline: {background:"transparent",color:C.red,border:`1.5px solid ${C.red}`,boxShadow:hov?`0 0 0 3px ${C.red}18`:"none"},
    ghost:   {background:hov?"#F1F5F9":"transparent",color:C.textM,border:`1px solid ${C.border}`},
    blue:    {background:hov?"#1a4f8a":C.blue,   color:"#fff"},
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...sizes[size],...vars[variant],border:"none",fontWeight:600,cursor:disabled?"not-allowed":"pointer",transition:"all .15s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,opacity:disabled?.5:1,width:full?"100%":"auto",...style}}>
      {children}
    </button>
  );
};

// ── Input ────────────────────────────────────────────
export const Input = ({ label, value, onChange, type="text", placeholder="", style={}, icon, required=false, readOnly=false }) => (
  <div style={style}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:C.textM,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <div style={{position:"relative"}}>
      {icon&&<span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>{icon}</span>}
      <input type={type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{width:"100%",padding:icon?"11px 12px 11px 36px":"11px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"inherit",color:C.text,background:readOnly?"#F8FAFC":"white",transition:"border .15s, box-shadow .15s"}}/>
    </div>
  </div>
);

// ── Textarea ─────────────────────────────────────────
export const Textarea = ({ label, value, onChange, placeholder, rows=3, style={} }) => (
  <div style={style}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:C.textM,display:"block",marginBottom:5}}>{label}</label>}
    <textarea value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"inherit",color:C.text,resize:"vertical",transition:"border .15s"}}/>
  </div>
);

// ── Select ───────────────────────────────────────────
export const Select = ({ label, value, onChange, options=[], style={}, required=false }) => (
  <div style={style}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:C.textM,display:"block",marginBottom:5}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <select value={value} onChange={e=>onChange&&onChange(e.target.value)}
      style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:"inherit",color:C.text,background:"white",cursor:"pointer",transition:"border .15s"}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Modal — bottom sheet on mobile, centered on desktop ──
export const Modal = ({ open, onClose, title, children, width=540, subtitle }) => {
  const mob = window.innerWidth < 640;
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(11,30,61,.55)",zIndex:1000,display:"flex",
        alignItems: mob?"flex-end":"center",
        justifyContent: mob?"stretch":"center",
        backdropFilter:"blur(5px)", padding: mob?0:20}}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}
        style={{background:"white",
          borderRadius: mob?"20px 20px 0 0":18,
          width: mob?"100%":width,
          maxWidth: mob?"100%":"92vw",
          maxHeight: mob?"92vh":"88vh",
          overflowY:"auto",boxShadow:C.shadowXL}}>
        {/* Handle on mobile */}
        {mob&&<div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:2}}><div style={{width:40,height:4,borderRadius:99,background:C.border}}/></div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
          padding: mob?"14px 18px 12px":"20px 24px 16px",
          borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:"white",zIndex:1}}>
          <div>
            <h3 style={{margin:0,fontSize:mob?16:17,fontWeight:800,color:C.text}}>{title}</h3>
            {subtitle&&<p style={{margin:"3px 0 0",fontSize:12,color:C.textS}}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{background:"#F1F5F9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,color:C.textS,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12}}>×</button>
        </div>
        <div style={{padding: mob?"16px 18px":"22px 24px"}}>{children}</div>
        {mob&&<div style={{height:"env(safe-area-inset-bottom, 0px)"}}/>}
      </div>
    </div>
  );
};

// ── Table (horizontal scroll wrapper on mobile) ──────
export const Table = ({ cols, rows, onRow, emptyMsg="No records found" }) => (
  <div className="table-wrap">
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:cols.length>4?500:"auto"}}>
      <thead>
        <tr style={{background:"#F8FAFC",borderBottom:`1px solid ${C.border}`}}>
          {cols.map(c=>(
            <th key={c.key} style={{textAlign:"left",padding:"10px 14px",color:C.textS,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:.6,whiteSpace:"nowrap"}}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row,i)=>(
          <tr key={i} className="table-row" onClick={()=>onRow&&onRow(row)}
            style={{cursor:onRow?"pointer":"default",borderBottom:"1px solid #F8FAFC"}}>
            {cols.map(c=>(
              <td key={c.key} style={{padding:"12px 14px",color:C.textM,verticalAlign:"middle",whiteSpace:c.nowrap?"nowrap":"normal"}}>
                {c.render?c.render(row[c.key],row):row[c.key]}
              </td>
            ))}
          </tr>
        ))}
        {rows.length===0&&(
          <tr><td colSpan={cols.length} style={{padding:"36px",textAlign:"center",color:C.textS,fontSize:13}}>{emptyMsg}</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

// ── Tabs — horizontally scrollable on mobile ─────────
export const Tabs = ({ tabs, active, onChange, variant="pill" }) => (
  <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:1}}>
    <div style={{display:"flex",gap:3,
      background:variant==="pill"?"#F1F5F9":"transparent",
      borderRadius:variant==="pill"?11:0,
      padding:variant==="pill"?4:0,
      width:"max-content",minWidth:"100%",
      borderBottom:variant==="underline"?`1px solid ${C.border}`:"none"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} className="pill"
          style={{padding:variant==="pill"?"7px 14px":"10px 16px",
            borderRadius:variant==="pill"?8:0,border:"none",
            fontSize:"clamp(11px,2.5vw,13px)",fontWeight:600,whiteSpace:"nowrap",
            background:active===t.id&&variant==="pill"?"white":"transparent",
            color:active===t.id?C.red:C.textS,
            boxShadow:active===t.id&&variant==="pill"?C.shadowS:"none",
            borderBottom:active===t.id&&variant==="underline"?`2px solid ${C.red}`:"2px solid transparent",
            transition:"all .15s"}}>
          {t.icon&&<span style={{marginRight:4}}>{t.icon}</span>}{t.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Progress Bar ─────────────────────────────────────
export const ProgressBar = ({ value, color, height=6, label=false }) => {
  const col = color||(value>=70?C.green:value>=40?C.amber:C.red);
  return (
    <div>
      <div style={{background:"#E5E7EB",borderRadius:99,height,overflow:"hidden"}}>
        <div style={{width:`${Math.min(100,Math.max(0,value))}%`,height:"100%",background:col,borderRadius:99,transition:"width .5s ease"}}/>
      </div>
      {label&&<div style={{fontSize:11,color:C.textS,marginTop:3,textAlign:"right",fontWeight:600}}>{value}%</div>}
    </div>
  );
};

// ── Alert ─────────────────────────────────────────────
export const Alert = ({ type="info", title, message, onClose, style={} }) => {
  const cfgs = {
    success: {bg:"#F0FDF4",border:"#BBF7D0",icon:"✅",color:C.green},
    warning: {bg:"#FFFBEB",border:"#FDE68A",icon:"⚠️",color:C.amber},
    error:   {bg:"#FFF1F2",border:"#FECDD3",icon:"❌",color:"#DC2626"},
    info:    {bg:"#EFF6FF",border:"#BFDBFE",icon:"ℹ️",color:C.blue},
    critical:{bg:"#FFF1F2",border:"#FECDD3",icon:"🚨",color:"#DC2626"},
  };
  const cf = cfgs[type]||cfgs.info;
  return (
    <div style={{display:"flex",gap:10,padding:"12px 14px",background:cf.bg,border:`1px solid ${cf.border}`,borderRadius:10,alignItems:"flex-start",...style}}>
      <span style={{fontSize:16,flexShrink:0}}>{cf.icon}</span>
      <div style={{flex:1}}>
        {title&&<div style={{fontSize:13,fontWeight:700,color:cf.color,marginBottom:2}}>{title}</div>}
        <div style={{fontSize:12,color:cf.color,lineHeight:1.5}}>{message}</div>
      </div>
      {onClose&&<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:C.textS,flexShrink:0,padding:0}}>×</button>}
    </div>
  );
};

// ── Section Header (wraps actions on mobile) ─────────
export const SectionHeader = ({ title, subtitle, actions }) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
    <div style={{minWidth:0}}>
      <h2 style={{margin:0,fontSize:"clamp(17px,4.5vw,22px)",fontWeight:800,color:C.text,lineHeight:1.2}}>{title}</h2>
      {subtitle&&<p style={{margin:"4px 0 0",fontSize:"clamp(11px,2.5vw,13px)",color:C.textS,lineHeight:1.5}}>{subtitle}</p>}
    </div>
    {actions&&<div style={{display:"flex",gap:8,flexShrink:0,flexWrap:"wrap"}}>{actions}</div>}
  </div>
);

// ── Avatar ────────────────────────────────────────────
export const Avatar = ({ initials, color, size=36, style={} }) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,flexShrink:0,userSelect:"none",...style}}>
    {initials}
  </div>
);

// ── Divider ───────────────────────────────────────────
export const Divider = ({ label, style={} }) => (
  <div style={{display:"flex",alignItems:"center",gap:12,margin:"14px 0",...style}}>
    <div style={{flex:1,height:1,background:C.border}}/>
    {label&&<span style={{fontSize:11,color:C.textS,fontWeight:600,textTransform:"uppercase",letterSpacing:.6,whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:C.border}}/>
  </div>
);

// ── Stat Row ──────────────────────────────────────────
export const StatRow = ({ items }) => (
  <div style={{display:"grid",gridTemplateColumns:`repeat(${items.length},1fr)`,gap:1,background:C.border,borderRadius:12,overflow:"hidden"}}>
    {items.map((s,i)=>(
      <div key={i} style={{background:"white",padding:"12px 8px",textAlign:"center"}}>
        <div style={{fontSize:"clamp(16px,4vw,22px)",fontWeight:800,color:s.color||C.text}}>{s.value}</div>
        <div style={{fontSize:"clamp(9px,2vw,11px)",color:C.textS,marginTop:2,lineHeight:1.3}}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ── Empty State ───────────────────────────────────────
export const Empty = ({ icon="📭", title="No data", sub="", action }) => (
  <div style={{textAlign:"center",padding:"40px 20px"}}>
    <div style={{fontSize:44,marginBottom:10}}>{icon}</div>
    <div style={{fontSize:15,fontWeight:700,color:C.textM,marginBottom:5}}>{title}</div>
    {sub&&<div style={{fontSize:13,color:C.textS,marginBottom:14}}>{sub}</div>}
    {action}
  </div>
);
