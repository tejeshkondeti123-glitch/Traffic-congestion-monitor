import { useState } from 'react';
import { Bus, MapPin, Battery, BatteryCharging, ChevronDown, Activity, PlayCircle, RefreshCw } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface FleetUnit {
  id: string;
  type: 'SHUTTLE' | 'BRT';
  route: string;
  status: 'ACTIVE' | 'DELAYED' | 'CHARGING' | 'MAINTENANCE';
  delay: string;
  battery: number;
  driver: string;
  speed: string;
  passengers: number;
  maxPassengers: number;
  nextStop: string;
  lidarStatus: 'NOMINAL' | 'CALIBRATING' | 'ALERT';
}

const FLEET_DATA: FleetUnit[] = [
  { id: 'AV-101', type: 'SHUTTLE', route: 'Songdo Central Canal Loop', status: 'ACTIVE', delay: '+0m', battery: 92, driver: 'Autonomous AI (L4)', speed: '38 km/h', passengers: 14, maxPassengers: 20, nextStop: 'Central Park West', lidarStatus: 'NOMINAL' },
  { id: 'AV-102', type: 'SHUTTLE', route: 'Convensia - Posco Express', status: 'ACTIVE', delay: '+1m', battery: 84, driver: 'Autonomous AI (L4)', speed: '44 km/h', passengers: 18, maxPassengers: 20, nextStop: 'Sheraton Incheon', lidarStatus: 'NOMINAL' },
  { id: 'BRT-201', type: 'BRT', route: 'Incheon Metro Line 1 Link', status: 'ACTIVE', delay: '+0m', battery: 78, driver: 'Kang D. (Safety Monitor)', speed: '52 km/h', passengers: 42, maxPassengers: 60, nextStop: 'Technopark Station', lidarStatus: 'NOMINAL' },
  { id: 'AV-103', type: 'SHUTTLE', route: 'University Campus Transit', status: 'DELAYED', delay: '+4m', battery: 65, driver: 'Autonomous AI (L4)', speed: '24 km/h', passengers: 19, maxPassengers: 20, nextStop: 'Yonsei Global Campus', lidarStatus: 'CALIBRATING' },
  { id: 'AV-104', type: 'SHUTTLE', route: 'Waterfront Bay Circular', status: 'CHARGING', delay: '--', battery: 31, driver: 'Depot Standby', speed: '0 km/h', passengers: 0, maxPassengers: 20, nextStop: 'Charging Dock Delta', lidarStatus: 'NOMINAL' },
  { id: 'BRT-202', type: 'BRT', route: 'Gyeongwon Rapid Transit', status: 'ACTIVE', delay: '+0m', battery: 89, driver: 'Park S. (Safety Monitor)', speed: '48 km/h', passengers: 36, maxPassengers: 60, nextStop: 'Haedoji Plaza', lidarStatus: 'NOMINAL' },
  { id: 'AV-105', type: 'SHUTTLE', route: 'Smart Logistics Hub', status: 'MAINTENANCE', delay: '--', battery: 12, driver: 'Service Bay 3', speed: '0 km/h', passengers: 0, maxPassengers: 20, nextStop: 'Diagnostics Bay', lidarStatus: 'ALERT' },
];

export default function FleetOps() {
  const { addLog } = useSimulation();
  const [filterType, setFilterType] = useState<'ALL' | 'SHUTTLE' | 'BRT'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('AV-101');
  const [fleets, setFleets] = useState<FleetUnit[]>(FLEET_DATA);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  const filteredFleets = fleets.filter(f => {
    if (filterType === 'ALL') return true;
    return f.type === filterType;
  });

  const activeUnits = fleets.filter(f => f.status === 'ACTIVE').length;
  const avgBattery = Math.round(fleets.reduce((a, b) => a + b.battery, 0) / fleets.length);

  const handleDispatch = () => {
    const newId = `AV-${106 + Math.floor(Math.random() * 10)}`;
    const newUnit: FleetUnit = {
      id: newId,
      type: 'SHUTTLE',
      route: 'Songdo Central Canal Loop',
      status: 'ACTIVE',
      delay: '+0m',
      battery: 98,
      driver: 'Autonomous AI (L4)',
      speed: '35 km/h',
      passengers: 4,
      maxPassengers: 20,
      nextStop: 'Central Park West',
      lidarStatus: 'NOMINAL'
    };
    setFleets(prev => [newUnit, ...prev]);
    addLog('INFO', 'DISPATCH-AI', `Mobilized reserve Autonomous Shuttle ${newId} onto Central Canal Loop.`);
    setDispatchNotice(`Dispatched ${newId} to Central Corridor!`);
    setTimeout(() => setDispatchNotice(null), 4000);
  };

  const handleHalt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFleets(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'DELAYED' : 'ACTIVE', speed: '0 km/h' } : u));
    addLog('WARN', 'FLEET-CTRL', `Remote hold command transmitted to Unit ${id}.`);
  };

  return (
    <div className="flex flex-col gap-5 h-full select-none">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Active Fleet Units</div>
            <div className="text-2xl font-mono font-bold text-on-surface mt-1">
              {activeUnits} <span className="text-sm text-outline font-normal">/ {fleets.length}</span>
            </div>
            <div className="text-[10px] font-mono text-secondary mt-0.5">88.5% Service Availability</div>
          </div>
          <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary">
            <Bus className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">On-Time Schedule</div>
            <div className="text-2xl font-mono font-bold text-secondary mt-1">96.4%</div>
            <div className="text-[10px] font-mono text-outline mt-0.5">Average route deviation: +1.2m</div>
          </div>
          <div className="p-3 bg-secondary/10 rounded border border-secondary/20 text-secondary">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Fleet Mean SoC</div>
            <div className="text-2xl font-mono font-bold text-primary mt-1">{avgBattery}%</div>
            <div className="text-[10px] font-mono text-outline mt-0.5">Smart inductive depot charging</div>
          </div>
          <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary">
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Passenger Throughput</div>
            <div className="text-2xl font-mono font-bold text-tertiary mt-1">1,480 <span className="text-xs text-outline font-normal">pax/hr</span></div>
            <div className="text-[10px] font-mono text-secondary mt-0.5">Autonomous micro-transit</div>
          </div>
          <div className="p-3 bg-tertiary/10 rounded border border-tertiary/20 text-tertiary">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {dispatchNotice && (
        <div className="bg-primary/20 border border-primary text-primary px-4 py-2.5 rounded font-mono text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-primary" />
            <span>{dispatchNotice}</span>
          </div>
          <span className="text-[10px] text-outline">TELEMETRY LINK VERIFIED</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-panel rounded border-outline-variant/60 flex-1 flex flex-col overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest/60">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-lg">directions_bus</span>
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface">
              Autonomous Shuttles & Rapid Transit Units
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-outline">
              V2X MESH ONLINE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded border border-outline-variant/60 text-xs font-mono">
              {(['ALL', 'SHUTTLE', 'BRT'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterType === t
                      ? 'bg-primary text-on-primary font-bold shadow-[0_0_8px_rgba(76,215,246,0.3)]'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Quick Dispatch Unit */}
            <button
              onClick={handleDispatch}
              className="px-3.5 py-1.5 rounded bg-secondary hover:bg-secondary/90 text-on-secondary font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(78,222,163,0.3)] flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              DISPATCH RESERVE UNIT
            </button>
          </div>
        </div>

        {/* Units Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2.5">
            {filteredFleets.map(unit => {
              const isExpanded = expandedId === unit.id;
              const statusColor =
                unit.status === 'ACTIVE'
                  ? 'bg-secondary/15 text-secondary border-secondary/30'
                  : unit.status === 'DELAYED'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : unit.status === 'CHARGING'
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-error/15 text-error border-error/30';

              return (
                <div
                  key={unit.id}
                  onClick={() => setExpandedId(isExpanded ? null : unit.id)}
                  className={`rounded border transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-surface-container-low/90 border-primary/50 shadow-[0_0_15px_rgba(76,215,246,0.15)]'
                      : 'bg-surface-container-lowest/70 border-outline-variant/40 hover:bg-surface-container-high/40 hover:border-outline-variant'
                  }`}
                >
                  {/* Unit Row Summary */}
                  <div className="p-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className={`w-8 h-8 rounded flex items-center justify-center border ${
                        unit.type === 'SHUTTLE'
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-secondary/10 border-secondary/30 text-secondary'
                      }`}>
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-on-surface flex items-center gap-2">
                          <span>{unit.id}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-surface-container-high text-outline font-normal">
                            {unit.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-outline font-mono truncate max-w-[200px]">
                          {unit.route}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="min-w-[100px]">
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold uppercase ${statusColor}`}>
                        {unit.status}
                      </span>
                    </div>

                    {/* Speed & Next Stop */}
                    <div className="text-xs font-mono min-w-[140px]">
                      <div className="text-on-surface font-semibold">{unit.speed}</div>
                      <div className="text-[10px] text-outline truncate max-w-[180px]">Next: {unit.nextStop}</div>
                    </div>

                    {/* Battery Level */}
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Battery className={`w-4 h-4 ${unit.battery > 50 ? 'text-secondary' : unit.battery > 25 ? 'text-amber-400' : 'text-error'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-outline">SOC</span>
                          <span className="text-on-surface font-bold">{unit.battery}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              unit.battery > 50 ? 'bg-secondary' : unit.battery > 25 ? 'bg-amber-400' : 'bg-error'
                            }`}
                            style={{ width: `${unit.battery}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Load */}
                    <div className="min-w-[100px] text-right">
                      <div className="text-[10px] font-mono text-outline">CAPACITY</div>
                      <div className="text-xs font-mono font-bold text-on-surface">
                        {unit.passengers} / {unit.maxPassengers} <span className="text-outline text-[10px] font-normal">pax</span>
                      </div>
                    </div>

                    {/* Controls & Expand Arrow */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleHalt(unit.id, e)}
                        className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface text-[10px] font-mono border border-outline-variant/60 transition-colors"
                        title="Toggle Halt / Resume"
                      >
                        {unit.status === 'ACTIVE' ? 'PAUSE' : 'RESUME'}
                      </button>
                      <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Telemetry Details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 border-t border-outline-variant/40 bg-surface-container-lowest/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <div className="text-outline text-[10px] uppercase mb-1">Navigation & Driver Control</div>
                        <div className="text-on-surface font-semibold">{unit.driver}</div>
                        <div className="text-[11px] text-secondary mt-1">Autonomous L4 Geofence • Songdo Sector 01-04</div>
                      </div>

                      <div>
                        <div className="text-outline text-[10px] uppercase mb-1">Perception & Sensor Health</div>
                        <div className="flex items-center gap-2 text-on-surface font-semibold">
                          <span className={`w-2 h-2 rounded-full ${
                            unit.lidarStatus === 'NOMINAL' ? 'bg-secondary' : unit.lidarStatus === 'CALIBRATING' ? 'bg-amber-400' : 'bg-error'
                          }`}></span>
                          <span>LiDAR / Radar Array: {unit.lidarStatus}</span>
                        </div>
                        <div className="text-[11px] text-outline mt-1">V2X Packet Loss: 0.02% • GPS RTK Fix: OK</div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="text-outline text-[10px] uppercase mb-1.5">Action Commands</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addLog('INFO', `UNIT-${unit.id}`, 'Reroute command queued for Next Intersection.')}
                            className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary text-[11px] hover:bg-primary/20 transition-colors"
                          >
                            REROUTE TO AVOID TRAFFIC
                          </button>
                          <button
                            onClick={() => addLog('INFO', `UNIT-${unit.id}`, 'Diagnostic ping sent: telemetry latency 2.1ms.')}
                            className="p-1 rounded bg-surface-container-high border border-outline-variant text-outline hover:text-on-surface transition-colors"
                            title="Run diagnostic ping"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
