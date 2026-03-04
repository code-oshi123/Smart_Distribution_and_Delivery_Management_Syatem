// ═══════════════════════════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Realistic Live Tracking Page
// Uses: React-Leaflet + OpenStreetMap + Animated GPS Simulation
//
// SETUP:
//   npm install leaflet react-leaflet
//
// Add to public/index.html inside <head>:
//   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";

// Fix broken default icons in webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────
const C = {
  red:"#C8102E", redD:"#9B0C22", redL:"#FFF0F3",
  navy:"#0B1E3D",
  green:"#059669", greenL:"#ECFDF5", greenSoft:"#D1FAE5",
  amber:"#D97706",
  blue:"#1D5FA4",
  bg:"#EEF2F7", surface:"#FFFFFF",
  border:"#E2E8F0",
  text:"#0F172A", textM:"#334155", textS:"#64748B",
  slateL:"#94A3B8",
  shadow:"0 1px 3px rgba(0,0,0,.07)",
  shadowM:"0 4px 16px rgba(0,0,0,.1)",
};

// ─── STATUS CONFIG ──────────────────────────────────────────────────────
const STATUS_CFG = {
  "on-route":   { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"On Route"   },
  "delayed":    { bg:"#FEE2E2", fg:"#991B1B", dot:"#EF4444", label:"Delayed"    },
  "completed":  { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"Completed"  },
  "idle":       { bg:"#F1F5F9", fg:"#475569", dot:"#94A3B8", label:"Idle"       },
  "delivered":  { bg:"#D1FAE5", fg:"#065F46", dot:"#059669", label:"Delivered"  },
  "in-transit": { bg:"#DBEAFE", fg:"#1E40AF", dot:"#3B82F6", label:"In Transit" },
  "pending":    { bg:"#FEF3C7", fg:"#92400E", dot:"#F59E0B", label:"Pending"    },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG["idle"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      background:cfg.bg, color:cfg.fg, padding:"2px 10px", borderRadius:20,
      fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:"uppercase" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot }}/>
      {cfg.label}
    </span>
  );
};

const ProgressBar = ({ value, color }) => {
  const col = color || (value>=70?C.green:value>=40?C.amber:"#EF4444");
  return (
    <div style={{ background:"#E5E7EB", borderRadius:99, height:7, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(100,value)}%`, height:"100%", background:col, borderRadius:99, transition:"width .4s" }}/>
    </div>
  );
};

// ─── VEHICLE ROUTES with real Sri Lanka GPS waypoints ──────────────────
const VEHICLE_ROUTES = {
  V001: {
    id:"V001", plate:"NB-1234", type:"Heavy Lorry", driver:"Kumara Silva",
    phone:"+94 77 678 9012", status:"on-route", fuel:78, capacity:"5 Ton",
    color:"#059669", speed:52, heading:"North",
    waypoints:[
      { lat:6.9271, lng:79.8612, label:"Warehouse — Peliyagoda" },
      { lat:6.9350, lng:79.8850, label:"Wattala Stop"           },
      { lat:6.9554, lng:79.8901, label:"Ja-Ela Stop"            },
      { lat:7.0173, lng:79.8997, label:"Negombo Stop"           },
      { lat:6.9876, lng:79.9123, label:"Katunayake Stop"        },
      { lat:6.9612, lng:79.8754, label:"Seeduwa Stop"           },
      { lat:6.9271, lng:79.8612, label:"Return to Warehouse"    },
    ],
    deliveries:[
      { id:"D003", retailer:"Keells Super",   city:"Wattala",    status:"delivered",  eta:"12:30" },
      { id:"D011", retailer:"Cargills",       city:"Ja-Ela",     status:"delivered",  eta:"13:15" },
      { id:"D012", retailer:"Sathosa",        city:"Negombo",    status:"in-transit", eta:"14:45" },
      { id:"D013", retailer:"Arpico",         city:"Katunayake", status:"pending",    eta:"15:30" },
    ],
  },
  V002: {
    id:"V002", plate:"NB-5678", type:"Mini Truck", driver:"Nimal Jayawardena",
    phone:"+94 71 789 0123", status:"on-route", fuel:55, capacity:"2 Ton",
    color:"#1D5FA4", speed:38, heading:"East",
    waypoints:[
      { lat:7.2906, lng:80.6337, label:"Kandy Depot"       },
      { lat:7.2741, lng:80.5965, label:"Peradeniya Stop"   },
      { lat:7.2534, lng:80.5697, label:"Gampola Stop"      },
      { lat:7.3053, lng:80.6621, label:"Kundasale Stop"    },
      { lat:7.3245, lng:80.6012, label:"Katugastota Stop"  },
      { lat:7.2906, lng:80.6337, label:"Return to Depot"   },
    ],
    deliveries:[
      { id:"D004", retailer:"Arpico Supercentre", city:"Kandy",       status:"delivered",  eta:"10:45" },
      { id:"D005", retailer:"Sathosa",            city:"Peradeniya",  status:"in-transit", eta:"15:15" },
      { id:"D014", retailer:"Cargills Kandy",     city:"Katugastota", status:"pending",    eta:"16:00" },
    ],
  },
  V003: {
    id:"V003", plate:"NB-9012", type:"Cargo Van", driver:"Unassigned",
    phone:"—", status:"delayed", fuel:40, capacity:"1 Ton",
    color:"#EF4444", speed:0, heading:"Stopped",
    waypoints:[
      { lat:6.2257, lng:80.0549, label:"Kalutara Depot" },
      { lat:6.1428, lng:80.1232, label:"Aluthgama Stop" },
      { lat:6.0535, lng:80.2210, label:"Galle Stop"     },
    ],
    deliveries:[
      { id:"D006", retailer:"Lanka Sathosa", city:"Galle", status:"delayed", eta:"17:00" },
    ],
  },
};

// ─── LERP helper ───────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// ─── Custom SVG vehicle marker ─────────────────────────────────────────
const makeVehicleIcon = (color, vid, isSelected, speed) => {
  const moving = speed > 0;
  const size   = isSelected ? 54 : 44;
  const pulse  = moving
    ? `<circle cx="27" cy="27" r="20" fill="${color}" opacity="0.12">
         <animate attributeName="r" values="15;26;15" dur="2s" repeatCount="indefinite"/>
         <animate attributeName="opacity" values="0.12;0;0.12" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : "";
  const ring = isSelected
    ? `<circle cx="27" cy="27" r="25" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5,3" opacity="0.6"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 54 54">
    ${ring}${pulse}
    <circle cx="27" cy="27" r="19" fill="${color}" opacity="0.22"/>
    <circle cx="27" cy="27" r="13" fill="${color}"/>
    <text x="27" y="23" text-anchor="middle" font-size="7" fill="white" font-weight="800"
      font-family="monospace">${vid}</text>
    <text x="27" y="33" text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.85)"
      font-family="sans-serif">${moving ? speed+"km/h" : "STOPPED"}</text>
  </svg>`;
  return L.divIcon({ html:svg, className:"", iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2] });
};

const makeStopIcon = (status) => {
  const col = STATUS_CFG[status]?.dot || "#94A3B8";
  return L.divIcon({
    html:`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="${col}" opacity="0.2" stroke="${col}" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="4" fill="${col}"/>
    </svg>`,
    className:"", iconSize:[20,20], iconAnchor:[10,10],
  });
};

// ─── Map fly-to helper ─────────────────────────────────────────────────
function FlyTo({ center, zoom }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (!center) return;
    const key = `${center[0]},${center[1]},${zoom}`;
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo(center, zoom, { duration:1.2 });
  }, [center, zoom, map]);
  return null;
}

// ─── TILE LAYERS ───────────────────────────────────────────────────────
const TILES = {
  Street:    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Dark:      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  Topo:      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function LiveTrackingPage() {

  // ── Live GPS positions state ──────────────────────────────────────
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(
      Object.values(VEHICLE_ROUTES).map(v => [
        v.id,
        { lat:v.waypoints[0].lat, lng:v.waypoints[0].lng, wpIndex:0, progress:0 },
      ])
    )
  );

  const [selected,    setSelected]    = useState("V001");
  const [flyTarget,   setFlyTarget]   = useState([6.9271, 79.8612]);
  const [flyZoom,     setFlyZoom]     = useState(12);
  const [tileStyle,   setTileStyle]   = useState("Street");
  const [showRoutes,  setShowRoutes]  = useState(true);
  const [showStops,   setShowStops]   = useState(true);
  const [clock,       setClock]       = useState(new Date());
  const [alertVisible,setAlertVisible]= useState(true);

  // ── Animate vehicles ─────────────────────────────────────────────
  useEffect(() => {
    const TICK = 40; // ms between frames — smooth 25fps
    const id = setInterval(() => {
      setPositions(prev => {
        const next = {};
        Object.values(VEHICLE_ROUTES).forEach(v => {
          const cur = prev[v.id];
          const wps = v.waypoints;
          if (v.speed === 0) { next[v.id] = cur; return; }
          const advance = (v.speed / 60) * 0.0038;
          const newProg = cur.progress + advance;
          if (newProg >= 1) {
            const nextIdx = (cur.wpIndex + 1) >= wps.length - 1 ? 0 : cur.wpIndex + 1;
            next[v.id] = { lat:wps[nextIdx].lat, lng:wps[nextIdx].lng, wpIndex:nextIdx, progress:0 };
          } else {
            const from = wps[cur.wpIndex];
            const to   = wps[Math.min(cur.wpIndex + 1, wps.length - 1)];
            next[v.id] = { lat:lerp(from.lat,to.lat,newProg), lng:lerp(from.lng,to.lng,newProg), wpIndex:cur.wpIndex, progress:newProg };
          }
        });
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, []);

  // ── Clock ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const selV   = VEHICLE_ROUTES[selected];
  const selPos = positions[selected];

  const focusVehicle = (vid) => {
    const pos = positions[vid];
    setSelected(vid);
    setFlyTarget([pos.lat, pos.lng]);
    setFlyZoom(13);
  };

  // ── Derived live stats for selected vehicle ────────────────────
  const doneStops    = selV.deliveries.filter(d => d.status === "delivered").length;
  const totalStops   = selV.deliveries.length;
  const nextStop     = selV.deliveries.find(d => d.status === "in-transit" || d.status === "pending");
  const currentWp    = selV.waypoints[selPos?.wpIndex ?? 0];

  return (
    <div style={{ fontFamily:"'Outfit',system-ui,sans-serif", display:"flex", flexDirection:"column", height:"100%", gap:0 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:C.text }}>🗺️ Live Vehicle Tracking</h2>
          <p style={{ margin:"3px 0 0", fontSize:12, color:C.textS }}>
            OpenStreetMap · Real-time GPS ·&nbsp;
            <span style={{ color:C.green, fontWeight:700, fontFamily:"monospace" }}>
              {clock.toLocaleTimeString("en-LK")}
            </span>
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {/* Map style picker */}
          <div style={{ display:"flex", gap:2, background:"#F1F5F9", borderRadius:9, padding:3 }}>
            {Object.keys(TILES).map(k => (
              <button key={k} onClick={() => setTileStyle(k)}
                style={{ padding:"5px 13px", borderRadius:7, border:"none", fontSize:11, fontWeight:600, cursor:"pointer", transition:"all .15s",
                  background: tileStyle===k?"white":"transparent",
                  color:      tileStyle===k?C.red:C.textS,
                  boxShadow:  tileStyle===k?C.shadow:"none" }}>
                {k}
              </button>
            ))}
          </div>
          {/* Toggle buttons */}
          {[{l:"Routes",v:showRoutes,fn:setShowRoutes},{l:"Stops",v:showStops,fn:setShowStops}].map(t=>(
            <button key={t.l} onClick={()=>t.fn(!t.v)}
              style={{ padding:"6px 14px", borderRadius:8, border:`1.5px solid ${t.v?C.red:C.border}`, fontSize:12, fontWeight:600, cursor:"pointer", background:t.v?C.redL:"white", color:t.v?C.red:C.textS, transition:"all .15s" }}>
              {t.v?"✓ ":""}{t.l}
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:6, background:C.greenSoft, borderRadius:8, padding:"6px 12px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block" }}/>
            <span style={{ fontSize:11, color:C.green, fontWeight:700 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Alert Banner ───────────────────────────────────────── */}
      {alertVisible && (
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"#FFF1F2", border:"1px solid #FECDD3", borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:12, color:"#991B1B" }}>
          <span style={{ fontSize:16 }}>🚨</span>
          <span style={{ flex:1, fontWeight:500 }}>
            <strong>V003 (NB-9012)</strong> has stopped on the Southern Expressway near Aluthgama. Breakdown reported — driver attempting repair.
          </span>
          <button onClick={()=>setAlertVisible(false)}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#991B1B", lineHeight:1, padding:0 }}>×</button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:14, flex:1, minHeight:0 }}>

        {/* ── MAP ────────────────────────────────────────────── */}
        <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${C.border}`, boxShadow:C.shadowM }}>
          <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ width:"100%", height:"100%", minHeight:520 }}>
            <TileLayer url={TILES[tileStyle]} attribution="© OpenStreetMap contributors"/>
            <FlyTo center={flyTarget} zoom={flyZoom}/>

            {/* Route polylines */}
            {showRoutes && Object.values(VEHICLE_ROUTES).map(v => (
              <Polyline key={`r-${v.id}`}
                positions={v.waypoints.map(w=>[w.lat,w.lng])}
                pathOptions={{
                  color:     v.color,
                  weight:    selected===v.id ? 4 : 2.5,
                  opacity:   selected===v.id ? 0.9 : 0.35,
                  dashArray: v.status==="delayed" ? "8,6" : undefined,
                }}
              />
            ))}

            {/* Delivery stop markers */}
            {showStops && Object.values(VEHICLE_ROUTES).map(v =>
              v.waypoints.slice(1,-1).map((wp,i) => {
                const del = v.deliveries[i];
                return (
                  <Marker key={`s-${v.id}-${i}`} position={[wp.lat,wp.lng]} icon={makeStopIcon(del?.status||"pending")}>
                    <Popup>
                      <div style={{ fontFamily:"'Outfit',sans-serif", minWidth:170 }}>
                        <div style={{ fontWeight:700, fontSize:13, marginBottom:5 }}>{wp.label}</div>
                        {del && <>
                          <div style={{ fontSize:11, color:"#64748B" }}>📦 {del.retailer}</div>
                          <div style={{ fontSize:11, color:"#64748B", margin:"2px 0" }}>🕐 ETA: {del.eta}</div>
                          <div style={{ marginTop:7 }}><Badge status={del.status}/></div>
                        </>}
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            )}

            {/* Live vehicle markers */}
            {Object.values(VEHICLE_ROUTES).map(v => {
              const pos = positions[v.id];
              return (
                <Marker key={v.id} position={[pos.lat,pos.lng]}
                  icon={makeVehicleIcon(v.color, v.id, selected===v.id, v.speed)}
                  eventHandlers={{ click:()=>focusVehicle(v.id) }}>
                  <Popup>
                    <div style={{ fontFamily:"'Outfit',sans-serif", minWidth:200 }}>
                      <div style={{ fontWeight:800, fontSize:14, marginBottom:2 }}>{v.id} — {v.plate}</div>
                      <div style={{ fontSize:11, color:"#64748B", marginBottom:8 }}>{v.type} · {v.driver}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, fontSize:12, marginBottom:8 }}>
                        {[["Speed",`${v.speed} km/h`],["Fuel",`${v.fuel}%`],["Heading",v.heading],["Capacity",v.capacity]].map(([k,val])=>(
                          <div key={k}><span style={{color:"#94A3B8"}}>{k}: </span><strong>{val}</strong></div>
                        ))}
                      </div>
                      <Badge status={v.status}/>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* GPS accuracy circle */}
            {selPos && (
              <Circle center={[selPos.lat,selPos.lng]} radius={280}
                pathOptions={{ color:selV.color, fillOpacity:0.06, weight:1.5, opacity:0.4 }}/>
            )}
          </MapContainer>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>

          {/* Fleet Selector */}
          <div style={{ background:"white", borderRadius:12, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.textS, textTransform:"uppercase", letterSpacing:.7, marginBottom:10 }}>
              Fleet — Click to Track
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {Object.values(VEHICLE_ROUTES).map(v => {
                const pos   = positions[v.id];
                const isSel = selected === v.id;
                return (
                  <button key={v.id} onClick={()=>focusVehicle(v.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                      border:`1.5px solid ${isSel?v.color:C.border}`, background:isSel?v.color+"10":"white",
                      cursor:"pointer", textAlign:"left", transition:"all .2s", fontFamily:"inherit" }}>
                    {/* Animated status dot */}
                    <div style={{ position:"relative", flexShrink:0, width:12, height:12 }}>
                      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:v.color, opacity:v.speed>0?.3:1 }}/>
                      {v.speed > 0 && (
                        <div style={{ position:"absolute", inset:-3, borderRadius:"50%", border:`2px solid ${v.color}`, animation:"ping-ring 1.5s ease-out infinite" }}/>
                      )}
                      <div style={{ position:"absolute", inset:2, borderRadius:"50%", background:v.color }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:C.text, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"monospace" }}>{v.id} · {v.plate}</span>
                        <Badge status={v.status}/>
                      </div>
                      <div style={{ fontSize:10, color:C.textS, marginTop:2 }}>{v.driver}</div>
                      <div style={{ fontSize:10, color:C.textS, marginTop:1, fontFamily:"monospace" }}>
                        {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected vehicle inspector */}
          {selV && selPos && (
            <div style={{ background:"white", borderRadius:12, padding:16, border:`2px solid ${selV.color}30`, boxShadow:C.shadowM }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16, color:C.text, fontFamily:"monospace" }}>{selV.id}</div>
                  <div style={{ fontSize:12, color:C.textS, marginTop:1 }}>{selV.plate} · {selV.type}</div>
                </div>
                <Badge status={selV.status}/>
              </div>

              {/* Live GPS terminal */}
              <div style={{ background:C.navy, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.35)", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>
                  Live GPS — Updates every 40ms
                </div>
                <div style={{ fontFamily:"monospace", fontSize:13, color:"#4ADE80", fontWeight:600, marginBottom:10 }}>
                  {selPos.lat.toFixed(6)}, {selPos.lng.toFixed(6)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {[
                    { label:"SPEED",   value:`${selV.speed}`, unit:"km/h", color: selV.speed===0?"#EF4444":"white" },
                    { label:"HEADING", value:selV.heading,    unit:"",     color:"white" },
                    { label:"FUEL",    value:`${selV.fuel}`,  unit:"%",    color: selV.fuel<30?"#EF4444":selV.fuel<60?"#F59E0B":"#4ADE80" },
                  ].map(s=>(
                    <div key={s.label}>
                      <div style={{ fontSize:8, color:"rgba(255,255,255,.3)", letterSpacing:.8 }}>{s.label}</div>
                      <div style={{ fontSize:17, fontWeight:800, color:s.color, lineHeight:1.2, marginTop:2 }}>
                        {s.value}<span style={{ fontSize:9, opacity:.6, marginLeft:2 }}>{s.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div style={{ background:"#F8FAFC", borderRadius:9, padding:"10px 12px", marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:6 }}>
                  <span style={{ color:C.textS, fontWeight:600 }}>Route Progress</span>
                  <span style={{ fontWeight:800, color:selV.color }}>{doneStops}/{totalStops} stops done</span>
                </div>
                <ProgressBar value={Math.round((doneStops/totalStops)*100)} color={selV.color}/>
                {nextStop && (
                  <div style={{ fontSize:11, color:C.textS, marginTop:6 }}>
                    ▶ Next: <strong style={{ color:C.text }}>{nextStop.retailer}, {nextStop.city}</strong> · ETA {nextStop.eta}
                  </div>
                )}
              </div>

              {/* Current waypoint */}
              <div style={{ fontSize:11, color:C.textS, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:selV.color, flexShrink:0 }}/>
                <span>Currently near: <strong style={{ color:C.text }}>{currentWp?.label}</strong></span>
              </div>

              {/* Detail rows */}
              {[
                ["👤 Driver",    selV.driver],
                ["📱 Phone",     selV.phone],
                ["⚖️ Capacity",  selV.capacity],
                ["🛑 Stops",     `${totalStops} delivery stops`],
              ].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                  <span style={{ color:C.textS }}>{k}</span>
                  <span style={{ fontWeight:600, color:C.text }}>{v}</span>
                </div>
              ))}

              {/* Fuel bar */}
              <div style={{ marginTop:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textS, marginBottom:4 }}>
                  <span>Fuel Level</span>
                  <span style={{ fontWeight:700, color:selV.fuel<30?"#EF4444":selV.fuel<60?C.amber:C.green }}>{selV.fuel}%</span>
                </div>
                <ProgressBar value={selV.fuel} color={selV.fuel<30?"#EF4444":selV.fuel<60?C.amber:C.green}/>
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:7, marginTop:14 }}>
                <button style={{ flex:1, padding:"9px", background:C.red, color:"white", border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  📞 Call Driver
                </button>
                <button style={{ flex:1, padding:"9px", background:"#F1F5F9", color:C.textM, border:"none", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  💬 Message
                </button>
                <button onClick={()=>{setFlyTarget([selPos.lat,selPos.lng]);setFlyZoom(15);}}
                  style={{ padding:"9px 12px", background:"#F1F5F9", color:C.textM, border:"none", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  🎯
                </button>
              </div>
            </div>
          )}

          {/* Delivery stops list */}
          {selV && (
            <div style={{ background:"white", borderRadius:12, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:10 }}>
                📦 Stop Schedule — {selV.id}
              </div>
              {selV.deliveries.map((d,i)=>(
                <div key={d.id} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:"1px solid #F8FAFC", alignItems:"center" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%",
                    background: STATUS_CFG[d.status]?.bg||"#F1F5F9",
                    color:      STATUS_CFG[d.status]?.fg||"#475569",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{d.retailer}</div>
                    <div style={{ fontSize:10, color:C.textS }}>📍 {d.city} · ETA {d.eta}</div>
                  </div>
                  <Badge status={d.status}/>
                </div>
              ))}
            </div>
          )}

          {/* System Alerts */}
          <div style={{ background:"white", borderRadius:12, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:10 }}>🚨 System Alerts</div>
            {[
              { type:"critical", msg:"V003 breakdown — Southern Expressway near Aluthgama", time:"5m ago"  },
              { type:"warning",  msg:"V002 low fuel warning — 55% remaining",               time:"18m ago" },
              { type:"success",  msg:"V001 completed stop D011 — Ja-Ela delivered ✓",       time:"31m ago" },
            ].map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:9, padding:"8px 0", borderBottom:"1px solid #F8FAFC", alignItems:"flex-start" }}>
                <span style={{ fontSize:14 }}>{a.type==="critical"?"🔴":a.type==="warning"?"🟡":"🟢"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:C.text }}>{a.msg}</div>
                  <div style={{ fontSize:10, color:C.slateL, marginTop:1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes ping-ring {
          0%   { transform: scale(1); opacity: .7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .leaflet-container { font-family: 'Outfit', system-ui, sans-serif !important; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,.15) !important; }
        .leaflet-popup-content { margin: 14px 16px !important; }
        .leaflet-control-zoom a { font-family: 'Outfit', sans-serif !important; }
      `}</style>
    </div>
  );
}
