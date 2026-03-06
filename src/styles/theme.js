// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Design Tokens & Theme (Mobile-First v3)
// ═══════════════════════════════════════════════════

export const C = {
  red:"#C8102E", redD:"#9B0C22", redL:"#FFF0F3", redM:"#FEE2E2",
  navy:"#0B1E3D", navyM:"#122848", navyL:"#1a3a6b", navySoft:"rgba(255,255,255,0.06)",
  blue:"#1D5FA4", blueL:"#EFF6FF", blueSoft:"#DBEAFE",
  green:"#059669", greenL:"#ECFDF5", greenSoft:"#D1FAE5",
  amber:"#D97706", amberL:"#FFFBEB", amberSoft:"#FDE68A",
  purple:"#7C3AED", purpleL:"#F5F3FF", purpleSoft:"#EDE9FE",
  slate:"#475569", slateL:"#94A3B8", slateSoft:"#F1F5F9",
  bg:"#EEF2F7", surface:"#FFFFFF",
  border:"#E2E8F0", borderD:"#CBD5E1",
  text:"#0F172A", textM:"#334155", textS:"#64748B",
  shadowS:"0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowM:"0 4px 16px rgba(0,0,0,0.08)",
  shadowL:"0 12px 40px rgba(0,0,0,0.12)",
  shadowXL:"0 24px 64px rgba(0,0,0,0.18)",
};

export const ROLE_COLORS = {
  management:    "#7C3AED",
  order_team:    "#1D5FA4",
  route_planner: "#059669",
  warehouse:     "#D97706",
  driver:        "#C8102E",
  retailer:      "#0891B2",
};

export const ROLE_LABELS = {
  management:    "Management",
  order_team:    "Order Processing",
  route_planner: "Route Planning",
  warehouse:     "Warehouse Staff",
  driver:        "Delivery Driver",
  retailer:      "Retailer / Wholesaler",
};

export const STATUS_CFG = {
  delivered:     { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Delivered"    },
  "in-transit":  { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"In Transit"   },
  delayed:       { bg:"#FEE2E2", fg:"#991B1B", dot:"#EF4444", label:"Delayed"      },
  failed:        { bg:"#EDE9FE", fg:"#5B21B6", dot:"#8B5CF6", label:"Failed"       },
  pending:       { bg:"#FEF3C7", fg:"#92400E", dot:"#F59E0B", label:"Pending"      },
  completed:     { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"Completed"    },
  "on-route":    { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"On Route"     },
  idle:          { bg:"#F1F5F9", fg:"#475569", dot:"#94A3B8", label:"Idle"         },
  active:        { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Active"       },
  planned:       { bg:"#FEF3C7", fg:"#92400E", dot:"#F59E0B", label:"Planned"      },
  offline:       { bg:"#F1F5F9", fg:"#374151", dot:"#6B7280", label:"Offline"      },
  dispatched:    { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"Dispatched"   },
  "out_of_stock":{ bg:"#FEE2E2", fg:"#991B1B", dot:"#EF4444", label:"Out of Stock" },
  available:     { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Available"    },
};

export const PRIO_CFG = {
  urgent: { bg:"#FEE2E2", fg:"#991B1B", label:"URGENT" },
  high:   { bg:"#FEF3C7", fg:"#92400E", label:"HIGH"   },
  normal: { bg:"#F0FDF4", fg:"#166534", label:"NORMAL" },
};

export const NAV_CONFIG = {
  management: [
    { id:"dashboard",  label:"Dashboard",          icon:"📊", section:"main"  },
    { id:"tracking",   label:"Live Tracking",       icon:"🗺️", section:"main"  },
    { id:"deliveries", label:"Deliveries",          icon:"📦", section:"main"  },
    { id:"reports",    label:"Reports & Analytics", icon:"📈", section:"main"  },
    { id:"vehicles",   label:"Fleet Management",    icon:"🚛", section:"ops"   },
    { id:"users",      label:"User Management",     icon:"👥", section:"admin" },
    { id:"messages",   label:"Communication",       icon:"💬", section:"tools" },
  ],
  order_team: [
    { id:"orders",     label:"Order Management",    icon:"📋", section:"main"  },
    { id:"deliveries", label:"Delivery Tracking",   icon:"📦", section:"main"  },
    { id:"retailers",  label:"Retailers",           icon:"🏪", section:"main"  },
    { id:"messages",   label:"Communication",       icon:"💬", section:"tools" },
  ],
  route_planner: [
    { id:"routing",    label:"Route Planning",      icon:"🛣️", section:"main"  },
    { id:"tracking",   label:"Live Tracking",       icon:"🗺️", section:"main"  },
    { id:"deliveries", label:"Deliveries",          icon:"📦", section:"main"  },
    { id:"vehicles",   label:"Fleet",               icon:"🚛", section:"ops"   },
    { id:"messages",   label:"Communication",       icon:"💬", section:"tools" },
  ],
  warehouse: [
    { id:"dispatch",   label:"Dispatch Management", icon:"📤", section:"main"  },
    { id:"inventory",  label:"Inventory",           icon:"🏭", section:"main"  },
    { id:"deliveries", label:"Deliveries",          icon:"📦", section:"main"  },
    { id:"messages",   label:"Communication",       icon:"💬", section:"tools" },
  ],
  driver: [
    { id:"my_delivery",label:"My Deliveries",       icon:"📦", section:"main"  },
    { id:"navigation", label:"Navigation & Route",  icon:"🧭", section:"main"  },
    { id:"messages",   label:"Messages",            icon:"💬", section:"tools" },
  ],
  retailer: [
    { id:"my_orders",  label:"My Orders",           icon:"📋", section:"main"  },
    { id:"tracking",   label:"Track Delivery",      icon:"🗺️", section:"main"  },
    { id:"history",    label:"History",             icon:"📂", section:"main"  },
    { id:"messages",   label:"Support",             icon:"💬", section:"tools" },
  ],
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; font-family: 'Outfit', system-ui, sans-serif; }
  body { background: #EEF2F7; color: #0F172A; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }

  /* Prevent iOS double-tap zoom & input zoom */
  input, select, textarea { touch-action: manipulation; }
  @media (max-width: 639px) {
    input, select, textarea { font-size: 16px !important; }
  }

  /* Scrollbars */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }

  /* ── Keyframes ── */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideInL  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
  @keyframes ping-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes spin      { to{transform:rotate(360deg)} }

  /* ── Animation classes ── */
  .anim-fadeUp  { animation: fadeUp  .35s ease both; }
  .anim-fade1   { animation: fadeUp  .35s .06s ease both; }
  .anim-fade2   { animation: fadeUp  .35s .12s ease both; }
  .anim-fade3   { animation: fadeUp  .35s .18s ease both; }
  .anim-fade4   { animation: fadeUp  .35s .24s ease both; }
  .anim-slideL  { animation: slideInL .28s cubic-bezier(.22,1,.36,1) both; }
  .anim-slideUp { animation: slideUp  .32s cubic-bezier(.22,1,.36,1) both; }

  /* ── Focus ── */
  input:focus, select:focus, textarea:focus {
    outline: none !important;
    border-color: #C8102E !important;
    box-shadow: 0 0 0 3px rgba(200,16,46,0.1) !important;
  }
  button, input, select, textarea { font-family: 'Outfit', system-ui, sans-serif; }

  /* ── Interactions ── */
  .hover-lift { transition: transform .18s, box-shadow .18s; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.1) !important; }
  .nav-item { transition: all .15s; }
  .nav-item:hover { background: rgba(255,255,255,.08) !important; }
  .nav-item.active { background: rgba(200,16,46,.85) !important; color: #fff !important; }
  .table-row { transition: background .1s; }
  .table-row:hover td { background: #fafbff; }
  .pill { transition: all .15s; cursor: pointer; }
  .pill:hover { opacity: .85; }
  .modal-overlay { animation: fadeIn .2s ease; }
  .modal-box     { animation: fadeUp .25s ease; }

  /* ── Mobile drawer ── */
  .mob-drawer-bg {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(11,30,61,.6);
    backdrop-filter: blur(4px);
    animation: fadeIn .2s ease;
  }
  .mob-drawer-panel {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: min(300px, 85vw);
    background: #0B1E3D;
    z-index: 501;
    display: flex; flex-direction: column;
    box-shadow: 6px 0 40px rgba(0,0,0,.4);
    animation: slideInL .28s cubic-bezier(.22,1,.36,1);
  }

  /* ── Bottom nav ── */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: white;
    border-top: 1px solid #E2E8F0;
    box-shadow: 0 -4px 24px rgba(0,0,0,.09);
    display: flex;
    z-index: 200;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    -webkit-tap-highlight-color: transparent;
  }
  .bnav-btn {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 8px 2px 6px; border: none; background: none;
    cursor: pointer; position: relative; gap: 3px;
  }
  .bnav-btn.active .bnav-icon { transform: translateY(-2px); }
  .bnav-icon { font-size: 22px; display: block; transition: transform .15s; }
  .bnav-label { font-size: 10px; font-weight: 600; transition: color .15s; line-height: 1; }
  .bnav-dot {
    position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%; background: #C8102E;
    opacity: 0; transition: opacity .15s;
  }
  .bnav-btn.active .bnav-dot { opacity: 1; }

  /* ── Notification sheet (mobile) ── */
  .notif-sheet-bg {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(3px);
    animation: fadeIn .2s ease;
  }
  .notif-sheet {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 401;
    background: white;
    border-radius: 20px 20px 0 0;
    max-height: 82vh;
    display: flex; flex-direction: column;
    box-shadow: 0 -8px 48px rgba(0,0,0,.2);
    animation: slideUp .3s cubic-bezier(.22,1,.36,1);
  }

  /* ── Responsive table ── */
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

  /* ── Responsive helpers ── */
  @media (max-width: 639px) {
    .hide-xs    { display: none !important; }
    .grid-2xs   { grid-template-columns: 1fr 1fr !important; }
    .grid-1xs   { grid-template-columns: 1fr !important; }
    .p-xs       { padding: 14px !important; }
    .gap-xs     { gap: 10px !important; }
    .fs-xs      { font-size: 13px !important; }
    .full-xs    { width: 100% !important; }
    .stack-xs   { flex-direction: column !important; }
  }
  @media (min-width: 640px) and (max-width: 1023px) {
    .hide-sm    { display: none !important; }
    .grid-2sm   { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Safe area ── */
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
  .main-safe { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); }
`;
