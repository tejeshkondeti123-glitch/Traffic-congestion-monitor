import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrafficCone, Bus, CloudRain, Sparkles, Terminal, AlertTriangle } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export function Sidebar() {
  const { 
    systemLoad, 
    isLogsOpen, 
    setIsLogsOpen, 
    emergencyOverride, 
    toggleEmergencyOverride,
    logs
  } = useSimulation();

  const navItems = [
    { name: "Network Map", path: "/", icon: LayoutDashboard, tag: "LIVE" },
    { name: "Junctions", path: "/junctions", icon: TrafficCone, tag: "12 NODES" },
    { name: "Fleet Ops", path: "/fleet", icon: Bus, tag: "24 UNITS" },
    { name: "Climate & Emissions", path: "/climate", icon: CloudRain, tag: "ECO-GRID" },
    { name: "Design System & Arch", path: "/design-system", icon: Sparkles, tag: "SPEC" },
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest/90 backdrop-blur-xl border-r border-outline-variant h-full flex flex-col z-30 transition-all duration-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-outline-variant flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_rgba(76,215,246,0.3)]">
          <span className="material-symbols-outlined text-primary text-base">hub</span>
        </div>
        <div>
          <h2 className="font-bold text-sm leading-tight tracking-wider text-primary font-mono uppercase">
            SONGDO AI OPS
          </h2>
          <p className="text-[10px] text-secondary font-mono tracking-widest uppercase">
            SECTOR-07 NOMINAL
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono text-outline font-semibold tracking-widest uppercase">
          Command Modules
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-mono tracking-wide transition-all duration-150 ${
                isActive
                  ? "bg-primary/15 text-primary border-l-4 border-primary shadow-[inset_0_0_15px_rgba(76,215,246,0.1)] font-semibold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
            {item.tag && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono">
                {item.tag}
              </span>
            )}
          </NavLink>
        ))}

        {/* System Logs Drawer Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setIsLogsOpen(!isLogsOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-mono tracking-wide transition-all ${
              isLogsOpen
                ? "bg-secondary/15 text-secondary border border-secondary/30"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-secondary" />
              <span>System Logs</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary font-mono animate-pulse">
              {logs.length}
            </span>
          </button>
        </div>
      </nav>

      {/* Emergency Override & System Telemetry Footer */}
      <div className="p-4 border-t border-outline-variant space-y-3 bg-surface-container-low/40">
        {/* System Load */}
        <div className="glass-panel p-3 bg-surface-container-lowest/80 rounded border-outline-variant/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-outline font-mono uppercase tracking-wider">
              GRID AI LOAD
            </span>
            <span className={`text-xs font-mono font-bold ${systemLoad > 75 ? 'text-error' : 'text-primary'}`}>
              {systemLoad}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                systemLoad > 75 
                  ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.8)]' 
                  : 'bg-primary shadow-[0_0_8px_rgba(76,215,246,0.6)]'
              }`}
              style={{ width: `${systemLoad}%` }}
            ></div>
          </div>
        </div>

        {/* Emergency Override Button */}
        <button
          onClick={toggleEmergencyOverride}
          className={`w-full py-2.5 px-3 rounded font-mono text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 ${
            emergencyOverride
              ? "bg-error text-on-error shadow-[0_0_20px_rgba(255,180,171,0.7)] animate-pulse"
              : "bg-error-container/20 border border-error/50 text-error hover:bg-error-container/40"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{emergencyOverride ? "EMERGENCY ACTIVE" : "EMERGENCY OVERRIDE"}</span>
        </button>
      </div>
    </aside>
  );
}
