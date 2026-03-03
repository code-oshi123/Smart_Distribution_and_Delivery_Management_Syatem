// ═══════════════════════════════════════════════════
// PAGE: Login
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { USERS } from "../data/db";
import { ROLE_COLORS, ROLE_LABELS, C } from "../styles/theme";
import { Alert, Btn, Input } from "../components/UI";

export default function LoginPage({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  const handle = () => {
    if (!email || !pass) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.pw === pass);
      if (user) onLogin(user);
      else { setError("Incorrect email or password. Use the demo accounts below."); setLoading(false); }
    }, 600);
  };

  const quickLogin = (u) => { setEmail(u.email); setPass(u.pw); setTimeout(()=>onLogin(u),200); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Outfit', sans-serif", background:C.navy, overflow:"hidden", position:"relative" }}>
      {/* Left panel */}
      <div style={{ flex:"0 0 52%", background:`linear-gradient(140deg, ${C.navy} 0%, #122848 45%, #1a3a6b 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 72px", position:"relative", overflow:"hidden" }}>

        {/* Decorative circles */}
        {[{w:500,h:500,t:-180,l:-180,op:.06},{w:360,h:360,b:-140,r:-80,op:.06},{w:200,h:200,t:"35%",l:"70%",op:.04}].map((ci,i)=>(
          <div key={i} style={{ position:"absolute", width:ci.w, height:ci.h, borderRadius:"50%", background:C.red, top:ci.t, left:ci.l, bottom:ci.b, right:ci.r, opacity:ci.op, pointerEvents:"none" }}/>
        ))}

        {/* Grid pattern overlay */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04, pointerEvents:"none" }}>
          {Array.from({length:20},(_,i)=><line key={`v${i}`} x1={i*60} y1={0} x2={i*60} y2="100%" stroke="white" strokeWidth=".5"/>)}
          {Array.from({length:20},(_,i)=><line key={`h${i}`} x1={0} y1={i*60} x2="100%" y2={i*60} stroke="white" strokeWidth=".5"/>)}
        </svg>

        <div style={{ position:"relative", zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:14, marginBottom:56 }}>
            <div style={{ background:C.red, borderRadius:12, padding:"10px 18px", fontWeight:900, fontSize:22, color:"white", letterSpacing:2 }}>NESTLÉ</div>
            <div style={{ width:1, height:40, background:"rgba(255,255,255,.18)" }}/>
            <div style={{ color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:500, lineHeight:1.5 }}>SRI LANKA<br/><span style={{fontSize:11,opacity:.7}}>Delivery Management System</span></div>
          </div>

          <h1 style={{ color:"white", fontSize:40, fontWeight:900, lineHeight:1.15, marginBottom:16 }}>
            Supply Chain<br/>
            <span style={{ color:C.red }}>Reimagined</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.55)", fontSize:15, lineHeight:1.7, maxWidth:400, marginBottom:48 }}>
            A centralized platform for real-time delivery tracking, route optimization, and operational excellence across Sri Lanka.
          </p>

          {/* Feature pills */}
          {[
            { icon:"🗺️", label:"Real-time Vehicle Tracking" },
            { icon:"🛣️", label:"AI-Powered Route Optimization" },
            { icon:"📦", label:"Live Delivery Status Updates" },
            { icon:"📊", label:"KPI & Performance Dashboard" },
          ].map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{f.icon}</div>
              <span style={{ color:"rgba(255,255,255,.75)", fontSize:13, fontWeight:500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40, background:"#F0F4F8", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>

          <div style={{ background:"white", borderRadius:20, padding:"36px 36px 28px", boxShadow:C.shadowXL, marginBottom:16 }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:4 }}>Welcome back</h2>
            <p style={{ fontSize:13, color:C.textS, marginBottom:28 }}>Sign in to your Nestlé DMS account</p>

            {error && <Alert type="error" message={error} onClose={()=>setError("")} style={{ marginBottom:18 }}/>}

            <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@nestle.lk" icon="✉️" style={{ marginBottom:14 }} required/>
            <Input label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••" icon="🔒" style={{ marginBottom:22 }} required/>

            <Btn full onClick={handle} size="lg" disabled={loading}>
              {loading ? <><span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span> Signing in…</> : "Sign In →"}
            </Btn>

            <p style={{ textAlign:"center", fontSize:11, color:C.textS, marginTop:16 }}>
              Protected by enterprise-grade encryption · Role-based access control
            </p>
          </div>

          {/* Demo accounts */}
          <div style={{ background:"white", borderRadius:16, padding:"20px 24px", boxShadow:C.shadowS, border:`1px solid ${C.border}` }}>
            <button onClick={()=>setShowDemo(!showDemo)}
              style={{ background:"none", border:"none", width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"'Outfit', sans-serif" }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.textM }}>🔑 Demo Accounts</span>
              <span style={{ fontSize:11, color:C.red, fontWeight:600 }}>{showDemo?"Hide ▲":"Show ▼"}</span>
            </button>

            {showDemo && (
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:7 }}>
                {USERS.map(u=>(
                  <button key={u.id} onClick={()=>quickLogin(u)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px", background:ROLE_COLORS[u.role]+"0D", border:`1px solid ${ROLE_COLORS[u.role]}28`, borderRadius:10, cursor:"pointer", textAlign:"left", transition:"all .15s", fontFamily:"'Outfit', sans-serif" }}
                    onMouseEnter={e=>{e.currentTarget.style.background=ROLE_COLORS[u.role]+"1A"; e.currentTarget.style.borderColor=ROLE_COLORS[u.role]+"55";}}
                    onMouseLeave={e=>{e.currentTarget.style.background=ROLE_COLORS[u.role]+"0D"; e.currentTarget.style.borderColor=ROLE_COLORS[u.role]+"28";}}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:ROLE_COLORS[u.role],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0 }}>{u.avatar}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:700,color:C.text }}>{u.name}</div>
                      <div style={{ fontSize:10,color:ROLE_COLORS[u.role],fontWeight:600 }}>{ROLE_LABELS[u.role]}</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:10, color:C.textS, flexShrink:0 }}>Click to login</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"rgba(0,0,0,.3)", marginTop:20 }}>
            © 2025 Nestlé Lanka PLC · Internal System v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
