import { useState } from 'react';
import { Wind, Thermometer, Leaf, Sparkles, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '../context/SimulationContext';

const EMISSIONS_HOURLY = [
  { time: '00:00', baseline: 140, optimized: 105, reduction: 25 },
  { time: '04:00', baseline: 110, optimized: 88, reduction: 20 },
  { time: '08:00', baseline: 260, optimized: 195, reduction: 25 },
  { time: '12:00', baseline: 210, optimized: 168, reduction: 20 },
  { time: '16:00', baseline: 290, optimized: 218, reduction: 25 },
  { time: '20:00', baseline: 190, optimized: 146, reduction: 23 },
  { time: '24:00', baseline: 130, optimized: 100, reduction: 23 },
];

const SECTOR_WEATHER = [
  { sector: 'Sector 01 (Central Park)', temp: '22.1°C', humidity: '64%', aqi: 38, status: 'EXCELLENT', sensor: 'S-01A' },
  { sector: 'Sector 02 (Canal Commercial)', temp: '23.4°C', humidity: '61%', aqi: 45, status: 'GOOD', sensor: 'S-02B' },
  { sector: 'Sector 03 (International Hub)', temp: '22.8°C', humidity: '62%', aqi: 42, status: 'GOOD', sensor: 'S-03A' },
  { sector: 'Sector 04 (Expressway Corridor)', temp: '24.2°C', humidity: '58%', aqi: 56, status: 'MODERATE', sensor: 'S-04C' },
  { sector: 'Sector 05 (Waterfront Marina)', temp: '21.6°C', humidity: '72%', aqi: 32, status: 'EXCELLENT', sensor: 'S-05A' },
];

export default function Climate() {
  const { totalCarbonOffset, addLog } = useSimulation();
  const [selectedSector, setSelectedSector] = useState<string>('Sector 01 (Central Park)');
  const [calibrating, setCalibrating] = useState(false);

  const handleCalibrate = () => {
    setCalibrating(true);
    addLog('INFO', 'ECO-GRID', 'Initiated zero-point recalibration across 48 IoT air quality sensors.');
    setTimeout(() => {
      setCalibrating(false);
      addLog('INFO', 'ECO-GRID', 'Sensor calibration finished. Variance < 0.3%.');
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-5 h-full select-none">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Carbon Offset */}
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Total Carbon Offset</div>
            <div className="text-2xl font-mono font-bold text-secondary mt-1">
              {totalCarbonOffset.toLocaleString()} <span className="text-sm font-normal text-outline">kg CO₂</span>
            </div>
            <div className="text-[10px] font-mono text-secondary mt-0.5 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-secondary" /> +18.4% VS UN-OPTIMIZED BASELINE
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded border border-secondary/20 text-secondary">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        {/* City-Wide AQI */}
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Composite City AQI</div>
            <div className="text-2xl font-mono font-bold text-primary mt-1">
              42 <span className="text-sm font-normal text-secondary">GOOD</span>
            </div>
            <div className="text-[10px] font-mono text-outline mt-0.5">PM2.5: 11 µg/m³ • NO₂: 18 ppb</div>
          </div>
          <div className="p-3 bg-primary/10 rounded border border-primary/20 text-primary">
            <Wind className="w-5 h-5" />
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Micro-Climate Temp</div>
            <div className="text-2xl font-mono font-bold text-on-surface mt-1">22.4°C</div>
            <div className="text-[10px] font-mono text-outline mt-0.5">Cool sea breeze from Incheon Bay</div>
          </div>
          <div className="p-3 bg-surface-container-high rounded border border-outline-variant text-outline">
            <Thermometer className="w-5 h-5" />
          </div>
        </div>

        {/* Traffic Adaptive Reduction */}
        <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-outline">Grid Energy Savings</div>
            <div className="text-2xl font-mono font-bold text-tertiary mt-1">-340 kW/h</div>
            <div className="text-[10px] font-mono text-secondary mt-0.5">Adaptive LED signal dimming</div>
          </div>
          <div className="p-3 bg-tertiary/10 rounded border border-tertiary/20 text-tertiary">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Sector Topology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left 7 Cols: CO2 Reduction Curves & Correlation */}
        <div className="lg:col-span-7 glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">co2</span>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface">
                  Emissions Abatement Trend (kg CO₂ / hr)
                </h3>
              </div>
              <p className="text-[11px] font-mono text-outline mt-0.5">
                Comparing standard fixed signal timing against Songdo AI adaptive routing
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                <span className="text-outline">Baseline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="text-secondary font-semibold">AI Optimized</span>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="flex-1 min-h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EMISSIONS_HOURLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#869397" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#869397" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#242a3a" />
                <XAxis dataKey="time" stroke="#869397" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#869397" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080e1d',
                    borderColor: '#3d494c',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="baseline" stroke="#869397" fillOpacity={1} fill="url(#colorBaseline)" name="Fixed Signal Baseline" />
                <Area type="monotone" dataKey="optimized" stroke="#4edea3" strokeWidth={2} fillOpacity={1} fill="url(#colorOptimized)" name="Songdo AI Optimized" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Micro-Correlation Factoid */}
          <div className="p-3 rounded bg-surface-container-lowest/80 border border-outline-variant/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">insights</span>
              <span className="text-on-surface">Correlation: Stop-and-Go Elimination delivers 82% of emission gains.</span>
            </div>
            <span className="text-secondary font-bold">-24.8% IDLE TIME</span>
          </div>
        </div>

        {/* Right 5 Cols: Sector Micro-Climate Table & AQI Map */}
        <div className="lg:col-span-5 glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">sensors</span>
                Sector Air Quality Mesh
              </h3>
              <p className="text-[11px] font-mono text-outline mt-0.5">48 IoT roadside stations reporting</p>
            </div>

            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface text-[10px] font-mono border border-outline-variant flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${calibrating ? 'animate-spin text-primary' : ''}`} />
              {calibrating ? 'CALIBRATING...' : 'CALIBRATE'}
            </button>
          </div>

          {/* Sector Weather List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {SECTOR_WEATHER.map(s => {
              const isSelected = selectedSector === s.sector;
              return (
                <div
                  key={s.sector}
                  onClick={() => setSelectedSector(s.sector)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-secondary/15 border-secondary/50 shadow-[0_0_12px_rgba(78,222,163,0.15)]'
                      : 'bg-surface-container-lowest/60 border-outline-variant/40 hover:bg-surface-container-high/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-on-surface">{s.sector}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      s.status === 'EXCELLENT' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                    }`}>
                      AQI {s.aqi} • {s.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-outline mt-2">
                    <span>Temp: <strong className="text-on-surface">{s.temp}</strong></span>
                    <span>Humidity: <strong className="text-on-surface">{s.humidity}</strong></span>
                    <span className="text-secondary">Sensor: {s.sensor}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ingestion Stream Status */}
          <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] font-mono text-outline">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              MQTT INGESTION: 100 Hz
            </span>
            <span className="text-secondary">0 DROPPED FRAMES</span>
          </div>
        </div>
      </div>
    </div>
  );
}
