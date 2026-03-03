// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Main App Entry Point
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { GLOBAL_CSS, C, NAV_CONFIG, ROLE_COLORS, ROLE_LABELS } from "./styles/theme";
import { NOTIFICATIONS } from "./data/db";
import { Avatar, Btn } from "./components/UI";

import LoginPage       from "./pages/LoginPage";
import DashboardPage   from "./pages/DashboardPage";
import {
  TrackingPage,
  OrdersPage,
  RoutingPage,
  DeliveriesPage,
  DispatchPage,
  InventoryPage,
  MyDeliveryPage,
  NavigationPage,
  RetailerOrdersPage,
  RetailerTrackingPage,
  RetailerHistoryPage,
  ReportsPage,
  UsersPage,
  VehiclesPage,
  RetailersPage,
  MessagesPage,
} from "./pages/Pages";

// ─── Page Router ──────────────────────────────────
function PageContent({ pageId, user }) {
  const props = { user };
  switch (pageId) {
    case "dashboard":    return <DashboardPage {...props}/>;
    case "tracking":     return <TrackingPage {...props}/>;
    case "orders":       return <OrdersPage {...props}/>;
    case "routing":      return <RoutingPage {...props}/>;
    case "deliveries":   return <DeliveriesPage {...props}/>;
    case "dispatch":     return <DispatchPage {...props}/>;
    case "inventory":    return <InventoryPage {...props}/>;
    case "my_delivery":  return <MyDeliveryPage {...props}/>;
    case "navigation":   return <NavigationPage {...props}/>;
    case "my_orders":    return <RetailerOrdersPage {...props}/>;
    case "history":      return <RetailerHistoryPage {...props}/>;
    case "reports":      return <ReportsPage {...props}/>;
    case "users":        return <UsersPage {...props}/>;
    case "vehicles":     return <VehiclesPage {...props}/>;
    case "retailers":    return <RetailersPage {...props}/>;
    case "messages":     return <MessagesPage {...props}/>;
    default:             return (
      <div style={{ textAlign:"center", padding:60, color:C.textS }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:16, fontWeight:700 }}>Access Restricted</div>
        <div style={{ fontSize:13, marginTop:6 }}>This page is not available for your role.</div>
      </div>
    );
  }
}

// ─── Main Layout ──────────────────────────────────
function MainLayout({ user, onLogout }) {
  const [page, setPage]         = useState(NAV_CONFIG[user.role]?.[0]?.id || "dashboard");
  const [notifOpen, setNotif]   = useState(false);
  const [sideCollapsed, setSide] = useState(false);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const navItems = NAV_CONFIG[user.role] || [];
  const unread   = NOTIFICATIONS.filter(n => !n.read).length;
  const sections = [...new Set(navItems.map(n => n.section))];
  const sectionLabel = { main:"Main", ops:"Operations", admin:"Administration", tools:"Tools" };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Outfit', sans-serif", overflow:"hidden", background:C.bg }}>

      {/* ─── Sidebar ─── */}
      <aside style={{ width: sideCollapsed ? 64 : 240, background:C.navy, display:"flex", flexDirection:"column", flexShrink:0, transition:"width .25s ease", overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:"16px 14px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:10, height:60, flexShrink:0 }}>
          <div style={{ width:34,height:34,background:C.red,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"white",flexShrink:0,letterSpacing:1 }}>N</div>
          {!sideCollapsed && (
            <div>
              <div style={{ fontWeight:800,fontSize:13,color:"rgba(255,255,255,.92)",lineHeight:1 }}>NESTLÉ DMS</div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,.35)",marginTop:2,letterSpacing:.5 }}>SRI LANKA · v2.0</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {sections.map(sec => (
            <div key={sec}>
              {!sideCollapsed && (
                <div style={{ fontSize:9,color:"rgba(255,255,255,.28)",fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"10px 8px 5px" }}>
                  {sectionLabel[sec]||sec}
                </div>
              )}
              {navItems.filter(n=>n.section===sec).map(n=>{
                const active = page===n.id;
                return (
                  <button key={n.id} className={`nav-item${active?" active":""}`} onClick={()=>setPage(n.id)}
                    style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 10px",borderRadius:8,border:"none",marginBottom:2,cursor:"pointer",background:active?"rgba(200,16,46,.85)":"transparent",color:active?"white":"rgba(255,255,255,.6)",textAlign:"left",fontSize:13,fontWeight:active?700:400,whiteSpace:"nowrap",overflow:"hidden" }}>
                    <span style={{ fontSize:15,flexShrink:0 }}>{n.icon}</span>
                    {!sideCollapsed && n.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,.07)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: sideCollapsed?0:10 }}>
            <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={32} style={{ flexShrink:0 }}/>
            {!sideCollapsed && (
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,.88)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
                <div style={{ fontSize:9,color:ROLE_COLORS[user.role],fontWeight:600,marginTop:1 }}>{ROLE_LABELS[user.role]}</div>
              </div>
            )}
          </div>
          {!sideCollapsed && (
            <button onClick={onLogout}
              style={{ width:"100%",padding:"6px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,color:"rgba(255,255,255,.55)",fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .15s" }}>
              ← Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Topbar */}
        <header style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,height:60,display:"flex",alignItems:"center",padding:"0 22px",gap:14,flexShrink:0,boxShadow:"0 1px 0 rgba(0,0,0,.04)" }}>

          {/* Sidebar toggle */}
          <button onClick={()=>setSide(!sideCollapsed)}
            style={{ background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.textS,padding:4,borderRadius:6,transition:"background .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
            ☰
          </button>

          {/* Breadcrumb */}
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13,color:C.textS }}>Nestlé DMS · </span>
            <span style={{ fontSize:14,fontWeight:700,color:C.text }}>
              {navItems.find(n=>n.id===page)?.icon} {navItems.find(n=>n.id===page)?.label}
            </span>
          </div>

          {/* Live indicator */}
          <div style={{ display:"flex",alignItems:"center",gap:6,background:C.greenL,borderRadius:7,padding:"4px 12px",fontSize:11,color:C.green,fontWeight:700 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite" }}/>
            System Live
          </div>

          {/* Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setNotif(!notifOpen)}
              style={{ background:"none",border:"none",cursor:"pointer",fontSize:19,position:"relative",padding:4,borderRadius:8,color:C.textS,display:"flex",alignItems:"center",justifyContent:"center" }}>
              🔔
              {unread>0 && (
                <span style={{ position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:C.red,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div style={{ position:"absolute",top:46,right:0,width:370,background:"white",borderRadius:16,boxShadow:C.shadowXL,border:`1px solid ${C.border}`,zIndex:300,maxHeight:440,overflow:"auto" }}>
                <div style={{ padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white" }}>
                  <span style={{ fontWeight:800,fontSize:14 }}>Notifications</span>
                  <span style={{ fontSize:11,color:C.red,cursor:"pointer",fontWeight:700 }}>Mark all read</span>
                </div>
                {NOTIFICATIONS.map(n=>(
                  <div key={n.id} style={{ display:"flex",gap:11,padding:"12px 18px",background:n.read?"white":"#FFFBFB",borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:17,flexShrink:0 }}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12,fontWeight:700,color:C.text }}>{n.title}</div>
                      <div style={{ fontSize:11,color:C.textS,marginTop:2,lineHeight:1.5 }}>{n.msg}</div>
                      <div style={{ fontSize:10,color:"#94A3B8",marginTop:3 }}>{n.time}</div>
                    </div>
                    {!n.read && <div style={{ width:7,height:7,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:4 }}/>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User chip */}
          <div style={{ display:"flex",alignItems:"center",gap:9,padding:"5px 12px 5px 6px",background:"#F8FAFC",borderRadius:99,border:`1px solid ${C.border}` }}>
            <Avatar initials={user.avatar} color={ROLE_COLORS[user.role]} size={28}/>
            <div>
              <div style={{ fontSize:12,fontWeight:700,color:C.text,lineHeight:1 }}>{user.name.split(" ")[0]}</div>
              <div style={{ fontSize:9,color:ROLE_COLORS[user.role],fontWeight:700,marginTop:1 }}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", padding:"22px 24px" }}>
          <PageContent pageId={page} user={user}/>
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {user
        ? <MainLayout user={user} onLogout={() => setUser(null)}/>
        : <LoginPage  onLogin={setUser}/>
      }
    </>
  );
}
