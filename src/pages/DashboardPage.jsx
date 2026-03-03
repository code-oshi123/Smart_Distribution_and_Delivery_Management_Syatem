// ═══════════════════════════════════════════════════
// PAGE: Management Dashboard (Role: management)
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { DELIVERIES, VEHICLES, KPI_HISTORY, NOTIFICATIONS, GPS_LOGS } from "../data/db";
import { C } from "../styles/theme";
import { Card, KPICard, SectionHeader, Badge, ProgressBar, Table, Btn, Tabs } from "../components/UI";
import { SriLankaMap, BarChart, LineChart, DonutChart } from "../components/Charts";

export default function DashboardPage() {
  const [mapSelected, setMapSelected] = useState(null);
  const [chartTab, setChartTab] = useState("weekly");

  const total   = DELIVERIES.length;
  const done    = DELIVERIES.filter(d=>d.status==="delivered"||d.status==="completed").length;
  const delayed = DELIVERIES.filter(d=>d.status==="delayed").length;
  const inT     = DELIVERIES.filter(d=>d.status==="in-transit").length;
  const pending = DELIVERIES.filter(d=>d.status==="pending").length;
  const failed  = DELIVERIES.filter(d=>d.status==="failed").length;
  const onTimeD = DELIVERIES.filter(d=>(d.status==="delivered"||d.status==="completed")&&d.delay<=15).length;
  const onTimePct = done ? Math.round((onTimeD/done)*100) : 0;
  const activeV = VEHICLES.filter(v=>v.status==="on-route").length;

  const donutData = [
    { value:done,    color:C.green,  label:"Delivered"  },
    { value:inT,     color:C.blue,   label:"In Transit" },
    { value:delayed, color:"#EF4444",label:"Delayed"    },
    { value:pending, color:C.amber,  label:"Pending"    },
    { value:failed,  color:C.purple, label:"Failed"     },
  ];

  const chartData = chartTab==="weekly" ? KPI_HISTORY.weekly_deliveries : KPI_HISTORY.monthly_deliveries;

  return (
    <div className="anim-fadeUp">
      <SectionHeader
        title="Operations Dashboard"
        subtitle={`Live overview · ${new Date().toLocaleDateString("en-LK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`}
        actions={[
          <Btn key="r" variant="ghost" size="sm">⬇ Export PDF</Btn>,
          <Btn key="f" variant="ghost" size="sm">🔄 Refresh</Btn>,
        ]}
      />

      {/* KPI Row */}
      <div className="anim-fade1" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <KPICard label="Total Deliveries"  value={total}         sub="Today"                    icon="📦" color={C.blue}   trend="+2 vs yesterday" trendUp={true}/>
        <KPICard label="On-Time Rate"       value={`${onTimePct}%`} sub={`${onTimeD}/${done} on time`} icon="✅" color={C.green}  trend="+3% vs last week" trendUp={true}/>
        <KPICard label="Active Vehicles"    value={activeV}       sub={`of ${VEHICLES.length} fleet`} icon="🚛" color={C.red}    trend="Same as yesterday" trendUp={true}/>
        <KPICard label="Delayed Deliveries" value={delayed}       sub="Require attention"         icon="⚠️" color={C.amber}  trend="+1 vs yesterday"  trendUp={false}/>
      </div>

      {/* Row 2: Map + Fleet */}
      <div className="anim-fade2" style={{ display:"grid", gridTemplateColumns:"1.45fr 1fr", gap:14, marginBottom:14 }}>
        {/* Live Map */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:C.text }}>🗺️ Live Fleet Map</div>
              <div style={{ fontSize:11, color:C.textS, marginTop:2 }}>{activeV} vehicles active · Click to inspect</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:C.greenL, borderRadius:7, padding:"4px 10px" }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite" }}/>
              <span style={{ fontSize:11,color:C.green,fontWeight:700 }}>Live GPS</span>
            </div>
          </div>
          <SriLankaMap vehicles={VEHICLES} gpsLogs={GPS_LOGS} onSelect={v=>setMapSelected(v.id===mapSelected?null:v.id)} selected={mapSelected} height={310}/>
        </Card>

        {/* Fleet Status */}
        <Card>
          <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:14 }}>🚛 Fleet Status</div>
          {VEHICLES.map(v=>(
            <div key={v.id} onClick={()=>setMapSelected(v.id===mapSelected?null:v.id)}
              style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}`, cursor:"pointer", transition:"background .1s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontWeight:800, fontSize:13, color:mapSelected===v.id?C.red:C.text, fontFamily:"'JetBrains Mono', monospace" }}>{v.id}</span>
                  <span style={{ fontSize:11, color:C.textS }}>{v.plate}</span>
                </div>
                <Badge status={v.status}/>
              </div>
              <div style={{ fontSize:11, color:C.textS, marginBottom:5 }}>{v.type} · Cap: {v.cap}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <ProgressBar value={v.fuel} height={5} style={{ flex:1 }}/>
                <span style={{ fontSize:10,fontWeight:700,color:v.fuel<30?C.red:v.fuel<60?C.amber:C.green,flexShrink:0 }}>{v.fuel}%</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Row 3: Charts */}
      <div className="anim-fade3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Deliveries Chart */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:C.text }}>📊 Delivery Volume</div>
              <div style={{ fontSize:11, color:C.textS, marginTop:2 }}>Dispatched over time</div>
            </div>
            <Tabs active={chartTab} onChange={setChartTab} tabs={[{id:"weekly",label:"Week"},{id:"monthly",label:"Month"}]}/>
          </div>
          <BarChart data={chartData} color={C.red} showValues/>
        </Card>

        {/* Status Donut */}
        <Card style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:16, alignSelf:"flex-start" }}>📋 Status Breakdown</div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <DonutChart segments={donutData} size={120} thickness={22} label={`${total}`} sublabel="total"/>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {donutData.map(s=>(
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:9,height:9,borderRadius:2,background:s.color,flexShrink:0 }}/>
                  <span style={{ fontSize:11,color:C.textM }}>{s.label}</span>
                  <span style={{ fontSize:11,fontWeight:700,marginLeft:"auto",paddingLeft:8 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* On-time Rate Trend */}
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:4 }}>✅ On-Time Rate Trend</div>
          <div style={{ fontSize:11, color:C.textS, marginBottom:14 }}>Monthly % — Target: 90%</div>
          <LineChart data={KPI_HISTORY.on_time_rate} color={C.green} showValues/>
          <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
            <div style={{ background:C.greenL, borderRadius:6, padding:"4px 10px", fontSize:11, color:C.green, fontWeight:700 }}>Current: 89%</div>
            <div style={{ background:"#F1F5F9", borderRadius:6, padding:"4px 10px", fontSize:11, color:C.textS, fontWeight:600 }}>Target: 90%</div>
          </div>
        </Card>
      </div>

      {/* Row 4: Regional + Recent Deliveries */}
      <div className="anim-fade4" style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:14 }}>
        {/* Regional */}
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.text, marginBottom:14 }}>📍 Deliveries by Region</div>
          {KPI_HISTORY.region_breakdown.map(r=>(
            <div key={r.l} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ fontWeight:600, color:C.textM }}>{r.l}</span>
                <span style={{ color:C.textS }}>{r.count} deliveries ({r.v}%)</span>
              </div>
              <ProgressBar value={r.v} color={C.red}/>
            </div>
          ))}
          <div style={{ marginTop:16, padding:"12px 14px", background:C.redL, borderRadius:9, fontSize:12, color:C.redD }}>
            <strong>Western Region</strong> leads with 60% of all deliveries today. Southern shows a delay pattern.
          </div>
        </Card>

        {/* Recent Deliveries Table */}
        <Card padding={0}>
          <div style={{ padding:"16px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontWeight:800, fontSize:14, color:C.text }}>🕐 Recent Delivery Activity</div>
            <Btn size="sm" variant="ghost">View All →</Btn>
          </div>
          <Table
            cols={[
              { key:"id",       label:"ID",       render:v=><span style={{ fontWeight:700, color:C.red, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{v}</span> },
              { key:"retailer", label:"Retailer"  },
              { key:"city",     label:"City"      },
              { key:"status",   label:"Status",   render:v=><Badge status={v}/> },
              { key:"prio",     label:"Priority", render:v=><Badge priority={v}/> },
              { key:"delay",    label:"Delay",    render:v=>v>0?<span style={{color:C.red,fontWeight:700,fontSize:12}}>{v}m late</span>:<span style={{color:C.green,fontSize:12}}>✓ On time</span> },
              { key:"updated",  label:"Updated"  },
            ]}
            rows={DELIVERIES.slice(0,7)}
          />
        </Card>
      </div>

      {/* Notifications */}
      <div style={{ marginTop:14 }} className="anim-fade4">
        <Card padding={0}>
          <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontWeight:800, fontSize:14, color:C.text }}>🔔 Recent Alerts</div>
            <span style={{ background:C.redM, color:C.red, borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:700 }}>
              {NOTIFICATIONS.filter(n=>!n.read).length} unread
            </span>
          </div>
          <div style={{ padding:"8px 0" }}>
            {NOTIFICATIONS.slice(0,4).map(n=>(
              <div key={n.id} style={{ display:"flex", gap:12, padding:"10px 20px", background:n.read?"white":"#FFFBFB", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:18,flexShrink:0 }}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{n.title}</div>
                  <div style={{ fontSize:12,color:C.textS,marginTop:2 }}>{n.msg}</div>
                </div>
                <div style={{ fontSize:11,color:C.slateL,flexShrink:0,whiteSpace:"nowrap" }}>{n.time}</div>
                {!n.read && <div style={{ width:7,height:7,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:5 }}/>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
