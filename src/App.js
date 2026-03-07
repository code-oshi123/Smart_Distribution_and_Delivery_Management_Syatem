// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — App.js  (Mobile-First v3)
// ═══════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { GLOBAL_CSS, C, NAV_CONFIG, ROLE_COLORS, ROLE_LABELS } from "./styles/theme";
import { useDB } from "./data/db";
import { Avatar } from "./components/UI";

import LoginPage        from "./pages/LoginPage";
import DashboardPage    from "./pages/DashboardPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import {
  OrdersPage, RoutingPage, DeliveriesPage, WarehousePage,
  InventoryPage, MyDeliveryPage, NavigationPage,
  RetailerOrdersPage, RetailerTrackingPage, RetailerHistoryPage,
  ReportsPage, UsersPage, VehiclesPage, RetailersPage, MessagesPage,
} from "./pages/Pages";

// ── Responsive hook ────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive:true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, w };
}

// ── Page router ────────────────────────────────────
function PageContent({ pageId, user }) {
  const p = { user };
  switch (pageId) {
    case "dashboard":   return <DashboardPage   {...p}/>;
    case "tracking":    return user.role==="retailer" ? <RetailerTrackingPage {...p}/> : <LiveTrackingPage {...p}/>;
    case "orders":      return <OrdersPage      {...p}/>;
    case "routing":     return <RoutingPage     {...p}/>;
    case "deliveries":  return <DeliveriesPage  {...p}/>;
    case "dispatch":    return <WarehousePage    {...p}/>;
    case "inventory":   return <InventoryPage   {...p}/>;
    case "my_delivery": return <MyDeliveryPage  {...p}/>;
    case "navigation":  return <NavigationPage  {...p}/>;
    case "my_orders":   return <RetailerOrdersPage {...p}/>;
    case "history":     return <RetailerHistoryPage {...p}/>;
    case "reports":     return <ReportsPage     {...p}/>;
    case "users":       return <UsersPage       {...p}/>;
    case "vehicles":    return <VehiclesPage    {...p}/>;
    case "retailers":   return <RetailersPage   {...p}/>;
    case "messages":    return <MessagesPage    {...p}/>;
    default: return (
      <div style={{textAlign:"center",padding:60,color:C.textS}}>
        <div style={{fontSize:48,marginBottom:12}}>🔒</div>
        <div style={{fontSize:16,fontWeight:700}}>Access Restricted</div>
        <div style={{fontSize:13,marginTop:6}}>Not available for your role.</div>
      </div>
    );
  }
}

// ── Mobile Drawer ──────────────────────────────────
function MobileDrawer({ open, onClose, user, page, setPage, onLogout }) {
  const nav      = NAV_CONFIG[user.role] || [];
  const sections = [...new Set(nav.map(n => n.section))];
  const secLabel = { main:"Main", ops:"Operations", admin:"Administration", tools:"Tools" };
  if (!open) return null;
  return (
    <>
      <div className="mob-drawer-bg" onClick={onClose}/>
      <div className="mob-drawer-panel">
        {/* Logo row */}
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,background:C.red,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"white",flexShrink:0}}>N</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14,color:"rgba(255,255,255,.92)"}}>NESTLÉ DMS</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>SRI LANKA · v2.0</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 10px",overflowY:"auto"}}>
          {sections.map(sec=>(
            <div key={sec}>
              <div style={{fontSize:9,color:"rgba(255,255,255,.28)",fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"10px 8px 4px"}}>
                {secLabel[sec]||sec}
              </div>
              {nav.filter(n=>n.section===sec).map(n=>{
                const active = page===n.id;
                return (
                  <button key={n.id} onClick={()=>{setPage(n.id);onClose();}}
                    style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 12px",borderRadius:10,border:"none",marginBottom:2,cursor:"pointer",background:active?"rgba(200,16,46,.85)":"transparent",color:active?"white":"rgba(255,255,255,.65)",textAlign:"left",fontSize:14,fontWeight:active?700:400}}>
                    <span style={{fontSize:18,flexShrink:0}}>{n.icon}</span>
                    <span>{n.label}</span>
                    {active&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,.5)"}}/>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{padding:"12px 14px 20px",borderTop:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={38}/>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:10,color:ROLE_COLORS[user.role],fontWeight:600,marginTop:1}}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <button onClick={onLogout}
            style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"rgba(255,255,255,.6)",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            ← Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// ── Bottom Navigation ──────────────────────────────
function BottomNav({ navItems, page, setPage }) {
  const items = navItems.slice(0, 5);
  return (
    <nav className="bottom-nav">
      {items.map(n=>{
        const active = page===n.id;
        return (
          <button key={n.id} className={`bnav-btn${active?" active":""}`} onClick={()=>setPage(n.id)}>
            <span className="bnav-icon">{n.icon}</span>
            <span className="bnav-label" style={{color:active?C.red:C.textS}}>{n.label.split(" ")[0]}</span>
            <span className="bnav-dot"/>
          </button>
        );
      })}
    </nav>
  );
}

// ── Notification Dropdown (desktop) ───────────────
function NotifDropdown({ onClose }) {
  const { notifications: NOTIFICATIONS, markAllRead } = useDB();
  const unread = NOTIFICATIONS.filter(n=>!n.read).length;
  return (
    <div style={{position:"absolute",top:52,right:0,width:380,background:"white",borderRadius:16,boxShadow:C.shadowXL,border:`1px solid ${C.border}`,zIndex:300,maxHeight:440,overflowY:"auto"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white"}}>
        <div>
          <span style={{fontWeight:800,fontSize:14}}>Notifications</span>
          {unread>0&&<span style={{marginLeft:8,background:C.redM,color:C.red,borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700}}>{unread}</span>}
        </div>
        <span style={{fontSize:11,color:C.red,cursor:"pointer",fontWeight:700}} onClick={onClose}>Close</span>
      </div>
      {NOTIFICATIONS.map(n=>(
        <div key={n.id} style={{display:"flex",gap:11,padding:"12px 18px",background:n.read?"white":"#FFFBFB",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:17,flexShrink:0}}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>{n.title}</div>
            <div style={{fontSize:11,color:C.textS,marginTop:2,lineHeight:1.5}}>{n.msg}</div>
            <div style={{fontSize:10,color:"#94A3B8",marginTop:3}}>{n.time}</div>
          </div>
          {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:4}}/>}
        </div>
      ))}
    </div>
  );
}

// ── Notification Sheet (mobile bottom-sheet) ────────
function NotifSheet({ onClose }) {
  const { notifications: NOTIFICATIONS, markAllRead } = useDB();
  const unread = NOTIFICATIONS.filter(n=>!n.read).length;
  return (
    <>
      <div className="notif-sheet-bg" onClick={onClose}/>
      <div className="notif-sheet">
        {/* Handle bar */}
        <div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:4,flexShrink:0}}>
          <div style={{width:40,height:4,borderRadius:99,background:C.border}}/>
        </div>
        <div style={{padding:"10px 18px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>Notifications</div>
            {unread>0&&<div style={{fontSize:12,color:C.red,marginTop:2}}>{unread} unread</div>}
          </div>
          <button onClick={onClose} style={{background:"#F1F5F9",border:"none",borderRadius:9,width:34,height:34,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {NOTIFICATIONS.map(n=>(
            <div key={n.id} style={{display:"flex",gap:12,padding:"14px 18px",background:n.read?"white":"#FFFBFB",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:20,flexShrink:0}}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{n.title}</div>
                <div style={{fontSize:12,color:C.textS,marginTop:3,lineHeight:1.5}}>{n.msg}</div>
                <div style={{fontSize:11,color:"#94A3B8",marginTop:4}}>{n.time}</div>
              </div>
              {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:4}}/>}
            </div>
          ))}
        </div>
        <div className="pb-safe" style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={()=>{markAllRead();onClose();}} style={{width:"100%",padding:"12px",background:C.redL,color:C.red,border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>
            Mark All as Read
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Layout ────────────────────────────────────
function MainLayout({ user, onLogout }) {
  const { isMobile, isTablet } = useBreakpoint();
  const { notifications, markAllRead } = useDB();
  const [page,      setPage]   = useState(NAV_CONFIG[user.role]?.[0]?.id || "dashboard");
  const [drawer,    setDrawer] = useState(false);
  const [notif,     setNotif]  = useState(false);
  const [collapsed, setCol]    = useState(false);

  const navItems = NAV_CONFIG[user.role] || [];
  const unread   = notifications.filter(n=>!n.read).length;
  const sections = [...new Set(navItems.map(n=>n.section))];
  const secLabel = { main:"Main", ops:"Operations", admin:"Administration", tools:"Tools" };
  const curNav   = navItems.find(n=>n.id===page);

  const go = useCallback((id)=>{ setPage(id); setDrawer(false); setNotif(false); },[]);

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'Outfit',sans-serif",overflow:"hidden",background:C.bg}}>

      {/* ── Desktop/Tablet Sidebar ── */}
      {!isMobile && (
        <aside style={{width:collapsed?64:240,background:C.navy,display:"flex",flexDirection:"column",flexShrink:0,transition:"width .25s ease",overflow:"hidden"}}>
          {/* Logo */}
          <div style={{padding:"16px 14px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:10,height:60,flexShrink:0}}>
            <div style={{width:34,height:34,background:C.red,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"white",flexShrink:0}}>N</div>
            {!collapsed&&<div>
              <div style={{fontWeight:800,fontSize:13,color:"rgba(255,255,255,.92)",lineHeight:1}}>NESTLÉ DMS</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.35)",marginTop:2}}>SRI LANKA · v2.0</div>
            </div>}
          </div>
          {/* Nav */}
          <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
            {sections.map(sec=>(
              <div key={sec}>
                {!collapsed&&<div style={{fontSize:9,color:"rgba(255,255,255,.28)",fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"10px 8px 5px"}}>{secLabel[sec]||sec}</div>}
                {navItems.filter(n=>n.section===sec).map(n=>{
                  const active=page===n.id;
                  return (
                    <button key={n.id} className={`nav-item${active?" active":""}`} onClick={()=>go(n.id)}
                      title={collapsed?n.label:undefined}
                      style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 10px",borderRadius:8,border:"none",marginBottom:2,cursor:"pointer",background:active?"rgba(200,16,46,.85)":"transparent",color:active?"white":"rgba(255,255,255,.6)",textAlign:"left",fontSize:13,fontWeight:active?700:400,whiteSpace:"nowrap",overflow:"hidden",justifyContent:collapsed?"center":"flex-start"}}>
                      <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
                      {!collapsed&&n.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          {/* Footer */}
          <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:collapsed?0:10,justifyContent:collapsed?"center":"flex-start"}}>
              <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={32}/>
              {!collapsed&&<div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.88)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                <div style={{fontSize:9,color:ROLE_COLORS[user.role],fontWeight:600,marginTop:1}}>{ROLE_LABELS[user.role]}</div>
              </div>}
            </div>
            {!collapsed&&<button onClick={onLogout} style={{width:"100%",padding:"7px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,color:"rgba(255,255,255,.55)",fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>← Sign Out</button>}
          </div>
        </aside>
      )}

      {/* ── Mobile drawer ── */}
      {isMobile && (
        <MobileDrawer open={drawer} onClose={()=>setDrawer(false)} user={user} page={page} setPage={go} onLogout={onLogout}/>
      )}

      {/* ── Main column ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

        {/* Topbar */}
        <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,height:isMobile?54:60,display:"flex",alignItems:"center",padding:isMobile?"0 12px":"0 20px",gap:isMobile?8:14,flexShrink:0,boxShadow:"0 1px 0 rgba(0,0,0,.04)",zIndex:100}}>

          {/* Hamburger */}
          <button onClick={()=>isMobile?setDrawer(true):setCol(!collapsed)}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:isMobile?22:19,color:C.textS,padding:"4px 6px",borderRadius:7,flexShrink:0,lineHeight:1,display:"flex",alignItems:"center"}}>
            ☰
          </button>

          {/* Page title */}
          <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
            {!isMobile&&<span style={{fontSize:12,color:C.textS}}>Nestlé DMS · </span>}
            <span style={{fontSize:isMobile?14:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {curNav?.icon} {curNav?.label}
            </span>
          </div>

          {/* Live pill — hidden on mobile */}
          {!isMobile&&(
            <div style={{display:"flex",alignItems:"center",gap:6,background:C.greenL,borderRadius:7,padding:"4px 11px",fontSize:11,color:C.green,fontWeight:700,flexShrink:0}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite"}}/>
              {isTablet?"Live":"System Live"}
            </div>
          )}

          {/* Live dot — mobile only */}
          {isMobile&&<div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite",flexShrink:0}}/>}

          {/* Notifications */}
          <div style={{position:"relative",flexShrink:0}}>
            <button onClick={()=>setNotif(!notif)}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:isMobile?22:20,position:"relative",padding:"4px 6px",borderRadius:8,color:C.textS,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
              🔔
              {unread>0&&(
                <span style={{position:"absolute",top:0,right:0,width:16,height:16,borderRadius:"50%",background:C.red,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {unread}
                </span>
              )}
            </button>
            {notif && !isMobile && <NotifDropdown onClose={()=>setNotif(false)}/>}
          </div>
          {notif && isMobile && <NotifSheet onClose={()=>setNotif(false)}/>}

          {/* Avatar / user chip */}
          {!isMobile ? (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px 4px 5px",background:"#F8FAFC",borderRadius:99,border:`1px solid ${C.border}`,flexShrink:0}}>
              <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={28}/>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1}}>{user.name.split(" ")[0]}</div>
                <div style={{fontSize:9,color:ROLE_COLORS[user.role],fontWeight:700,marginTop:1}}>{ROLE_LABELS[user.role]}</div>
              </div>
            </div>
          ) : (
            <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={32} style={{flexShrink:0,cursor:"pointer"}}/>
          )}
        </header>

        {/* Page content */}
        <main style={{
          flex:1, overflowY:"auto",
          padding: isMobile ? "12px 12px" : isTablet ? "18px 18px" : "22px 24px",
        }} className={isMobile?"main-safe":""}>
          <PageContent pageId={page} user={user}/>
        </main>

        {/* Bottom nav — mobile only */}
        {isMobile&&<BottomNav navItems={navItems} page={page} setPage={go}/>}
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {user
        ? <MainLayout user={user} onLogout={()=>setUser(null)}/>
        : <LoginPage  onLogin={setUser}/>
      }
    </>
  );
}
