// ════════════════════════════════════════════════════════
// NESTLÉ DMS — Sprint 1 v2  Express API
// node server.js   →   http://localhost:5001
// ════════════════════════════════════════════════════════

const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // serve demo.html

// ── DB config ────────────────────────────────────────────
const DB = {
  server:   'ISHEY-LAPTOP2',
  port:      1433,
  database: 'NestleSprint1',
  user:     'sa',
  password: 'Nestle123!',
  options:  { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  pool:     { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool;
async function getPool() {
  if (!pool) { pool = await sql.connect(DB); console.log('✓ SQL Server connected'); }
  return pool;
}
async function q(query, params = {}) {
  const p = await getPool(), r = p.request();
  for (const [k, v] of Object.entries(params)) r.input(k, v);
  return (await r.query(query)).recordset;
}
async function ex(query, params = {}) {
  const p = await getPool(), r = p.request();
  for (const [k, v] of Object.entries(params)) r.input(k, v);
  return r.query(query);
}

// ── Helpers ──────────────────────────────────────────────
function region(city) {
  const m = { Colombo:'Western',Dehiwala:'Western',Nugegoda:'Western',Negombo:'Western',
    Kiribathgoda:'Western',Kandy:'Central',Peradeniya:'Central',Kurunegala:'North Western',
    Galle:'Southern',Matara:'Southern',Jaffna:'Northern',Ratnapura:'Sabaragamuwa' };
  return m[city] || 'Western';
}
function eta(city) {
  const m = { Colombo:30,Dehiwala:45,Nugegoda:50,Negombo:75,Kiribathgoda:60,
    Kandy:180,Peradeniya:195,Galle:240,Matara:270,Jaffna:390,Ratnapura:150,Kurunegala:180 };
  const t = new Date(Date.now() + (m[city]||60) * 60000);
  return t.toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit'});
}
async function nextId(table, col, prefix) {
  const rows = await q(`SELECT MAX(CAST(SUBSTRING(${col},${prefix.length+1},10) AS INT)) AS n FROM dbo.${table}`);
  const n = (rows[0].n || 0) + 1;
  return prefix + String(n).padStart(3,'0');
}

// ════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
  try {
    const rows = await q(
      `SELECT UserID AS id, FullName AS name, Email AS email, Role AS role, Avatar AS avatar
       FROM dbo.Users WHERE Email=@e AND PasswordHash=@p AND IsActive=1`,
      { e: req.body.email, p: req.body.password }
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
// ORDERS  — retailer submits, OPT confirms/rejects
// ════════════════════════════════════════════════════════

// GET all orders (filtered by role via query param)
app.get('/api/orders', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let where = '';
    if (role === 'retailer') where = `WHERE o.RetailerID = ${+userId}`;
    const rows = await q(`
      SELECT o.OrderID AS id, o.RetailerName AS retailer, o.City AS city,
             o.Region AS region, o.ItemCount AS items, o.WeightKG AS kg,
             o.Priority AS prio, o.Status AS status, o.Notes AS notes,
             o.RejectionReason AS rejectReason,
             FORMAT(o.CreatedAt,'HH:mm dd-MMM') AS created,
             u.FullName AS confirmedBy
      FROM dbo.Orders o
      LEFT JOIN dbo.Users u ON o.ConfirmedBy = u.UserID
      ${where}
      ORDER BY o.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — retailer creates order request
app.post('/api/orders', async (req, res) => {
  try {
    const { retailerId, retailerName, city, items, kg, priority, notes } = req.body;
    const id = await nextId('Orders','OrderID','ORD');
    await ex(`INSERT INTO dbo.Orders
        (OrderID,RetailerID,RetailerName,City,Region,ItemCount,WeightKG,Priority,Notes,Status)
      VALUES (@id,@rid,@rname,@city,@reg,@items,@kg,@prio,@notes,'pending')`,
      { id, rid:+retailerId, rname:retailerName, city, reg:region(city), items:+items, kg:+kg, prio:priority||'normal', notes:notes||'' });
    res.json({ id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — OPT confirms or rejects an order
app.put('/api/orders/:id/confirm', async (req, res) => {
  try {
    const { action, confirmedBy, rejectReason } = req.body; // action: 'confirm'|'reject'
    const status = action === 'confirm' ? 'confirmed' : 'rejected';
    await ex(`UPDATE dbo.Orders SET Status=@s, ConfirmedBy=@cb, RejectionReason=@rr, UpdatedAt=GETDATE()
      WHERE OrderID=@id`,
      { s: status, cb: +confirmedBy, rr: rejectReason||null, id: req.params.id });
    res.json({ ok: true, status });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
// DELIVERIES — OPT consolidates, route planner assigns
// ════════════════════════════════════════════════════════

// GET all deliveries
app.get('/api/deliveries', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let where = '';
    if (role === 'distributor') where = `WHERE d.DriverID = ${+userId}`;
    const rows = await q(`
      SELECT d.DeliveryID AS id, d.OrderID AS orderId,
             d.RetailerName AS retailer, d.City AS city, d.Region AS region,
             d.ItemCount AS items, d.WeightKG AS kg, d.Priority AS prio,
             d.Status AS status, d.ETA AS eta, d.Notes AS notes,
             d.DriverID AS driverId, d.VehicleID AS vehicleId,
             u.FullName AS driverName, u.Avatar AS driverAvatar
      FROM dbo.Deliveries d
      LEFT JOIN dbo.Users u ON d.DriverID = u.UserID
      ${where}
      ORDER BY d.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — OPT consolidates confirmed orders → creates deliveries
app.post('/api/deliveries/consolidate', async (req, res) => {
  try {
    const confirmed = await q(
      `SELECT * FROM dbo.Orders WHERE Status='confirmed'`);
    if (!confirmed.length) return res.json({ created: 0 });
    let created = 0;
    for (const o of confirmed) {
      const id = await nextId('Deliveries','DeliveryID','D');
      await ex(`INSERT INTO dbo.Deliveries
          (DeliveryID,OrderID,RetailerName,City,Region,ItemCount,WeightKG,Priority,Status)
        VALUES (@id,@oid,@rn,@city,@reg,@items,@kg,@prio,'pending')`,
        { id, oid:o.OrderID, rn:o.RetailerName, city:o.City, reg:o.Region,
          items:o.ItemCount, kg:o.WeightKG, prio:o.Priority });
      await ex(`UPDATE dbo.Orders SET Status='consolidated' WHERE OrderID=@id`,{ id:o.OrderID });
      created++;
    }
    res.json({ created });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — route planner assigns driver + vehicle to a delivery
app.put('/api/deliveries/:id/assign', async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const rows = await q(`SELECT City FROM dbo.Deliveries WHERE DeliveryID=@id`,{ id:req.params.id });
    const etaVal = rows.length ? eta(rows[0].City) : '—';
    await ex(`UPDATE dbo.Deliveries SET DriverID=@did, VehicleID=@vid,
        Status='assigned', ETA=@eta, UpdatedAt=GETDATE()
      WHERE DeliveryID=@id`,
      { did:+driverId, vid:vehicleId, eta:etaVal, id:req.params.id });
    await ex(`UPDATE dbo.Vehicles SET Status='assigned' WHERE VehicleID=@vid`,{ vid:vehicleId });
    res.json({ ok:true, eta:etaVal });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — warehouse marks delivery as ready
app.put('/api/deliveries/:id/warehouse-ready', async (req, res) => {
  try {
    await ex(`UPDATE dbo.Deliveries SET Status='warehouse_ready', UpdatedAt=GETDATE()
      WHERE DeliveryID=@id`, { id:req.params.id });
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PUT — distributor updates delivery status (only own deliveries)
app.put('/api/deliveries/:id/status', async (req, res) => {
  try {
    const { newStatus, note, updatedBy } = req.body;
    const old = await q(`SELECT Status FROM dbo.Deliveries WHERE DeliveryID=@id`,{ id:req.params.id });
    const oldStatus = old[0]?.Status || 'unknown';
    await ex(`UPDATE dbo.Deliveries SET Status=@s, UpdatedAt=GETDATE() WHERE DeliveryID=@id`,
      { s:newStatus, id:req.params.id });
    await ex(`INSERT INTO dbo.DeliveryStatus(DeliveryID,UpdatedByID,OldStatus,NewStatus,Note)
      VALUES (@did,@uid,@os,@ns,@n)`,
      { did:req.params.id, uid:+updatedBy, os:oldStatus, ns:newStatus, n:note||null });
    if (newStatus==='delivered'||newStatus==='failed') {
      await ex(`UPDATE dbo.Vehicles SET Status='idle' WHERE VehicleID=(SELECT VehicleID FROM dbo.Deliveries WHERE DeliveryID=@id)`,{ id:req.params.id });
    }
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════
app.get('/api/routes', async (req, res) => {
  try {
    const rows = await q(`
      SELECT r.RouteID AS id, r.RouteName AS name, r.StopCount AS stops,
             r.DistanceKM AS distKm, r.DurationMins AS durMins,
             r.CitySequence AS cities, r.Status AS status,
             u.FullName AS driverName, r.VehicleID AS vehicleId
      FROM dbo.Routes r
      LEFT JOIN dbo.Users u ON r.DriverID = u.UserID
      ORDER BY r.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/routes', async (req, res) => {
  try {
    const { driverId, driverName, vehicleId, stops, distKm, durMins, cities } = req.body;
    const id = await nextId('Routes','RouteID','R');
    await ex(`INSERT INTO dbo.Routes(RouteID,RouteName,DriverID,VehicleID,StopCount,DistanceKM,DurationMins,CitySequence,Status)
      VALUES (@id,@name,@did,@vid,@stops,@dist,@dur,@cities,'planned')`,
      { id, name:`${driverName} Route`, did:+driverId, vid:vehicleId,
        stops:+stops, dist:+distKm, dur:+durMins, cities:JSON.stringify(cities) });
    res.json({ id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════
// REFERENCE DATA
// ════════════════════════════════════════════════════════
app.get('/api/drivers', async (req, res) => {
  try {
    res.json(await q(`SELECT UserID AS id, FullName AS name, Avatar AS avatar FROM dbo.Users WHERE Role='distributor' AND IsActive=1`));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    res.json(await q(`SELECT VehicleID AS id, Plate AS plate, VehicleType AS type, Capacity AS cap, FuelPercent AS fuel, Status AS status FROM dbo.Vehicles`));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/status-log/:deliveryId', async (req, res) => {
  try {
    const rows = await q(`
      SELECT ds.OldStatus AS oldStatus, ds.NewStatus AS newStatus, ds.Note AS note,
             FORMAT(ds.UpdatedAt,'HH:mm dd-MMM') AS time, u.FullName AS updatedBy
      FROM dbo.DeliveryStatus ds
      JOIN dbo.Users u ON ds.UpdatedByID = u.UserID
      WHERE ds.DeliveryID=@id ORDER BY ds.UpdatedAt DESC`, { id:req.params.deliveryId });
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Start ────────────────────────────────────────────────
app.listen(5001, () => {
  console.log('\n🟢 Nestlé Sprint 1 v2 running at http://localhost:5001');
  console.log('   Open http://localhost:5001/demo.html\n');
});
