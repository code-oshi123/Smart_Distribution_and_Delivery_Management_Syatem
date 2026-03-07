// ═══════════════════════════════════════════════════
// PAGE: Management Dashboard (Mobile-First v3)
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { useDB, KPI_HISTORY } from "../data/db";
import { C } from "../styles/theme";
import { Card, KPICard, SectionHeader, Badge, ProgressBar, Table, Btn, Tabs, useIsMobile } from "../components/UI";
import { SriLankaMap, BarChart, LineChart, DonutChart } from "../components/Charts";

export default function DashboardPage() {
  const { deliveries: DELIVERIES, vehicles: VEHICLES, notifications: NOTIFICATIONS, gpsLogs: GPS_LOGS } = useDB();
  const isMobile   = useIsMobile();
  const [mapSel,   setMapSel]   = useState(null);
  const [chartTab, setChartTab] = useState("weekly");

  const total    = DELIVERIES.length;
  const done     = DELIVERIES.filter(d=>d.status==="delivered"||d.status==="completed").length;
  const delayed  = DELIVERIES.filter(d=>d.status==="delayed").length;
  const inT      = DELIVERIES.filter(d=>d.status==="in-transit").length;
  const pending  = DELIVERIES.filter(d=>d.status==="pending").length;
  const failed   = DELIVERIES.filter(d=>d.status==="failed").length;
  const onTimeD  = DELIVERIES.filter(d=>(d.status==="delivered"||d.status==="completed")&&d.delay<=15).length;
  const onTimePct= done?Math.round((onTimeD/done)*100):0;
  const activeV  = VEHICLES.filter(v=>v.status==="on-route").length;

  const donutData = [
    {value:done,    color:C.green,   label:"Delivered" },
    {value:inT,     color:C.blue,    label:"In Transit"},
    {value:delayed, color:"#EF4444", label:"Delayed"   },
    {value:pending, color:C.amber,   label:"Pending"   },
    {value:failed,  color:C.purple,  label:"Failed"    },
  ];

  const chartData = chartTab==="weekly" ? KPI_HISTORY.weekly_deliveries : KPI_HISTORY.monthly_deliveries;

  return (
    <div className="anim-fadeUp">

      {/* ── Header ── */}
      <SectionHeader
        title="Operations Dashboard"
        subtitle={new Date().toLocaleDateString("en-LK",{weekday:"short",month:"short",day:"numeric"})}
        actions={!isMobile?[
          <Btn key="r" variant="ghost" size="sm">⬇ Export</Btn>,
          <Btn key="f" variant="ghost" size="sm">🔄 Refresh</Btn>,
        ]:undefined}
      />

      {/* ── KPIs — 2 cols on mobile, 4 on desktop ── */}
      <div className="anim-fade1" style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?10:14,marginBottom:14}}>
        <KPICard label="Total"     value={total}           sub="Today"               icon="📦" color={C.blue}  trend="+2 vs yesterday" trendUp/>
        <KPICard label="On-Time"   value={`${onTimePct}%`} sub={`${onTimeD}/${done}`} icon="✅" color={C.green} trend="+3% vs week"     trendUp/>
        <KPICard label="Active"    value={activeV}         sub="Fleet vehicles"       icon="🚛" color={C.red}   trend="Same as yesterday" trendUp/>
        <KPICard label="Delayed"   value={delayed}         sub="Need attention"       icon="⚠️" color={C.amber} trend="+1 vs yesterday" trendUp={false}/>
      </div>

      {/* ── Map + Fleet — stacked on mobile ── */}
      <div className="anim-fade2" style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.45fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:C.text}}>🗺️ Live Fleet Map</div>
              <div style={{fontSize:11,color:C.textS,marginTop:1}}>{activeV} vehicles active</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,background:C.greenL,borderRadius:6,padding:"3px 10px"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"pulse-dot 1.5s infinite"}}/>
              <span style={{fontSize:10,color:C.green,fontWeight:700}}>GPS Live</span>
            </div>
          </div>
          <SriLankaMap vehicles={VEHICLES} gpsLogs={GPS_LOGS} onSelect={v=>setMapSel(v.id===mapSel?null:v.id)} selected={mapSel} height={isMobile?200:300}/>
        </Card>

        <Card>
          <div style={{fontWeight:800,fontSize:14,color:C.text,marginBottom:12}}>🚛 Fleet Status</div>
          {VEHICLES.map(v=>(
            <div key={v.id} onClick={()=>setMapSel(v.id===mapSel?null:v.id)}
              style={{padding:"9px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontWeight:800,fontSize:12,color:mapSel===v.id?C.red:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{v.id}</span>
                  <span style={{fontSize:10,color:C.textS}}>{v.plate}</span>
                </div>
                <Badge status={v.status}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <ProgressBar value={v.fuel} height={5} style={{flex:1}}/>
                <span style={{fontSize:10,fontWeight:700,color:v.fuel<30?C.red:v.fuel<60?C.amber:C.green,flexShrink:0,width:30,textAlign:"right"}}>{v.fuel}%</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Charts — single col on mobile ── */}
      <div className="anim-fade3" style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontWeight:800,fontSize:13,color:C.text}}>📊 Delivery Volume</div>
              <div style={{fontSize:10,color:C.textS}}>Dispatched over time</div>
            </div>
            <Tabs active={chartTab} onChange={setChartTab} tabs={[{id:"weekly",label:"Week"},{id:"monthly",label:"Month"}]}/>
          </div>
          <BarChart data={chartData} color={C.red} showValues/>
        </Card>

        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:12}}>📋 Status Breakdown</div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <DonutChart segments={donutData} size={isMobile?90:110} thickness={18} label={`${total}`} sublabel="total"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {donutData.map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:11,color:C.textM}}>{s.label}</span>
                  <span style={{fontSize:11,fontWeight:700,marginLeft:"auto",paddingLeft:8}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:4}}>✅ On-Time Rate</div>
          <div style={{fontSize:10,color:C.textS,marginBottom:12}}>Monthly % · Target 90%</div>
          <LineChart data={KPI_HISTORY.on_time_rate} color={C.green} showValues/>
          <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
            <div style={{background:C.greenL,borderRadius:6,padding:"3px 9px",fontSize:11,color:C.green,fontWeight:700}}>Now: 89%</div>
            <div style={{background:"#F1F5F9",borderRadius:6,padding:"3px 9px",fontSize:11,color:C.textS,fontWeight:600}}>Target: 90%</div>
          </div>
        </Card>
      </div>

      {/* ── Regional + Recent ── */}
      <div className="anim-fade4" style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"300px 1fr",gap:14}}>
        <Card>
          <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:12}}>📍 By Region</div>
          {KPI_HISTORY.region_breakdown.map(r=>(
            <div key={r.l} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                <span style={{fontWeight:600,color:C.textM}}>{r.l}</span>
                <span style={{color:C.textS}}>{r.count} ({r.v}%)</span>
              </div>
              <ProgressBar value={r.v} color={C.red}/>
            </div>
          ))}
        </Card>

        {/* Mobile: card list / Desktop: table */}
        {isMobile ? (
          <Card padding={0}>
            <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:800,fontSize:13,color:C.text}}>🕐 Recent Deliveries</div>
              <Btn size="xs" variant="ghost">All →</Btn>
            </div>
            <div style={{padding:"4px 0"}}>
              {DELIVERIES.slice(0,5).map(d=>(
                <div key={d.id} style={{display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:11,color:C.red,fontFamily:"monospace"}}>{d.id}</span>
                      <Badge status={d.status}/>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.retailer}</div>
                    <div style={{fontSize:11,color:C.textS}}>📍 {d.city}</div>
                  </div>
                  {d.delay>0
                    ? <span style={{fontSize:11,color:C.red,fontWeight:700,flexShrink:0}}>{d.delay}m late</span>
                    : <span style={{fontSize:14}}>✅</span>
                  }
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card padding={0}>
            <div style={{padding:"14px 18px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontWeight:800,fontSize:13,color:C.text}}>🕐 Recent Activity</div>
              <Btn size="sm" variant="ghost">View All →</Btn>
            </div>
            <Table
              cols={[
                {key:"id",       label:"ID",       render:v=><span style={{fontWeight:700,color:C.red,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{v}</span>},
                {key:"retailer", label:"Retailer"},
                {key:"city",     label:"City"},
                {key:"status",   label:"Status",   render:v=><Badge status={v}/>},
                {key:"prio",     label:"Priority", render:v=><Badge priority={v}/>},
                {key:"delay",    label:"Delay",    render:v=>v>0?<span style={{color:C.red,fontWeight:700,fontSize:12}}>{v}m</span>:<span style={{color:C.green}}>✓</span>},
              ]}
              rows={DELIVERIES.slice(0,7)}
            />
          </Card>
        )}
      </div>

      {/* ── Alerts ── */}
      <div style={{marginTop:14}} className="anim-fade4">
        <Card padding={0}>
          <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontWeight:800,fontSize:13,color:C.text}}>🔔 Recent Alerts</div>
            <span style={{background:C.redM,color:C.red,borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700}}>
              {NOTIFICATIONS.filter(n=>!n.read).length} unread
            </span>
          </div>
          {NOTIFICATIONS.slice(0,4).map(n=>(
            <div key={n.id} style={{display:"flex",gap:10,padding:"11px 16px",background:n.read?"white":"#FFFBFB",borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
              <span style={{fontSize:17,flexShrink:0}}>{n.type==="critical"?"🔴":n.type==="warning"?"🟡":n.type==="success"?"🟢":"🔵"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{n.title}</div>
                <div style={{fontSize:11,color:C.textS,marginTop:2,lineHeight:1.4}}>{n.msg}</div>
              </div>
              <div style={{fontSize:10,color:C.slateL,flexShrink:0,whiteSpace:"nowrap",marginTop:1}}>{n.time}</div>
              {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:C.red,flexShrink:0,marginTop:5}}/>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
