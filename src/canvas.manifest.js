export const manifest = {
  screens: {
    scr_hjw249: { name: "Sign in", route: "/login", position: { "x": 160, "y": 220 } },
    scr_2fhdb1: { name: "Access denied", route: "/403", state: { "authRole": "Staff" }, position: { "x": 1560, "y": 220 } },
    scr_f3diiw: { name: "Dashboard", route: "/dashboard", state: { "authRole": "RiskManager" }, position: { "x": 160, "y": 2200 } },
    scr_alsjbp: { name: "Dashboard (Staff view)", route: "/dashboard", state: { "authRole": "Staff" }, position: { "x": 1560, "y": 2200 } },
    scr_4zbn6a: { name: "Notifications", route: "/notifications", state: { "authRole": "RiskManager" }, position: { "x": 0, "y": 0 }, isDefaultRow: true },
    scr_ie6sio: { name: "OLTS", route: "/olts", state: { "authRole": "RiskManager" }, position: { "x": 160, "y": 4180 } },
    scr_aa0qyz: { name: "KRI", route: "/kri", state: { "authRole": "RiskManager" }, position: { "x": 1560, "y": 4180 } },
    scr_r32o49: { name: "Risk Register", route: "/risk-register", state: { "authRole": "RiskManager" }, position: { "x": 2960, "y": 4180 } },
    scr_brs7pw: { name: "Audit", route: "/audit", state: { "authRole": "Auditor" }, position: { "x": 4360, "y": 4180 } },
    scr_a1c5fv: { name: "Self Assessment", route: "/self-assessment", state: { "authRole": "ProcessOwner" }, position: { "x": 160, "y": 6160 } },
    scr_30tf0g: { name: "Process Flows", route: "/process-flows", state: { "authRole": "ProcessOwner" }, position: { "x": 1560, "y": 6160 } }
  },
  sections: {
    sec_hr2gmc: { name: "Authentication", x: 0, y: 0, width: 2920, height: 1180 },
    sec_klnau7: { name: "Dashboards", x: 0, y: 1980, width: 2920, height: 1180 },
    sec_mgntbm: { name: "Risk & Audit", x: 0, y: 3960, width: 5720, height: 1180 },
    sec_wys0n3: { name: "Assessment & Process", x: 0, y: 5940, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_hr2gmc", children: [
    { kind: "screen", id: "scr_hjw249" },
    { kind: "screen", id: "scr_2fhdb1" }]
  },
  { kind: "section", id: "sec_klnau7", children: [
    { kind: "screen", id: "scr_f3diiw" },
    { kind: "screen", id: "scr_alsjbp" }]
  },
  { kind: "section", id: "sec_mgntbm", children: [
    { kind: "screen", id: "scr_ie6sio" },
    { kind: "screen", id: "scr_aa0qyz" },
    { kind: "screen", id: "scr_r32o49" },
    { kind: "screen", id: "scr_brs7pw" }]
  },
  { kind: "section", id: "sec_wys0n3", children: [
    { kind: "screen", id: "scr_a1c5fv" },
    { kind: "screen", id: "scr_30tf0g" }]
  },
  { kind: "screen", id: "scr_4zbn6a" }]

};