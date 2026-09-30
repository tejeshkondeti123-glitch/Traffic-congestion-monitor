import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'EMERGENCY';
  module: string;
  message: string;
}

interface SimulationContextType {
  timeStr: string;
  scenario: 'nominal' | 'rush_hour' | 'emergency';
  setScenario: (s: 'nominal' | 'rush_hour' | 'emergency') => void;
  emergencyOverride: boolean;
  toggleEmergencyOverride: () => void;
  logs: SystemLog[];
  addLog: (level: SystemLog['level'], module: string, message: string) => void;
  clearLogs: () => void;
  isLogsOpen: boolean;
  setIsLogsOpen: (open: boolean) => void;
  systemLoad: number;
  totalCarbonOffset: number;
  activeFleetCount: number;
  averageSpeed: number;
  networkCongestion: number;
  selectedJunction: number;
  setSelectedJunction: (id: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const INITIAL_LOGS: SystemLog[] = [
  { id: '1', timestamp: '08:30:37.100', level: 'INFO', module: 'DRONE-INGEST', message: 'Ingested 220 aerial trajectory samples (Drones 1-5). Tracked 66 vehicles across N101 & N102 corridors.' },
  { id: '2', timestamp: '08:30:37.350', level: 'INFO', module: 'FLOW-OPTIMIZER', message: 'Network speed calibrated to 50.4 km/h empirical mean (N102_G2 Expressway free-flow 67.6 km/h).' },
  { id: '3', timestamp: '08:30:37.600', level: 'INFO', module: 'SECTOR-N101', message: 'Convensia N101 approaches balanced: G1 48.4 km/h (24 veh), G2 51.2 km/h (19 veh), G3 51.4 km/h (15 veh).' },
  { id: '4', timestamp: '08:30:38.012', level: 'INFO', module: 'FLEET-AV', message: 'Autonomous fleet synced with drone radar mesh. V2X latency 3.8ms.' },
  { id: '5', timestamp: '08:30:38.450', level: 'INFO', module: 'DIJKSTRA-AI', message: 'Dynamic graph edge weights recalibrated with empirical drone speeds.' }
];

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<'nominal' | 'rush_hour' | 'emergency'>('nominal');
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [timeStr, setTimeStr] = useState('');
  const [selectedJunction, setSelectedJunction] = useState<number>(1001);
  
  // Dynamic metrics based on scenario (calibrated to real drone trajectory data)
  const [systemLoad, setSystemLoad] = useState(38);
  const [totalCarbonOffset, setTotalCarbonOffset] = useState(1342.8);
  const [activeFleetCount] = useState(66);
  const [averageSpeed, setAverageSpeed] = useState(50.4);
  const [networkCongestion, setNetworkCongestion] = useState(24);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // KST (UTC+9)
      const kstTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      setTimeStr(`${kstTime} KST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic simulated events and dynamic load fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      // Small fluctuation
      setTotalCarbonOffset(prev => +(prev + 0.05).toFixed(2));
      
      if (scenario === 'emergency' || emergencyOverride) {
        setSystemLoad(86);
        setAverageSpeed(34.2);
        setNetworkCongestion(58);
      } else if (scenario === 'rush_hour') {
        setSystemLoad(74);
        setAverageSpeed(39.1);
        setNetworkCongestion(46);
      } else {
        setSystemLoad(prev => Math.min(60, Math.max(38, prev + (Math.random() * 4 - 2))));
        setAverageSpeed(prev => +(prev + (Math.random() * 0.8 - 0.4)).toFixed(1));
        setNetworkCongestion(prev => Math.round(Math.min(35, Math.max(18, prev + (Math.random() * 2 - 1)))));
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [scenario, emergencyOverride]);

  // Periodic random logs simulation
  useEffect(() => {
    const logInterval = setInterval(() => {
      const modules = ['DIJKSTRA-AI', 'EDGE-NET', 'JUNCTION-CTRL', 'FLEET-AV', 'CLIMATE-GRID', 'CORRIDOR-04'];
      const now = new Date();
      const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const randomMod = modules[Math.floor(Math.random() * modules.length)];
      
      let newLog: SystemLog;
      if (emergencyOverride) {
        newLog = {
          id: String(Date.now()),
          timestamp: ts,
          level: 'EMERGENCY',
          module: 'GRID-OVERRIDE',
          message: 'Priority Green Wave corridor enforced. All transversal civilian signals held RED.'
        };
      } else {
        const msgs = [
          'Signal timing cycle synchronized across Corridor C-2.',
          'Autonomous shuttle AV-102 boarding complete at Central Park Node.',
          'Inbound vehicle count: 320 veh/hr. Capacity headroom: 44%.',
          'Solar-powered road sensor array generating 4.8 kW net surplus.',
          'Adaptive speed harmony algorithm active on Gyeongwon-daero.'
        ];
        newLog = {
          id: String(Date.now()),
          timestamp: ts,
          level: 'INFO',
          module: randomMod,
          message: msgs[Math.floor(Math.random() * msgs.length)]
        };
      }

      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }, 4000);

    return () => clearInterval(logInterval);
  }, [emergencyOverride]);

  const addLog = (level: SystemLog['level'], module: string, message: string) => {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [{ id: String(Date.now()), timestamp: ts, level, module, message }, ...prev.slice(0, 49)]);
  };

  const clearLogs = () => setLogs([]);

  const toggleEmergencyOverride = () => {
    setEmergencyOverride(prev => {
      const next = !prev;
      addLog(
        next ? 'EMERGENCY' : 'WARN',
        'SYSTEM-CTRL',
        next ? 'EMERGENCY GREEN WAVE OVERRIDE INITIATED BY OPERATOR' : 'Emergency Green Wave Override terminated. Nominal cycle restored.'
      );
      return next;
    });
  };

  return (
    <SimulationContext.Provider
      value={{
        timeStr,
        scenario,
        setScenario,
        emergencyOverride,
        toggleEmergencyOverride,
        logs,
        addLog,
        clearLogs,
        isLogsOpen,
        setIsLogsOpen,
        systemLoad: Math.round(systemLoad),
        totalCarbonOffset,
        activeFleetCount,
        averageSpeed,
        networkCongestion,
        selectedJunction,
        setSelectedJunction
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
