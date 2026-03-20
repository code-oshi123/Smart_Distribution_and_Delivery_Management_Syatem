// ══════════════════════════════════════════════════════════
// NESTLÉ DMS — Sprint 1 v3  (Full Notification System)
// npm install && node server.js  →  http://localhost:5001
// ══════════════════════════════════════════════════════════
const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── DB config ─────────────────────────────────────────────
const DB = {
  server:   'ISHEY-LAPTOP2', port: 1433, database: 'NestleSprint1',
  user: 'sa', password: 'Nestle123!',
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  pool:    { max: 10, min: 0, idleTimeoutMillis: 30000 },
};
let pool;
async function getPool() {
  if (!pool) { pool = await sql.connect(DB); console.log('✓ SQL Server connected'); }
  return pool;
}
async function q(qry, params = {}) {
  const p = await getPool(), r = p.request();
  for (const [k, v] of Object.entries(params)) r.input(k, v);
  return (await r.query(qry)).recordset;
}
async function ex(qry, params = {}) {
  const p = await getPool(), r = p.request();
  for (const [k, v] of Object.entries(params)) r.input(k, v);
  return r.query(qry);
}

// ── Helpers ───────────────────────────────────────────────
const REGIONS = {
  Colombo:'Western', Dehiwala:'Western', Nugegoda:'Western', Negombo:'Western',
  Kiribathgoda:'Western', Kandy:'Central', Peradeniya:'Central',
  Kurunegala:'North Western', Galle:'Southern', Matara:'Southern',
  Jaffna:'Northern', Ratnapura:'Sabaragamuwa'
};
function region(city) { return REGIONS[city] || 'Western'; }
function calcEta(city) {
  const mins = { Colombo:30,Dehiwala:45,Nugegoda:50,Negombo:75,Kiribathgoda:60,
    Kandy:180,Peradeniya:195,Galle:240,Matara:270,Jaffna:390,Ratnapura:150,Kurunegala:180 };
  const t = new Date(Date.now() + (mins[city]||60)*60000);
  return t.toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit'});
}
async function nextId(table, col, prefix) {
  const rows = await q(`SELECT MAX(CAST(SUBSTRING(${col},${prefix.length+1},10) AS INT)) AS n FROM dbo.${table}`);
  return prefix + String((rows[0].n||0)+1).padStart(3,'0');
}

// ══════════════════════════════════════════════════════════
// NOTIFICATION ENGINE
// ══════════════════════════════════════════════════════════

// Send to one specific user
async function notifyUser(userId, type, title, message, refId) {
  await ex(
    `INSERT INTO dbo.Notifications(UserID,Type,Title,Message,RefID) VALUES(@uid,@t,@ti,@m,@r)`,
    { uid:+userId, t:type, ti:title, m:message, r:refId||null }
  );
}

// Send to ALL users of a role
async function notifyRole(role, type, title, message, refId) {
  const users = await q(`SELECT UserID FROM dbo.Users WHERE Role=@r AND IsActive=1`,{ r:role });
  for (const u of users) await notifyUser(u.UserID, type, title, message, refId);
}

// Send to multiple roles
async function notifyRoles(roles, type, title, message, refId) {
  for (const role of roles) await notifyRole(role, type, title, message, refId);
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
  try {
    const rows = await q(
      `SELECT UserID AS id,FullName AS name,Email AS email,Role AS role,Avatar AS avatar
       FROM dbo.Users WHERE Email=@e AND PasswordHash=@p AND IsActive=1`,
      { e:req.body.email, p:req.body.password }
    );
    if (!rows.length) return res.status(401).json({ error:'Invalid credentials' });
    res.json(rows[0]);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ══════════════════════════════════════════════════════════
app.get('/api/notifications', async (req, res) => {
  try {
    const rows = await q(
      `SELECT NotifID AS id,Type AS type,Title AS title,Message AS message,
              RefID AS refId,IsRead AS isRead,
              FORMAT(CreatedAt,'HH:mm dd-MMM') AS time
       FROM dbo.Notifications WHERE UserID=@uid
       ORDER BY CreatedAt DESC`,
      { uid:+req.query.userId }
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/notifications/unread', async (req, res) => {
  try {
    const rows = await q(
      `SELECT COUNT(*) AS cnt FROM dbo.Notifications WHERE UserID=@uid AND IsRead=0`,
      { uid:+req.query.userId }
    );
    res.json({ count: rows[0].cnt });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await ex(`UPDATE dbo.Notifications SET IsRead=1 WHERE NotifID=@id`,{ id:+req.params.id });
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await ex(`UPDATE dbo.Notifications SET IsRead=1 WHERE UserID=@uid`,{ uid:+req.body.userId });
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ══════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════
app.get('/api/orders', async (req, res) => {
  try {
    const { role, userId } = req.query;
    const where = role === 'retailer' ? `WHERE o.RetailerID=${+userId}` : '';
    const rows = await q(`
      SELECT o.OrderID AS id,o.RetailerName AS retailer,o.City AS city,
             o.Region AS region,o.ItemCount AS items,o.WeightKG AS kg,
             o.Priority AS prio,o.Status AS status,o.Notes AS notes,
             o.RejectionReason AS rejectReason,o.RetailerID AS retailerId,
             FORMAT(o.CreatedAt,'HH:mm dd-MMM') AS created,
             u.FullName AS confirmedBy
      FROM dbo.Orders o LEFT JOIN dbo.Users u ON o.ConfirmedBy=u.UserID
      ${where} ORDER BY o.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// RETAILER submits order ──► notify ALL order_team
app.post('/api/orders', async (req, res) => {
  try {
    const { retailerId, retailerName, city, items, kg, priority, notes } = req.body;
    const id = await nextId('Orders','OrderID','ORD');
    await ex(
      `INSERT INTO dbo.Orders(OrderID,RetailerID,RetailerName,City,Region,ItemCount,WeightKG,Priority,Notes,Status)
       VALUES(@id,@rid,@rn,@city,@reg,@items,@kg,@prio,@notes,'pending')`,
      { id, rid:+retailerId, rn:retailerName, city, reg:region(city),
        items:+items, kg:+kg, prio:priority||'normal', notes:notes||'' }
    );

    // 🔔 Notify Order Processing Team
    await notifyRole('order_team','info',
      `New order request — ${id}`,
      `${retailerName} has requested ${items} items (${kg} kg) to ${city}. Priority: ${priority||'normal'}. Please review and confirm or reject.`,
      id
    );

    res.json({ id });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// OPT confirms or rejects ──► notify the retailer
app.put('/api/orders/:id/confirm', async (req, res) => {
  try {
    const { action, confirmedBy, rejectReason } = req.body;
    const status = action === 'confirm' ? 'confirmed' : 'rejected';
    const order = (await q(`SELECT RetailerID,RetailerName,City FROM dbo.Orders WHERE OrderID=@id`,{ id:req.params.id }))[0];
    await ex(
      `UPDATE dbo.Orders SET Status=@s,ConfirmedBy=@cb,RejectionReason=@rr,UpdatedAt=GETDATE() WHERE OrderID=@id`,
      { s:status, cb:+confirmedBy, rr:rejectReason||null, id:req.params.id }
    );

    // 🔔 Notify the Retailer
    if (action === 'confirm') {
      await notifyUser(order.RetailerID,'success',
        `✅ Order ${req.params.id} confirmed`,
        `Your order for ${order.City} has been confirmed by the Order Processing Team. It will be prepared and dispatched to you shortly.`,
        req.params.id
      );
    } else {
      await notifyUser(order.RetailerID,'alert',
        `❌ Order ${req.params.id} rejected`,
        `Your order for ${order.City} was rejected. Reason: ${rejectReason||'Not specified'}. Please submit a new order request.`,
        req.params.id
      );
    }

    res.json({ ok:true, status });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ══════════════════════════════════════════════════════════
// DELIVERIES
// ══════════════════════════════════════════════════════════
app.get('/api/deliveries', async (req, res) => {
  try {
    const { role, userId } = req.query;
    const where = role === 'distributor' ? `WHERE d.DriverID=${+userId}` : '';
    const rows = await q(`
      SELECT d.DeliveryID AS id,d.OrderID AS orderId,
             d.RetailerName AS retailer,d.City AS city,d.Region AS region,
             d.ItemCount AS items,d.WeightKG AS kg,d.Priority AS prio,
             d.Status AS status,d.ETA AS eta,d.Notes AS notes,
             d.DriverID AS driverId,d.VehicleID AS vehicleId,
             u.FullName AS driverName,u.Avatar AS driverAvatar
      FROM dbo.Deliveries d LEFT JOIN dbo.Users u ON d.DriverID=u.UserID
      ${where} ORDER BY d.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// OPT consolidates ──► notify Route Planner + Warehouse
app.post('/api/deliveries/consolidate', async (req, res) => {
  try {
    const confirmed = await q(`SELECT * FROM dbo.Orders WHERE Status='confirmed'`);
    if (!confirmed.length) return res.json({ created:0 });

    let created = 0;
    const cities = [];
    for (const o of confirmed) {
      const id = await nextId('Deliveries','DeliveryID','D');
      await ex(
        `INSERT INTO dbo.Deliveries(DeliveryID,OrderID,RetailerName,City,Region,ItemCount,WeightKG,Priority,Status)
         VALUES(@id,@oid,@rn,@city,@reg,@items,@kg,@prio,'pending')`,
        { id, oid:o.OrderID, rn:o.RetailerName, city:o.City, reg:o.Region,
          items:o.ItemCount, kg:o.WeightKG, prio:o.Priority }
      );
      await ex(`UPDATE dbo.Orders SET Status='consolidated' WHERE OrderID=@id`,{ id:o.OrderID });
      cities.push(o.City);
      created++;
    }

    // 🔔 Notify Route Planner — ready to plan
    await notifyRole('route_planner','info',
      `📋 ${created} deliveries ready to plan`,
      `OPT has consolidated ${created} confirmed orders into delivery records. Cities: ${cities.join(', ')}. Please assign drivers and vehicles now.`,
      null
    );

    // 🔔 Notify Warehouse — heads up, deliveries incoming
    await notifyRole('warehouse','info',
      `📦 ${created} new deliveries incoming`,
      `${created} orders have been consolidated into delivery records. Drivers and vehicles will be assigned shortly. Please prepare warehouse for cargo packing.`,
      null
    );

    res.json({ created });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Route Planner assigns driver + vehicle ──► notify Driver + Warehouse
app.put('/api/deliveries/:id/assign', async (req, res) => {
  try {
    const { driverId, vehicleId, driverName } = req.body;
    const del = (await q(
      `SELECT City,RetailerName,WeightKG,ItemCount FROM dbo.Deliveries WHERE DeliveryID=@id`,
      { id:req.params.id }
    ))[0];
    const etaVal = del ? calcEta(del.City) : '—';

    await ex(
      `UPDATE dbo.Deliveries SET DriverID=@did,VehicleID=@vid,Status='assigned',ETA=@eta,UpdatedAt=GETDATE() WHERE DeliveryID=@id`,
      { did:+driverId, vid:vehicleId, eta:etaVal, id:req.params.id }
    );
    await ex(`UPDATE dbo.Vehicles SET Status='assigned' WHERE VehicleID=@vid`,{ vid:vehicleId });

    // 🔔 Notify the assigned Driver
    await notifyUser(+driverId,'info',
      `🚚 New delivery assigned — ${req.params.id}`,
      `You have been assigned delivery ${req.params.id}. Destination: ${del.RetailerName}, ${del.City}. ${del.ItemCount} items · ${del.WeightKG} kg. Vehicle: ${vehicleId}. ETA: ${etaVal}. Wait for warehouse to prepare and load the cargo.`,
      req.params.id
    );

    // 🔔 Notify Warehouse — full delivery details, prepare cargo
    await notifyRole('warehouse','info',
      `📦 Prepare cargo — Delivery ${req.params.id}`,
      `Delivery ${req.params.id} assigned to ${driverName} (${vehicleId}). Destination: ${del.RetailerName}, ${del.City}. ${del.ItemCount} items · ${del.WeightKG} kg. Please pick, pack and load vehicle now.`,
      req.params.id
    );

    res.json({ ok:true, eta:etaVal });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Warehouse marks cargo ready ──► notify Driver to come pick up
app.put('/api/deliveries/:id/warehouse-ready', async (req, res) => {
  try {
    const del = (await q(
      `SELECT RetailerName,City,DriverID,VehicleID,ItemCount,WeightKG FROM dbo.Deliveries WHERE DeliveryID=@id`,
      { id:req.params.id }
    ))[0];
    await ex(`UPDATE dbo.Deliveries SET Status='warehouse_ready',UpdatedAt=GETDATE() WHERE DeliveryID=@id`,{ id:req.params.id });

    // 🔔 Notify the Driver — cargo packed, come pick up
    if (del?.DriverID) {
      await notifyUser(del.DriverID,'success',
        `✅ Cargo ready — come pick up ${req.params.id}`,
        `Your cargo for ${del.RetailerName}, ${del.City} (${del.ItemCount} items · ${del.WeightKG} kg) has been packed and is ready. Please come to the warehouse to collect vehicle ${del.VehicleID}.`,
        req.params.id
      );
    }
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Warehouse marks vehicle loaded ──► notify Driver to confirm pickup in app
app.put('/api/deliveries/:id/loaded', async (req, res) => {
  try {
    const del = (await q(
      `SELECT RetailerName,City,DriverID,VehicleID FROM dbo.Deliveries WHERE DeliveryID=@id`,
      { id:req.params.id }
    ))[0];
    await ex(`UPDATE dbo.Deliveries SET Status='loaded',UpdatedAt=GETDATE() WHERE DeliveryID=@id`,{ id:req.params.id });

    // 🔔 Notify Driver — vehicle fully loaded, confirm pickup
    if (del?.DriverID) {
      await notifyUser(del.DriverID,'alert',
        `🚛 Vehicle loaded — confirm pickup to begin route`,
        `Vehicle ${del.VehicleID} has been fully loaded with cargo for ${del.RetailerName}, ${del.City}. Please open your app, confirm the pickup and begin your delivery route.`,
        req.params.id
      );
    }
    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// Distributor updates status ──► notify based on new status
// in-transit → Retailer + OPT + Warehouse
// delivered  → Retailer + OPT + Warehouse
// failed     → Retailer + OPT + Warehouse
app.put('/api/deliveries/:id/status', async (req, res) => {
  try {
    const { newStatus, note, updatedBy } = req.body;
    const delRows = await q(
      `SELECT d.Status,d.RetailerName,d.City,d.ETA,d.ItemCount,d.WeightKG,d.VehicleID,
              o.RetailerID
       FROM dbo.Deliveries d LEFT JOIN dbo.Orders o ON d.OrderID=o.OrderID
       WHERE d.DeliveryID=@id`,
      { id:req.params.id }
    );
    const del = delRows[0];
    const oldStatus = del?.Status || 'unknown';

    await ex(`UPDATE dbo.Deliveries SET Status=@s,UpdatedAt=GETDATE() WHERE DeliveryID=@id`,{ s:newStatus, id:req.params.id });
    await ex(
      `INSERT INTO dbo.DeliveryStatus(DeliveryID,UpdatedByID,OldStatus,NewStatus,Note) VALUES(@did,@uid,@os,@ns,@n)`,
      { did:req.params.id, uid:+updatedBy, os:oldStatus, ns:newStatus, n:note||null }
    );

    // ── IN-TRANSIT: notify Retailer, OPT, Warehouse ──────
    if (newStatus === 'in-transit') {
      if (del?.RetailerID) {
        await notifyUser(del.RetailerID,'info',
          `🚚 Your delivery is on the way!`,
          `Delivery ${req.params.id} has been dispatched and is heading to ${del.City}. Your ${del.ItemCount} items should arrive by ${del.ETA}.`,
          req.params.id
        );
      }
      await notifyRoles(['order_team','warehouse'],'info',
        `🚚 Delivery ${req.params.id} dispatched`,
        `${del.RetailerName}, ${del.City} — now in transit. ETA: ${del.ETA}. Driver note: ${note||'—'}.`,
        req.params.id
      );
    }

    // ── DELIVERED: notify Retailer, OPT, Warehouse ───────
    if (newStatus === 'delivered') {
      await ex(`UPDATE dbo.Vehicles SET Status='idle' WHERE VehicleID=(SELECT VehicleID FROM dbo.Deliveries WHERE DeliveryID=@id)`,{ id:req.params.id });
      if (del?.RetailerID) {
        await notifyUser(del.RetailerID,'success',
          `✅ Your order has been delivered!`,
          `Delivery ${req.params.id} — your ${del.ItemCount} items have been successfully delivered to ${del.City}. Thank you for choosing Nestlé!`,
          req.params.id
        );
      }
      await notifyRoles(['order_team','warehouse'],'success',
        `✅ Delivery ${req.params.id} completed`,
        `${del.RetailerName}, ${del.City} — delivered successfully. Note: ${note||'—'}.`,
        req.params.id
      );
    }

    // ── FAILED: notify Retailer, OPT, Warehouse ──────────
    if (newStatus === 'failed') {
      await ex(`UPDATE dbo.Vehicles SET Status='idle' WHERE VehicleID=(SELECT VehicleID FROM dbo.Deliveries WHERE DeliveryID=@id)`,{ id:req.params.id });
      if (del?.RetailerID) {
        await notifyUser(del.RetailerID,'alert',
          `❌ Delivery ${req.params.id} failed`,
          `Your delivery to ${del.City} could not be completed. Reason: ${note||'Not specified'}. Please contact the Order Processing Team to reschedule.`,
          req.params.id
        );
      }
      await notifyRoles(['order_team','warehouse'],'alert',
        `❌ Delivery ${req.params.id} failed`,
        `${del.RetailerName}, ${del.City} — delivery failed. Reason: ${note||'Not specified'}. Immediate action required.`,
        req.params.id
      );
    }

    res.json({ ok:true });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ══════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════
app.get('/api/routes', async (req, res) => {
  try {
    const rows = await q(`
      SELECT r.RouteID AS id,r.RouteName AS name,r.StopCount AS stops,
             r.DistanceKM AS distKm,r.DurationMins AS durMins,
             r.CitySequence AS cities,r.Status AS status,
             u.FullName AS driverName,r.VehicleID AS vehicleId
      FROM dbo.Routes r LEFT JOIN dbo.Users u ON r.DriverID=u.UserID
      ORDER BY r.CreatedAt DESC`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/routes', async (req, res) => {
  try {
    const { driverId, driverName, vehicleId, stops, distKm, durMins, cities } = req.body;
    const id = await nextId('Routes','RouteID','R');
    await ex(
      `INSERT INTO dbo.Routes(RouteID,RouteName,DriverID,VehicleID,StopCount,DistanceKM,DurationMins,CitySequence,Status)
       VALUES(@id,@name,@did,@vid,@stops,@dist,@dur,@cities,'planned')`,
      { id, name:`${driverName} Route`, did:+driverId, vid:vehicleId,
        stops:+stops, dist:+distKm, dur:+durMins, cities:JSON.stringify(cities) }
    );
    res.json({ id });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

// ══════════════════════════════════════════════════════════
// REFERENCE DATA
// ══════════════════════════════════════════════════════════
app.get('/api/drivers', async (req, res) => {
  try {
    res.json(await q(`SELECT UserID AS id,FullName AS name,Avatar AS avatar FROM dbo.Users WHERE Role='distributor' AND IsActive=1`));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    res.json(await q(`SELECT VehicleID AS id,Plate AS plate,VehicleType AS type,Capacity AS cap,FuelPercent AS fuel,Status AS status FROM dbo.Vehicles`));
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.get('/api/status-log/:deliveryId', async (req, res) => {
  try {
    const rows = await q(`
      SELECT ds.OldStatus AS oldStatus,ds.NewStatus AS newStatus,ds.Note AS note,
             FORMAT(ds.UpdatedAt,'HH:mm dd-MMM') AS time,u.FullName AS updatedBy
      FROM dbo.DeliveryStatus ds JOIN dbo.Users u ON ds.UpdatedByID=u.UserID
      WHERE ds.DeliveryID=@id ORDER BY ds.UpdatedAt DESC`,{ id:req.params.deliveryId });
    res.json(rows);
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.listen(5001, () => {
  console.log('\n🟢 Nestlé DMS v3 + Notifications → http://localhost:5001');
  console.log('   Open http://localhost:5001/demo.html\n');
});
