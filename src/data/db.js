// ═══════════════════════════════════════════════════
// NESTLÉ SRI LANKA DMS — Mock Database
// ═══════════════════════════════════════════════════

export const USERS = [
  { id:1,  name:"Rajith Fernando",    email:"admin@nestle.lk",       pw:"admin123",  role:"management",     avatar:"RF", dept:"IT Management",            phone:"+94 77 123 4567", joined:"Jan 2022", active:true },
  { id:2,  name:"Samanthi Perera",    email:"scm@nestle.lk",         pw:"scm123",    role:"management",     avatar:"SP", dept:"Supply Chain",             phone:"+94 71 234 5678", joined:"Mar 2021", active:true },
  { id:3,  name:"Nuwan Dissanayake",  email:"order@nestle.lk",       pw:"order123",  role:"order_team",     avatar:"ND", dept:"Order Processing",         phone:"+94 76 345 6789", joined:"Jun 2020", active:true },
  { id:4,  name:"Chamodi Rupasinghe", email:"route@nestle.lk",       pw:"route123",  role:"route_planner",  avatar:"CR", dept:"Route Planning",           phone:"+94 70 456 7890", joined:"Sep 2020", active:true },
  { id:5,  name:"Kasun Bandara",      email:"warehouse@nestle.lk",   pw:"wh123",     role:"warehouse",      avatar:"KB", dept:"Warehouse Operations",     phone:"+94 77 567 8901", joined:"Feb 2021", active:true },
  { id:6,  name:"Kumara Silva",       email:"driver1@nestle.lk",     pw:"drv123",    role:"driver",         avatar:"KS", dept:"Field Logistics",          phone:"+94 77 678 9012", joined:"Apr 2022", active:true },
  { id:7,  name:"Nimal Jayawardena",  email:"driver2@nestle.lk",     pw:"drv123",    role:"driver",         avatar:"NJ", dept:"Field Logistics",          phone:"+94 71 789 0123", joined:"Jul 2022", active:true },
  { id:8,  name:"Cargills Manager",   email:"retailer@cargills.lk",  pw:"ret123",    role:"retailer",       avatar:"CM", dept:"Retail — Cargills",        phone:"+94 11 234 5678", joined:"Jan 2023", active:true },
];

export const VEHICLES = [
  { id:"V001", plate:"NB-1234", type:"Heavy Lorry",  cap:"5 Ton",  fuel:78,  status:"on-route",  driver:6,    km:"124,500", lastService:"15 Nov 2024", nextService:"15 Feb 2025", year:2020 },
  { id:"V002", plate:"NB-5678", type:"Mini Truck",   cap:"2 Ton",  fuel:55,  status:"on-route",  driver:7,    km:"89,200",  lastService:"20 Oct 2024", nextService:"20 Jan 2025", year:2021 },
  { id:"V003", plate:"NB-9012", type:"Cargo Van",    cap:"1 Ton",  fuel:40,  status:"delayed",   driver:null, km:"67,800",  lastService:"05 Dec 2024", nextService:"05 Mar 2025", year:2019 },
  { id:"V004", plate:"NB-3456", type:"Heavy Lorry",  cap:"5 Ton",  fuel:92,  status:"idle",      driver:null, km:"201,300", lastService:"01 Jan 2025", nextService:"01 Apr 2025", year:2018 },
  { id:"V005", plate:"NB-7890", type:"Mini Truck",   cap:"2 Ton",  fuel:65,  status:"completed", driver:null, km:"45,100",  lastService:"10 Dec 2024", nextService:"10 Mar 2025", year:2022 },
];

export const DELIVERIES = [
  { id:"D001", retailer:"Cargills Food City",   city:"Dehiwala",      driver:6, veh:"V001", status:"delivered",   prio:"high",   items:24, kg:240,  created:"08:00", updated:"11:20", eta:"11:00", delay:20,  region:"Western",  note:"",                         proof:true  },
  { id:"D002", retailer:"Keells Super",          city:"Nugegoda",      driver:6, veh:"V001", status:"delivered",   prio:"normal", items:18, kg:180,  created:"08:00", updated:"12:05", eta:"12:00", delay:5,   region:"Western",  note:"",                         proof:true  },
  { id:"D003", retailer:"Laugfs Supermarket",    city:"Kiribathgoda",  driver:6, veh:"V001", status:"in-transit",  prio:"high",   items:32, kg:320,  created:"08:00", updated:"13:30", eta:"14:30", delay:0,   region:"Western",  note:"",                         proof:false },
  { id:"D004", retailer:"Arpico Supercentre",    city:"Kandy",         driver:7, veh:"V002", status:"delivered",   prio:"normal", items:40, kg:400,  created:"07:30", updated:"10:45", eta:"10:30", delay:15,  region:"Central",  note:"",                         proof:true  },
  { id:"D005", retailer:"Sathosa Peradeniya",    city:"Peradeniya",    driver:7, veh:"V002", status:"in-transit",  prio:"normal", items:15, kg:150,  created:"07:30", updated:"13:00", eta:"15:15", delay:0,   region:"Central",  note:"",                         proof:false },
  { id:"D006", retailer:"Lanka Sathosa",         city:"Galle Fort",    driver:null,veh:"V003",status:"delayed",    prio:"urgent", items:22, kg:220,  created:"07:00", updated:"14:00", eta:"13:00", delay:90,  region:"Southern", note:"Vehicle breakdown on A2",  proof:false },
  { id:"D007", retailer:"Keells Super Negombo",  city:"Negombo",       driver:null,veh:"V005",status:"completed",  prio:"normal", items:28, kg:280,  created:"06:00", updated:"13:30", eta:"13:00", delay:30,  region:"Western",  note:"",                         proof:true  },
  { id:"D008", retailer:"Cargills Jaffna",       city:"Jaffna",        driver:null,veh:"V004",status:"pending",    prio:"normal", items:35, kg:350,  created:"09:00", updated:"09:00", eta:"—",     delay:0,   region:"Northern", note:"",                         proof:false },
  { id:"D009", retailer:"Arpico Matara",         city:"Matara",        driver:null,veh:"V004",status:"pending",    prio:"high",   items:20, kg:200,  created:"09:30", updated:"09:30", eta:"—",     delay:0,   region:"Southern", note:"",                         proof:false },
  { id:"D010", retailer:"Keells Colombo 07",     city:"Colombo 07",    driver:6, veh:"V001", status:"failed",      prio:"urgent", items:10, kg:100,  created:"07:00", updated:"10:00", eta:"09:30", delay:120, region:"Western",  note:"Customer unavailable",     proof:false },
];

export const ORDERS = [
  { id:"ORD001", retailer:"Cargills Food City",  city:"Dehiwala",    items:24, kg:240,  prio:"high",   status:"dispatched",  window:"10:00–12:00", created:"07:30", stock:"confirmed", delivery:"D001" },
  { id:"ORD002", retailer:"Keells Nugegoda",      city:"Nugegoda",    items:18, kg:180,  prio:"normal", status:"dispatched",  window:"11:00–13:00", created:"07:30", stock:"confirmed", delivery:"D002" },
  { id:"ORD003", retailer:"Laugfs Kiribathgoda",  city:"Kiribathgoda",items:32, kg:320,  prio:"high",   status:"in-transit",  window:"14:00–16:00", created:"08:00", stock:"confirmed", delivery:"D003" },
  { id:"ORD004", retailer:"Arpico Kandy",         city:"Kandy",       items:40, kg:400,  prio:"normal", status:"dispatched",  window:"10:00–12:00", created:"07:00", stock:"confirmed", delivery:"D004" },
  { id:"ORD005", retailer:"Cargills Jaffna",      city:"Jaffna",      items:35, kg:350,  prio:"normal", status:"pending",     window:"—",           created:"09:00", stock:"pending",   delivery:"D008" },
  { id:"ORD006", retailer:"Arpico Matara",        city:"Matara",      items:20, kg:200,  prio:"high",   status:"pending",     window:"—",           created:"09:30", stock:"pending",   delivery:"D009" },
];

export const ROUTES = [
  { id:"R001", name:"Colombo North Circuit",  driver:6,    veh:"V001", stops:8,  dist:"48 km",  dur:"3.5h", eff:92, traffic:"Moderate", status:"active",    fuelEst:"18 L", seq:["Dehiwala","Nugegoda","Kiribathgoda","Kelaniya","Wattala","Peliyagoda","Kolonnawa","Rajagiriya"] },
  { id:"R002", name:"Kandy Central Loop",     driver:7,    veh:"V002", stops:7,  dist:"62 km",  dur:"4h",   eff:85, traffic:"Low",      status:"active",    fuelEst:"22 L", seq:["Kandy","Peradeniya","Katugastota","Kundasale","Ampitiya","Rajawella","Gampola"] },
  { id:"R003", name:"Southern Express",       driver:null, veh:"V003", stops:6,  dist:"95 km",  dur:"5h",   eff:71, traffic:"High",     status:"delayed",   fuelEst:"35 L", seq:["Kalutara","Aluthgama","Bentota","Ambalangoda","Hikkaduwa","Galle"] },
  { id:"R004", name:"Western Coast Run",      driver:null, veh:"V005", stops:9,  dist:"55 km",  dur:"3h",   eff:96, traffic:"Low",      status:"completed", fuelEst:"20 L", seq:["Negombo","Katunayake","Ja-Ela","Seeduwa","Ekala","Ragama","Kandana","Minuwangoda","Nittambuwa"] },
  { id:"R005", name:"Northern Peninsula",     driver:null, veh:"V004", stops:5,  dist:"120 km", dur:"6h",   eff:88, traffic:"Low",      status:"planned",   fuelEst:"45 L", seq:["Vavuniya","Kilinochchi","Elephant Pass","Chavakachcheri","Jaffna"] },
];

export const NOTIFICATIONS = [
  { id:1, type:"critical", title:"Route Deviation Detected",       msg:"V003 has deviated 4km from assigned route near Matara bypass.",    time:"5m ago",  read:false, target:["management","route_planner"] },
  { id:2, type:"warning",  title:"Delivery D006 Severely Delayed",  msg:"Lanka Sathosa, Galle — 90 minutes behind schedule.",              time:"12m ago", read:false, target:["management","route_planner","warehouse"] },
  { id:3, type:"success",  title:"Route R004 Completed",            msg:"Western Coast Run — 9/9 deliveries completed successfully.",       time:"30m ago", read:true,  target:["management"] },
  { id:4, type:"info",     title:"New Order Received — ORD006",     msg:"Arpico Matara requires driver & vehicle assignment.",             time:"1h ago",  read:true,  target:["order_team","route_planner"] },
  { id:5, type:"warning",  title:"Low Fuel — V003",                  msg:"Vehicle V003 fuel at 40%. Schedule refuelling.",                  time:"2h ago",  read:true,  target:["management","route_planner"] },
  { id:6, type:"info",     title:"Dispatch Complete — D004",         msg:"Arpico Kandy shipment dispatched. Kumara on route.",              time:"3h ago",  read:true,  target:["warehouse","driver"] },
];

export const MESSAGES = [
  { id:1, from:3, to:6, text:"Kumara, please confirm D003 delivery status — client is calling.",  time:"13:45", read:false },
  { id:2, from:6, to:3, text:"On the way. ETA 14:30. Traffic near Kiribathgoda junction.",         time:"13:47", read:true  },
  { id:3, from:4, to:7, text:"Nimal, V003 shows delayed. What is the current situation?",          time:"14:00", read:false },
  { id:4, from:7, to:4, text:"Minor breakdown on A2. Mechanic called. Expect 45min delay.",        time:"14:05", read:true  },
  { id:5, from:5, to:6, text:"D003 cargo is loaded and ready. Please confirm departure time.",     time:"09:00", read:true  },
];

export const GPS_LOGS = [
  { veh:"V001", lat:6.912, lng:79.852, time:"14:10", speed:"45 km/h", heading:"North" },
  { veh:"V002", lat:7.293, lng:80.634, time:"14:10", speed:"38 km/h", heading:"East"  },
  { veh:"V003", lat:6.014, lng:80.185, time:"14:08", speed:"0 km/h",  heading:"—"     },
];

export const KPI_HISTORY = {
  weekly_deliveries: [
    {l:"Mon",v:18},{l:"Tue",v:24},{l:"Wed",v:21},{l:"Thu",v:28},{l:"Fri",v:22},{l:"Sat",v:15},{l:"Sun",v:8}
  ],
  monthly_deliveries: [
    {l:"Jan",v:136},{l:"Feb",v:152},{l:"Mar",v:148},{l:"Apr",v:163},{l:"May",v:171},{l:"Jun",v:158}
  ],
  on_time_rate: [
    {l:"Jan",v:85},{l:"Feb",v:88},{l:"Mar",v:82},{l:"Apr",v:91},{l:"May",v:87},{l:"Jun",v:89}
  ],
  fuel_daily: [
    {l:"Mon",v:42},{l:"Tue",v:55},{l:"Wed",v:48},{l:"Thu",v:61},{l:"Fri",v:52},{l:"Sat",v:38},{l:"Sun",v:22}
  ],
  region_breakdown: [
    {l:"Western",  v:60, count:6},
    {l:"Central",  v:20, count:2},
    {l:"Southern", v:10, count:1},
    {l:"Northern", v:10, count:1},
  ],
  driver_perf: [
    { name:"Kumara Silva",      deliveries:48, onTime:44, rate:92, fuel:"420 L", avgDelay:"12 min" },
    { name:"Nimal Jayawardena", deliveries:41, onTime:35, rate:85, fuel:"380 L", avgDelay:"18 min" },
  ],
};

export const RETAILERS = [
  { id:"RET001", name:"Cargills Food City",  city:"Dehiwala",     contact:"011-234-5678", orders:24, lastDel:"Today",      status:"active" },
  { id:"RET002", name:"Keells Super",         city:"Nugegoda",     contact:"011-345-6789", orders:18, lastDel:"Today",      status:"active" },
  { id:"RET003", name:"Arpico Supercentre",   city:"Kandy",        contact:"081-234-5678", orders:40, lastDel:"Today",      status:"active" },
  { id:"RET004", name:"Lanka Sathosa",        city:"Galle",        contact:"091-234-5678", orders:22, lastDel:"Yesterday",  status:"active" },
  { id:"RET005", name:"Cargills Jaffna",      city:"Jaffna",       contact:"021-234-5678", orders:35, lastDel:"3 days ago", status:"active" },
];

export const INVENTORY = [
  { id:"SKU001", product:"Milo 400g",         stock:2400, reserved:800,  available:1600, unit:"pcs", status:"available" },
  { id:"SKU002", product:"Nestomalt 1kg",      stock:1200, reserved:400,  available:800,  unit:"pcs", status:"available" },
  { id:"SKU003", product:"Maggi Noodles 100g", stock:5000, reserved:1200, available:3800, unit:"pcs", status:"available" },
  { id:"SKU004", product:"Kit Kat 36.5g",      stock:800,  reserved:800,  available:0,    unit:"pcs", status:"out_of_stock" },
  { id:"SKU005", product:"Nescafe 200g",       stock:1500, reserved:300,  available:1200, unit:"pcs", status:"available" },
];
