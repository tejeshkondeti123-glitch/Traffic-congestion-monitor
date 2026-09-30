import { useLocation } from "react-router-dom";
import { useSimulation } from "../context/SimulationContext";
import { useState } from "react";

export function TopNav() {
  const location = useLocation();
  const { timeStr, scenario, setScenario, emergencyOverride, logs } = useSimulation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const getPageInfo = () => {
    switch (location.pathname) {
      case "/": return { title: "Traffic Operations Center", icon: "hub", subtitle: "Dynamic Dijkstra Rerouting & Grid Telemetry" };
      case "/junctions": return { title: "Junctions Management", icon: "traffic", subtitle: "Adaptive Signal Timing & Phase Split Rings" };
      case "/fleet": return { title: "Fleet Operations", icon: "directions_bus", subtitle: "Autonomous Shuttles & Battery Telemetry" };
      case "/climate": return { title: "Climate & Emissions", icon: "public", subtitle: "Environmental Impact & Carbon Abatement" };
      case "/design-system": return { title: "Design System & Architecture", icon: "auto_awesome", subtitle: "Cybernetic Minimalism & Cyber-Physical Specs" };
      default: return { title: "Songdo Smart Mobility", icon: "dashboard", subtitle: "Metro-Core Operations" };
    }
  };

  const { title, icon, subtitle } = getPageInfo();

  return (
    <header className="bg-surface/85 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant px-6 py-3.5 flex items-center justify-between select-none">
      {/* Title and Module Identification */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-primary/15 rounded border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(76,215,246,0.2)]">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-on-surface font-display">
              {title}
            </h1>
            {emergencyOverride && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-error text-on-error animate-pulse">
                PRIORITY OVERRIDE
              </span>
            )}
          </div>
          <p className="text-xs text-secondary font-mono tracking-wider uppercase">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right Controls: Scenario Switcher, Clock, Operator */}
      <div className="flex items-center gap-5">
        {/* Hackathon Demo Scenario Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded bg-surface-container-lowest border border-outline-variant">
          <span className="text-[10px] font-mono text-outline px-2 font-semibold">DEMO MODE:</span>
          {(['nominal', 'rush_hour', 'emergency'] as const).map(sc => (
            <button
              key={sc}
              onClick={() => setScenario(sc)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                scenario === sc
                  ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(76,215,246,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {sc.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Live KST Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-lowest border border-outline-variant">
          <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
          <span className="text-xs font-mono font-bold text-on-surface tracking-wider">
            {timeStr || '18:34:00 KST'}
          </span>
        </div>

        {/* System Nominal Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant">
          <span className={`w-2 h-2 rounded-full ${
            emergencyOverride ? 'bg-error animate-ping' : 'bg-secondary animate-pulse'
          } shadow-[0_0_8px_rgba(78,222,163,0.8)]`}></span>
          <span className={`text-[11px] font-mono font-semibold ${
            emergencyOverride ? 'text-error' : 'text-secondary'
          }`}>
            {emergencyOverride ? 'EMERGENCY CORRIDOR' : 'SYSTEM NOMINAL'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors relative"
            title="System alerts"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant text-xs font-mono">
                <span className="font-bold text-primary">ACTIVE INCIDENTS ({logs.filter(l => l.level !== 'INFO').length})</span>
                <span className="text-[10px] text-outline">Real-Time Feed</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-2 space-y-2">
                {logs.filter(l => l.level !== 'INFO').slice(0, 5).map(l => (
                  <div key={l.id} className="p-2 rounded bg-surface-container-low border border-outline-variant/50 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-outline text-[10px] mb-1">
                      <span className="text-error font-bold">{l.level}</span>
                      <span>{l.timestamp}</span>
                    </div>
                    <div className="text-on-surface">{l.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Commander Profile */}
        <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
          <div className="text-right hidden xl:block">
            <div className="text-xs font-mono font-bold text-on-surface">Ops Commander</div>
            <div className="text-[10px] font-mono text-secondary">Level-4 Security</div>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy0Ayseo27Id4eIQ-8XigA0WqeXydFxgS06KKVrHPM1YXXkrxV7JiIdJTQqepdYImfsfnYsWa9b8jQe-YP4ni5NJF3DjUG7yf8ZgsE07sMltskcNkvRSebHFElwHgw1hv-83mwjJYol13X8LSWgdSRRVxHf_xn_qh7ugp_LiPkBsmKMpXBO3ewta1PhKpRMM4jhxzj2oVVJAJ7zQ_kGHFbTzqdNLuIa-971tmmoAeqO0Accm1p-D4w6Q"
            alt="Operator avatar"
            className="w-8 h-8 rounded border border-primary/40 object-cover shadow-[0_0_8px_rgba(76,215,246,0.3)]"
          />
        </div>
      </div>
    </header>
  );
}
