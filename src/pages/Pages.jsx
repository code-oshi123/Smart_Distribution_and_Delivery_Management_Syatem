// ═══════════════════════════════════════════════════
// ALL PAGES — Nestlé Sri Lanka DMS
// Every create/edit/delete is wired to DB → persists
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useDB, KPI_HISTORY } from "../data/db";
import { C, ROLE_COLORS, ROLE_LABELS } from "../styles/theme";
import { Card, KPICard, SectionHeader, Badge, ProgressBar, Table, Btn, Input, Select, Textarea, Modal, Tabs, Alert, Avatar, Empty, Divider } from "../components/UI";
import { SriLankaMap, BarChart, LineChart } from "../components/Charts";

const driverName  = (id, users) => users.find(u => u.id === id)?.name || "Unassigned";
const effColor    = e => e >= 90 ? C.green : e >= 75 ? C.amber : C.red;
const trafficColor = t => ({ Low: C.green, Moderate: C.amber, High: C.red })[t] || C.slate;
const nowTime     = () => new Date().toLocaleTimeString("en-LK", { hour:"2-digit", minute:"2-digit" });

// ══════════════════════════════════════════════════
// PAGE: Tracking (management, route_planner)
// ══════════════════════════════════════════════════
export function TrackingPage() {
  const { vehicles, gpsLogs, deliveries, notifications, users } = useDB();
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 4000); return () => clearInterval(t); }, []);

  const selV   = vehicles.find(v => v.id === selected);
  const selLog = selV ? gpsLogs.find(g => g.veh === selV.id) : null;
  const selDrv = selV?.driver ? users.find(u => u.id === selV.driver) : null;
  const selDels = selV ? deliveries.filter(d => d.veh === selV.id) : [];

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Real-Time Vehicle Tracking" subtitle={`GPS auto-refresh · Last sync: ${new Date().toLocaleTimeString()}`}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:15, color:C.text }}>🗺️ Live Fleet Map</div>
              <div style={{ background:C.greenL, borderRadius:7, padding:"4px 12px", fontSize:11, color:C.green, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite" }}/>
                LIVE · Tick #{tick}
              </div>
            </div>
            <SriLankaMap vehicles={vehicles} gpsLogs={gpsLogs} onSelect={v => setSelected(v.id === selected ? null : v.id)} selected={selected} height={400}/>
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {vehicles.map(v => (
              <Card key={v.id} onClick={() => setSelected(v.id === selected ? null : v.id)} className="hover-lift"
                style={{ padding:"12px 10px", textAlign:"center", cursor:"pointer", border:`2px solid ${selected === v.id ? C.red : C.border}`, transition:"all .18s" }}>
                <div style={{ fontWeight:800, fontSize:13, color:selected === v.id ? C.red : C.text, fontFamily:"monospace" }}>{v.id}</div>
                <div style={{ fontSize:10, color:C.textS, margin:"3px 0 7px", fontFamily:"monospace" }}>{v.plate}</div>
                <Badge status={v.status}/>
                <div style={{ marginTop:8 }}><ProgressBar value={v.fuel} height={4}/><div style={{ fontSize:9,color:C.textS,marginTop:2 }}>{v.fuel}% fuel</div></div>
              </Card>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>{selV ? `${selV.id} — Inspector` : "🔍 Select Vehicle"}</div>
            {selV ? (
              <>
                <div style={{ marginBottom:12 }}><Badge status={selV.status}/></div>
                {[["🚛 Vehicle",`${selV.plate} (${selV.type})`],["⚖️ Capacity",selV.cap],["👤 Driver",selDrv?.name||"Unassigned"],["📍 Location",selLog?`${selLog.lat.toFixed(4)}, ${selLog.lng.toFixed(4)}`:"Unknown"],["⚡ Speed",selLog?.speed||"—"],["🧭 Heading",selLog?.heading||"—"],["📏 Mileage",selV.km],["🔧 Next Svc",selV.nextService]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
                    <span style={{ color:C.textS }}>{k}</span>
                    <span style={{ fontWeight:600,color:C.text,textAlign:"right",maxWidth:180 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:12 }}><div style={{ fontSize:11,color:C.textS,fontWeight:700,marginBottom:5 }}>FUEL LEVEL</div><ProgressBar value={selV.fuel} height={8} label/></div>
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:11,color:C.textS,fontWeight:700,marginBottom:8 }}>ASSIGNED DELIVERIES ({selDels.length})</div>
                  {selDels.slice(0,3).map(d => (
                    <div key={d.id} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:11,borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontFamily:"monospace",color:C.red,fontWeight:600 }}>{d.id}</span>
                      <span style={{ color:C.textM }}>{d.retailer.split(" ")[0]}</span>
                      <Badge status={d.status}/>
                    </div>
                  ))}
                </div>
              </>
            ) : <Empty icon="🗺️" title="No vehicle selected" sub="Click a vehicle on the map or cards above"/>}
          </Card>
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>📡 GPS Activity Log</div>
            {gpsLogs.map((g,i) => (
              <div key={i} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center" }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,animation:"pulse-dot 2s infinite" }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:C.text,fontFamily:"monospace" }}>{g.veh}</div>
                  <div style={{ fontSize:11,color:C.textS }}>{g.lat.toFixed(3)}, {g.lng.toFixed(3)} · {g.speed}</div>
                </div>
                <div style={{ fontSize:10,color:C.slateL }}>{g.time}</div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:12 }}>🚨 Active Alerts</div>
            {notifications.filter(n => !n.read).slice(0,4).map(n => (
              <div key={n.id} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
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
// PAGE: Orders (order_team)
// ══════════════════════════════════════════════════
export function OrdersPage({ user }) {
  const { orders, addOrder, updateOrder, deleteOrder } = useDB();
  const [modal, setModal]   = useState(null);
  const [selO, setSelO]     = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert]   = useState(null);
  const blank = { retailer:"", city:"", items:"", kg:"", prio:"normal", window:"", stock:"pending" };
  const [form, setForm] = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const filtered = orders.filter(o => !search ||
    o.retailer.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.retailer || !form.city || !form.items || !form.kg) {
      setAlert({ t:"error", m:"Please fill all required fields." }); return;
    }
    addOrder({ ...form, items: Number(form.items), kg: Number(form.kg) });
    setAlert({ t:"success", m:"✅ New order created successfully!" });
    setModal(null); setForm(blank);
  };

  const handleDelete = (o) => {
    deleteOrder(o.id);
    setAlert({ t:"warning", m:`Order ${o.id} cancelled and removed.` });
    setModal(null);
  };

  const handleStatusChange = (id, status) => {
    updateOrder(id, { status });
    setAlert({ t:"success", m:`Order status updated to "${status}".` });
    setModal(null);
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Order Management"
        subtitle={`${orders.length} orders — ${orders.filter(o => o.status === "pending").length} pending`}
        actions={[<Btn key="c" onClick={() => setModal("create")}>＋ New Order</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[
          { l:"Total Orders", v:orders.length,                                           c:C.blue  },
          { l:"Dispatched",   v:orders.filter(o => o.status==="dispatched").length,      c:C.green },
          { l:"In Transit",   v:orders.filter(o => o.status==="in-transit").length,      c:C.red   },
          { l:"Pending",      v:orders.filter(o => o.status==="pending").length,         c:C.amber },
        ].map(s => (
          <Card key={s.l} style={{ padding:"16px 18px", borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:28,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,fontWeight:500,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:10, alignItems:"center" }}>
          <Input value={search} onChange={setSearch} placeholder="Search retailer, city…" icon="🔍" style={{ flex:1, maxWidth:320 }}/>
          <div style={{ marginLeft:"auto", fontSize:12, color:C.textS }}>{filtered.length} orders</div>
        </div>
        <Table
          cols={[
            { key:"id",       label:"Order ID",  render:v=><span style={{ fontWeight:700,color:C.red,fontFamily:"monospace",fontSize:12 }}>{v}</span> },
            { key:"retailer", label:"Retailer"   },
            { key:"city",     label:"City"       },
            { key:"items",    label:"Items",      render:v=>`${v} units` },
            { key:"kg",       label:"Weight",     render:v=>`${v} kg` },
            { key:"prio",     label:"Priority",   render:v=><Badge priority={v}/> },
            { key:"stock",    label:"Stock",      render:v=><Badge status={v}/> },
            { key:"status",   label:"Status",     render:v=><Badge status={v}/> },
            { key:"window",   label:"Window" },
            { key:"delivery", label:"Delivery",   render:v=>v?<span style={{ fontFamily:"monospace",fontSize:11,color:C.blue }}>{v}</span>:"—" },
          ]}
          rows={filtered}
          onRow={o => { setSelO(o); setModal("detail"); }}
        />
      </Card>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Create New Order" subtitle="All starred fields are required">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Retailer Name *"    value={form.retailer} onChange={v=>setF("retailer",v)} placeholder="e.g. Cargills Food City"/>
          <Input label="Delivery City *"    value={form.city}     onChange={v=>setF("city",v)}     placeholder="e.g. Colombo 03"/>
          <Select label="Priority *"        value={form.prio}     onChange={v=>setF("prio",v)}     options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"normal",label:"🟢 Normal"}]}/>
          <Input label="Delivery Window"    value={form.window}   onChange={v=>setF("window",v)}   placeholder="e.g. 10:00–12:00"/>
          <Input label="Number of Items *"  value={form.items}    onChange={v=>setF("items",v)}    type="number" placeholder="0"/>
          <Input label="Total Weight (kg) *" value={form.kg}      onChange={v=>setF("kg",v)}       type="number" placeholder="0"/>
          <Select label="Stock Status"      value={form.stock}    onChange={v=>setF("stock",v)}    options={[{value:"confirmed",label:"✅ Confirmed"},{value:"pending",label:"⏳ Pending"}]}/>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>✓ Create Order</Btn>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal==="detail"} onClose={() => setModal(null)} title={`Order ${selO?.id}`}>
        {selO && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}><Badge status={selO.status}/><Badge priority={selO.prio}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              {[["Retailer",selO.retailer],["City",selO.city],["Items",`${selO.items} units`],["Weight",`${selO.kg} kg`],["Window",selO.window||"—"],["Stock",selO.stock],["Created",selO.created],["Delivery",selO.delivery||"Not assigned"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Btn size="sm" onClick={() => handleStatusChange(selO.id,"dispatched")}>🚛 Mark Dispatched</Btn>
              <Btn size="sm" variant="warning" onClick={() => { updateOrder(selO.id,{prio:"urgent"}); setAlert({t:"warning",m:"Order flagged as urgent."}); setModal(null); }}>🚩 Flag Urgent</Btn>
              <Btn size="sm" variant="danger" onClick={() => handleDelete(selO)}>🗑 Cancel Order</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Routing (route_planner)
// ══════════════════════════════════════════════════
export function RoutingPage() {
  const { routes, vehicles, users, gpsLogs, addRoute, updateRoute, deleteRoute } = useDB();
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal]       = useState(null);
  const [optModal, setOptModal] = useState(null);
  const [alert, setAlert]       = useState(null);
  const blank = { name:"", driver:"", veh:"", stops:"", dist:"", dur:"", fuelEst:"", traffic:"Low", eff:85, seq:[] };
  const [form, setForm]         = useState(blank);
  const [seqInput, setSeqInput] = useState("");
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleCreate = () => {
    if (!form.name || !form.stops) { setAlert({t:"error",m:"Route name and stops are required."}); return; }
    const seq = seqInput.split(",").map(s=>s.trim()).filter(Boolean);
    addRoute({ ...form, stops: Number(form.stops), eff: Number(form.eff)||85, driver: form.driver ? Number(form.driver) : null, seq });
    setAlert({t:"success",m:"✅ New route created!"});
    setModal(null); setForm(blank); setSeqInput("");
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Route Planning & Optimization"
        subtitle="Manage delivery routes, assign drivers, optimize paths"
        actions={[
          <Btn key="n" onClick={() => setModal("create")}>＋ New Route</Btn>,
          <Btn key="a" variant="secondary" onClick={() => setAlert({t:"info",m:"Auto-optimization running. Routes updated."})}>⚡ Auto-Optimize All</Btn>,
        ]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        <div>
          {routes.length === 0 && <Card><Empty icon="🛣️" title="No routes yet" sub="Create your first route using the button above"/></Card>}
          {routes.map(r => {
            const isOpen = expanded === r.id;
            const driver = users.find(u => u.id === r.driver);
            return (
              <Card key={r.id} style={{ marginBottom:12, overflow:"hidden", padding:0 }}>
                <div onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", background:isOpen?"#FFF9F9":"white" }}>
                  <div style={{ background:C.red+"18",borderRadius:9,padding:"6px 12px",fontWeight:800,fontSize:12,color:C.red,fontFamily:"monospace",flexShrink:0 }}>{r.id}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800,fontSize:14,color:C.text }}>{r.name}</div>
                    <div style={{ fontSize:11,color:C.textS,marginTop:2 }}>{driver?.name||"No driver"} · {r.stops} stops · {r.dist} · {r.dur}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontWeight:800,fontSize:17,color:effColor(r.eff) }}>{r.eff}%</div>
                    <div style={{ fontSize:9,color:C.textS }}>efficiency</div>
                  </div>
                  <Badge status={r.status}/>
                  <span style={{ color:C.slateL,transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",fontSize:18,flexShrink:0 }}>›</span>
                </div>
                {isOpen && (
                  <div style={{ padding:"16px 20px",background:"#FAFBFF",borderTop:`1px solid ${C.border}` }}>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14 }}>
                      {[["🛑 Stops",r.stops,""],["📏 Distance",r.dist,""],["⏱ Duration",r.dur,""],["🚦 Traffic",r.traffic,trafficColor(r.traffic)],["⛽ Fuel Est.",r.fuelEst,""],["📊 Efficiency",`${r.eff}%`,effColor(r.eff)]].map(([k,v,col])=>(
                        <div key={k} style={{ background:"white",padding:"10px 12px",borderRadius:9,border:`1px solid ${C.border}` }}>
                          <div style={{ fontSize:10,color:C.textS,fontWeight:600 }}>{k}</div>
                          <div style={{ fontWeight:700,fontSize:14,color:col||C.text,marginTop:2 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {r.seq && r.seq.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:11,color:C.textS,fontWeight:700,marginBottom:8 }}>STOP SEQUENCE</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                          {r.seq.map((s,i) => (
                            <div key={i} style={{ display:"flex",alignItems:"center",gap:5 }}>
                              <div style={{ background:C.red+"18",color:C.red,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600 }}>{i+1}. {s}</div>
                              {i < r.seq.length-1 && <span style={{ color:C.slateL,fontSize:12 }}>→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10,color:C.textS,fontWeight:700,marginBottom:5 }}>ROUTE EFFICIENCY</div>
                      <ProgressBar value={r.eff} color={effColor(r.eff)} height={8}/>
                    </div>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      <Btn size="sm" onClick={() => setOptModal(r)}>⚡ Optimize</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { updateRoute(r.id,{status:"active"}); setAlert({t:"success",m:`Route ${r.id} activated.`}); }}>▶ Activate</Btn>
                      <Btn size="sm" variant="danger" onClick={() => { deleteRoute(r.id); setAlert({t:"warning",m:`Route ${r.id} deleted.`}); setExpanded(null); }}>🗑 Delete</Btn>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:14 }}>📊 Route Analytics</div>
            {[
              {l:"Total Routes",     v:routes.length,                                        c:C.blue},
              {l:"Active",           v:routes.filter(r=>r.status==="active").length,         c:C.green},
              {l:"Completed",        v:routes.filter(r=>r.status==="completed").length,      c:C.green},
              {l:"Delayed",          v:routes.filter(r=>r.status==="delayed").length,        c:"#DC2626"},
              {l:"Planned",          v:routes.filter(r=>r.status==="planned").length,        c:C.amber},
              {l:"Avg. Efficiency",  v:routes.length?Math.round(routes.reduce((s,r)=>s+r.eff,0)/routes.length)+"%":"—", c:C.green},
            ].map(m => (
              <div key={m.l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:13,color:C.textM }}>{m.l}</span>
                <span style={{ fontWeight:700,fontSize:14,color:m.c }}>{m.v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:12 }}>📍 Route Map</div>
            <SriLankaMap vehicles={vehicles.filter(v=>v.status==="on-route")} gpsLogs={gpsLogs} height={200} compact/>
          </Card>
        </div>
      </div>

      {/* Optimize Modal */}
      <Modal open={!!optModal} onClose={() => setOptModal(null)} title={`Optimize: ${optModal?.name}`}>
        <Alert type="info" message="Recalculate optimal stop sequence using real-time traffic data."/>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
          <Btn variant="ghost" onClick={() => setOptModal(null)}>Cancel</Btn>
          <Btn onClick={() => { updateRoute(optModal.id,{eff:Math.min(100,(optModal.eff||85)+5)}); setAlert({t:"success",m:`Route ${optModal.id} optimized!`}); setOptModal(null); }}>⚡ Run Optimization</Btn>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Create New Route">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="Route Name *"     value={form.name}     onChange={v=>setF("name",v)}     placeholder="e.g. Eastern Loop"/>
          <Select label="Assign Driver"   value={form.driver}   onChange={v=>setF("driver",v)}   options={[{value:"",label:"Select driver…"},...users.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
          <Select label="Vehicle"         value={form.veh}      onChange={v=>setF("veh",v)}      options={[{value:"",label:"Select vehicle…"},...vehicles.map(v=>({value:v.id,label:`${v.id} — ${v.plate}`}))]}/>
          <Input label="Number of Stops *" value={form.stops}   onChange={v=>setF("stops",v)}    type="number" placeholder="0"/>
          <Input label="Distance"         value={form.dist}     onChange={v=>setF("dist",v)}     placeholder="e.g. 48 km"/>
          <Input label="Duration"         value={form.dur}      onChange={v=>setF("dur",v)}      placeholder="e.g. 3.5h"/>
          <Input label="Fuel Estimate"    value={form.fuelEst}  onChange={v=>setF("fuelEst",v)}  placeholder="e.g. 18 L"/>
          <Select label="Traffic"         value={form.traffic}  onChange={v=>setF("traffic",v)}  options={[{value:"Low",label:"Low"},{value:"Moderate",label:"Moderate"},{value:"High",label:"High"}]}/>
        </div>
        <Input label="Stop Sequence (comma-separated)" value={seqInput} onChange={setSeqInput} placeholder="Colombo, Nugegoda, Kandy…" style={{ marginTop:14 }}/>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>Create Route</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Deliveries (all roles)
// ══════════════════════════════════════════════════
export function DeliveriesPage({ user }) {
  const { deliveries, vehicles, users, addDelivery, updateDelivery, deleteDelivery } = useDB();
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("all");
  const [regionF, setRegionF] = useState("all");
  const [priF, setPriF]       = useState("all");
  const [tab, setTab]         = useState("all");
  const [modal, setModal]     = useState(null);
  const [selD, setSelD]       = useState(null);
  const [alert, setAlert]     = useState(null);
  const blank = { retailer:"", city:"", driver:"", veh:"", prio:"normal", items:"", kg:"", eta:"", region:"Western", note:"", status:"pending" };
  const [form, setForm]       = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const base = user.role === "driver" ? deliveries.filter(d => d.driver === user.id) : deliveries;
  const filtered = base.filter(d => {
    const s = search.toLowerCase();
    if (s && !d.retailer.toLowerCase().includes(s) && !d.city.toLowerCase().includes(s) && !d.id.toLowerCase().includes(s)) return false;
    if (statusF !== "all" && d.status !== statusF) return false;
    if (regionF !== "all" && d.region !== regionF) return false;
    if (priF    !== "all" && d.prio   !== priF)    return false;
    if (tab === "delayed" && d.status !== "delayed") return false;
    if (tab === "pending" && d.status !== "pending") return false;
    if (tab === "transit" && d.status !== "in-transit") return false;
    if (tab === "done"    && d.status !== "delivered" && d.status !== "completed") return false;
    return true;
  });

  const counts = {
    all:     base.length,
    delayed: base.filter(d => d.status==="delayed").length,
    pending: base.filter(d => d.status==="pending").length,
    transit: base.filter(d => d.status==="in-transit").length,
    done:    base.filter(d => d.status==="delivered"||d.status==="completed").length,
  };

  const handleCreate = () => {
    if (!form.retailer || !form.city || !form.items) { setAlert({t:"error",m:"Retailer, city, and items are required."}); return; }
    addDelivery({ ...form, items:Number(form.items), kg:Number(form.kg), driver:form.driver?Number(form.driver):null });
    setAlert({t:"success",m:"✅ Delivery created successfully!"});
    setModal(null); setForm(blank);
  };

  const handleStatusUpdate = (id, status) => {
    updateDelivery(id, { status });
    setAlert({t:"success",m:`Delivery status updated to "${status}".`});
    setModal(null);
  };

  const canCreate = ["management","order_team","warehouse"].includes(user.role);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Delivery Management"
        subtitle={`${base.length} deliveries · ${counts.delayed} delayed · ${counts.pending} pending`}
        actions={canCreate ? [<Btn key="c" onClick={() => setModal("create")}>＋ New Delivery</Btn>] : []}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:18 }}>
        {[{l:"Total",v:counts.all,c:C.slate},{l:"Delivered",v:counts.done,c:C.green},{l:"In Transit",v:counts.transit,c:C.blue},{l:"Delayed",v:counts.delayed,c:"#DC2626"},{l:"Pending",v:counts.pending,c:C.amber}].map(s=>(
          <Card key={s.l} style={{ padding:"14px 16px",textAlign:"center",borderTop:`3px solid ${s.c}`,cursor:"pointer" }}
            onClick={()=>{if(s.l==="Delayed")setTab("delayed");else if(s.l==="Pending")setTab("pending");else if(s.l==="In Transit")setTab("transit");else setTab("all");}}>
            <div style={{ fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11,color:C.textS,fontWeight:500,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom:14 }}>
        <Tabs active={tab} onChange={setTab} tabs={[
          {id:"all",label:`All (${counts.all})`},{id:"transit",label:`In Transit (${counts.transit})`},
          {id:"delayed",label:`Delayed (${counts.delayed})`},{id:"pending",label:`Pending (${counts.pending})`},{id:"done",label:`Done (${counts.done})`},
        ]}/>
      </div>

      <Card padding={0}>
        <div style={{ padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
          <Input value={search} onChange={setSearch} placeholder="Search retailer, city, ID…" icon="🔍" style={{ flex:1,minWidth:200 }}/>
          <Select value={statusF} onChange={setStatusF} style={{ width:140 }} options={[{value:"all",label:"All Status"},{value:"pending",label:"Pending"},{value:"in-transit",label:"In Transit"},{value:"delayed",label:"Delayed"},{value:"delivered",label:"Delivered"},{value:"failed",label:"Failed"}]}/>
          <Select value={regionF} onChange={setRegionF} style={{ width:130 }} options={[{value:"all",label:"All Regions"},{value:"Western",label:"Western"},{value:"Central",label:"Central"},{value:"Southern",label:"Southern"},{value:"Northern",label:"Northern"}]}/>
          <Select value={priF}    onChange={setPriF}    style={{ width:130 }} options={[{value:"all",label:"All Priority"},{value:"urgent",label:"Urgent"},{value:"high",label:"High"},{value:"normal",label:"Normal"}]}/>
          <Btn variant="ghost" size="sm" onClick={()=>{setSearch("");setStatusF("all");setRegionF("all");setPriF("all");}}>↺ Clear</Btn>
          <span style={{ fontSize:12,color:C.textS }}>{filtered.length} results</span>
        </div>
        {filtered.length === 0
          ? <Empty icon="📦" title="No deliveries found" sub="Try adjusting your filters"/>
          : <Table
              cols={[
                {key:"id",      label:"ID",       render:v=><span style={{fontWeight:700,color:C.red,fontFamily:"monospace",fontSize:12}}>{v}</span>},
                {key:"retailer",label:"Retailer"},
                {key:"city",    label:"City"},
                {key:"driver",  label:"Driver",   render:v=><span style={{fontSize:12}}>{driverName(v,users)}</span>},
                {key:"veh",     label:"Vehicle",  render:v=><span style={{fontFamily:"monospace",fontSize:12,color:C.blue}}>{v}</span>},
                {key:"prio",    label:"Priority", render:v=><Badge priority={v}/>},
                {key:"status",  label:"Status",   render:v=><Badge status={v}/>},
                {key:"items",   label:"Items",    render:v=>`${v} units`},
                {key:"eta",     label:"ETA"},
                {key:"delay",   label:"Delay",    render:v=>v>0?<span style={{color:"#DC2626",fontWeight:700,fontSize:12}}>{v}m late</span>:<span style={{color:C.green,fontSize:12}}>✓</span>},
              ]}
              rows={filtered}
              onRow={row => { setSelD(row); setModal("detail"); }}
            />
        }
      </Card>

      {/* Detail Modal */}
      <Modal open={modal==="detail"} onClose={() => setModal(null)} title={`Delivery ${selD?.id}`} subtitle={selD?.retailer} width={600}>
        {selD && (
          <div>
            <div style={{ display:"flex",gap:8,marginBottom:18 }}><Badge status={selD.status}/><Badge priority={selD.prio}/></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
              {[["Retailer",selD.retailer],["City",selD.city],["Driver",driverName(selD.driver,users)],["Vehicle",selD.veh],["Items",`${selD.items} units (${selD.kg} kg)`],["ETA",selD.eta],["Region",selD.region],["Last Update",selD.updated],["Created",selD.created],["Proof",selD.proof?"✅ Uploaded":"❌ Pending"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase",letterSpacing:.5 }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <Btn size="sm" variant="success" onClick={()=>handleStatusUpdate(selD.id,"delivered")}>✅ Mark Delivered</Btn>
              <Btn size="sm" variant="warning"  onClick={()=>handleStatusUpdate(selD.id,"delayed")}>⏰ Mark Delayed</Btn>
              <Btn size="sm" variant="danger"   onClick={()=>handleStatusUpdate(selD.id,"failed")}>❌ Mark Failed</Btn>
              <Btn size="sm" variant="ghost"    onClick={()=>{deleteDelivery(selD.id);setAlert({t:"warning",m:`Delivery ${selD.id} deleted.`});setModal(null);}}>🗑 Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Create New Delivery">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Retailer *"    value={form.retailer} onChange={v=>setF("retailer",v)} placeholder="e.g. Cargills Food City"/>
          <Input label="City *"        value={form.city}     onChange={v=>setF("city",v)}     placeholder="e.g. Kandy"/>
          <Select label="Driver"       value={form.driver}   onChange={v=>setF("driver",v)}   options={[{value:"",label:"Unassigned"},...users.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
          <Select label="Vehicle"      value={form.veh}      onChange={v=>setF("veh",v)}      options={[{value:"",label:"Select…"},...vehicles.map(v=>({value:v.id,label:`${v.id} — ${v.plate}`}))]}/>
          <Select label="Priority"     value={form.prio}     onChange={v=>setF("prio",v)}     options={[{value:"urgent",label:"🔴 Urgent"},{value:"high",label:"🟠 High"},{value:"normal",label:"🟢 Normal"}]}/>
          <Select label="Region"       value={form.region}   onChange={v=>setF("region",v)}   options={[{value:"Western",label:"Western"},{value:"Central",label:"Central"},{value:"Southern",label:"Southern"},{value:"Northern",label:"Northern"}]}/>
          <Input label="Items *"       value={form.items}    onChange={v=>setF("items",v)}    type="number" placeholder="0"/>
          <Input label="Weight (kg)"   value={form.kg}       onChange={v=>setF("kg",v)}       type="number" placeholder="0"/>
          <Input label="ETA"           value={form.eta}      onChange={v=>setF("eta",v)}      placeholder="e.g. 14:30"/>
          <Textarea label="Notes"      value={form.note}     onChange={v=>setF("note",v)}     placeholder="Optional notes…" rows={2} style={{ gridColumn:"span 2" }}/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>✓ Create Delivery</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Warehouse / Dispatch
// ══════════════════════════════════════════════════
export function WarehousePage({ user }) {
  const { deliveries, vehicles, users, updateDelivery } = useDB();
  const [modal, setModal] = useState(null);
  const [selD, setSelD]   = useState(null);
  const [alert, setAlert] = useState(null);
  const [drvSel, setDrv]  = useState("");
  const [vehSel, setVeh]  = useState("");

  const pending = deliveries.filter(d => d.status === "pending");
  const active  = deliveries.filter(d => d.status === "in-transit");

  const handleDispatch = () => {
    if (!selD) return;
    updateDelivery(selD.id, { status:"in-transit", driver: drvSel ? Number(drvSel) : selD.driver, veh: vehSel || selD.veh });
    setAlert({t:"success",m:`✅ Delivery ${selD.id} dispatched!`});
    setModal(null); setDrv(""); setVeh("");
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Warehouse & Dispatch" subtitle="Manage outbound shipments, assign drivers, track dispatches"/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
        {[{l:"Pending Dispatch",v:pending.length,c:C.amber},{l:"Active Deliveries",v:active.length,c:C.green},{l:"Total Today",v:deliveries.length,c:C.blue}].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px",borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:28,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        <div style={{ padding:"12px 18px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:14,color:C.text }}>📦 Pending Dispatch ({pending.length})</div>
        {pending.length === 0
          ? <Empty icon="✅" title="All dispatched!" sub="No pending deliveries"/>
          : <Table
              cols={[
                {key:"id",      label:"ID",       render:v=><span style={{fontWeight:700,color:C.red,fontFamily:"monospace",fontSize:12}}>{v}</span>},
                {key:"retailer",label:"Retailer"},
                {key:"city",    label:"City"},
                {key:"prio",    label:"Priority", render:v=><Badge priority={v}/>},
                {key:"items",   label:"Items",    render:v=>`${v} units`},
                {key:"id",      label:"Action",   render:(v,row)=><Btn size="xs" onClick={e=>{e.stopPropagation();setSelD(row);setModal("dispatch");}}>🚛 Dispatch</Btn>},
              ]}
              rows={pending}
              onRow={row=>{setSelD(row);setModal("dispatch");}}
            />
        }
      </Card>

      {/* Dispatch Modal */}
      <Modal open={modal==="dispatch"} onClose={() => setModal(null)} title={`Dispatch ${selD?.id}`} subtitle={selD?.retailer}>
        {selD && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
              {[["Retailer",selD.retailer],["City",selD.city],["Items",`${selD.items} units`],["Weight",`${selD.kg} kg`]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <Select label="Assign Driver" value={drvSel} onChange={setDrv} style={{ marginBottom:14 }} options={[{value:"",label:"Select driver…"},...users.filter(u=>u.role==="driver").map(u=>({value:u.id,label:u.name}))]}/>
            <Select label="Assign Vehicle" value={vehSel} onChange={setVeh} style={{ marginBottom:16 }} options={[{value:"",label:"Select vehicle…"},...vehicles.map(v=>({value:v.id,label:`${v.id} — ${v.plate} (${v.type})`}))]}/>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn variant="success" onClick={handleDispatch}>🚛 Confirm Dispatch</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Inventory (warehouse)
// ══════════════════════════════════════════════════
export function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useDB();
  const [modal, setModal] = useState(null);
  const [selI, setSelI]   = useState(null);
  const [alert, setAlert] = useState(null);
  const blank = { product:"", stock:"", reserved:"0", unit:"pcs" };
  const [form, setForm]   = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleCreate = () => {
    if (!form.product || !form.stock) { setAlert({t:"error",m:"Product name and stock are required."}); return; }
    addInventoryItem({ ...form, stock:Number(form.stock), reserved:Number(form.reserved||0) });
    setAlert({t:"success",m:"✅ SKU added to inventory!"});
    setModal(null); setForm(blank);
  };

  const handleEdit = () => {
    updateInventoryItem(selI.id, { stock:Number(form.stock), reserved:Number(form.reserved) });
    setAlert({t:"success",m:`Stock updated for ${selI.product}.`});
    setModal(null);
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Inventory Management" subtitle={`${inventory.length} SKUs · ${inventory.filter(i=>i.status==="out_of_stock").length} out of stock`}
        actions={[<Btn key="a" onClick={() => setModal("create")}>＋ Add SKU</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18 }}>
        {[{l:"Total SKUs",v:inventory.length,c:C.blue},{l:"Available",v:inventory.filter(i=>i.status==="available").length,c:C.green},{l:"Out of Stock",v:inventory.filter(i=>i.status==="out_of_stock").length,c:"#DC2626"}].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px",borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:28,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        {inventory.length === 0
          ? <Empty icon="📦" title="No inventory items" sub="Add your first SKU using the button above"/>
          : <Table
              cols={[
                {key:"id",       label:"SKU",      render:v=><span style={{fontFamily:"monospace",fontSize:12,color:C.blue}}>{v}</span>},
                {key:"product",  label:"Product",  render:v=><span style={{fontWeight:700}}>{v}</span>},
                {key:"stock",    label:"Total",    render:v=><strong>{v}</strong>},
                {key:"reserved", label:"Reserved", render:v=><span style={{color:C.amber,fontWeight:600}}>{v}</span>},
                {key:"available",label:"Available",render:v=><span style={{color:v>0?C.green:"#DC2626",fontWeight:700}}>{v}</span>},
                {key:"unit",     label:"Unit"},
                {key:"status",   label:"Status",   render:v=><Badge status={v}/>},
                {key:"stock",    label:"Level",    render:(v,row)=><div style={{width:80}}><ProgressBar value={row.stock>0?Math.round((row.available/row.stock)*100):0} height={6}/></div>},
                {key:"id",       label:"Actions",  render:(v,row)=>(
                  <div style={{display:"flex",gap:5}}>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();setSelI(row);setForm({stock:String(row.stock),reserved:String(row.reserved),product:row.product,unit:row.unit});setModal("edit");}}>✏️ Edit</Btn>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();deleteInventoryItem(row.id);setAlert({t:"warning",m:`SKU ${row.id} deleted.`});}}>🗑</Btn>
                  </div>
                )},
              ]}
              rows={inventory}
            />
        }
      </Card>

      {/* Add SKU Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Add New SKU">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Product Name *" value={form.product}  onChange={v=>setF("product",v)}  placeholder="e.g. Nescafe 500g" style={{gridColumn:"span 2"}}/>
          <Input label="Total Stock *"  value={form.stock}    onChange={v=>setF("stock",v)}    type="number" placeholder="0"/>
          <Input label="Reserved"       value={form.reserved} onChange={v=>setF("reserved",v)} type="number" placeholder="0"/>
          <Select label="Unit"          value={form.unit}     onChange={v=>setF("unit",v)}     options={[{value:"pcs",label:"Pieces"},{value:"kg",label:"Kilograms"},{value:"ltr",label:"Litres"}]}/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>Add SKU</Btn>
        </div>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal open={modal==="edit"} onClose={() => setModal(null)} title={`Edit: ${selI?.product}`}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Total Stock *"  value={form.stock}    onChange={v=>setF("stock",v)}    type="number"/>
          <Input label="Reserved"       value={form.reserved} onChange={v=>setF("reserved",v)} type="number"/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleEdit}>Save Changes</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Driver — My Deliveries
// ══════════════════════════════════════════════════
export function MyDeliveryPage({ user }) {
  const { deliveries, updateDelivery } = useDB();
  const myDels = deliveries.filter(d => d.driver === user.id);
  const [modal, setModal] = useState(null);
  const [selD, setSelD]   = useState(null);
  const [alert, setAlert] = useState(null);

  const handleStatus = (d, status) => {
    updateDelivery(d.id, { status });
    setAlert({t: status==="delivered"?"success":"warning", m:`${d.id} marked as ${status}.`});
    setModal(null);
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="My Deliveries" subtitle={`${myDels.length} assigned deliveries`}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18 }}>
        {[{l:"Total",v:myDels.length,c:C.blue},{l:"Delivered",v:myDels.filter(d=>d.status==="delivered").length,c:C.green},{l:"In Transit",v:myDels.filter(d=>d.status==="in-transit").length,c:C.amber},{l:"Remaining",v:myDels.filter(d=>["pending","in-transit"].includes(d.status)).length,c:C.red}].map(s=>(
          <Card key={s.l} style={{ padding:"16px 18px",borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
            <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      {myDels.length === 0
        ? <Card><Empty icon="📦" title="No deliveries assigned" sub="Contact your distribution manager"/></Card>
        : <div style={{ display:"grid",gap:12 }}>
            {myDels.map(d => (
              <Card key={d.id} className="hover-lift" style={{ cursor:"pointer" }} onClick={() => { setSelD(d); setModal("detail"); }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                      <span style={{ fontWeight:800,fontSize:14,color:C.red,fontFamily:"monospace" }}>{d.id}</span>
                      <Badge status={d.status}/><Badge priority={d.prio}/>
                    </div>
                    <div style={{ fontWeight:700,fontSize:15,color:C.text }}>{d.retailer}</div>
                    <div style={{ fontSize:13,color:C.textS,marginTop:3 }}>📍 {d.city} · {d.items} units ({d.kg} kg)</div>
                    <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>🕐 ETA: {d.eta||"—"}</div>
                    {d.note && <div style={{ fontSize:12,color:C.amber,marginTop:4 }}>⚠️ {d.note}</div>}
                  </div>
                  {d.status === "in-transit" && (
                    <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                      <Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();handleStatus(d,"delivered");}}>✅ Delivered</Btn>
                      <Btn size="sm" variant="warning" onClick={e=>{e.stopPropagation();handleStatus(d,"delayed");}}>⚠️ Delayed</Btn>
                      <Btn size="sm" variant="danger"  onClick={e=>{e.stopPropagation();handleStatus(d,"failed");}}>❌ Failed</Btn>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
      }

      <Modal open={modal==="detail"} onClose={() => setModal(null)} title={`Delivery ${selD?.id}`}>
        {selD && (
          <div>
            <div style={{ display:"flex",gap:8,marginBottom:16 }}><Badge status={selD.status}/><Badge priority={selD.prio}/></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
              {[["Retailer",selD.retailer],["City",selD.city],["Items",`${selD.items} units`],["Weight",`${selD.kg} kg`],["Vehicle",selD.veh],["ETA",selD.eta||"—"]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,color:C.text,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            {selD.status === "in-transit" && (
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="success" full onClick={() => handleStatus(selD,"delivered")}>✅ Confirm Delivery</Btn>
                <Btn variant="warning" style={{flex:1}} onClick={() => handleStatus(selD,"delayed")}>⏰ Report Delay</Btn>
              </div>
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
  const { deliveries, vehicles, routes, gpsLogs } = useDB();
  const myDels  = deliveries.filter(d => d.driver === user.id && d.status === "in-transit");
  const myVeh   = vehicles.find(v => v.driver === user.id);
  const myRoute = myVeh ? routes.find(r => r.veh === myVeh.id) : null;

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Navigation & Route" subtitle="Your assigned route and live navigation"/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:16 }}>
        <Card>
          <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:14 }}>🧭 Route Map</div>
          <SriLankaMap vehicles={myVeh?[myVeh]:[]} gpsLogs={gpsLogs} height={380}/>
          {myVeh && <div style={{ marginTop:14,display:"flex",gap:8 }}><Btn full variant="primary">▶ Start Navigation</Btn><Btn variant="danger" style={{flexShrink:0}}>🚨 Emergency</Btn></div>}
        </Card>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {myVeh ? (
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:12 }}>🚛 My Vehicle</div>
              {[["Plate",myVeh.plate],["Type",myVeh.type],["Fuel",`${myVeh.fuel}%`]].map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
                  <span style={{ color:C.textS }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10 }}><ProgressBar value={myVeh.fuel} height={8} label/></div>
            </Card>
          ) : <Card><Empty icon="🚛" title="No vehicle assigned" sub="Contact your manager"/></Card>}
          {myRoute && (
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:12 }}>📋 My Route: {myRoute.name}</div>
              {(myRoute.seq||[]).map((s,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:12 }}>
                  <div style={{ width:20,height:20,borderRadius:"50%",background:C.red+"18",color:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0 }}>{i+1}</div>
                  <span style={{ color:C.textM }}>{s}</span>
                  {myDels.find(d => d.city === s) && <Badge status="in-transit"/>}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Retailer pages
// ══════════════════════════════════════════════════
export function RetailerOrdersPage({ user }) {
  const { orders } = useDB();
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="My Orders" subtitle="Track your Nestlé delivery orders"/>
      <div style={{ display:"grid",gap:14 }}>
        {orders.slice(0,5).map(o => (
          <Card key={o.id} className="hover-lift">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <span style={{ fontFamily:"monospace",fontWeight:700,color:C.red,fontSize:13 }}>{o.id}</span>
                  <Badge status={o.status}/><Badge priority={o.prio}/>
                </div>
                <div style={{ fontWeight:700,fontSize:15,color:C.text }}>{o.retailer}</div>
                <div style={{ fontSize:13,color:C.textS,marginTop:3 }}>📍 {o.city} · {o.items} items · {o.kg} kg</div>
                <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>🕐 Window: {o.window||"Not set"}</div>
              </div>
              <Btn size="sm" variant="ghost">📞 Contact</Btn>
            </div>
          </Card>
        ))}
        {orders.length === 0 && <Card><Empty icon="📦" title="No orders yet"/></Card>}
      </div>
    </div>
  );
}

export function RetailerTrackingPage() {
  const { vehicles, gpsLogs } = useDB();
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Track My Delivery" subtitle="Live delivery tracking for your orders"/>
      <Card>
        <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:14 }}>🗺️ Delivery Map</div>
        <SriLankaMap vehicles={vehicles.filter(v=>v.status==="on-route")} gpsLogs={gpsLogs} height={360}/>
      </Card>
    </div>
  );
}

export function RetailerHistoryPage() {
  const { orders } = useDB();
  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Order History" subtitle="Past deliveries and documentation"/>
      <Card padding={0}>
        <Table
          cols={[
            {key:"id",      label:"Order ID",  render:v=><span style={{fontWeight:700,color:C.red,fontFamily:"monospace",fontSize:12}}>{v}</span>},
            {key:"retailer",label:"Retailer"},
            {key:"city",    label:"City"},
            {key:"status",  label:"Status",    render:v=><Badge status={v}/>},
            {key:"items",   label:"Items",     render:v=>`${v} units`},
            {key:"id",      label:"Actions",   render:v=><Btn size="xs" variant="ghost">⬇ Invoice</Btn>},
          ]}
          rows={orders}
        />
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Reports (management)
// ══════════════════════════════════════════════════
export function ReportsPage() {
  const { deliveries, vehicles, users } = useDB();
  const [tab, setTab] = useState("summary");
  const [alert, setAlert] = useState(null);

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Reports & Analytics" subtitle="KPIs, delivery analytics, and exportable reports"
        actions={[
          <Btn key="p" variant="ghost" size="sm" onClick={() => setAlert({t:"success",m:"PDF report generated!"})}>⬇ Export PDF</Btn>,
          <Btn key="x" variant="ghost" size="sm" onClick={() => setAlert({t:"success",m:"Excel report generated!"})}>⬇ Export Excel</Btn>,
        ]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ marginBottom:16 }}>
        <Tabs active={tab} onChange={setTab} tabs={[{id:"summary",label:"📊 Summary"},{id:"driver",label:"👤 Driver Perf."},{id:"fuel",label:"⛽ Fuel"},{id:"delivery",label:"📦 Deliveries"}]}/>
      </div>

      {tab==="summary" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16 }}>
            <KPICard label="Total Deliveries" value={deliveries.length}     sub="All time"         icon="📦" color={C.blue}  trend={`+${deliveries.filter(d=>d.status==="delivered").length} delivered`} trendUp={true}/>
            <KPICard label="Delivered"         value={deliveries.filter(d=>d.status==="delivered"||d.status==="completed").length} sub="Completed" icon="✅" color={C.green} trend="" trendUp={true}/>
            <KPICard label="Delayed"           value={deliveries.filter(d=>d.status==="delayed").length}  sub="Need attention" icon="⏱" color={C.amber} trend="" trendUp={false}/>
            <KPICard label="Fleet Size"        value={vehicles.length}       sub="Total vehicles"  icon="🚛" color={C.red}   trend={`${vehicles.filter(v=>v.status==="on-route").length} active`} trendUp={true}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>📦 Monthly Delivery Volume</div>
              <BarChart data={KPI_HISTORY.monthly_deliveries} color={C.red} showValues/>
            </Card>
            <Card>
              <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>✅ On-Time Rate Trend (%)</div>
              <LineChart data={KPI_HISTORY.on_time_rate} color={C.green} showValues/>
            </Card>
          </div>
        </div>
      )}
      {tab==="driver" && (
        <Card padding={0}>
          <Table
            cols={[{key:"name",label:"Driver"},{key:"deliveries",label:"Deliveries",render:v=><strong>{v}</strong>},{key:"onTime",label:"On-Time",render:v=><span style={{color:C.green,fontWeight:700}}>{v}</span>},{key:"rate",label:"Rate",render:v=><span style={{fontWeight:800,color:v>=90?C.green:v>=80?C.amber:"#DC2626"}}>{v}%</span>},{key:"fuel",label:"Fuel Used"},{key:"avgDelay",label:"Avg Delay"}]}
            rows={KPI_HISTORY.driver_perf}
          />
        </Card>
      )}
      {tab==="fuel" && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          <Card>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:4 }}>⛽ Daily Fuel Consumption (L)</div>
            <BarChart data={KPI_HISTORY.fuel_daily} color={C.amber} showValues/>
          </Card>
          <Card>
            <div style={{ fontWeight:700,fontSize:14,color:C.text,marginBottom:14 }}>Vehicle Fuel Levels</div>
            {vehicles.map(v=>(
              <div key={v.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontWeight:600,fontSize:13,fontFamily:"monospace" }}>{v.id}</span>
                <span style={{ fontSize:12,color:C.textS }}>{v.plate}</span>
                <div style={{ display:"flex",alignItems:"center",gap:10,width:160 }}>
                  <ProgressBar value={v.fuel} height={6} style={{flex:1}}/>
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
            cols={[{key:"id",label:"ID",render:v=><span style={{fontWeight:700,color:C.red,fontFamily:"monospace",fontSize:12}}>{v}</span>},{key:"retailer",label:"Retailer"},{key:"city",label:"City"},{key:"status",label:"Status",render:v=><Badge status={v}/>},{key:"prio",label:"Priority",render:v=><Badge priority={v}/>},{key:"items",label:"Items",render:v=>`${v} units`},{key:"delay",label:"Delay",render:v=>v>0?<span style={{color:"#DC2626"}}>{v}m late</span>:<span style={{color:C.green}}>✓</span>},{key:"region",label:"Region"}]}
            rows={deliveries}
          />
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Users (management/admin)
// ══════════════════════════════════════════════════
export function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useDB();
  const [modal, setModal] = useState(null);
  const [selU, setSelU]   = useState(null);
  const [alert, setAlert] = useState(null);
  const blank = { name:"", email:"", role:"", dept:"", pw:"", phone:"" };
  const [form, setForm]   = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleCreate = () => {
    if (!form.name || !form.email || !form.role || !form.pw) { setAlert({t:"error",m:"Name, email, role and password are required."}); return; }
    if (users.find(u => u.email === form.email)) { setAlert({t:"error",m:"Email already exists."}); return; }
    const initials = form.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    addUser({ ...form, avatar:initials, joined: new Date().toLocaleDateString("en",{month:"short",year:"numeric"}) });
    setAlert({t:"success",m:"✅ User created successfully!"});
    setModal(null); setForm(blank);
  };

  const handleDeactivate = (u) => {
    updateUser(u.id, { active: !u.active });
    setAlert({t:"info",m:`${u.name} ${u.active?"deactivated":"activated"}.`});
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="User Management" subtitle={`${users.length} users · ${Object.keys(ROLE_LABELS).length} roles`}
        actions={[<Btn key="a" onClick={() => setModal("create")}>＋ Add User</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18 }}>
        {Object.entries(ROLE_LABELS).map(([r,l]) => (
          <Card key={r} style={{ padding:"12px 14px",borderTop:`3px solid ${ROLE_COLORS[r]}`,textAlign:"center" }}>
            <div style={{ fontSize:22,fontWeight:800,color:ROLE_COLORS[r] }}>{users.filter(u=>u.role===r).length}</div>
            <div style={{ fontSize:10,color:C.textS,marginTop:2,lineHeight:1.4 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Card padding={0}>
        {users.length === 0
          ? <Empty icon="👤" title="No users yet"/>
          : <Table
              cols={[
                {key:"avatar",  label:"",       render:(v,r)=><Avatar initials={v} color={ROLE_COLORS[r.role]} size={34}/>},
                {key:"name",    label:"Name",   render:v=><span style={{fontWeight:700}}>{v}</span>},
                {key:"email",   label:"Email",  render:v=><span style={{fontFamily:"monospace",fontSize:11,color:C.textS}}>{v}</span>},
                {key:"role",    label:"Role",   render:v=><span style={{background:ROLE_COLORS[v]+"15",color:ROLE_COLORS[v],padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:700}}>{ROLE_LABELS[v]}</span>},
                {key:"dept",    label:"Dept"},
                {key:"phone",   label:"Phone",  render:v=><span style={{fontSize:12}}>{v}</span>},
                {key:"joined",  label:"Joined"},
                {key:"active",  label:"Status", render:v=><Badge status={v?"active":"offline"}/>},
                {key:"id",      label:"Actions",render:(v,row)=>(
                  <div style={{display:"flex",gap:5}}>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();setSelU(row);setForm({name:row.name,email:row.email,role:row.role,dept:row.dept||"",pw:"",phone:row.phone||""});setModal("edit");}}>✏️</Btn>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();handleDeactivate(row);}}>{row.active?"🚫":"✅"}</Btn>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();deleteUser(row.id);setAlert({t:"warning",m:`${row.name} deleted.`});}}>🗑</Btn>
                  </div>
                )},
              ]}
              rows={users}
              onRow={u => { setSelU(u); setModal("view"); }}
            />
        }
      </Card>

      {/* View Modal */}
      <Modal open={modal==="view"} onClose={() => setModal(null)} title="User Profile">
        {selU && (
          <div>
            <div style={{ display:"flex",gap:16,alignItems:"center",marginBottom:20 }}>
              <Avatar initials={selU.avatar} color={ROLE_COLORS[selU.role]} size={60}/>
              <div>
                <div style={{ fontSize:18,fontWeight:800,color:C.text }}>{selU.name}</div>
                <div style={{ fontSize:13,color:ROLE_COLORS[selU.role],fontWeight:600 }}>{ROLE_LABELS[selU.role]}</div>
                <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{selU.dept}</div>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[["Email",selU.email],["Phone",selU.phone],["Department",selU.dept],["Joined",selU.joined]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,marginTop:2 }}>{v||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Add New User">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Full Name *"  value={form.name}  onChange={v=>setF("name",v)}  placeholder="e.g. Kasun Perera"/>
          <Input label="Email *"      value={form.email} onChange={v=>setF("email",v)} placeholder="user@nestle.lk" type="email"/>
          <Select label="Role *"      value={form.role}  onChange={v=>setF("role",v)}  options={[{value:"",label:"Select role…"},...Object.entries(ROLE_LABELS).map(([v,l])=>({value:v,label:l}))]}/>
          <Input label="Department"   value={form.dept}  onChange={v=>setF("dept",v)}  placeholder="e.g. Logistics"/>
          <Input label="Phone"        value={form.phone} onChange={v=>setF("phone",v)} placeholder="+94 77 xxx xxxx"/>
          <Input label="Password *"   value={form.pw}    onChange={v=>setF("pw",v)}    placeholder="Min. 8 characters" type="password"/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>Create User</Btn>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal==="edit"} onClose={() => setModal(null)} title={`Edit: ${selU?.name}`}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Full Name"  value={form.name}  onChange={v=>setF("name",v)}/>
          <Input label="Email"      value={form.email} onChange={v=>setF("email",v)} type="email"/>
          <Select label="Role"      value={form.role}  onChange={v=>setF("role",v)}  options={Object.entries(ROLE_LABELS).map(([v,l])=>({value:v,label:l}))}/>
          <Input label="Department" value={form.dept}  onChange={v=>setF("dept",v)}/>
          <Input label="Phone"      value={form.phone} onChange={v=>setF("phone",v)}/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={() => { updateUser(selU.id,{name:form.name,email:form.email,role:form.role,dept:form.dept,phone:form.phone}); setAlert({t:"success",m:"User updated."}); setModal(null); }}>Save Changes</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Vehicles (management, route_planner)
// ══════════════════════════════════════════════════
export function VehiclesPage() {
  const { vehicles, users, addVehicle, updateVehicle, deleteVehicle } = useDB();
  const [modal, setModal] = useState(null);
  const [selV, setSelV]   = useState(null);
  const [alert, setAlert] = useState(null);
  const blank = { plate:"", type:"Mini Truck", cap:"", year:"", fuel:"100", status:"idle" };
  const [form, setForm]   = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleCreate = () => {
    if (!form.plate || !form.cap) { setAlert({t:"error",m:"Plate and capacity are required."}); return; }
    addVehicle({ ...form, fuel:Number(form.fuel)||100, year:Number(form.year)||2024, driver:null, km:"0", lastService:"—", nextService:"—" });
    setAlert({t:"success",m:"✅ Vehicle added to fleet!"});
    setModal(null); setForm(blank);
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Fleet Management" subtitle={`${vehicles.length} vehicles · ${vehicles.filter(v=>v.status==="on-route").length} active`}
        actions={[<Btn key="a" onClick={() => setModal("create")}>＋ Add Vehicle</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18 }}>
        {[{l:"Total Fleet",v:vehicles.length,c:C.navy},{l:"On Route",v:vehicles.filter(v=>v.status==="on-route").length,c:C.green},{l:"Idle",v:vehicles.filter(v=>v.status==="idle").length,c:C.slate},{l:"Issues",v:vehicles.filter(v=>v.status==="delayed").length,c:"#DC2626"}].map(s=>(
          <KPICard key={s.l} label={s.l} value={s.v} sub="" icon="🚛" color={s.c}/>
        ))}
      </div>

      {vehicles.length === 0
        ? <Card><Empty icon="🚛" title="No vehicles in fleet" sub="Add your first vehicle using the button above"/></Card>
        : <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
            {vehicles.map(v => {
              const driver = users.find(u => u.id === v.driver);
              return (
                <Card key={v.id} className="hover-lift" style={{ cursor:"pointer" }} onClick={() => { setSelV(v); setModal("detail"); }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800,fontSize:15,color:C.text,fontFamily:"monospace" }}>{v.id}</div>
                      <div style={{ fontSize:12,color:C.textS,marginTop:1 }}>{v.plate}</div>
                    </div>
                    <Badge status={v.status}/>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
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
      }

      {/* Detail Modal */}
      <Modal open={modal==="detail"} onClose={() => setModal(null)} title={`Vehicle ${selV?.id}`} subtitle={selV?.plate}>
        {selV && (
          <div>
            <div style={{ marginBottom:16 }}><Badge status={selV.status}/></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
              {[["Plate",selV.plate],["Type",selV.type],["Capacity",selV.cap],["Mileage",selV.km],["Fuel",`${selV.fuel}%`],["Driver",users.find(u=>u.id===selV.driver)?.name||"Unassigned"],["Last Service",selV.lastService],["Next Service",selV.nextService]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 12px",background:"#F8FAFC",borderRadius:9 }}>
                  <div style={{ fontSize:10,color:C.textS,fontWeight:700,textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13,fontWeight:600,marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              <Btn onClick={()=>{updateVehicle(selV.id,{status:"idle"});setAlert({t:"success",m:`Maintenance scheduled for ${selV.id}.`});setModal(null);}}>🔧 Schedule Maint.</Btn>
              <Btn variant="ghost" onClick={()=>{const f=Math.min(100,(selV.fuel||0)+20);updateVehicle(selV.id,{fuel:f});setAlert({t:"success",m:`Fuel logged for ${selV.id}. Now ${f}%.`});setModal(null);}}>⛽ Log Refuel</Btn>
              <Btn variant="danger" onClick={()=>{deleteVehicle(selV.id);setAlert({t:"warning",m:`${selV.id} removed from fleet.`});setModal(null);}}>🗑 Remove</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Add New Vehicle">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="License Plate *" value={form.plate}  onChange={v=>setF("plate",v)}  placeholder="e.g. NB-1111"/>
          <Select label="Type"           value={form.type}   onChange={v=>setF("type",v)}   options={[{value:"Heavy Lorry",label:"Heavy Lorry"},{value:"Mini Truck",label:"Mini Truck"},{value:"Cargo Van",label:"Cargo Van"}]}/>
          <Input label="Capacity *"      value={form.cap}    onChange={v=>setF("cap",v)}    placeholder="e.g. 3 Ton"/>
          <Input label="Year"            value={form.year}   onChange={v=>setF("year",v)}   type="number" placeholder="2024"/>
          <Input label="Initial Fuel %"  value={form.fuel}   onChange={v=>setF("fuel",v)}   type="number" placeholder="100"/>
          <Select label="Status"         value={form.status} onChange={v=>setF("status",v)} options={[{value:"idle",label:"Idle"},{value:"on-route",label:"On Route"},{value:"maintenance",label:"Maintenance"}]}/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>Add Vehicle</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Retailers (order_team)
// ══════════════════════════════════════════════════
export function RetailersPage() {
  const { retailers, addRetailer, updateRetailer, deleteRetailer } = useDB();
  const [modal, setModal] = useState(null);
  const [selR, setSelR]   = useState(null);
  const [alert, setAlert] = useState(null);
  const blank = { name:"", city:"", contact:"", email:"" };
  const [form, setForm]   = useState(blank);
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleCreate = () => {
    if (!form.name || !form.city) { setAlert({t:"error",m:"Name and city are required."}); return; }
    addRetailer(form);
    setAlert({t:"success",m:"✅ Retailer added!"});
    setModal(null); setForm(blank);
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Retailer Management" subtitle={`${retailers.length} retailers in database`}
        actions={[<Btn key="a" onClick={() => setModal("create")}>＋ Add Retailer</Btn>]}/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <Card padding={0}>
        {retailers.length === 0
          ? <Empty icon="🏪" title="No retailers yet" sub="Add your first retailer using the button above"/>
          : <Table
              cols={[
                {key:"id",     label:"ID",      render:v=><span style={{fontFamily:"monospace",fontSize:11,color:C.blue}}>{v}</span>},
                {key:"name",   label:"Retailer",render:v=><span style={{fontWeight:700}}>{v}</span>},
                {key:"city",   label:"City"},
                {key:"contact",label:"Contact"},
                {key:"orders", label:"Orders",  render:v=><strong>{v}</strong>},
                {key:"lastDel",label:"Last Delivery"},
                {key:"status", label:"Status",  render:v=><Badge status={v}/>},
                {key:"id",     label:"Actions", render:(v,row)=>(
                  <div style={{display:"flex",gap:5}}>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();setSelR(row);setForm({name:row.name,city:row.city,contact:row.contact||"",email:row.email||""});setModal("edit");}}>✏️</Btn>
                    <Btn size="xs" variant="ghost" onClick={e=>{e.stopPropagation();deleteRetailer(row.id);setAlert({t:"warning",m:`${row.name} deleted.`});}}>🗑</Btn>
                  </div>
                )},
              ]}
              rows={retailers}
            />
        }
      </Card>

      {/* Create Modal */}
      <Modal open={modal==="create"} onClose={() => setModal(null)} title="Add New Retailer">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Retailer Name *" value={form.name}    onChange={v=>setF("name",v)}    placeholder="e.g. Arpico Kandy"/>
          <Input label="City *"          value={form.city}    onChange={v=>setF("city",v)}    placeholder="e.g. Kandy"/>
          <Input label="Contact Phone"   value={form.contact} onChange={v=>setF("contact",v)} placeholder="+94 xx xxx xxxx"/>
          <Input label="Email"           value={form.email}   onChange={v=>setF("email",v)}   placeholder="manager@retailer.lk" type="email"/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleCreate}>Add Retailer</Btn>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal==="edit"} onClose={() => setModal(null)} title={`Edit: ${selR?.name}`}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <Input label="Name"    value={form.name}    onChange={v=>setF("name",v)}/>
          <Input label="City"    value={form.city}    onChange={v=>setF("city",v)}/>
          <Input label="Contact" value={form.contact} onChange={v=>setF("contact",v)}/>
          <Input label="Email"   value={form.email}   onChange={v=>setF("email",v)} type="email"/>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:20 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={() => { updateRetailer(selR.id,form); setAlert({t:"success",m:"Retailer updated."}); setModal(null); }}>Save Changes</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PAGE: Messages (all roles)
// ══════════════════════════════════════════════════
export function MessagesPage({ user }) {
  const { users, messages, notifications, addMessage, markMessagesRead, markAllRead } = useDB();
  const [selContact, setSel]   = useState(null);
  const [msgText, setMsgText]  = useState("");
  const [announcement, setAnn] = useState("");
  const [tab, setTab]          = useState("chat");
  const [alert, setAlert]      = useState(null);

  const contacts = users.filter(u => u.id !== user.id);
  const thread   = selContact
    ? messages.filter(m => (m.from===user.id&&m.to===selContact.id)||(m.from===selContact.id&&m.to===user.id))
    : [];
  const unreadFor = cid => messages.filter(m => m.from===cid&&m.to===user.id&&!m.read).length;

  const handleSelect = (c) => {
    setSel(c);
    markMessagesRead(c.id, user.id);
  };

  const sendMsg = () => {
    if (!msgText.trim() || !selContact) return;
    addMessage({ from:user.id, to:selContact.id, text:msgText });
    setMsgText("");
  };

  return (
    <div className="anim-fadeUp">
      <SectionHeader title="Communication Center" subtitle="In-app messaging, broadcasts, and notifications"/>
      {alert && <Alert type={alert.t} message={alert.m} onClose={() => setAlert(null)} style={{ marginBottom:14 }}/>}

      <div style={{ marginBottom:14 }}>
        <Tabs active={tab} onChange={setTab} tabs={[{id:"chat",label:"💬 Direct Messages"},{id:"broadcast",label:"📢 Announcements"},{id:"notifications",label:`🔔 Notifications (${notifications.filter(n=>!n.read).length})`}]}/>
      </div>

      {tab==="chat" && (
        <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:16,height:540 }}>
          <Card padding={0} style={{ overflow:"hidden" }}>
            <div style={{ padding:"12px 16px",borderBottom:`1px solid ${C.border}`,fontWeight:800,fontSize:13,color:C.text }}>Team Members</div>
            <div style={{ overflowY:"auto",height:"calc(100% - 48px)" }}>
              {contacts.map(c => {
                const unread = unreadFor(c.id);
                return (
                  <div key={c.id} onClick={() => handleSelect(c)}
                    style={{ display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:selContact?.id===c.id?"#FFF0F3":"white" }}>
                    <Avatar initials={c.avatar} color={ROLE_COLORS[c.role]} size={34}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:12,color:C.text }}>{c.name}</div>
                      <div style={{ fontSize:10,color:ROLE_COLORS[c.role],fontWeight:600 }}>{ROLE_LABELS[c.role]}</div>
                    </div>
                    {unread > 0 && <div style={{ width:18,height:18,borderRadius:"50%",background:C.red,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{unread}</div>}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding={0} style={{ display:"flex",flexDirection:"column",overflow:"hidden" }}>
            {selContact ? (
              <>
                <div style={{ padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12 }}>
                  <Avatar initials={selContact.avatar} color={ROLE_COLORS[selContact.role]} size={34}/>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:C.text }}>{selContact.name}</div>
                    <div style={{ fontSize:11,color:C.green }}>● Online · {ROLE_LABELS[selContact.role]}</div>
                  </div>
                  <div style={{ marginLeft:"auto",display:"flex",gap:7 }}>
                    <Btn size="sm" variant="ghost">📞 Call</Btn>
                    <Btn size="sm" variant="danger">🚨 Emergency</Btn>
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto",padding:18,display:"flex",flexDirection:"column",gap:10 }}>
                  {thread.length === 0 && <Empty icon="💬" title="No messages yet" sub="Start the conversation!"/>}
                  {thread.map(m => {
                    const isMe = m.from === user.id;
                    const sender = users.find(u => u.id === m.from);
                    return (
                      <div key={m.id} style={{ display:"flex",justifyContent:isMe?"flex-end":"flex-start" }}>
                        <div style={{ maxWidth:"72%",background:isMe?C.red:"#F1F5F9",color:isMe?"white":C.text,padding:"10px 14px",borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",fontSize:13,lineHeight:1.5 }}>
                          <div>{m.text}</div>
                          <div style={{ fontSize:10,opacity:.65,marginTop:4,textAlign:"right" }}>{m.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding:"10px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8 }}>
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
        <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:16 }}>
          <Card>
            <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:14 }}>📢 Send Announcement</div>
            <Select label="Target Audience" value="all" onChange={()=>{}} options={[{value:"all",label:"All Staff"},{value:"driver",label:"Drivers Only"},{value:"warehouse",label:"Warehouse Only"}]} style={{ marginBottom:14 }}/>
            <Textarea label="Announcement Message" value={announcement} onChange={setAnn} placeholder="Type your announcement here…" rows={5} style={{ marginBottom:14 }}/>
            <Btn full onClick={() => { if(announcement.trim()){setAnn("");setAlert({t:"success",m:"Announcement sent to all staff!"});} }}>📨 Send Announcement</Btn>
          </Card>
          <Card>
            <div style={{ fontWeight:800,fontSize:14,color:C.text,marginBottom:14 }}>📋 Recent Broadcasts</div>
            {[{msg:"All drivers: Please confirm fuel levels before departure.",time:"08:00",by:"Management"},{msg:"Warehouse: D006 cargo ready for loading.",time:"07:30",by:"Dist. Manager"},{msg:"Route R003 has high traffic on A2 highway.",time:"07:00",by:"Route Planner"}].map((b,i)=>(
              <div key={i} style={{ padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:12,color:C.text,marginBottom:4 }}>{b.msg}</div>
                <div style={{ fontSize:10,color:C.textS }}>{b.by} · {b.time}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="notifications" && (
        <Card padding={0}>
          <div style={{ padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between" }}>
            <span style={{ fontWeight:700,fontSize:14,color:C.text }}>{notifications.length} Notifications ({notifications.filter(n=>!n.read).length} unread)</span>
            <span style={{ fontSize:12,color:C.red,cursor:"pointer",fontWeight:600 }} onClick={markAllRead}>✓ Mark all read</span>
          </div>
          {notifications.length === 0 && <Empty icon="🔔" title="No notifications"/>}
          {notifications.map(n => (
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
