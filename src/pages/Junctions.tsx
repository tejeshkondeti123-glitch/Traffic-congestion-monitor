import { useState, useEffect } from 'react';
import trafficDataRaw from '../data/traffic.json';
import { TrafficData } from '../utils/dijkstra';
import { AlertTriangle, TrafficCone, ShieldAlert, Sliders, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import locationNames from '../data/location_names.json';

const trafficData = trafficDataRaw as TrafficData[];

const JUNCTION_NAMES: Record<number, { name: string; sector: string; status: 'OPTIMAL' | 'ELEVATED' | 'SATURATED' }> = {
  1001: { name: "Convensia Ave & Central Blvd", sector: "Sector 01", status: "OPTIMAL" },
  1002: { name: "Central Park North & Canal Way", sector: "Sector 02", status: "OPTIMAL" },
  1003: { name: "Posco Tower & International Rd", sector: "Sector 03", status: "ELEVATED" },
  1004: { name: "Gyeongwon-daero Smart Corridor", sector: "Sector 04", status: "OPTIMAL" },
  1005: { name: "Haedoji Park East Transit Way", sector: "Sector 05", status: "OPTIMAL" },
  1006: { name: "Technopark Eco Expressway", sector: "Sector 06", status: "SATURATED" },
  1007: { name: "University Campus Node", sector: "Sector 07", status: "OPTIMAL" },
  1008: { name: "Songdo Waterfront Terminal", sector: "Sector 08", status: "OPTIMAL" },
};

export default function Junctions() {
  const { emergencyOverride, toggleEmergencyOverride, addLog } = useSimulation();
  const [selectedJunction, setSelectedJunction] = useState<number>(1001);
  const [cycleTime, setCycleTime] = useState<number>(90);
  const [greenSplit, setGreenSplit] = useState<number>(55);
  const [phaseCountDown, setPhaseCountDown] = useState<number>(24);
  const [currentPhase, setCurrentPhase] = useState<'N-S' | 'E-W'>('N-S');
  const [manualHold, setManualHold] = useState(false);

  // Group data by cycle_id
  const junctionData = trafficData.filter(d => d.cycle_id === selectedJunction);
  
  // Metrics
  const totalWait = junctionData.reduce((acc, d) => acc + d.current_wait_time_sec, 0);
  const maxWait = Math.max(...junctionData.map(d => d.current_wait_time_sec), 0);
  const hasEmergency = junctionData.some(d => d.emergency_vehicle > 0) || emergencyOverride;

  // Countdown timer simulation
  useEffect(() => {
    if (manualHold) return;
    const interval = setInterval(() => {
      setPhaseCountDown(prev => {
        if (prev <= 1) {
          setCurrentPhase(p => (p === 'N-S' ? 'E-W' : 'N-S'));
          return currentPhase === 'N-S' ? Math.round(cycleTime * ((100 - greenSplit) / 100)) : Math.round(cycleTime * (greenSplit / 100));
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cycleTime, greenSplit, currentPhase, manualHold]);

  const handleApplySettings = () => {
    addLog(
      'INFO',
      `J-${selectedJunction}`,
      `Signal timing updated: Cycle=${cycleTime}s, Green Split=${greenSplit}%, Manual Hold=${manualHold ? 'ENABLED' : 'DISABLED'}`
    );
  };

  const selectedMeta = JUNCTION_NAMES[selectedJunction] || {
    name: (locationNames as Record<string, string>)[selectedJunction.toString()] || `Junction J-${selectedJunction.toString().slice(-2)}`,
    sector: "Sector 01",
    status: "OPTIMAL"
  };

  return (
    <div className="flex flex-col gap-5 h-full select-none">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Active Controllers</div>
            <div className="text-2xl font-mono font-bold text-on-surface mt-1">12 / 12</div>
            <div className="text-[10px] font-mono text-secondary mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> ALL NODES SYNCHRONIZED
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded border border-secondary/20 text-secondary">
            <TrafficCone className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Total Corridor Wait</div>
            <div className="text-2xl font-mono font-bold text-on-surface mt-1">{totalWait} <span className="text-xs text-secondary">sec</span></div>
            <div className="text-[10px] font-mono text-outline mt-0.5">Peak queue delay: {maxWait}s</div>
          </div>
          <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Signal Efficiency</div>
            <div className="text-2xl font-mono font-bold text-secondary mt-1">94.8%</div>
            <div className="text-[10px] font-mono text-outline mt-0.5">Adaptive split optimization</div>
          </div>
          <div className="p-3 bg-secondary/10 rounded border border-secondary/20 text-secondary">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Priority Preemption</div>
            <div className={`text-2xl font-mono font-bold mt-1 ${hasEmergency ? 'text-error animate-pulse' : 'text-secondary'}`}>
              {hasEmergency ? 'ACTIVE' : 'STANDBY'}
            </div>
            <div className="text-[10px] font-mono text-outline mt-0.5">
              {hasEmergency ? 'Green wave enforced' : 'Ready for emergency sirens'}
            </div>
          </div>
          <div className={`p-3 rounded border ${hasEmergency ? 'bg-error/20 border-error text-error animate-pulse' : 'bg-surface-container-high border-outline-variant text-outline'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Column: Junction List Selector */}
        <div className="lg:col-span-4 glass-panel p-4 rounded border-outline-variant/60 flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-base">alt_route</span>
              Intersection Nodes
            </h3>
            <span className="text-[10px] font-mono text-outline">SELECT TO CONTROL</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {Array.from(new Set(trafficData.map(d => d.cycle_id))).map(id => {
              const meta = JUNCTION_NAMES[id] || {
                name: (locationNames as Record<string, string>)[id.toString()] || `Junction J-${id.toString().slice(-2)}`,
                sector: "Sector 01",
                status: "OPTIMAL"
              };
              const isSelected = id === selectedJunction;

              return (
                <div
                  key={id}
                  onClick={() => setSelectedJunction(id)}
                  className={`p-3 rounded border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary/15 border-primary/60 shadow-[0_0_12px_rgba(76,215,246,0.2)]'
                      : 'bg-surface-container-lowest/60 border-outline-variant/40 hover:bg-surface-container-high/60 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-on-surface">
                      NODE J-{id.toString().slice(-2)}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        meta.status === 'OPTIMAL'
                          ? 'bg-secondary/15 text-secondary border border-secondary/30'
                          : meta.status === 'ELEVATED'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-error/15 text-error border border-error/30'
                      }`}
                    >
                      {meta.status}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium mt-1 truncate">
                    {meta.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-outline mt-2">
                    <span>{meta.sector}</span>
                    <span className="text-secondary">4 Approach Lanes</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Override Quick Trigger */}
          <div className="pt-2 border-t border-outline-variant">
            <button
              onClick={toggleEmergencyOverride}
              className={`w-full py-2.5 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                emergencyOverride
                  ? 'bg-error text-on-error shadow-[0_0_15px_rgba(255,180,171,0.6)] animate-pulse'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface hover:border-error hover:text-error'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {emergencyOverride ? 'TERMINATE EMERGENCY OVERRIDE' : 'ACTIVATE NODE EMERGENCY'}
            </button>
          </div>
        </div>

        {/* Center & Right Columns: Interactive Controller & Approaches */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Signal Controller Card */}
          <div className="glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-primary">J-{selectedJunction.toString().slice(-2)}:</span>
                  <span className="text-sm font-bold text-on-surface">{selectedMeta.name}</span>
                </div>
                <div className="text-[11px] font-mono text-secondary mt-0.5">
                  Controller Model: Yunex-C900 Smart Urban Edge • Protocol: NTCIP 1202
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-outline">SIGNAL RING STATUS:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                  currentPhase === 'N-S' ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
                }`}>
                  PHASE {currentPhase} GREEN
                </span>
              </div>
            </div>

            {/* Signal Phase Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface-container-lowest/60 p-4 rounded border border-outline-variant/40">
              {/* North-South Phase */}
              <div className={`p-3 rounded border text-center transition-all ${
                currentPhase === 'N-S'
                  ? 'bg-secondary/15 border-secondary/60 shadow-[0_0_15px_rgba(78,222,163,0.2)]'
                  : 'bg-surface-container-high/30 border-outline-variant/30 opacity-70'
              }`}>
                <div className="text-[10px] font-mono uppercase text-outline">Phase 1: North - South</div>
                <div className="text-2xl font-mono font-bold text-on-surface mt-1">
                  {currentPhase === 'N-S' ? `${phaseCountDown}s` : 'HOLD RED'}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`w-3 h-3 rounded-full ${currentPhase === 'N-S' ? 'bg-secondary animate-pulse' : 'bg-surface-container-highest'}`}></span>
                  <span className="text-[10px] font-mono text-secondary">GREEN WAVE</span>
                </div>
              </div>

              {/* Cycle Ring Center */}
              <div className="text-center flex flex-col items-center justify-center py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={currentPhase === 'N-S' ? 'text-secondary' : 'text-primary'}
                      strokeDasharray={`${greenSplit}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-lg font-bold text-on-surface">{phaseCountDown}</span>
                    <span className="text-[9px] text-outline">SECONDS</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-outline mt-2">Total Cycle: {cycleTime}s</span>
              </div>

              {/* East-West Phase */}
              <div className={`p-3 rounded border text-center transition-all ${
                currentPhase === 'E-W'
                  ? 'bg-primary/15 border-primary/60 shadow-[0_0_15px_rgba(76,215,246,0.2)]'
                  : 'bg-surface-container-high/30 border-outline-variant/30 opacity-70'
              }`}>
                <div className="text-[10px] font-mono uppercase text-outline">Phase 2: East - West</div>
                <div className="text-2xl font-mono font-bold text-on-surface mt-1">
                  {currentPhase === 'E-W' ? `${phaseCountDown}s` : 'HOLD RED'}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`w-3 h-3 rounded-full ${currentPhase === 'E-W' ? 'bg-primary animate-pulse' : 'bg-surface-container-highest'}`}></span>
                  <span className="text-[10px] font-mono text-primary">CROSS TRAFFIC</span>
                </div>
              </div>
            </div>

            {/* Timing Controls & Manual Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-outline">CYCLE LENGTH:</span>
                  <span className="text-primary font-bold">{cycleTime} sec</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="150"
                  step="5"
                  value={cycleTime}
                  onChange={e => setCycleTime(Number(e.target.value))}
                  className="w-full accent-primary bg-surface-container-high h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-outline">GREEN SPLIT (N-S vs E-W):</span>
                  <span className="text-secondary font-bold">{greenSplit}% / {100 - greenSplit}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="5"
                  value={greenSplit}
                  onChange={e => setGreenSplit(Number(e.target.value))}
                  className="w-full accent-secondary bg-surface-container-high h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualHold(!manualHold)}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                    manualHold
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant'
                  }`}
                >
                  {manualHold ? 'MANUAL HOLD: ON' : 'ENABLE MANUAL HOLD'}
                </button>
              </div>

              <button
                onClick={handleApplySettings}
                className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(76,215,246,0.3)] flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                APPLY TIMING TO NODE
              </button>
            </div>
          </div>

          {/* Approach Lane Telemetry */}
          <div className="glass-panel p-4 rounded border-outline-variant/60 flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">radar</span>
                  Approach Lane Telemetry
                </h4>
                {(selectedJunction === 1001 || selectedJunction === 1002) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    DRONE INGESTED {selectedJunction === 1001 ? '(N101)' : '(N102)'}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-outline">
                {selectedJunction === 1001 || selectedJunction === 1002 
                  ? 'Calibrated via Aerial Drone Mesh (Drones 1–5)' 
                  : 'Real-time induction loop counts'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {junctionData.map((lane) => {
                const dir = lane.lane_id.split('_')[2] || 'Approach';
                const isHigh = lane.current_wait_time_sec > 15;
                
                // Drone speed info for N101 and N102
                let droneSpeedStr: string | null = null;
                if (selectedJunction === 1001) {
                  if (dir === 'North') droneSpeedStr = '48.4 km/h (N101_G1)';
                  else if (dir === 'East') droneSpeedStr = '51.2 km/h (N101_G2)';
                  else if (dir === 'South') droneSpeedStr = '51.4 km/h (N101_G3)';
                } else if (selectedJunction === 1002) {
                  if (dir === 'North') droneSpeedStr = '49.7 km/h (N102_G1)';
                  else if (dir === 'East') droneSpeedStr = '67.6 km/h (N102_G2)';
                }

                return (
                  <div
                    key={lane.lane_id}
                    className="p-3.5 rounded bg-surface-container-lowest/70 border border-outline-variant/40 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-1.5 mb-2">
                      <span className="font-mono text-xs font-bold text-on-surface uppercase">
                        {dir}BOUND
                      </span>
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                        {lane.allocated_green_time_sec}s GREEN
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {droneSpeedStr && (
                        <div className="flex justify-between text-cyan-300">
                          <span className="text-[11px]">DRONE SPEED:</span>
                          <span className="font-bold">{droneSpeedStr}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-outline text-[11px]">DENSITY:</span>
                        <span className="font-bold text-on-surface">{lane.cross_traffic_density} v/c</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline text-[11px]">FLEET MIX:</span>
                        <span className="text-on-surface-variant text-[11px]">
                          {lane.car_count}c • {lane.heavy_vehicle_count}h • {lane.two_wheeler_count}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline text-[11px]">VEHICLES:</span>
                        <span className="text-secondary font-semibold">
                          {lane.car_count + lane.heavy_vehicle_count + lane.two_wheeler_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-outline text-[11px]">QUEUE DELAY:</span>
                        <span className={isHigh ? 'text-error font-bold' : 'text-secondary font-semibold'}>
                          {lane.current_wait_time_sec}s
                        </span>
                      </div>

                      {/* Queue Capacity Bar */}
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.8)]' : 'bg-secondary'
                          }`}
                          style={{ width: `${Math.min(100, (lane.current_wait_time_sec / 30) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
