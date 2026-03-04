// ═══════════════════════════════════════════════════
// ALL REMAINING PAGES — Nestlé Sri Lanka DMS
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { DELIVERIES, VEHICLES, GPS_LOGS, ROUTES, ORDERS, USERS, MESSAGES, NOTIFICATIONS, INVENTORY, RETAILERS, KPI_HISTORY } from "../data/db";
import { C, ROLE_COLORS, ROLE_LABELS } from "../styles/theme";
import { Card, KPICard, SectionHeader, Badge, ProgressBar, Table, Btn, Input, Select, Textarea, Modal, Tabs, Alert, Avatar, Empty, Divider } from "../components/UI";
import { SriLankaMap, BarChart, LineChart } from "../components/Charts";

// ─── helper ───────────────────────────────────────
const driverName = id => USERS.find(u=>u.id===id)?.name || "Unassigned";
const effColor   = e => e>=90?C.green:e>=75?C.amber:C.red;
const trafficColor = t => ({Low:C.green,Moderate:C.amber,High:C.red})[t]||C.slate;

// ══════════════════════════════════════════════════
// PAGE: Live Tracking (management, route_planner)
// ══════════════════════════════════════════════════
export function TrackingPage() {
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>setTick(x=>x+1),4000); return()=>clearInterval(t); },[]);

  const selV   = VEHICLES.find(v=>v.id===selected);
  const selLog = selV ? GPS_LOGS.find(g=>g.veh===selV.id) : null;
  const selDrv = selV?.driver ? USERS.find(u=>u.id===selV.driver) : null;
  const selDels = selV ? DELIVERIES.filter(d=>d.veh===selV.id) : [];

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Real-Time Vehicle Tracking" subtitle={`GPS auto-refresh every 4 seconds · Last sync: ${new Date().toLocaleTimeString()}`}/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:15, color:C.text }}>🗺️ Live Fleet Map</div>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ background:C.greenL, borderRadius:7, padding:"4px 12px", fontSize:11, color:C.green, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite" }}/>
                  LIVE · Tick #{tick}
                </div>
              </div>
            </div>
            <SriLankaMap vehicles={VEHICLES} gpsLogs={GPS_LOGS} onSelect={v=>setSelected(v.id===selected?null:v.id)} selected={selected} height={400}/>
          </Card>

          {/* Vehicle selector */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {VEHICLES.map(v=>(
              <Card key={v.id} onClick={()=>setSelected(v.id===selected?null:v.id)} className="hover-lift"
                style={{ padding:"12px 10px", textAlign:"center", cursor:"pointer", border:`2px solid ${selected===v.id?C.red:C.border}`, transition:"all .18s" }}>
                <div style={{ fontWeight:800, fontSize:13, color:selected===v.id?C.red:C.text, fontFamily:"'JetBrains Mono',monospace" }}>{v.id}</div>
                <div style={{ fontSize:10, color:C.textS, margin:"3px 0 7px", fontFamily:"'JetBrains Mono',monospace" }}>{v.plate}</div>
                <Badge status={v.status}/>
                <div style={{ marginTop:8 }}>
                  <ProgressBar value={v.fuel} height={4}/>
                  <div style={{ fontSize:9,color:C.textS,marginTop:2 }}>{v.fuel}% fuel</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Detail panel */}
          <Card>
            <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>
              {selV ? `${selV.id} — Inspector` : "🔍 Select Vehicle"}
            </div>
            {selV ? (
              <>
                <div style={{ marginBottom:12, display:"flex", gap:8 }}>
                  <Badge status={selV.status}/>
                </div>
                {[
                  ["🚛 Vehicle",   `${selV.plate} (${selV.type})`],
                  ["⚖️ Capacity",  selV.cap],
                  ["👤 Driver",    selDrv?.name||"Unassigned"],
                  ["📍 Location",  selLog?`${selLog.lat.toFixed(4)}, ${selLog.lng.toFixed(4)}`:"Unknown"],
                  ["⚡ Speed",     selLog?.speed||"—"],
                  ["🧭 Heading",   selLog?.heading||"—"],
                  ["📏 Mileage",   selV.km],
                  ["🔧 Next Svc",  selV.nextService],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                    <span style={{ color:C.textS }}>{k}</span>
                    <span style={{ fontWeight:600, color:C.text, textAlign:"right", maxWidth:180 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:C.textS, fontWeight:700, marginBottom:5 }}>FUEL LEVEL</div>
                  <ProgressBar value={selV.fuel} height={8} label/>
                </div>
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11, color:C.textS, fontWeight:700, marginBottom:8 }}>ASSIGNED DELIVERIES ({selDels.length})</div>
                  {selDels.slice(0,3).map(d=>(
                    <div key={d.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:11, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C.red, fontWeight:600 }}>{d.id}</span>
                      <span style={{ color:C.textM }}>{d.retailer.split(" ")[0]}</span>
                      <Badge status={d.status}/>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:7, marginTop:12 }}>
                  <Btn size="sm" variant="primary" style={{ flex:1, justifyContent:"center" }}>📞 Contact</Btn>
                  <Btn size="sm" variant="ghost" style={{ flex:1, justifyContent:"center" }}>📋 History</Btn>
                </div>
              </>
            ) : (
              <Empty icon="🗺️" title="No vehicle selected" sub="Click a vehicle on the map or the selector above"/>
            )}
          </Card>

          {/* GPS Log */}
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>📡 GPS Activity Log</div>
            {GPS_LOGS.map((g,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,animation:"pulse-dot 2s infinite" }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:C.text,fontFamily:"'JetBrains Mono',monospace" }}>{g.veh}</div>
                  <div style={{ fontSize:11,color:C.textS }}>{g.lat.toFixed(3)}, {g.lng.toFixed(3)} · {g.speed}</div>
                </div>
                <div style={{ fontSize:10,color:C.slateL }}>{g.time}</div>
              </div>
            ))}
          </Card>

          {/* Alerts */}
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>🚨 Active Alerts</div>
            {NOTIFICATIONS.filter(n=>!n.read).map(n=>(
              <div key={n.id} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:16 }}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":"🔵"}</span>
                <div>
                  <div style={{ fontSize:12,fontWeight:700,color:C.text }}>{n.title}</div>
                  <div style={{ fontSize:11,color:C.textS,marginTop:1 }}>{n.msg}</div>
                  <div style={{ fontSize:10,color:C.slateL,marginTop:2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Order Management (role: order_team)
// ══════════════════════════════════════════════════
export function OrdersPage({ user }) {
  const [modal, setModal]   = useState(null);
  const [selO, setSelO]     = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert]   = useState(null);
  const [form, setForm]     = useState({ retailer:"", city:"", items:"", kg:"", prio:"normal", window:"", stock:"pending" });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  const filtered = ORDERS.filter(o=>!search||o.retailer.toLowerCase().includes(search.toLowerCase())||o.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Order Management"
        subtitle={`${ORDERS.length} orders — ${ORDERS.filter(o=>o.status==="pending").length} pending`}
        actions={[
          <Btn key="b" variant="ghost" size="sm">⬆ Bulk Upload</Btn>,
          <Btn key="c" onClick={()=>setModal("create")}>＋ New Order</Btn>,
        ]}
      />

      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { l:"Total Orders",   v:ORDERS.length,                            c:C.blue  },
          { l:"Dispatched",     v:ORDERS.filter(o=>o.status==="dispatched").length, c:C.green },
          { l:"In Transit",     v:ORDERS.filter(o=>o.status==="in-transit").length, c:C.red   },
          { l:"Pending",        v:ORDERS.filter(o=>o.status==="pending").length,    c:C.amber },
        ].map(s=>(
          <Card key={s.l} className="hover-lift" style={{ padding:"16px 18px", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:28,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,fontWeight:500,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:10, alignItems:"center" }}>
          <Input value={search} onChange={setSearch} placeholder="Search retailer, city…" icon="🔍" style={{ flex:1, maxWidth:280 }}/>
          <div style={{ marginLeft:"auto", fontSize:12, color:C.textS }}>{filtered.length} orders</div>
        </div>
        <Table
          cols={[
            { key:"id",       label:"Order ID",  render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{v}</span> },
            { key:"retailer", label:"Retailer"   },
            { key:"city",     label:"City"       },
            { key:"items",    label:"Items",     render:v=>`${v} units` },
            { key:"kg",       label:"Weight",    render:v=>`${v} kg` },
            { key:"prio",     label:"Priority",  render:v=><Badge priority={v}/> },
            { key:"stock",    label:"Stock",     render:v=><Badge status={v}/> },
            { key:"status",   label:"Status",    render:v=><Badge status={v}/> },
            { key:"window",   label:"Window"     },
            { key:"delivery", label:"Delivery",  render:v=>v?<span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.blue }}>{v}</span>:"—" },
          ]}
          rows={filtered}
          onRow={o=>{ setSelO(o); setModal("detail"); }}
        />
      </Card>

      {/* Create modal */}
      <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Create New Delivery Order" subtitle="Fill all required fields before submitting">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Retailer Name" value={form.retailer} onChange={v=>setF("retailer",v)} placeholder="e.g. Cargills Food City" required/>
          <Input label="Delivery City"  value={form.city}     onChange={v=>setF("city",v)}     placeholder="e.g. Colombo 03"         required/>
          <Select label="Priority" value={form.prio} onChange={v=>setF("prio",v)} options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"normal",label:"🟢 Normal"}]} required/>
          <Input label="Delivery Window" value={form.window} onChange={v=>setF("window",v)} placeholder="e.g. 10:00 – 12:00"/>
          <Input label="Number of Items" value={form.items}  onChange={v=>setF("items",v)} type="number" placeholder="0" required/>
          <Input label="Total Weight (kg)" value={form.kg}  onChange={v=>setF("kg",v)}    type="number" placeholder="0" required/>
          <Select label="Stock Status" value={form.stock} onChange={v=>setF("stock",v)} options={[{value:"confirmed",label:"✅ Confirmed"},{value:"pending",label:"⏳ Pending"}]}/>
        </div>
        <Divider label="Confirmation"/>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"New order created. Pending driver & vehicle assignment."}); setModal(null); setForm({ retailer:"",city:"",items:"",kg:"",prio:"normal",window:"",stock:"pending" }); }}>✓ Create Order</Btn>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={modal==="detail"} onClose={()=>setModal(null)} title={`Order ${selO?.id}`}>
        {selO && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              <Badge status={selO.status}/><Badge priority={selO.prio}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              {[["Retailer",selO.retailer],["City",selO.city],["Items",`${selO.items} units`],["Weight",`${selO.kg} kg`],["Window",selO.window||"—"],["Stock",selO.stock],["Created",selO.created],["Linked Delivery",selO.delivery||"Not assigned"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn size="sm" variant="ghost">✏️ Edit</Btn>
              <Btn size="sm" variant="warning">🚩 Flag Urgent</Btn>
              <Btn size="sm" variant="danger" onClick={()=>{ setAlert({t:"warning",m:`Order ${selO.id} cancelled.`}); setModal(null); }}>🗑 Cancel Order</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Routing (role: route_planner)
// ══════════════════════════════════════════════════
export function RoutingPage() {
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [optModal, setOptModal] = useState(null);
  const [alert, setAlert]       = useState(null);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Route Planning & Optimization"
        subtitle="Manage delivery routes, optimize paths, reduce fuel, and assign drivers"
        actions={[
          <Btn key="n" onClick={()=>setModal("create")}>＋ New Route</Btn>,
          <Btn key="a" variant="secondary" onClick={()=>setAlert({t:"info",m:"Auto-optimization running across all routes. Updated routes will appear in 30 seconds."})}>⚡ Auto-Optimize All</Btn>,
        ]}
      />

      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        <div>
          {/* Route cards */}
          {ROUTES.map(r=>{
            const isOpen = expanded===r.id;
            const driver = USERS.find(u=>u.id===r.driver);
            return (
              <Card key={r.id} style={{ marginBottom:12, overflow:"hidden", padding:0 }}>
                <div onClick={()=>setExpanded(isOpen?null:r.id)}
                  style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", background:isOpen?"#FFF9F9":"white", transition:"background .15s" }}>
                  <div style={{ background:C.red+"18", borderRadius:9, padding:"6px 12px", fontWeight:800, fontSize:12, color:C.red, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{r.id}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:C.text }}>{r.name}</div>
                    <div style={{ fontSize:11, color:C.textS, marginTop:2 }}>
                      {driver?.name||"No driver assigned"} · {r.stops} stops · {r.dist} · {r.dur}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:17, color:effColor(r.eff) }}>{r.eff}%</div>
                    <div style={{ fontSize:9, color:C.textS }}>efficiency</div>
                  </div>
                  <Badge status={r.status}/>
                  <span style={{ color:C.slateL, transform:isOpen?"rotate(90deg)":"none", transition:"transform .2s", fontSize:18, flexShrink:0 }}>›</span>
                </div>

                {isOpen && (
                  <div style={{ padding:"16px 20px", background:"#FAFBFF", borderTop:`1px solid ${C.border}` }}>
                    {/* Stats grid */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                      {[
                        ["🛑 Stops",       r.stops,   ""],
                        ["📏 Distance",    r.dist,    ""],
                        ["⏱ Duration",    r.dur,     ""],
                        ["🚦 Traffic",     r.traffic, trafficColor(r.traffic)],
                        ["⛽ Fuel Est.",   r.fuelEst, ""],
                        ["📊 Efficiency",  `${r.eff}%`, effColor(r.eff)],
                      ].map(([k,v,col])=>(
                        <div key={k} style={{ background:"white", padding:"10px 12px", borderRadius:9, border:`1px solid ${C.border}` }}>
                          <div style={{ fontSize:10,color:C.textS,fontWeight:600 }}>{k}</div>
                          <div style={{ fontWeight:700,fontSize:14,color:col||C.text,marginTop:2 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stop sequence */}
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11,color:C.textS,fontWeight:700,marginBottom:8 }}>STOP SEQUENCE</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {r.seq.map((s,i)=>(
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <div style={{ background:C.red+"18",color:C.red,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600 }}>{i+1}. {s}</div>
                            {i<r.seq.length-1 && <span style={{ color:C.slateL, fontSize:12 }}>→</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10,color:C.textS,fontWeight:700,marginBottom:5 }}>ROUTE EFFICIENCY</div>
                      <ProgressBar value={r.eff} color={effColor(r.eff)} height={8}/>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <Btn size="sm" onClick={()=>setOptModal(r)}>⚡ Optimize</Btn>
                      <Btn size="sm" variant="secondary">👤 Assign Driver</Btn>
                      <Btn size="sm" variant="ghost">🗺️ View Map</Btn>
                      <Btn size="sm" variant="ghost">📋 Deliveries</Btn>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>📊 Route Analytics</div>
            {[
              { l:"Avg. Efficiency",    v:"86.4%",  c:C.green },
              { l:"Total Distance",     v:"380 km", c:C.blue  },
              { l:"Total Fuel Est.",    v:"140 L",  c:C.amber },
              { l:"Active Routes",      v:"2",      c:C.red   },
              { l:"Completed Today",    v:"1",      c:C.green },
              { l:"Planned",            v:"1",      c:C.amber },
              { l:"Delayed Routes",     v:"1",      c:"#DC2626" },
            ].map(m=>(
              <div key={m.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:13, color:C.textM }}>{m.l}</span>
                <span style={{ fontWeight:700, fontSize:14, color:m.c }}>{m.v}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>⚙️ Optimizer Settings</div>
            {[
              { l:"Priority Mode",   v:"Delivery Time" },
              { l:"Traffic Source",  v:"Real-time"     },
              { l:"Fuel Optimize",   v:"Enabled"       },
              { l:"Time Windows",    v:"Strict"        },
              { l:"Auto Re-route",   v:"On Deviation"  },
              { l:"Load Balancing",  v:"Enabled"       },
            ].map(s=>(
              <div key={s.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ color:C.textS }}>{s.l}</span>
                <span style={{ background:C.blueL, color:C.blue, padding:"2px 9px", borderRadius:6, fontWeight:700, fontSize:11 }}>{s.v}</span>
              </div>
            ))}
            <Btn full variant="success" style={{ marginTop:14 }} onClick={()=>setAlert({t:"success",m:"Route optimization complete! All routes updated."})}>▶ Run Optimization</Btn>
          </Card>

          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>📍 Route Map</div>
            <SriLankaMap vehicles={VEHICLES.filter(v=>v.status==="on-route")} gpsLogs={GPS_LOGS} height={200} compact/>
          </Card>
        </div>
      </div>

      {/* Optimize Modal */}
      <Modal open={!!optModal} onClose={()=>setOptModal(null)} title={`Optimize: ${optModal?.name}`} subtitle="AI-powered path optimization using real-time traffic data">
        <Alert type="info" message="This will recalculate the optimal stop sequence based on current traffic, delivery priorities, and fuel efficiency targets."/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, margin:"16px 0" }}>
          <Select label="Optimization Target" value="time" onChange={()=>{}} options={[{value:"time",label:"⏱ Minimize Time"},{value:"fuel",label:"⛽ Minimize Fuel"},{value:"stops",label:"🛑 Maximize Stops"}]}/>
          <Select label="Traffic Data" value="realtime" onChange={()=>{}} options={[{value:"realtime",label:"Real-time"},{value:"historical",label:"Historical"},{value:"none",label:"Ignore"}]}/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <Btn variant="ghost" onClick={()=>setOptModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:`Route ${optModal?.id} optimized! Efficiency improved by ~5%.`}); setOptModal(null); }}>⚡ Run Optimization</Btn>
        </div>
      </Modal>

      {/* Create Route Modal */}
      <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Create New Route">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Route Name" value="" onChange={()=>{}} placeholder="e.g. Eastern Loop" required/>
          <Select label="Assign Driver" value="" onChange={()=>{}} options={[{value:"",label:"Select driver…"},...USERS.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
          <Select label="Vehicle" value="" onChange={()=>{}} options={[{value:"",label:"Select vehicle…"},...VEHICLES.map(v=>({value:v.id,label:`${v.id} — ${v.plate} (${v.type})`}))]}/>
          <Input label="Number of Stops" value="" onChange={()=>{}} type="number" placeholder="0" required/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"Route created and ready for optimization."}); setModal(null); }}>Create Route</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Deliveries (all roles — filtered by role)
// ══════════════════════════════════════════════════
export function DeliveriesPage({ user }) {
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("all");
  const [regionF, setRegionF] = useState("all");
  const [priF, setPriF]       = useState("all");
  const [tab, setTab]         = useState("all");
  const [modal, setModal]     = useState(null);
  const [selD, setSelD]       = useState(null);
  const [alert, setAlert]     = useState(null);

  // Drivers see only their deliveries
  const base = user.role==="driver" ? DELIVERIES.filter(d=>d.driver===user.id) : DELIVERIES;

  const filtered = base.filter(d=>{
    const s=search.toLowerCase();
    if (s && !d.retailer.toLowerCase().includes(s) && !d.city.toLowerCase().includes(s) && !d.id.toLowerCase().includes(s)) return false;
    if (statusF!=="all" && d.status!==statusF) return false;
    if (regionF!=="all" && d.region!==regionF) return false;
    if (priF!=="all" && d.prio!==priF) return false;
    if (tab==="delayed" && d.status!=="delayed") return false;
    if (tab==="pending" && d.status!=="pending") return false;
    if (tab==="transit" && d.status!=="in-transit") return false;
    if (tab==="done"    && d.status!=="delivered" && d.status!=="completed") return false;
    return true;
  });

  const counts = {
    all:     base.length,
    delayed: base.filter(d=>d.status==="delayed").length,
    pending: base.filter(d=>d.status==="pending").length,
    transit: base.filter(d=>d.status==="in-transit").length,
    done:    base.filter(d=>d.status==="delivered"||d.status==="completed").length,
  };

  const canCreate = ["management","dist_manager","order_team","warehouse"].includes(user.role);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Delivery Management"
        subtitle={`${base.length} deliveries · ${counts.delayed} delayed · ${counts.pending} pending`}
        actions={canCreate ? [<Btn key="c" onClick={()=>setModal("create")}>＋ New Delivery</Btn>] : []}
      />

      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      {/* Summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:18 }}>
        {[
          {l:"Total",       v:counts.all,     c:C.slate },
          {l:"Delivered",   v:counts.done,    c:C.green },
          {l:"In Transit",  v:counts.transit, c:C.blue  },
          {l:"Delayed",     v:counts.delayed, c:"#DC2626"},
          {l:"Pending",     v:counts.pending, c:C.amber },
        ].map(s=>(
          <Card key={s.l} style={{ padding:"14px 16px", textAlign:"center", borderTop:`3px solid ${s.c}`, cursor:"pointer" }}
            onClick={()=>{if(s.l==="Delayed")setTab("delayed");else if(s.l==="Pending")setTab("pending");else if(s.l==="In Transit")setTab("transit");else setTab("all");}}>
            <div style={{ fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11,color:C.textS,fontWeight:500,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom:14 }}>
        <Tabs active={tab} onChange={setTab} tabs={[
          {id:"all",     label:`All (${counts.all})`},
          {id:"transit", label:`In Transit (${counts.transit})`},
          {id:"delayed", label:`Delayed (${counts.delayed})`},
          {id:"pending", label:`Pending (${counts.pending})`},
          {id:"done",    label:`Done (${counts.done})`},
        ]}/>
      </div>

      <Card padding={0}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <Input value={search} onChange={setSearch} placeholder="Search retailer, city, ID…" icon="🔍" style={{ flex:1, minWidth:200 }}/>
          <Select value={statusF} onChange={setStatusF} style={{ width:140 }} options={[{value:"all",label:"All Status"},{value:"pending",label:"Pending"},{value:"in-transit",label:"In Transit"},{value:"delayed",label:"Delayed"},{value:"delivered",label:"Delivered"},{value:"failed",label:"Failed"}]}/>
          <Select value={regionF} onChange={setRegionF} style={{ width:130 }} options={[{value:"all",label:"All Regions"},{value:"Western",label:"Western"},{value:"Central",label:"Central"},{value:"Southern",label:"Southern"},{value:"Northern",label:"Northern"}]}/>
          <Select value={priF}    onChange={setPriF}    style={{ width:130 }} options={[{value:"all",label:"All Priority"},{value:"urgent",label:"Urgent"},{value:"high",label:"High"},{value:"normal",label:"Normal"}]}/>
          <Btn variant="ghost" size="sm" onClick={()=>{setSearch("");setStatusF("all");setRegionF("all");setPriF("all");}}>↺ Clear</Btn>
          <span style={{ fontSize:12,color:C.textS }}>{filtered.length} results</span>
        </div>
        <Table
          cols={[
            { key:"id",       label:"ID",       render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{v}</span> },
            { key:"retailer", label:"Retailer"  },
            { key:"city",     label:"City"      },
            { key:"driver",   label:"Driver",   render:v=><span style={{ fontSize:12 }}>{driverName(v)}</span> },
            { key:"veh",      label:"Vehicle",  render:v=><span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.blue }}>{v}</span> },
            { key:"prio",     label:"Priority", render:v=><Badge priority={v}/> },
            { key:"status",   label:"Status",   render:v=><Badge status={v}/> },
            { key:"items",    label:"Items",    render:v=>`${v} units` },
            { key:"eta",      label:"ETA" },
            { key:"delay",    label:"Delay",    render:v=>v>0?<span style={{color:"#DC2626",fontWeight:700,fontSize:12}}>{v}m late</span>:<span style={{color:C.green,fontSize:12}}>✓ On time</span> },
          ]}
          rows={filtered}
          onRow={row=>{ setSelD(row); setModal("detail"); }}
        />
      </Card>

      {/* Detail modal */}
      <Modal open={modal==="detail"} onClose={()=>setModal(null)} title={`Delivery ${selD?.id}`} subtitle={selD?.retailer} width={600}>
        {selD && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              <Badge status={selD.status}/><Badge priority={selD.prio}/>
              <span style={{ fontSize:12,color:C.textS,marginLeft:"auto" }}>Region: {selD.region}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[["Retailer",selD.retailer],["City",selD.city],["Driver",driverName(selD.driver)],["Vehicle",selD.veh],["Items",`${selD.items} units (${selD.kg} kg)`],["ETA",selD.eta],["Delay",selD.delay>0?`${selD.delay} minutes`:"On time"],["Last Update",selD.updated],["Created",selD.created],["Proof",selD.proof?"✅ Uploaded":"❌ Pending"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Timeline */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.textM,marginBottom:10,textTransform:"uppercase",letterSpacing:.5 }}>Delivery Timeline</div>
              {[
                { icon:"📋", text:"Order Created",        done:true,  time:selD.created },
                { icon:"👤", text:"Driver Assigned",       done:!!selD.driver, time:selD.driver?"08:30":"—" },
                { icon:"🏭", text:"Dispatched from WH",   done:!!selD.driver, time:selD.driver?"09:00":"—" },
                { icon:"🚛", text:"In Transit",            done:["in-transit","delivered","completed","delayed","failed"].includes(selD.status), time:selD.updated },
                { icon:selD.status==="failed"?"❌":"📦",   text:selD.status==="failed"?"Delivery Failed":"Delivered", done:["delivered","completed","failed"].includes(selD.status), time:selD.updated },
              ].map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"center" }}>
                  <div style={{ width:30,height:30,borderRadius:"50%",background:t.done?C.greenSoft:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{t.icon}</div>
                  <div style={{ flex:1, fontSize:12, fontWeight:600, color:t.done?C.text:C.textS }}>{t.text}</div>
                  <div style={{ fontSize:11,color:C.textS }}>{t.time}</div>
                </div>
              ))}
            </div>
            {/* Driver actions */}
            {user.role==="driver" && selD.status==="in-transit" && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Btn variant="success" onClick={()=>{ setAlert({t:"success",m:`${selD.id} marked as delivered.`}); setModal(null); }}>✅ Mark Delivered</Btn>
                <Btn variant="warning">⚠️ Report Delay</Btn>
                <Btn variant="danger"  onClick={()=>{ setAlert({t:"error",m:`${selD.id} marked as failed.`}); setModal(null); }}>❌ Mark Failed</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create modal */}
      <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Create New Delivery Order">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Retailer Name"   value="" onChange={()=>{}} placeholder="Cargills Food City" required/>
          <Input label="City"            value="" onChange={()=>{}} placeholder="Colombo 03" required/>
          <Select label="Priority"       value="normal" onChange={()=>{}} options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"normal",label:"🟢 Normal"}]}/>
          <Select label="Assign Driver"  value="" onChange={()=>{}} options={[{value:"",label:"Select driver…"},...USERS.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
          <Select label="Vehicle"        value="" onChange={()=>{}} options={[{value:"",label:"Select vehicle…"},...VEHICLES.map(v=>({value:v.id,label:`${v.id} — ${v.plate}`}))]}/>
          <Input label="Items"           value="" onChange={()=>{}} type="number" placeholder="0" required/>
          <Input label="Weight (kg)"     value="" onChange={()=>{}} type="number" placeholder="0" required/>
          <Select label="Region"         value="" onChange={()=>{}} options={[{value:"",label:"Select…"},{value:"Western",label:"Western"},{value:"Central",label:"Central"},{value:"Southern",label:"Southern"},{value:"Northern",label:"Northern"}]}/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"Delivery order created."}); setModal(null); }}>Create Delivery</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Warehouse Dispatch (role: warehouse)
// ══════════════════════════════════════════════════
export function DispatchPage() {
  const [modal, setModal] = useState(null);
  const [selD, setSelD]   = useState(null);
  const [alert, setAlert] = useState(null);
  const pending = DELIVERIES.filter(d=>d.status==="pending"||d.status==="in-transit");

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Dispatch Management" subtitle="Prepare shipments, confirm packaging, and dispatch vehicles"/>

      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          {l:"Ready to Dispatch", v:DELIVERIES.filter(d=>d.status==="pending").length,    c:C.amber},
          {l:"Dispatched Today",  v:DELIVERIES.filter(d=>d.status!=="pending").length,    c:C.blue },
          {l:"In Transit",        v:DELIVERIES.filter(d=>d.status==="in-transit").length, c:C.green},
          {l:"Vehicles Active",   v:VEHICLES.filter(v=>v.status==="on-route").length,     c:C.red  },
        ].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        <Card padding={0}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:700, fontSize:14, color:C.text }}>📤 Dispatch Queue</div>
          <Table
            cols={[
              { key:"id",       label:"Del. ID",  render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{v}</span> },
              { key:"retailer", label:"Retailer"  },
              { key:"city",     label:"City"      },
              { key:"items",    label:"Items",    render:v=>`${v} units` },
              { key:"status",   label:"Status",   render:v=><Badge status={v}/> },
              { key:"prio",     label:"Priority", render:v=><Badge priority={v}/> },
              { key:"id",       label:"Actions",  render:(v,row)=>(
                <div style={{ display:"flex", gap:6 }}>
                  <Btn size="xs" variant="primary" onClick={e=>{e.stopPropagation();setSelD(row);setModal("dispatch");}}>Dispatch</Btn>
                  <Btn size="xs" variant="ghost">Note</Btn>
                </div>
              )},
            ]}
            rows={pending}
            onRow={row=>{ setSelD(row); setModal("dispatch"); }}
          />
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:14 }}>🏭 Inventory Status</div>
            {INVENTORY.map(item=>(
              <div key={item.id} style={{ padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontSize:12,fontWeight:600,color:C.text }}>{item.product}</span>
                  <Badge status={item.status}/>
                </div>
                <div style={{ fontSize:11,color:C.textS,marginBottom:4 }}>
                  Available: <strong style={{color:item.available>0?C.green:C.red}}>{item.available}</strong> / {item.stock} {item.unit}
                </div>
                <ProgressBar value={Math.round((item.available/item.stock)*100)} height={5}/>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>📢 Notify Driver</div>
            <Select label="Select Driver" value="" onChange={()=>{}} options={[{value:"",label:"Choose driver…"},...USERS.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
            <Textarea label="Message" value="" onChange={()=>{}} placeholder="Type message to driver…" style={{ marginTop:12 }}/>
            <Btn full style={{ marginTop:12 }} onClick={()=>setAlert({t:"success",m:"Message sent to driver."})}>📨 Send Message</Btn>
          </Card>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal open={modal==="dispatch"} onClose={()=>setModal(null)} title={`Dispatch Delivery ${selD?.id}`}>
        {selD && (
          <div>
            <Alert type="info" message={`Dispatching ${selD.items} items to ${selD.retailer}, ${selD.city}`} style={{ marginBottom:16 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <Select label="Assign Driver" value="" onChange={()=>{}} options={[{value:"",label:"Select…"},...USERS.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
              <Select label="Vehicle" value="" onChange={()=>{}} options={[{value:"",label:"Select…"},...VEHICLES.map(v=>({value:v.id,label:`${v.id} — ${v.plate}`}))]}/>
            </div>
            <Textarea label="Dispatch Notes" value="" onChange={()=>{}} placeholder="e.g. Handle with care, refrigerated items" style={{ marginBottom:16 }}/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
              <Btn variant="success" onClick={()=>{ setAlert({t:"success",m:`Delivery ${selD.id} dispatched successfully!`}); setModal(null); }}>🚛 Confirm Dispatch</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Inventory (role: warehouse)
// ══════════════════════════════════════════════════
export function InventoryPage() {
  const [modal, setModal] = useState(false);
  const [alert, setAlert] = useState(null);
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Inventory Management" subtitle="Track stock, reservations, and outbound shipments"
        actions={[<Btn key="a" onClick={()=>setModal(true)}>＋ Add SKU</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}
      <Card padding={0}>
        <Table
          cols={[
            { key:"id",        label:"SKU",       render:v=><span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.blue }}>{v}</span> },
            { key:"product",   label:"Product"    },
            { key:"stock",     label:"Total Stock",render:v=><strong>{v}</strong> },
            { key:"reserved",  label:"Reserved",  render:v=><span style={{ color:C.amber,fontWeight:600 }}>{v}</span> },
            { key:"available", label:"Available", render:v=><span style={{ color:v>0?C.green:C.red,fontWeight:700 }}>{v}</span> },
            { key:"unit",      label:"Unit"       },
            { key:"status",    label:"Status",    render:v=><Badge status={v}/> },
            { key:"stock",     label:"Level",     render:(v,row)=><div style={{ width:80 }}><ProgressBar value={Math.round((row.available/row.stock)*100)} height={6}/></div> },
          ]}
          rows={INVENTORY}
        />
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add New SKU">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="SKU ID" value="" onChange={()=>{}} placeholder="e.g. SKU006" required/>
          <Input label="Product Name" value="" onChange={()=>{}} placeholder="e.g. Nescafe 500g" required/>
          <Input label="Total Stock" value="" onChange={()=>{}} type="number" placeholder="0" required/>
          <Select label="Unit" value="pcs" onChange={()=>{}} options={[{value:"pcs",label:"Pieces"},{value:"kg",label:"Kilograms"},{value:"ltr",label:"Litres"}]}/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"New SKU added to inventory."}); setModal(false); }}>Add SKU</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Driver — My Deliveries
// ══════════════════════════════════════════════════
export function MyDeliveryPage({ user }) {
  const myDels  = DELIVERIES.filter(d=>d.driver===user.id);
  const [modal, setModal] = useState(null);
  const [selD, setSelD]   = useState(null);
  const [alert, setAlert] = useState(null);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="My Deliveries" subtitle={`${myDels.length} assigned deliveries for today`}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          {l:"Total Assigned", v:myDels.length,                                              c:C.blue  },
          {l:"Delivered",      v:myDels.filter(d=>d.status==="delivered").length,            c:C.green },
          {l:"In Transit",     v:myDels.filter(d=>d.status==="in-transit").length,           c:C.amber },
          {l:"Remaining",      v:myDels.filter(d=>d.status==="pending"||d.status==="in-transit").length, c:C.red },
        ].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      {myDels.length===0 ? (
        <Card><Empty icon="📦" title="No deliveries assigned" sub="Contact your distribution manager for assignment"/></Card>
      ) : (
        <div style={{ display:"grid", gap:12 }}>
          {myDels.map((d,i)=>(
            <Card key={d.id} className="hover-lift" style={{ cursor:"pointer" }} onClick={()=>{ setSelD(d); setModal("detail"); }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span style={{ fontWeight:800,fontSize:14,color:C.red,fontFamily:"'JetBrains Mono',monospace" }}>{d.id}</span>
                    <Badge status={d.status}/>
                    <Badge priority={d.prio}/>
                  </div>
                  <div style={{ fontWeight:700,fontSize:15,color:C.text }}>{d.retailer}</div>
                  <div style={{ fontSize:13,color:C.textS,marginTop:3 }}>📍 {d.city} · {d.items} units ({d.kg} kg)</div>
                  <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>🕐 ETA: {d.eta} {d.delay>0&&<span style={{color:"#DC2626",fontWeight:700}}>({d.delay}m delayed)</span>}</div>
                  {d.note && <div style={{ fontSize:12,color:C.amber,marginTop:4 }}>⚠️ {d.note}</div>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                  {d.status==="in-transit" && <>
                    <Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setAlert({t:"success",m:`${d.id} marked delivered!`});}}>✅ Delivered</Btn>
                    <Btn size="sm" variant="warning" onClick={e=>{e.stopPropagation();}}>⚠️ Delay</Btn>
                    <Btn size="sm" variant="danger"  onClick={e=>{e.stopPropagation();setAlert({t:"error",m:`${d.id} marked as failed.`});}}>❌ Failed</Btn>
                  </>}
                  {d.proof && <div style={{ fontSize:11,color:C.green,fontWeight:600 }}>✅ Proof uploaded</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal==="detail"} onClose={()=>setModal(null)} title={`Delivery ${selD?.id}`}>
        {selD && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}><Badge status={selD.status}/><Badge priority={selD.prio}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[["Retailer",selD.retailer],["City",selD.city],["Items",`${selD.items} units`],["Weight",`${selD.kg} kg`],["Vehicle",selD.veh],["ETA",selD.eta]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            {selD.status==="in-transit" && (
              <>
                <Divider label="Update Status"/>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="success" full onClick={()=>{ setAlert({t:"success",m:"Delivery confirmed!"}); setModal(null); }}>✅ Confirm Delivery</Btn>
                  <Btn variant="warning" style={{ flex:1 }}>📸 Upload Proof</Btn>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Driver Navigation
// ══════════════════════════════════════════════════
export function NavigationPage({ user }) {
  const myDels = DELIVERIES.filter(d=>d.driver===user.id&&d.status==="in-transit");
  const myVeh  = VEHICLES.find(v=>v.driver===user.id);
  const myRoute = myVeh ? ROUTES.find(r=>r.veh===myVeh.id) : null;

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Navigation & Route" subtitle="Your assigned route and live navigation"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        <Card>
          <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:14 }}>🧭 Route Map</div>
          <SriLankaMap vehicles={myVeh?[myVeh]:[]} gpsLogs={GPS_LOGS} height={380}/>
          {myVeh && (
            <div style={{ marginTop:14, display:"flex", gap:8 }}>
              <Btn full variant="primary">▶ Start Navigation</Btn>
              <Btn variant="danger" style={{ flexShrink:0 }}>🚨 Emergency</Btn>
            </div>
          )}
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {myVeh && (
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:12 }}>🚛 My Vehicle</div>
              {[["Plate",myVeh.plate],["Type",myVeh.type],["Fuel",`${myVeh.fuel}%`]].map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
                  <span style={{ color:C.textS }}>{k}</span>
                  <span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10 }}><ProgressBar value={myVeh.fuel} height={8} label/></div>
            </Card>
          )}
          {myRoute && (
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:12 }}>📋 My Route</div>
              <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>{myRoute.name}</div>
              {myRoute.seq.map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
                  <div style={{ width:20,height:20,borderRadius:"50%",background:C.red+"18",color:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0 }}>{i+1}</div>
                  <span style={{ color:C.textM }}>{s}</span>
                  {myDels.find(d=>d.city===s) && <Badge status="in-transit"/>}
                </div>
              ))}
            </Card>
          )}
          {!myVeh && <Card><Empty icon="🚛" title="No vehicle assigned" sub="Contact your manager"/></Card>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Retailer — My Orders
// ══════════════════════════════════════════════════
export function RetailerOrdersPage({ user }) {
  const myOrders = ORDERS.slice(0,3); // Demo: show first 3
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="My Orders" subtitle="Track your Nestlé delivery orders"/>
      <div style={{ display:"grid", gap:14 }}>
        {myOrders.map(o=>(
          <Card key={o.id} className="hover-lift">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.red,fontSize:13 }}>{o.id}</span>
                  <Badge status={o.status}/><Badge priority={o.prio}/>
                </div>
                <div style={{ fontWeight:700,fontSize:15,color:C.text }}>{o.retailer}</div>
                <div style={{ fontSize:13,color:C.textS,marginTop:3 }}>📍 {o.city} · {o.items} items · {o.kg} kg</div>
                <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>🕐 Window: {o.window||"Not set"}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                <Badge status={o.stock} custom={{ bg: o.stock==="confirmed"?C.greenSoft:C.amberSoft, fg: o.stock==="confirmed"?C.green:C.amber, label: o.stock==="confirmed"?"Stock Ready":"Pending Stock" }}/>
                <Btn size="sm" variant="ghost">📞 Contact</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RetailerTrackingPage() {
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Track My Delivery" subtitle="Live delivery tracking for your orders"/>
      <Card>
        <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:14 }}>🗺️ Delivery Map</div>
        <SriLankaMap vehicles={VEHICLES.filter(v=>v.status==="on-route")} gpsLogs={GPS_LOGS} height={360}/>
      </Card>
    </div>
  );
}

export function RetailerHistoryPage() {
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Order History" subtitle="Past deliveries and documentation"/>
      <Card padding={0}>
        <Table
          cols={[
            { key:"id",       label:"Order ID",  render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{v}</span> },
            { key:"retailer", label:"Retailer"   },
            { key:"city",     label:"City"       },
            { key:"status",   label:"Status",    render:v=><Badge status={v}/> },
            { key:"items",    label:"Items",     render:v=>`${v} units` },
            { key:"id",       label:"Actions",   render:v=><Btn size="xs" variant="ghost">⬇ Invoice</Btn> },
          ]}
          rows={ORDERS}
        />
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Reports (role: management)
// ══════════════════════════════════════════════════
export function ReportsPage() {
  const [tab, setTab]       = useState("summary");
  const [dateFrom, setFrom] = useState("2025-01-01");
  const [dateTo,   setTo]   = useState("2025-01-31");
  const [driverF,  setDrv]  = useState("all");
  const [regionF,  setReg]  = useState("all");
  const [alert, setAlert]   = useState(null);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Reports & Analytics"
        subtitle="Performance KPIs, delivery analytics, and exportable reports"
        actions={[
          <Btn key="p" variant="ghost" size="sm" onClick={()=>setAlert({t:"success",m:"PDF report generated and downloading…"})}>⬇ Export PDF</Btn>,
          <Btn key="x" variant="ghost" size="sm" onClick={()=>setAlert({t:"success",m:"Excel report generated and downloading…"})}>⬇ Export Excel</Btn>,
        ]}
      />

      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      {/* Filters */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
          <Input label="From"   type="date" value={dateFrom} onChange={setFrom} style={{ width:160 }}/>
          <Input label="To"     type="date" value={dateTo}   onChange={setTo}   style={{ width:160 }}/>
          <Select label="Driver" value={driverF} onChange={setDrv} style={{ width:180 }} options={[{value:"all",label:"All Drivers"},...USERS.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
          <Select label="Region" value={regionF} onChange={setReg} style={{ width:150 }} options={[{value:"all",label:"All Regions"},{value:"Western",label:"Western"},{value:"Central",label:"Central"},{value:"Southern",label:"Southern"},{value:"Northern",label:"Northern"}]}/>
          <Btn>Apply Filters</Btn>
        </div>
      </Card>

      <div style={{ marginBottom:16 }}>
        <Tabs active={tab} onChange={setTab} tabs={[
          {id:"summary",  label:"📊 Summary"},
          {id:"driver",   label:"👤 Driver Performance"},
          {id:"fuel",     label:"⛽ Fuel Analysis"},
          {id:"delivery", label:"📦 Delivery Details"},
        ]}/>
      </div>

      {tab==="summary" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
            <KPICard label="Total Deliveries"  value="136"    sub="Jan 2025"       icon="📦" color={C.blue}  trend="+12 vs Dec" trendUp={true}/>
            <KPICard label="On-Time Rate"       value="87%"    sub="Target: 90%"   icon="✅" color={C.green} trend="+2% vs Dec"  trendUp={true}/>
            <KPICard label="Avg Delay"          value="18 min" sub="Per delivery"  icon="⏱" color={C.amber} trend="-3min vs Dec" trendUp={true}/>
            <KPICard label="Fuel Efficiency"    value="94%"    sub="vs benchmark"  icon="⛽" color={C.red}   trend="+1% vs Dec"  trendUp={true}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>📦 Monthly Delivery Volume</div>
              <div style={{ fontSize:11,color:C.textS,marginBottom:14 }}>Total H1 2025: 928 deliveries</div>
              <BarChart data={KPI_HISTORY.monthly_deliveries} color={C.red} showValues/>
            </Card>
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>✅ On-Time Rate Trend (%)</div>
              <div style={{ fontSize:11,color:C.textS,marginBottom:14 }}>Target: 90% · Current avg: 87%</div>
              <LineChart data={KPI_HISTORY.on_time_rate} color={C.green} showValues/>
            </Card>
          </div>
        </div>
      )}

      {tab==="driver" && (
        <Card padding={0}>
          <Table
            cols={[
              { key:"name",        label:"Driver"        },
              { key:"deliveries",  label:"Deliveries",   render:v=><strong>{v}</strong> },
              { key:"onTime",      label:"On-Time",      render:v=><span style={{ color:C.green,fontWeight:700 }}>{v}</span> },
              { key:"rate",        label:"Rate",         render:v=><span style={{ fontWeight:800,color:v>=90?C.green:v>=80?C.amber:"#DC2626" }}>{v}%</span> },
              { key:"fuel",        label:"Fuel Used"     },
              { key:"avgDelay",    label:"Avg Delay"     },
            ]}
            rows={KPI_HISTORY.driver_perf}
          />
        </Card>
      )}

      {tab==="fuel" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>⛽ Daily Fuel Consumption (L)</div>
            <div style={{ fontSize:11,color:C.textS,marginBottom:14 }}>Weekly avg: 46L/day</div>
            <BarChart data={KPI_HISTORY.fuel_daily} color={C.amber} showValues/>
          </Card>
          <Card>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:14 }}>Vehicle Fuel Levels</div>
            {VEHICLES.map(v=>(
              <div key={v.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontWeight:600,fontSize:13,fontFamily:"'JetBrains Mono',monospace" }}>{v.id}</span>
                <span style={{ fontSize:12,color:C.textS }}>{v.plate}</span>
                <div style={{ display:"flex",alignItems:"center",gap:10,width:160 }}>
                  <ProgressBar value={v.fuel} height={6} style={{ flex:1 }}/>
                  <span style={{ fontSize:12,fontWeight:700,width:38 }}>{v.fuel}%</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="delivery" && (
        <Card padding={0}>
          <Table
            cols={[
              { key:"id",       label:"ID",       render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{v}</span> },
              { key:"retailer", label:"Retailer"  },
              { key:"city",     label:"City"      },
              { key:"status",   label:"Status",   render:v=><Badge status={v}/> },
              { key:"prio",     label:"Priority", render:v=><Badge priority={v}/> },
              { key:"items",    label:"Items",    render:v=>`${v} units` },
              { key:"delay",    label:"Delay",    render:v=>v>0?<span style={{color:"#DC2626"}}>{v}m late</span>:<span style={{color:C.green}}>✓</span> },
              { key:"region",   label:"Region"   },
            ]}
            rows={DELIVERIES}
          />
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Users (role: management/admin)
// ══════════════════════════════════════════════════
export function UsersPage() {
  const [modal, setModal] = useState(null);
  const [selU, setSelU]   = useState(null);
  const [alert, setAlert] = useState(null);
  const [form, setForm]   = useState({ name:"", email:"", role:"", dept:"", pw:"" });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="User Management"
        subtitle={`${USERS.length} registered users · ${Object.keys(ROLE_LABELS).length} roles`}
        actions={[<Btn key="a" onClick={()=>setModal("create")}>＋ Add User</Btn>]}
      />
      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      {/* Role summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:18 }}>
        {Object.entries(ROLE_LABELS).map(([r,l])=>(
          <Card key={r} style={{ padding:"12px 14px", borderTop:`3px solid ${ROLE_COLORS[r]}`, textAlign:"center" }}>
            <div style={{ fontSize:22,fontWeight:800,color:ROLE_COLORS[r] }}>{USERS.filter(u=>u.role===r).length}</div>
            <div style={{ fontSize:10,color:C.textS,marginTop:2,lineHeight:1.4 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <Table
          cols={[
            { key:"avatar",  label:"",      render:(v,r)=><Avatar initials={v} color={ROLE_COLORS[r.role]} size={34}/> },
            { key:"name",    label:"Name",  render:v=><span style={{ fontWeight:700 }}>{v}</span> },
            { key:"email",   label:"Email", render:v=><span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.textS }}>{v}</span> },
            { key:"role",    label:"Role",  render:v=><span style={{ background:ROLE_COLORS[v]+"15",color:ROLE_COLORS[v],padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:700 }}>{ROLE_LABELS[v]}</span> },
            { key:"dept",    label:"Department" },
            { key:"phone",   label:"Phone",    render:v=><span style={{ fontSize:12 }}>{v}</span> },
            { key:"joined",  label:"Joined"    },
            { key:"active",  label:"Status",   render:v=><Badge status={v?"active":"offline"}/> },
            { key:"id",      label:"Actions",  render:(v,row)=>(
              <div style={{ display:"flex", gap:5 }}>
                <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();setSelU(row);setModal("edit");}}>✏️</Btn>
                <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();setAlert({t:"warning",m:`${row.name} deactivated.`});}}>🚫</Btn>
              </div>
            )},
          ]}
          rows={USERS}
          onRow={u=>{ setSelU(u); setModal("view"); }}
        />
      </Card>

      {/* View Modal */}
      <Modal open={modal==="view"} onClose={()=>setModal(null)} title="User Profile">
        {selU && (
          <div>
            <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20 }}>
              <Avatar initials={selU.avatar} color={ROLE_COLORS[selU.role]} size={60}/>
              <div>
                <div style={{ fontSize:18,fontWeight:800,color:C.text }}>{selU.name}</div>
                <div style={{ fontSize:13,color:ROLE_COLORS[selU.role],fontWeight:600 }}>{ROLE_LABELS[selU.role]}</div>
                <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{selU.dept}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["Email",selU.email],["Phone",selU.phone],["Department",selU.dept],["Joined",selU.joined]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Add New User">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Full Name"    value={form.name}  onChange={v=>setF("name",v)}  placeholder="e.g. Kasun Perera" required/>
          <Input label="Email"        value={form.email} onChange={v=>setF("email",v)} placeholder="user@nestle.lk"   type="email" required/>
          <Select label="Role"        value={form.role}  onChange={v=>setF("role",v)}  options={[{value:"",label:"Select role…"},...Object.entries(ROLE_LABELS).map(([v,l])=>({value:v,label:l}))]} required/>
          <Input label="Department"   value={form.dept}  onChange={v=>setF("dept",v)}  placeholder="e.g. Logistics"/>
          <Input label="Password"     value={form.pw}    onChange={v=>setF("pw",v)}    placeholder="Min. 8 characters" type="password" required/>
          <Input label="Confirm PW"   value=""           onChange={()=>{}}             placeholder="Repeat password"  type="password" required/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"User created. Activation email sent."}); setModal(null); }}>Create User</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Vehicles (management, route_planner)
// ══════════════════════════════════════════════════
export function VehiclesPage() {
  const [modal, setModal] = useState(null);
  const [selV, setSelV]   = useState(null);
  const [alert, setAlert] = useState(null);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Fleet Management"
        subtitle={`${VEHICLES.length} vehicles · ${VEHICLES.filter(v=>v.status==="on-route").length} active`}
        actions={[<Btn key="a" onClick={()=>setModal("create")}>＋ Add Vehicle</Btn>]}
      />
      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          {l:"Total Fleet",    v:VEHICLES.length,                              c:C.navy },
          {l:"On Route",       v:VEHICLES.filter(v=>v.status==="on-route").length,  c:C.green},
          {l:"Idle",           v:VEHICLES.filter(v=>v.status==="idle").length,      c:C.slate},
          {l:"Issues/Delayed", v:VEHICLES.filter(v=>v.status==="delayed").length,   c:"#DC2626"},
        ].map(s=>(
          <KPICard key={s.l} label={s.l} value={s.v} sub="" icon="🚛" color={s.c}/>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {VEHICLES.map(v=>{
          const driver = USERS.find(u=>u.id===v.driver);
          return (
            <Card key={v.id} className="hover-lift" style={{ cursor:"pointer" }} onClick={()=>{ setSelV(v); setModal("detail"); }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:800,fontSize:15,color:C.text,fontFamily:"'JetBrains Mono',monospace" }}>{v.id}</div>
                  <div style={{ fontSize:12,color:C.textS,marginTop:1 }}>{v.plate}</div>
                </div>
                <Badge status={v.status}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {[["TYPE",v.type],["CAP",v.cap],["KM",v.km],["DRIVER",driver?.name.split(" ")[0]||"—"]].map(([k,val])=>(
                  <div key={k} style={{ background:"#F8FAFC",padding:"8px 10px",borderRadius:8 }}>
                    <div style={{ fontSize:9,color:C.textS,fontWeight:700 }}>{k}</div>
                    <div style={{ fontWeight:700,fontSize:12,marginTop:1 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11,color:C.textS,marginBottom:4,display:"flex",justifyContent:"space-between" }}>
                <span>Fuel Level</span>
                <span style={{ fontWeight:700,color:v.fuel<30?"#DC2626":v.fuel<60?C.amber:C.green }}>{v.fuel}%</span>
              </div>
              <ProgressBar value={v.fuel} height={7}/>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal open={modal==="detail"} onClose={()=>setModal(null)} title={`Vehicle ${selV?.id}`} subtitle={selV?.plate}>
        {selV && (
          <div>
            <div style={{ marginBottom:16 }}><Badge status={selV.status}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              {[["Plate",selV.plate],["Type",selV.type],["Capacity",selV.cap],["Mileage",selV.km],["Fuel",`${selV.fuel}%`],["Driver",USERS.find(u=>u.id===selV.driver)?.name||"Unassigned"],["Last Service",selV.lastService],["Next Service",selV.nextService]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>{ setAlert({t:"success",m:`Maintenance scheduled for ${selV.id}.`}); setModal(null); }}>🔧 Schedule Maintenance</Btn>
              <Btn variant="ghost">⛽ Log Fuel</Btn>
              <Btn variant="danger" onClick={()=>{ setAlert({t:"warning",m:`${selV.id} marked offline.`}); setModal(null); }}>🚫 Mark Offline</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Add New Vehicle">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Vehicle ID"    value="" onChange={()=>{}} placeholder="e.g. V006" required/>
          <Input label="License Plate" value="" onChange={()=>{}} placeholder="e.g. NB-1111" required/>
          <Select label="Type" value="" onChange={()=>{}} options={[{value:"",label:"Select…"},{value:"Heavy Lorry",label:"Heavy Lorry"},{value:"Mini Truck",label:"Mini Truck"},{value:"Cargo Van",label:"Cargo Van"}]}/>
          <Input label="Capacity"      value="" onChange={()=>{}} placeholder="e.g. 3 Ton" required/>
          <Input label="Year"          value="" onChange={()=>{}} type="number" placeholder="2024"/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"Vehicle added to fleet!"}); setModal(null); }}>Add Vehicle</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Retailers (order_team)
// ══════════════════════════════════════════════════
export function RetailersPage() {
  const [modal, setModal] = useState(false);
  const [alert, setAlert] = useState(null);
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Retailer & Wholesaler Management"
        subtitle={`${RETAILERS.length} retailers in database`}
        actions={[<Btn key="a" onClick={()=>setModal(true)}>＋ Add Retailer</Btn>]}
      />
      {alert && <Alert type={alert.t} message={alert.m} onClose={()=>setAlert(null)} style={{ marginBottom:14 }}/>}
      <Card padding={0}>
        <Table
          cols={[
            { key:"id",      label:"ID",      render:v=><span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.blue }}>{v}</span> },
            { key:"name",    label:"Retailer", render:v=><span style={{ fontWeight:700 }}>{v}</span> },
            { key:"city",    label:"City"      },
            { key:"contact", label:"Contact"   },
            { key:"orders",  label:"Total Orders", render:v=><strong>{v}</strong> },
            { key:"lastDel", label:"Last Delivery" },
            { key:"status",  label:"Status",  render:v=><Badge status={v}/> },
            { key:"id",      label:"Actions", render:v=><div style={{display:"flex",gap:5}}><Btn size="xs" variant="ghost">✏️ Edit</Btn><Btn size="xs" variant="ghost">📦 Orders</Btn></div> },
          ]}
          rows={RETAILERS}
        />
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add New Retailer">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Retailer Name" value="" onChange={()=>{}} placeholder="e.g. Arpico Kandy" required/>
          <Input label="City"          value="" onChange={()=>{}} placeholder="e.g. Kandy" required/>
          <Input label="Contact"       value="" onChange={()=>{}} placeholder="+94 xx xxx xxxx"/>
          <Input label="Email"         value="" onChange={()=>{}} placeholder="manager@retailer.lk" type="email"/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={()=>{ setAlert({t:"success",m:"Retailer added to database."}); setModal(false); }}>Add Retailer</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Messages (all roles)
// ══════════════════════════════════════════════════
export function MessagesPage({ user }) {
  const [selContact, setSel]    = useState(null);
  const [msgText, setMsgText]   = useState("");
  const [msgs, setMsgs]         = useState(MESSAGES);
  const [announcement, setAnn]  = useState("");
  const [tab, setTab]           = useState("chat");

  const contacts = USERS.filter(u=>u.id!==user.id);
  const thread   = selContact ? msgs.filter(m=>(m.from===user.id&&m.to===selContact.id)||(m.from===selContact.id&&m.to===user.id)) : [];
  const unreadFor = (cid) => msgs.filter(m=>m.from===cid&&m.to===user.id&&!m.read).length;

  const sendMsg = () => {
    if (!msgText.trim()||!selContact) return;
    setMsgs(prev=>[...prev,{ id:Date.now(),from:user.id,to:selContact.id,text:msgText,time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}),read:false }]);
    setMsgText("");
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Communication Center" subtitle="In-app messaging, broadcasts, and escalation"/>

      <div style={{ marginBottom:14 }}>
        <Tabs active={tab} onChange={setTab} tabs={[{id:"chat",label:"💬 Direct Messages"},{id:"broadcast",label:"📢 Announcements"},{id:"notifications",label:"🔔 Notifications"}]}/>
      </div>

      {tab==="chat" && (
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16, height:540 }}>
          {/* Contact list */}
          <Card padding={0} style={{ overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, fontWeight:800, fontSize:13, color:C.text }}>Team Members</div>
            <div style={{ overflowY:"auto", height:"calc(100% - 48px)" }}>
              {contacts.map(c=>{
                const unread = unreadFor(c.id);
                return (
                  <div key={c.id} onClick={()=>setSel(c)}
                    style={{ display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:selContact?.id===c.id?"#FFF0F3":"white",transition:"background .1s" }}>
                    <Avatar initials={c.avatar} color={ROLE_COLORS[c.role]} size={34}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:12,color:C.text }}>{c.name}</div>
                      <div style={{ fontSize:10,color:ROLE_COLORS[c.role],fontWeight:600 }}>{ROLE_LABELS[c.role]}</div>
                    </div>
                    {unread>0 && <div style={{ width:18,height:18,borderRadius:"50%",background:C.red,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{unread}</div>}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Chat window */}
          <Card padding={0} style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {selContact ? (
              <>
                <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar initials={selContact.avatar} color={ROLE_COLORS[selContact.role]} size={34}/>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:C.text }}>{selContact.name}</div>
                    <div style={{ fontSize:11,color:C.green }}>● Online · {ROLE_LABELS[selContact.role]}</div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", gap:7 }}>
                    <Btn size="sm" variant="ghost">📞 Call</Btn>
                    <Btn size="sm" variant="danger">🚨 Emergency</Btn>
                  </div>
                </div>
                <div style={{ flex:1, overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:10 }}>
                  {thread.length===0 && <Empty icon="💬" title="No messages yet" sub="Start the conversation!"/>}
                  {thread.map(m=>{
                    const isMe = m.from===user.id;
                    return (
                      <div key={m.id} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start" }}>
                        <div style={{ maxWidth:"72%", background:isMe?C.red:"#F1F5F9", color:isMe?"white":C.text, padding:"10px 14px", borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px", fontSize:13, lineHeight:1.5 }}>
                          <div>{m.text}</div>
                          <div style={{ fontSize:10,opacity:.65,marginTop:4,textAlign:"right" }}>{m.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding:"10px 14px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8 }}>
                  <input value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message…"
                    style={{ flex:1,padding:"9px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none" }}/>
                  <Btn onClick={sendMsg} disabled={!msgText.trim()}>Send →</Btn>
                </div>
              </>
            ) : <Empty icon="💬" title="Select a contact" sub="Choose a team member from the left panel"/>}
          </Card>
        </div>
      )}

      {tab==="broadcast" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
          <Card>
            <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:14 }}>📢 Send Announcement</div>
            <Select label="Target Audience" value="all" onChange={()=>{}} options={[{value:"all",label:"All Staff"},{value:"driver",label:"Drivers Only"},{value:"warehouse",label:"Warehouse Only"},{value:"management",label:"Management Only"}]} style={{ marginBottom:14 }}/>
            <Select label="Priority" value="normal" onChange={()=>{}} options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"normal",label:"🟢 Normal"}]} style={{ marginBottom:14 }}/>
            <Textarea label="Announcement Message" value={announcement} onChange={setAnn} placeholder="Type your announcement here…" rows={5} style={{ marginBottom:14 }}/>
            <Btn full onClick={()=>setAnn("")}>📨 Send Announcement</Btn>
          </Card>
          <Card>
            <div style={{ fontWeight:800,fontSize:14,color:C.text,marginBottom:14 }}>📋 Recent Broadcasts</div>
            {[
              { msg:"All drivers: Please confirm fuel levels before departure.", time:"08:00", by:"Management" },
              { msg:"Warehouse: D006 cargo ready for loading. Please confirm.", time:"07:30", by:"Dist. Manager" },
              { msg:"Route R003 has high traffic on A2 highway. Adjust ETA.",   time:"07:00", by:"Route Planner" },
            ].map((b,i)=>(
              <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:12,color:C.text,marginBottom:4 }}>{b.msg}</div>
                <div style={{ fontSize:10,color:C.textS }}>{b.by} · {b.time}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="notifications" && (
        <Card padding={0}>
          <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontWeight:700,fontSize:14,color:C.text }}>All Notifications</span>
            <span style={{ fontSize:12,color:C.red,cursor:"pointer",fontWeight:600 }}>Mark all read</span>
          </div>
          {NOTIFICATIONS.map(n=>(
            <div key={n.id} style={{ display:"flex",gap:12,padding:"13px 18px",background:n.read?"white":"#FFFBFB",borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:18,flexShrink:0 }}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{n.title}</div>
                <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{n.msg}</div>
              </div>
              <div style={{ fontSize:11,color:C.slateL,whiteSpace:"nowrap" }}>{n.time}</div>
              {!n.read && <div style={{ width:7,height:7,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:5 }}/>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
