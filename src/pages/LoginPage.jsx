// ═══════════════════════════════════════════════════
// PAGE: Login — Superly Mobile-First (iPhone & Android)
// ═══════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { USERS } from "../data/db";
import { ROLE_COLORS, ROLE_LABELS, C } from "../styles/theme";

// ── Viewport-height fix for iOS Safari ────────────
// iOS Safari 100vh includes the browser chrome, so we use
// window.innerHeight instead and update on resize/orientationchange
function useViewportHeight() {
  const [vh, setVh] = useState(window.innerHeight);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize",            update, { passive:true });
    window.addEventListener("orientationchange", update, { passive:true });
    return () => {
      window.removeEventListener("resize",            update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return vh;
}

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn, { passive:true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// ── Floating label Input (better UX on mobile) ────
function FloatInput({ label, type="text", value, onChange, onKeyDown, icon, rightSlot, autoComplete, inputMode }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const active = focused || filled;
  return (
    <div style={{ position:"relative", marginBottom:16 }}>
      <div style={{
        display:"flex", alignItems:"center",
        border:`2px solid ${focused?C.red:filled?"#94A3B8":C.border}`,
        borderRadius:14, background:focused?"#FFFCFD":"white",
        transition:"border-color .18s, background .18s",
        overflow:"hidden",
      }}>
        {/* Icon */}
        <span style={{ paddingLeft:16, fontSize:18, opacity:.6, flexShrink:0, userSelect:"none" }}>{icon}</span>

        {/* Input + floating label */}
        <div style={{ flex:1, position:"relative", paddingTop:20, paddingBottom:8, paddingRight:8 }}>
          <label style={{
            position:"absolute", left:0,
            fontSize: active ? 10 : 15,
            fontWeight: active ? 700 : 400,
            color: active ? (focused?C.red:C.textS) : C.textS,
            top: active ? 6 : "50%",
            transform: active ? "none" : "translateY(-50%)",
            transition:"all .18s cubic-bezier(.4,0,.2,1)",
            pointerEvents:"none", letterSpacing: active ? .4 : 0,
            textTransform: active ? "uppercase" : "none",
            lineHeight:1,
          }}>
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={e=>onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            autoComplete={autoComplete}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode={inputMode}
            style={{
              width:"100%", border:"none", outline:"none",
              fontSize:16, // prevents iOS zoom
              fontFamily:"'Outfit',system-ui,sans-serif",
              color:C.text, background:"transparent",
              paddingRight:4,
              WebkitAppearance:"none",
              caretColor:C.red,
            }}
          />
        </div>

        {/* Right slot (show/hide password) */}
        {rightSlot && (
          <div style={{ paddingRight:12, flexShrink:0 }}>{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const isMobile  = useIsMobile();
  const vh        = useViewportHeight();
  const formRef   = useRef(null);

  const [email,     setEmail]     = useState("");
  const [pass,      setPass]      = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [showDemo,  setShowDemo]  = useState(false);
  const [loggingIn, setLoggingIn] = useState(null);
  // Track if keyboard is likely open (form scrolled up on mobile)
  const [kbOpen,    setKbOpen]    = useState(false);

  // iOS keyboard detection: viewport shrinks when keyboard opens
  useEffect(() => {
    if (!isMobile) return;
    const baseH = window.screen.height;
    const check = () => setKbOpen(window.innerHeight < baseH * 0.75);
    window.addEventListener("resize", check, { passive:true });
    return () => window.removeEventListener("resize", check);
  }, [isMobile]);

  const handle = () => {
    if (!email || !pass) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.pw === pass);
      if (user) onLogin(user);
      else { setError("Incorrect credentials. Use a demo account below."); setLoading(false); }
    }, 700);
  };

  const quickLogin = (u) => {
    setLoggingIn(u.id);
    setTimeout(() => onLogin(u), 440);
  };

  const handleKey = (e) => { if (e.key === "Enter") handle(); };

  // ═══════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════
  if (isMobile) {
    return (
      <div style={{
        // Use measured viewport height instead of 100vh
        height: vh,
        fontFamily:"'Outfit',system-ui,sans-serif",
        display:"flex",
        flexDirection:"column",
        background: C.navy,
        overflow:"hidden",
        position:"relative",
        // Safe areas for iPhone notch + home indicator
        paddingTop:  "env(safe-area-inset-top, 0px)",
      }}>

        {/* ── Background decoration ── */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
          <div style={{ position:"absolute", width:"80vw", height:"80vw", maxWidth:360, maxHeight:360, borderRadius:"50%", background:C.red, top:"-25%", right:"-20%", opacity:.1 }}/>
          <div style={{ position:"absolute", width:"60vw", height:"60vw", maxWidth:280, maxHeight:280, borderRadius:"50%", background:C.red, bottom:"-15%", left:"-20%", opacity:.07 }}/>
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.03 }}>
            {Array.from({length:12},(_,i)=><line key={`v${i}`} x1={i*80} y1={0} x2={i*80} y2="100%" stroke="white" strokeWidth="1"/>)}
            {Array.from({length:20},(_,i)=><line key={`h${i}`} x1={0} y1={i*60} x2="100%" y2={i*60} stroke="white" strokeWidth="1"/>)}
          </svg>
        </div>

        {/* ── Brand header — shrinks when keyboard opens ── */}
        <div style={{
          position:"relative", zIndex:1,
          padding: kbOpen ? "16px 24px 12px" : "clamp(20px,5vh,44px) 24px clamp(16px,3vh,28px)",
          textAlign:"center",
          transition:"padding .3s",
          flexShrink:0,
        }}>
          {/* Logo */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom: kbOpen?8:"clamp(10px,2.5vh,20px)" }}>
            <div style={{ background:C.red, borderRadius:10, padding:"8px 16px", fontWeight:900, fontSize:18, color:"white", letterSpacing:2 }}>NESTLÉ</div>
            <div style={{ width:1, height:28, background:"rgba(255,255,255,.2)" }}/>
            <div style={{ color:"rgba(255,255,255,.6)", fontSize:11, fontWeight:500, lineHeight:1.5, textAlign:"left" }}>
              SRI LANKA<br/>
              <span style={{ opacity:.65, fontSize:10 }}>Delivery Management</span>
            </div>
          </div>

          {!kbOpen && (
            <>
              <h1 style={{ color:"white", fontSize:"clamp(22px,6vw,30px)", fontWeight:900, lineHeight:1.2, marginBottom:8 }}>
                Supply Chain <span style={{ color:C.red }}>Reimagined</span>
              </h1>

              {/* Feature pills */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, maxWidth:340, margin:"14px auto 0" }}>
                {[
                  { icon:"🗺️", label:"Live Tracking"       },
                  { icon:"🛣️", label:"Route Optimization"   },
                  { icon:"📦", label:"Delivery Updates"     },
                  { icon:"📊", label:"KPI Dashboard"        },
                ].map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.09)", borderRadius:10, padding:"9px 10px" }}>
                    <span style={{ fontSize:15, flexShrink:0 }}>{f.icon}</span>
                    <span style={{ color:"rgba(255,255,255,.72)", fontSize:11, fontWeight:600, lineHeight:1.2 }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── White form card — fills remaining height ── */}
        <div style={{
          position:"relative", zIndex:1,
          flex:1,
          background:"#F0F4F8",
          borderRadius:"24px 24px 0 0",
          overflowY:"auto",
          WebkitOverflowScrolling:"touch",
          boxShadow:"0 -10px 40px rgba(0,0,0,.25)",
          // Bottom safe area for iPhone home indicator
          paddingBottom:"env(safe-area-inset-bottom, 16px)",
        }}>
          {/* Drag handle */}
          <div style={{ display:"flex", justifyContent:"center", paddingTop:10, paddingBottom:4, flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:99, background:"#CBD5E1" }}/>
          </div>

          <div style={{ padding:"16px 18px 24px" }}>

            {/* ── Sign-in form card ── */}
            <div style={{ background:"white", borderRadius:20, padding:"22px 18px 20px", boxShadow:C.shadowM, marginBottom:14 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:3 }}>Welcome back 👋</h2>
              <p style={{ fontSize:12, color:C.textS, marginBottom:22, lineHeight:1.5 }}>Sign in to your Nestlé DMS account</p>

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 14px", background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:11, marginBottom:18 }}>
                  <span style={{ fontSize:15, flexShrink:0 }}>❌</span>
                  <span style={{ fontSize:12, color:"#991B1B", flex:1, lineHeight:1.5 }}>{error}</span>
                  <button onClick={()=>setError("")} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#991B1B",flexShrink:0,padding:0,lineHeight:1 }}>×</button>
                </div>
              )}

              {/* Email input */}
              <FloatInput
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                onKeyDown={handleKey}
                icon="✉️"
                autoComplete="email"
                inputMode="email"
              />

              {/* Password input */}
              <FloatInput
                label="Password"
                type={showPass?"text":"password"}
                value={pass}
                onChange={setPass}
                onKeyDown={handleKey}
                icon="🔒"
                autoComplete="current-password"
                rightSlot={
                  <button
                    onClick={()=>setShowPass(!showPass)}
                    style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,padding:"4px",color:C.textS,lineHeight:1,WebkitTapHighlightColor:"transparent" }}>
                    {showPass?"🙈":"👁️"}
                  </button>
                }
              />

              {/* Sign in button */}
              <button
                onClick={handle}
                disabled={loading}
                style={{
                  width:"100%",
                  padding:"16px",
                  background: loading?"#94A3B8":C.red,
                  color:"white",
                  border:"none",
                  borderRadius:14,
                  fontSize:16,
                  fontWeight:800,
                  cursor: loading?"not-allowed":"pointer",
                  transition:"background .2s, transform .1s",
                  letterSpacing:.3,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:8,
                  minHeight:54,
                  WebkitTapHighlightColor:"transparent",
                  boxShadow: loading?"none":`0 4px 20px ${C.red}45`,
                }}>
                {loading
                  ? <><span style={{ animation:"spin .7s linear infinite", display:"inline-block", fontSize:20 }}>⟳</span> Signing in…</>
                  : "Sign In →"
                }
              </button>

              <p style={{ textAlign:"center", fontSize:10, color:C.textS, marginTop:14, lineHeight:1.6 }}>
                🔒 Enterprise security · Role-based access control
              </p>
            </div>

            {/* ── Demo accounts ── */}
            <div style={{ background:"white", borderRadius:18, boxShadow:C.shadowS, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:14 }}>
              <button
                onClick={()=>setShowDemo(!showDemo)}
                style={{
                  background:"none", border:"none", width:"100%",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"16px 18px", cursor:"pointer",
                  fontFamily:"'Outfit',system-ui,sans-serif",
                  WebkitTapHighlightColor:"transparent",
                  minHeight:56,
                }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>🔑</span>
                  <span style={{ fontSize:14, fontWeight:700, color:C.textM }}>Demo Accounts</span>
                  <span style={{ background:C.redL, color:C.red, borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:700 }}>{USERS.length}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, color:C.red, fontSize:12, fontWeight:600 }}>
                  {showDemo?"Hide":"Tap to expand"}
                  <span style={{ display:"inline-block", transform:showDemo?"rotate(180deg)":"none", transition:"transform .22s", fontSize:10 }}>▼</span>
                </div>
              </button>

              {showDemo && (
                <div style={{ borderTop:`1px solid ${C.border}`, padding:"10px 14px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                  {USERS.map(u => (
                    <button key={u.id}
                      onClick={()=>quickLogin(u)}
                      disabled={!!loggingIn}
                      style={{
                        display:"flex", alignItems:"center", gap:12,
                        padding:"12px 13px",
                        background: loggingIn===u.id ? ROLE_COLORS[u.role]+"22" : ROLE_COLORS[u.role]+"0E",
                        border:`1.5px solid ${loggingIn===u.id?ROLE_COLORS[u.role]+"99":ROLE_COLORS[u.role]+"2A"}`,
                        borderRadius:13,
                        cursor: loggingIn?"not-allowed":"pointer",
                        textAlign:"left",
                        fontFamily:"'Outfit',system-ui,sans-serif",
                        transition:"all .15s",
                        WebkitTapHighlightColor:"transparent",
                        minHeight:60,
                      }}>
                      {/* Avatar */}
                      <div style={{ width:40, height:40, borderRadius:"50%", background:ROLE_COLORS[u.role], color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, flexShrink:0 }}>
                        {loggingIn===u.id
                          ? <span style={{ animation:"spin .6s linear infinite", display:"inline-block" }}>⟳</span>
                          : u.avatar
                        }
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{u.name}</div>
                        <div style={{ fontSize:11, color:ROLE_COLORS[u.role], fontWeight:600, marginTop:2 }}>{ROLE_LABELS[u.role]}</div>
                        <div style={{ fontSize:10, color:C.textS, marginTop:1, fontFamily:"monospace" }}>{u.email}</div>
                      </div>
                      {/* Arrow */}
                      <span style={{ fontSize:18, color:ROLE_COLORS[u.role], flexShrink:0, opacity: loggingIn===u.id?.3:1 }}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ textAlign:"center", fontSize:10, color:"rgba(0,0,0,.28)", lineHeight:1.6 }}>
              © 2025 Nestlé Lanka PLC · Internal System v2.0
            </p>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input:focus { outline: none !important; border-color: transparent !important; box-shadow: none !important; }
          * { -webkit-tap-highlight-color: transparent; }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════
  // DESKTOP LAYOUT
  // ═══════════════════════════════
  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Outfit',sans-serif", background:C.navy, overflow:"hidden", position:"relative" }}>

      {/* Left brand panel */}
      <div style={{ flex:"0 0 52%", background:`linear-gradient(140deg,${C.navy} 0%,#122848 45%,#1a3a6b 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 72px", position:"relative", overflow:"hidden" }}>
        {[{w:500,h:500,t:-180,l:-180,op:.06},{w:360,h:360,b:-140,r:-80,op:.06},{w:200,h:200,t:"35%",l:"70%",op:.04}].map((ci,i)=>(
          <div key={i} style={{ position:"absolute",width:ci.w,height:ci.h,borderRadius:"50%",background:C.red,top:ci.t,left:ci.l,bottom:ci.b,right:ci.r,opacity:ci.op,pointerEvents:"none" }}/>
        ))}
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.04,pointerEvents:"none" }}>
          {Array.from({length:20},(_,i)=><line key={`v${i}`} x1={i*60} y1={0} x2={i*60} y2="100%" stroke="white" strokeWidth=".5"/>)}
          {Array.from({length:20},(_,i)=><line key={`h${i}`} x1={0} y1={i*60} x2="100%" y2={i*60} stroke="white" strokeWidth=".5"/>)}
        </svg>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:14,marginBottom:56 }}>
            <div style={{ background:C.red,borderRadius:12,padding:"10px 18px",fontWeight:900,fontSize:22,color:"white",letterSpacing:2 }}>NESTLÉ</div>
            <div style={{ width:1,height:40,background:"rgba(255,255,255,.18)" }}/>
            <div style={{ color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:500,lineHeight:1.5 }}>SRI LANKA<br/><span style={{fontSize:11,opacity:.7}}>Delivery Management System</span></div>
          </div>
          <h1 style={{ color:"white",fontSize:40,fontWeight:900,lineHeight:1.15,marginBottom:16 }}>
            Supply Chain<br/><span style={{color:C.red}}>Reimagined</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,.55)",fontSize:15,lineHeight:1.7,maxWidth:400,marginBottom:48 }}>
            A centralized platform for real-time delivery tracking, route optimization, and operational excellence across Sri Lanka.
          </p>
          {[
            {icon:"🗺️",label:"Real-time Vehicle Tracking"},
            {icon:"🛣️",label:"AI-Powered Route Optimization"},
            {icon:"📦",label:"Live Delivery Status Updates"},
            {icon:"📊",label:"KPI & Performance Dashboard"},
          ].map((f,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{f.icon}</div>
              <span style={{ color:"rgba(255,255,255,.75)",fontSize:13,fontWeight:500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40,background:"#F0F4F8",overflowY:"auto" }}>
        <div style={{ width:"100%",maxWidth:420 }}>
          <div style={{ background:"white",borderRadius:20,padding:"36px 36px 28px",boxShadow:C.shadowXL,marginBottom:16 }}>
            <h2 style={{ fontSize:24,fontWeight:800,color:C.text,marginBottom:4 }}>Welcome back 👋</h2>
            <p style={{ fontSize:13,color:C.textS,marginBottom:28 }}>Sign in to your Nestlé DMS account</p>

            {error && (
              <div style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"11px 14px",background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,marginBottom:18 }}>
                <span style={{fontSize:15,flexShrink:0}}>❌</span>
                <span style={{fontSize:12,color:"#991B1B",flex:1,lineHeight:1.5}}>{error}</span>
                <button onClick={()=>setError("")} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#991B1B",flexShrink:0,padding:0}}>×</button>
              </div>
            )}

            <FloatInput label="Email Address" type="email" value={email} onChange={setEmail} onKeyDown={handleKey} icon="✉️" autoComplete="email" inputMode="email"/>
            <FloatInput
              label="Password" type={showPass?"text":"password"} value={pass} onChange={setPass} onKeyDown={handleKey} icon="🔒" autoComplete="current-password"
              rightSlot={
                <button onClick={()=>setShowPass(!showPass)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,padding:4,color:C.textS,lineHeight:1}}>
                  {showPass?"🙈":"👁️"}
                </button>
              }
            />

            <button onClick={handle} disabled={loading}
              style={{ width:"100%",padding:"13px",background:loading?"#94A3B8":C.red,color:"white",border:"none",borderRadius:12,fontSize:14,fontWeight:800,cursor:loading?"not-allowed":"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:loading?"none":`0 4px 18px ${C.red}40`,minHeight:48 }}>
              {loading ? <><span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span> Signing in…</> : "Sign In →"}
            </button>

            <p style={{ textAlign:"center",fontSize:11,color:C.textS,marginTop:16 }}>
              🔒 Protected by enterprise-grade encryption · Role-based access control
            </p>
          </div>

          <div style={{ background:"white",borderRadius:16,padding:"20px 24px",boxShadow:C.shadowS,border:`1px solid ${C.border}` }}>
            <button onClick={()=>setShowDemo(!showDemo)}
              style={{ background:"none",border:"none",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"'Outfit',sans-serif" }}>
              <span style={{ fontSize:13,fontWeight:700,color:C.textM }}>🔑 Demo Accounts</span>
              <span style={{ fontSize:11,color:C.red,fontWeight:600 }}>{showDemo?"Hide ▲":"Show ▼"}</span>
            </button>
            {showDemo && (
              <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:7 }}>
                {USERS.map(u=>(
                  <button key={u.id} onClick={()=>quickLogin(u)} disabled={!!loggingIn}
                    style={{ display:"flex",alignItems:"center",gap:12,padding:"9px 12px",background:loggingIn===u.id?ROLE_COLORS[u.role]+"22":ROLE_COLORS[u.role]+"0D",border:`1px solid ${loggingIn===u.id?ROLE_COLORS[u.role]+"66":ROLE_COLORS[u.role]+"28"}`,borderRadius:10,cursor:loggingIn?"not-allowed":"pointer",textAlign:"left",transition:"all .15s",fontFamily:"'Outfit',sans-serif" }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:ROLE_COLORS[u.role],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0 }}>
                      {loggingIn===u.id?<span style={{animation:"spin .6s linear infinite",display:"inline-block"}}>⟳</span>:u.avatar}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{u.name}</div>
                      <div style={{fontSize:10,color:ROLE_COLORS[u.role],fontWeight:600}}>{ROLE_LABELS[u.role]}</div>
                    </div>
                    <div style={{marginLeft:"auto",fontSize:10,color:C.textS,flexShrink:0}}>
                      {loggingIn===u.id?"Loading…":"Click →"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ textAlign:"center",fontSize:11,color:"rgba(0,0,0,.3)",marginTop:20 }}>
            © 2025 Nestlé Lanka PLC · Internal System v2.0
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none !important; }
      `}</style>
    </div>
  );
}
