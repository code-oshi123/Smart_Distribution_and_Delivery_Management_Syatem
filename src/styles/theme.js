// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Design Tokens & Theme
// ═══════════════════════════════════════════════════

export const C = {
  // Brand
  red:"#C8102E", redD:"#9B0C22", redL:"#FFF0F3", redM:"#FEE2E2",
  // Dark navy sidebar
  navy:"#0B1E3D", navyM:"#122848", navyL:"#1a3a6b", navySoft:"rgba(255,255,255,0.06)",
  // Blues
  blue:"#1D5FA4", blueL:"#EFF6FF", blueSoft:"#DBEAFE",
  // Greens
  green:"#059669", greenL:"#ECFDF5", greenSoft:"#D1FAE5",
  // Ambers
  amber:"#D97706", amberL:"#FFFBEB", amberSoft:"#FDE68A",
  // Purple
  purple:"#7C3AED", purpleL:"#F5F3FF", purpleSoft:"#EDE9FE",
  // Neutrals
  slate:"#475569", slateL:"#94A3B8", slateSoft:"#F1F5F9",
  bg:"#EEF2F7", surface:"#FFFFFF",
  border:"#E2E8F0", borderD:"#CBD5E1",
  text:"#0F172A", textM:"#334155", textS:"#64748B",
  // Shadows
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
  delivered:    { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Delivered"   },
  "in-transit": { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"In Transit"  },
  delayed:      { bg:"#FEE2E2", fg:"#991B1B", dot:"#EF4444", label:"Delayed"     },
  failed:       { bg:"#EDE9FE", fg:"#5B21B6", dot:"#8B5CF6", label:"Failed"      },
  pending:      { bg:"#FEF3C7", fg:"#92400E", dot:"#F59E0B", label:"Pending"     },
  completed:    { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"Completed"   },
  "on-route":   { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"On Route"    },
  idle:         { bg:"#F1F5F9", fg:"#475569", dot:"#94A3B8", label:"Idle"        },
  active:       { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Active"      },
  planned:      { bg:"#FEF3C7", fg:"#92400E", dot:"#F59E0B", label:"Planned"     },
  offline:      { bg:"#F1F5F9", fg:"#374151", dot:"#6B7280", label:"Offline"     },
  dispatched:   { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"Dispatched"  },
  "out_of_stock":{ bg:"#FEE2E2", fg:"#991B1B", dot:"#EF4444", label:"Out of Stock"},
  available:    { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Available"   },
};

export const PRIO_CFG = {
  urgent: { bg:"#FEE2E2", fg:"#991B1B", label:"URGENT" },
  high:   { bg:"#FEF3C7", fg:"#92400E", label:"HIGH"   },
  normal: { bg:"#F0FDF4", fg:"#166534", label:"NORMAL" },
};

// Navigation config per role
export const NAV_CONFIG = {
  management: [
    { id:"dashboard",  label:"Dashboard",         icon:"📊", section:"main"     },
    { id:"tracking",   label:"Live Tracking",      icon:"🗺️", section:"main"     },
    { id:"deliveries", label:"Deliveries",         icon:"📦", section:"main"     },
    { id:"reports",    label:"Reports & Analytics",icon:"📈", section:"main"     },
    { id:"vehicles",   label:"Fleet Management",   icon:"🚛", section:"ops"      },
    { id:"users",      label:"User Management",    icon:"👥", section:"admin"    },
    { id:"messages",   label:"Communication",      icon:"💬", section:"tools"    },
  ],
  order_team: [
    { id:"orders",     label:"Order Management",   icon:"📋", section:"main"     },
    { id:"deliveries", label:"Delivery Tracking",  icon:"📦", section:"main"     },
    { id:"retailers",  label:"Retailers",          icon:"🏪", section:"main"     },
    { id:"messages",   label:"Communication",      icon:"💬", section:"tools"    },
  ],
  route_planner: [
    { id:"routing",    label:"Route Planning",     icon:"🛣️", section:"main"     },
    { id:"tracking",   label:"Live Tracking",      icon:"🗺️", section:"main"     },
    { id:"deliveries", label:"Deliveries",         icon:"📦", section:"main"     },
    { id:"vehicles",   label:"Fleet",              icon:"🚛", section:"ops"      },
    { id:"messages",   label:"Communication",      icon:"💬", section:"tools"    },
  ],
  warehouse: [
    { id:"dispatch",   label:"Dispatch Management",icon:"📤", section:"main"     },
    { id:"inventory",  label:"Inventory",          icon:"🏭", section:"main"     },
    { id:"deliveries", label:"Deliveries",         icon:"📦", section:"main"     },
    { id:"messages",   label:"Communication",      icon:"💬", section:"tools"    },
  ],
  driver: [
    { id:"my_delivery",label:"My Deliveries",      icon:"📦", section:"main"     },
    { id:"navigation", label:"Navigation & Route", icon:"🧭", section:"main"     },
    { id:"messages",   label:"Messages",           icon:"💬", section:"tools"    },
  ],
  retailer: [
    { id:"my_orders",  label:"My Orders",          icon:"📋", section:"main"     },
    { id:"tracking",   label:"Track Delivery",     icon:"🗺️", section:"main"     },
    { id:"history",    label:"History",            icon:"📂", section:"main"     },
    { id:"messages",   label:"Support",            icon:"💬", section:"tools"    },
  ],
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; font-family: 'Outfit', system-ui, sans-serif; }
  body { background: #EEF2F7; color: #0F172A; -webkit-font-smoothing: antialiased; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideInL  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
  @keyframes ping-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  .anim-fadeUp   { animation: fadeUp  .35s ease both; }
  .anim-fade1    { animation: fadeUp  .35s .06s ease both; }
  .anim-fade2    { animation: fadeUp  .35s .12s ease both; }
  .anim-fade3    { animation: fadeUp  .35s .18s ease both; }
  .anim-fade4    { animation: fadeUp  .35s .24s ease both; }
  .anim-slideL   { animation: slideInL .3s ease both; }

  input:focus, select:focus, textarea:focus {
    outline: none !important;
    border-color: #C8102E !important;
    box-shadow: 0 0 0 3px rgba(200,16,46,0.1) !important;
  }
  button, input, select, textarea { font-family: 'Outfit', system-ui, sans-serif; }

  .hover-lift { transition: transform .18s, box-shadow .18s; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.1) !important; }

  .nav-item { transition: all .15s; }
  .nav-item:hover { background: rgba(255,255,255,.08) !important; }
  .nav-item.active { background: rgba(200,16,46,.85) !important; color: #fff !important; }

  .table-row { transition: background .1s; }
  .table-row:hover td { background: #fafbff; }

  .pill { transition: all .15s; cursor: pointer; }
  .pill:hover { opacity: .85; }
  .pill.active { box-shadow: 0 2px 8px rgba(200,16,46,.3); }

  .modal-overlay { animation: fadeIn .2s ease; }
  .modal-box { animation: fadeUp .25s ease; }
`;
