// ═══════════════════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Database Layer (SQL Server Edition)
// Replaces localStorage with REST API calls to Express + SQL Server
//
// All data now lives in SQL Server (NestleDMS database).
// useDB() hook fetches live data and exposes the same API surface
// as the old localStorage version — no other files need to change.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";

// ── API base URL ────────────────────────────────────────────────
// Change this if your Express server runs on a different port
const API = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
// ── HTTP helpers ────────────────────────────────────────────────
async function GET(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function POST(path, body) {
  const res = await fetch(`${API}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function PUT(path, body) {
  const res = await fetch(`${API}${path}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function DELETE_REQ(path) {
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Static KPI history (chart data — not stored in SQL) ─────────
export const KPI_HISTORY = {
  weekly_deliveries:  [{l:"Mon",v:18},{l:"Tue",v:24},{l:"Wed",v:21},{l:"Thu",v:28},{l:"Fri",v:22},{l:"Sat",v:15},{l:"Sun",v:8}],
  monthly_deliveries: [{l:"Jan",v:136},{l:"Feb",v:152},{l:"Mar",v:148},{l:"Apr",v:163},{l:"May",v:171},{l:"Jun",v:158}],
  on_time_rate:       [{l:"Jan",v:85},{l:"Feb",v:88},{l:"Mar",v:82},{l:"Apr",v:91},{l:"May",v:87},{l:"Jun",v:89}],
  fuel_daily:         [{l:"Mon",v:42},{l:"Tue",v:55},{l:"Wed",v:48},{l:"Thu",v:61},{l:"Fri",v:52},{l:"Sat",v:38},{l:"Sun",v:22}],
  region_breakdown:   [{l:"Western",v:60,count:6},{l:"Central",v:20,count:2},{l:"Southern",v:10,count:1},{l:"Northern",v:10,count:1}],
  driver_perf: [
    { name:"Kumara Silva",      deliveries:48, onTime:44, rate:92, fuel:"420 L", avgDelay:"12 min" },
    { name:"Nimal Jayawardena", deliveries:41, onTime:35, rate:85, fuel:"380 L", avgDelay:"18 min" },
  ],
};

// ════════════════════════════════════════════════════════════════
// PUBLIC DB API  (same method names as old localStorage version)
// Call these anywhere outside of React components.
// Inside components, use useDB() instead.
// ════════════════════════════════════════════════════════════════
export const DB = {

  // ─ Auth ─────────────────────────────────────────────────────
  login: (email, password) => POST("/auth/login", { email, password }),

  // ─ Users ────────────────────────────────────────────────────
  getUsers:    ()          => GET("/users"),
  addUser:     (u)         => POST("/users", u),
  updateUser:  (id, fields)=> PUT(`/users/${id}`, fields),
  deleteUser:  (id)        => DELETE_REQ(`/users/${id}`),

  // ─ Vehicles ─────────────────────────────────────────────────
  getVehicles:   ()          => GET("/vehicles"),
  addVehicle:    (v)         => POST("/vehicles", v),
  updateVehicle: (id, fields)=> PUT(`/vehicles/${id}`, fields),
  deleteVehicle: (id)        => DELETE_REQ(`/vehicles/${id}`),

  // ─ Retailers ────────────────────────────────────────────────
  getRetailers:   ()          => GET("/retailers"),
  addRetailer:    (r)         => POST("/retailers", r),
  updateRetailer: (id, fields)=> PUT(`/retailers/${id}`, fields),
  deleteRetailer: (id)        => DELETE_REQ(`/retailers/${id}`),

  // ─ Inventory ────────────────────────────────────────────────
  getInventory:        ()          => GET("/inventory"),
  addInventoryItem:    (i)         => POST("/inventory", i),
  updateInventoryItem: (id, fields)=> PUT(`/inventory/${id}`, fields),
  deleteInventoryItem: (id)        => DELETE_REQ(`/inventory/${id}`),

  // ─ Deliveries ───────────────────────────────────────────────
  getDeliveries:  ()          => GET("/deliveries"),
  addDelivery:    (d)         => POST("/deliveries", d),
  updateDelivery: (id, fields)=> PUT(`/deliveries/${id}`, fields),
  deleteDelivery: (id)        => DELETE_REQ(`/deliveries/${id}`),

  // ─ Orders ───────────────────────────────────────────────────
  getOrders:  ()          => GET("/orders"),
  addOrder:   (o)         => POST("/orders", o),
  updateOrder:(id, fields)=> PUT(`/orders/${id}`, fields),
  deleteOrder:(id)        => DELETE_REQ(`/orders/${id}`),

  // ─ Routes ───────────────────────────────────────────────────
  getRoutes:  ()          => GET("/routes"),
  addRoute:   (r)         => POST("/routes", r),
  updateRoute:(id, fields)=> PUT(`/routes/${id}`, fields),
  deleteRoute:(id)        => DELETE_REQ(`/routes/${id}`),

  // ─ Notifications ────────────────────────────────────────────
  getNotifications: ()    => GET("/notifications"),
  addNotification:  (n)   => POST("/notifications", n),
  markAllRead:      ()    => PUT("/notifications/mark-all-read", {}),

  // ─ Messages ─────────────────────────────────────────────────
  getMessages:      ()           => GET("/messages"),
  addMessage:       (m)          => POST("/messages", m),
  markMessagesRead: (fromId,toId)=> PUT("/messages/mark-read", { fromId, toId }),

  // ─ GPS ──────────────────────────────────────────────────────
  getGpsLogs: () => GET("/gps"),
};

// ════════════════════════════════════════════════════════════════
// useDB  React Hook
// Fetches all data once on mount, exposes live state + all mutators.
// Call refresh() or any mutator to re-fetch from SQL Server.
// ════════════════════════════════════════════════════════════════
export function useDB() {
  const [state, setState] = useState({
    users: [], vehicles: [], retailers: [], inventory: [],
    deliveries: [], orders: [], routes: [],
    notifications: [], messages: [], gpsLogs: [],
    loading: true, error: null,
  });

  // ── Fetch all tables in parallel ──────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [
        users, vehicles, retailers, inventory,
        deliveries, orders, routes,
        notifications, messages, gpsLogs,
      ] = await Promise.all([
        DB.getUsers(),
        DB.getVehicles(),
        DB.getRetailers(),
        DB.getInventory(),
        DB.getDeliveries(),
        DB.getOrders(),
        DB.getRoutes(),
        DB.getNotifications(),
        DB.getMessages(),
        DB.getGpsLogs(),
      ]);
      setState({
        users, vehicles, retailers, inventory,
        deliveries, orders, routes,
        notifications, messages, gpsLogs,
        loading: false, error: null,
      });
    } catch (err) {
      console.error("useDB fetch error:", err);
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Mutator: run API call then re-fetch ────────────────────────
  const mutate = useCallback((apiFn) => async (...args) => {
    await apiFn(...args);
    await fetchAll();
  }, [fetchAll]);

  return {
    // ── Live data (always fresh from SQL Server) ──
    users:         state.users,
    vehicles:      state.vehicles,
    retailers:     state.retailers,
    inventory:     state.inventory,
    deliveries:    state.deliveries,
    orders:        state.orders,
    routes:        state.routes,
    notifications: state.notifications,
    messages:      state.messages,
    gpsLogs:       state.gpsLogs,
    kpiHistory:    KPI_HISTORY,
    loading:       state.loading,
    error:         state.error,

    // ── Utility ──
    refresh: fetchAll,

    // ── Mutations (each calls SQL Server, then re-fetches) ──
    addDelivery:         mutate((d)        => DB.addDelivery(d)),
    updateDelivery:      mutate((id, f)    => DB.updateDelivery(id, f)),
    deleteDelivery:      mutate((id)       => DB.deleteDelivery(id)),

    addOrder:            mutate((o)        => DB.addOrder(o)),
    updateOrder:         mutate((id, f)    => DB.updateOrder(id, f)),
    deleteOrder:         mutate((id)       => DB.deleteOrder(id)),

    addVehicle:          mutate((v)        => DB.addVehicle(v)),
    updateVehicle:       mutate((id, f)    => DB.updateVehicle(id, f)),
    deleteVehicle:       mutate((id)       => DB.deleteVehicle(id)),

    addRoute:            mutate((r)        => DB.addRoute(r)),
    updateRoute:         mutate((id, f)    => DB.updateRoute(id, f)),
    deleteRoute:         mutate((id)       => DB.deleteRoute(id)),

    addRetailer:         mutate((r)        => DB.addRetailer(r)),
    updateRetailer:      mutate((id, f)    => DB.updateRetailer(id, f)),
    deleteRetailer:      mutate((id)       => DB.deleteRetailer(id)),

    addInventoryItem:    mutate((i)        => DB.addInventoryItem(i)),
    updateInventoryItem: mutate((id, f)    => DB.updateInventoryItem(id, f)),
    deleteInventoryItem: mutate((id)       => DB.deleteInventoryItem(id)),

    addUser:             mutate((u)        => DB.addUser(u)),
    updateUser:          mutate((id, f)    => DB.updateUser(id, f)),
    deleteUser:          mutate((id)       => DB.deleteUser(id)),

    addMessage:          mutate((m)        => DB.addMessage(m)),
    markMessagesRead:    mutate((f, t)     => DB.markMessagesRead(f, t)),

    addNotification:     mutate((n)        => DB.addNotification(n)),
    markAllRead:         mutate(()         => DB.markAllRead()),
  };
}

// ── Legacy named exports (keep existing imports working) ─────────
// These are async now — components that import them directly
// should switch to using useDB() instead.
export const USERS         = [];
export const VEHICLES      = [];
export const DELIVERIES    = [];
export const ORDERS        = [];
export const ROUTES        = [];
export const RETAILERS     = [];
export const INVENTORY     = [];
export const NOTIFICATIONS = [];
export const MESSAGES      = [];
export const GPS_LOGS      = [];
