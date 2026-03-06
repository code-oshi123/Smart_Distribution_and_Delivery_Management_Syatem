// ═══════════════════════════════════════════════════
// PAGE: Login — Mobile-First v3
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { USERS } from "../data/db";
import { ROLE_COLORS, ROLE_LABELS, C } from "../styles/theme";
import { Alert, Btn, Input } from "../components/UI";

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

export default function LoginPage({ onLogin }) {
  const isMobile = useIsMobile();
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loggingIn, setLoggingIn] = useState(null); // which user is logging in

  const handle = () => {
    if (!email || !pass) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.pw === pass);
      if (user) onLogin(user);
      else { setError("Incorrect email or password. Try a demo account below."); setLoading(false); }
    }, 700);
  };

  const quickLogin = (u) => {
    setLoggingIn(u.id);
    setEmail(u.email);
    setPass(u.pw);
    setTimeout(() => onLogin(u), 420);
  };

  const handleKey = (e) => { if (e.key === "Enter") handle(); };

  // ── MOBILE LAYOUT ──────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        minHeight: "100vh",
        fontFamily: "'Outfit', system-ui, sans-serif",
        background: C.navy,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        position: "relative",
      }}>

        {/* ── Decorative bg blobs ── */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
          <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:C.red, top:-140, right:-100, opacity:.10 }}/>
          <div style={{ position:"absolute", width:240, height:240, borderRadius:"50%", background:C.red, bottom:"-10%", left:"-15%", opacity:.07 }}/>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.03)", top:"40%", right:"-5%" }}/>
          {/* Grid */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.035 }}>
            {Array.from({length:16}, (_,i) => <line key={`v${i}`} x1={i*50} y1={0} x2={i*50} y2="100%" stroke="white" strokeWidth=".5"/>)}
            {Array.from({length:30}, (_,i) => <line key={`h${i}`} x1={0} y1={i*50} x2="100%" y2={i*50} stroke="white" strokeWidth=".5"/>)}
          </svg>
        </div>

        {/* ── Top brand strip ── */}
        <div style={{ position:"relative", zIndex:1, padding:"44px 24px 28px", textAlign:"center" }}>
          {/* Logo badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ background:C.red, borderRadius:10, padding:"8px 16px", fontWeight:900, fontSize:18, color:"white", letterSpacing:2 }}>NESTLÉ</div>
            <div style={{ width:1, height:32, background:"rgba(255,255,255,.2)" }}/>
            <div style={{ color:"rgba(255,255,255,.65)", fontSize:11, fontWeight:500, lineHeight:1.6, textAlign:"left" }}>
              SRI LANKA<br/>
              <span style={{ opacity:.7, fontSize:10 }}>Delivery Management</span>
            </div>
          </div>

          <h1 style={{ color:"white", fontSize:28, fontWeight:900, lineHeight:1.2, marginBottom:8 }}>
            Supply Chain<br/>
            <span style={{ color:C.red }}>Reimagined</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.45)", fontSize:13, lineHeight:1.6, maxWidth:320, margin:"0 auto" }}>
            Real-time tracking, intelligent routing & operational excellence.
          </p>

          {/* Feature pills — 2×2 grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:22, maxWidth:340, margin:"22px auto 0" }}>
            {[
              { icon:"🗺️", label:"Live Tracking"     },
              { icon:"🛣️", label:"Route Optimization" },
              { icon:"📦", label:"Delivery Updates"   },
              { icon:"📊", label:"KPI Dashboard"      },
            ].map((f,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.09)", borderRadius:10, padding:"9px 10px" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{f.icon}</span>
                <span style={{ color:"rgba(255,255,255,.7)", fontSize:11, fontWeight:600, lineHeight:1.3 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Login card — rounded top corners ── */}
        <div style={{
          position: "relative", zIndex: 1,
          flex: 1,
          background: "#F0F4F8",
          borderRadius: "24px 24px 0 0",
          padding: "28px 20px 20px",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,.25)",
        }}>
          {/* Handle */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
            <div style={{ width:40, height:4, borderRadius:99, background:C.border }}/>
          </div>

          {/* Form card */}
          <div style={{ background:"white", borderRadius:18, padding:"24px 20px 20px", boxShadow:C.shadowM, marginBottom:14 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:3 }}>Welcome back</h2>
            <p style={{ fontSize:12, color:C.textS, marginBottom:22 }}>Sign in to your Nestlé DMS account</p>

            {error && (
              <Alert type="error" message={error} onClose={()=>setError("")} style={{ marginBottom:16, fontSize:13 }}/>
            )}

            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.textM, display:"block", marginBottom:6 }}>Email Address *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>✉️</span>
                <input
                  type="email" value={email}
                  onChange={e=>setEmail(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="you@nestle.lk"
                  autoCapitalize="off" autoCorrect="off"
                  style={{ width:"100%", padding:"13px 14px 13px 40px", border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:16, color:C.text, background:"white", transition:"border .15s", WebkitAppearance:"none" }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.textM, display:"block", marginBottom:6 }}>Password *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔒</span>
                <input
                  type={showPass?"text":"password"} value={pass}
                  onChange={e=>setPass(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  style={{ width:"100%", padding:"13px 46px 13px 40px", border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:16, color:C.text, background:"white", transition:"border .15s", WebkitAppearance:"none" }}
                />
                <button
                  onClick={()=>setShowPass(!showPass)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, padding:4, color:C.textS }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Sign In button — large, full-width */}
            <button
              onClick={handle} disabled={loading}
              style={{ width:"100%", padding:"14px", background:loading?"#94A3B8":C.red, color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:loading?"not-allowed":"pointer", transition:"all .2s", letterSpacing:.3, display:"flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:50 }}>
              {loading
                ? <><span style={{animation:"spin .7s linear infinite",display:"inline-block",fontSize:18}}>⟳</span> Signing in…</>
                : "Sign In →"
              }
            </button>

            <p style={{ textAlign:"center", fontSize:10, color:C.textS, marginTop:14, lineHeight:1.5 }}>
              🔒 Enterprise-grade security · Role-based access
            </p>
          </div>

          {/* Demo Accounts — collapsible */}
          <div style={{ background:"white", borderRadius:16, boxShadow:C.shadowS, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:14 }}>
            <button
              onClick={()=>setShowDemo(!showDemo)}
              style={{ background:"none", border:"none", width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", cursor:"pointer", fontFamily:"'Outfit',sans-serif", WebkitTapHighlightColor:"transparent" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>🔑</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.textM }}>Demo Accounts</span>
                <span style={{ background:C.redL, color:C.red, borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:700 }}>{USERS.length}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, color:C.red, fontSize:12, fontWeight:600 }}>
                {showDemo ? "Hide" : "Tap to expand"}
                <span style={{ fontSize:11, transition:"transform .2s", display:"inline-block", transform:showDemo?"rotate(180deg)":"none" }}>▼</span>
              </div>
            </button>

            {showDemo && (
              <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                {USERS.map(u => (
                  <button key={u.id} onClick={()=>quickLogin(u)} disabled={!!loggingIn}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px",
                      background: loggingIn===u.id ? ROLE_COLORS[u.role]+"22" : ROLE_COLORS[u.role]+"0E",
                      border: `1.5px solid ${loggingIn===u.id ? ROLE_COLORS[u.role]+"88" : ROLE_COLORS[u.role]+"30"}`,
                      borderRadius:12, cursor:loggingIn?"not-allowed":"pointer", textAlign:"left",
                      fontFamily:"'Outfit',sans-serif", transition:"all .15s", WebkitTapHighlightColor:"transparent",
                      minHeight:56 }}>
                    {/* Avatar */}
                    <div style={{ width:38, height:38, borderRadius:"50%", background:ROLE_COLORS[u.role], color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
                      {loggingIn===u.id ? <span style={{animation:"spin .6s linear infinite",display:"inline-block"}}>⟳</span> : u.avatar}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
                      <div style={{ fontSize:11, color:ROLE_COLORS[u.role], fontWeight:600, marginTop:1 }}>{ROLE_LABELS[u.role]}</div>
                    </div>
                    <span style={{ fontSize:16, color:ROLE_COLORS[u.role], flexShrink:0 }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ textAlign:"center", fontSize:10, color:"rgba(0,0,0,.28)", paddingBottom:24 }}>
            © 2025 Nestlé Lanka PLC · Internal System v2.0
          </p>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input:focus { outline: none !important; border-color: #C8102E !important; box-shadow: 0 0 0 3px rgba(200,16,46,0.12) !important; }
        `}</style>
      </div>
    );
  }

  // ── DESKTOP LAYOUT (unchanged quality, minor polish) ──
  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Outfit', sans-serif", background:C.navy, overflow:"hidden", position:"relative" }}>

      {/* Left panel */}
      <div style={{ flex:"0 0 52%", background:`linear-gradient(140deg, ${C.navy} 0%, #122848 45%, #1a3a6b 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 72px", position:"relative", overflow:"hidden" }}>
        {[{w:500,h:500,t:-180,l:-180,op:.06},{w:360,h:360,b:-140,r:-80,op:.06},{w:200,h:200,t:"35%",l:"70%",op:.04}].map((ci,i)=>(
          <div key={i} style={{ position:"absolute", width:ci.w, height:ci.h, borderRadius:"50%", background:C.red, top:ci.t, left:ci.l, bottom:ci.b, right:ci.r, opacity:ci.op, pointerEvents:"none" }}/>
        ))}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04, pointerEvents:"none" }}>
          {Array.from({length:20},(_,i)=><line key={`v${i}`} x1={i*60} y1={0} x2={i*60} y2="100%" stroke="white" strokeWidth=".5"/>)}
          {Array.from({length:20},(_,i)=><line key={`h${i}`} x1={0} y1={i*60} x2="100%" y2={i*60} stroke="white" strokeWidth=".5"/>)}
        </svg>

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:14, marginBottom:56 }}>
            <div style={{ background:C.red, borderRadius:12, padding:"10px 18px", fontWeight:900, fontSize:22, color:"white", letterSpacing:2 }}>NESTLÉ</div>
            <div style={{ width:1, height:40, background:"rgba(255,255,255,.18)" }}/>
            <div style={{ color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:500, lineHeight:1.5 }}>SRI LANKA<br/><span style={{fontSize:11,opacity:.7}}>Delivery Management System</span></div>
          </div>
          <h1 style={{ color:"white", fontSize:40, fontWeight:900, lineHeight:1.15, marginBottom:16 }}>
            Supply Chain<br/><span style={{ color:C.red }}>Reimagined</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.55)", fontSize:15, lineHeight:1.7, maxWidth:400, marginBottom:48 }}>
            A centralized platform for real-time delivery tracking, route optimization, and operational excellence across Sri Lanka.
          </p>
          {[
            { icon:"🗺️", label:"Real-time Vehicle Tracking"      },
            { icon:"🛣️", label:"AI-Powered Route Optimization"    },
            { icon:"📦", label:"Live Delivery Status Updates"     },
            { icon:"📊", label:"KPI & Performance Dashboard"      },
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

            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.textM, display:"block", marginBottom:5 }}>Email Address *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>✉️</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleKey}
                  placeholder="you@nestle.lk" autoCapitalize="off"
                  style={{ width:"100%", padding:"10px 12px 10px 38px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.text, background:"white", transition:"border .15s" }}/>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, fontWeight:700, color:C.textM, display:"block", marginBottom:5 }}>Password *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔒</span>
                <input type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={handleKey}
                  placeholder="••••••••"
                  style={{ width:"100%", padding:"10px 40px 10px 38px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, color:C.text, background:"white", transition:"border .15s" }}/>
                <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, padding:4, color:C.textS }}>
                  {showPass?"🙈":"👁️"}
                </button>
              </div>
            </div>

            <button onClick={handle} disabled={loading}
              style={{ width:"100%", padding:"12px", background:loading?"#94A3B8":C.red, color:"white", border:"none", borderRadius:11, fontSize:14, fontWeight:800, cursor:loading?"not-allowed":"pointer", transition:"background .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? <><span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span> Signing in…</> : "Sign In →"}
            </button>

            <p style={{ textAlign:"center", fontSize:11, color:C.textS, marginTop:16 }}>
              🔒 Protected by enterprise-grade encryption · Role-based access control
            </p>
          </div>

          {/* Demo accounts */}
          <div style={{ background:"white", borderRadius:16, padding:"20px 24px", boxShadow:C.shadowS, border:`1px solid ${C.border}` }}>
            <button onClick={()=>setShowDemo(!showDemo)}
              style={{ background:"none", border:"none", width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.textM }}>🔑 Demo Accounts</span>
              <span style={{ fontSize:11, color:C.red, fontWeight:600 }}>{showDemo?"Hide ▲":"Show ▼"}</span>
            </button>
            {showDemo && (
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:7 }}>
                {USERS.map(u=>(
                  <button key={u.id} onClick={()=>quickLogin(u)} disabled={!!loggingIn}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px",
                      background:loggingIn===u.id?ROLE_COLORS[u.role]+"22":ROLE_COLORS[u.role]+"0D",
                      border:`1px solid ${loggingIn===u.id?ROLE_COLORS[u.role]+"66":ROLE_COLORS[u.role]+"28"}`,
                      borderRadius:10, cursor:loggingIn?"not-allowed":"pointer", textAlign:"left",
                      transition:"all .15s", fontFamily:"'Outfit',sans-serif" }}
                    onMouseEnter={e=>{if(!loggingIn){e.currentTarget.style.background=ROLE_COLORS[u.role]+"1A";e.currentTarget.style.borderColor=ROLE_COLORS[u.role]+"55";}}}
                    onMouseLeave={e=>{e.currentTarget.style.background=loggingIn===u.id?ROLE_COLORS[u.role]+"22":ROLE_COLORS[u.role]+"0D";e.currentTarget.style.borderColor=loggingIn===u.id?ROLE_COLORS[u.role]+"66":ROLE_COLORS[u.role]+"28";}}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:ROLE_COLORS[u.role],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0 }}>
                      {loggingIn===u.id?<span style={{animation:"spin .6s linear infinite",display:"inline-block"}}>⟳</span>:u.avatar}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:700,color:C.text }}>{u.name}</div>
                      <div style={{ fontSize:10,color:ROLE_COLORS[u.role],fontWeight:600 }}>{ROLE_LABELS[u.role]}</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:10, color:C.textS, flexShrink:0 }}>
                      {loggingIn===u.id ? "Loading…" : "Click to login"}
                    </div>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none !important; border-color: #C8102E !important; box-shadow: 0 0 0 3px rgba(200,16,46,0.12) !important; }
      `}</style>
    </div>
  );
}
