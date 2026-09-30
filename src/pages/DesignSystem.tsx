import { useState } from 'react';
import { Palette, Type, Layers, Cpu, Eye } from 'lucide-react';

const COLOR_SWATCHES = [
  { name: 'Primary (Cyan)', hex: '#4cd7f6', role: 'Telemetry Highlights & Active State', bg: 'bg-primary', text: 'text-on-primary' },
  { name: 'Primary Container', hex: '#06b6d4', role: 'Primary Buttons & Emphasis', bg: 'bg-primary-container', text: 'text-white' },
  { name: 'Secondary (Emerald)', hex: '#4edea3', role: 'Optimal Flow & Eco Telemetry', bg: 'bg-secondary', text: 'text-on-secondary' },
  { name: 'Secondary Container', hex: '#00a572', role: 'Green Wave Indicators', bg: 'bg-secondary-container', text: 'text-white' },
  { name: 'Tertiary (Purple)', hex: '#ddb7ff', role: 'Network Topology & Abstract Logic', bg: 'bg-tertiary', text: 'text-on-tertiary' },
  { name: 'Surface (Deep Slate)', hex: '#0d1322', role: 'Main Background Canvas', bg: 'bg-surface', text: 'text-on-surface' },
  { name: 'Container High', hex: '#242a3a', role: 'Glassmorphic Floating Panels', bg: 'bg-surface-container-high', text: 'text-on-surface' },
  { name: 'Error / Preemption', hex: '#ffb4ab', role: 'Emergency Priority & Siren Alerts', bg: 'bg-error', text: 'text-on-error' },
];

const ARCHITECTURE_LAYERS = [
  {
    layer: 'Layer 1: Edge Sensing Mesh',
    icon: 'sensors',
    tech: 'Roadway Induction Loops • 48 Air Quality IoT Nodes • Smart CCTV Flow AI',
    desc: 'Captures raw vehicular velocity, lane queuing length, micro-climate weather, and emergency vehicle optical/RF beacons at 100 Hz.'
  },
  {
    layer: 'Layer 2: Real-Time Ingestion Backbone',
    icon: 'hub',
    tech: 'NTCIP 1202 Signal Protocol • MQTT Telemetry Stream • Edge Compute Clusters',
    desc: 'Aggregates multi-modal sensor frames across 12 smart junctions and autonomous fleets with under 4.2ms round-trip latency.'
  },
  {
    layer: 'Layer 3: Algorithmic Optimization AI',
    icon: 'memory',
    tech: 'Dynamic Dijkstra Shortest-Path • Reinforcement Learning Green Waves • Emergency Preemption',
    desc: 'Continuously recalculates traffic flow equilibrium, minimizes stop-and-go idling, and clears automated corridors for ambulances and fire units.'
  },
  {
    layer: 'Layer 4: Cybernetic Operations Center',
    icon: 'terminal',
    tech: 'React 18 • Tailwind CSS • Leaflet Geo-Spatial • Glassmorphism Telemetry UI',
    desc: 'Provides unified situational awareness, scenario simulation tools, manual cycle hold controls, and real-time carbon offset accounting.'
  }
];

const STITCH_SCREENS = [
  { id: '1', title: '1. Climate & Emissions Dashboard', file: '/screens/1_Climate_Emissions.png', desc: 'Air quality mesh, carbon abatement curves, and grid energy efficiency telemetry.' },
  { id: '3', title: '3. Traffic Operations Center', file: '/screens/3_Smart_Mobility_Dashboard.png', desc: 'Real-time network map, Dijkstra pathfinding, and corridor congestion indexes.' },
  { id: '4', title: '4. Dashboard with System Logs', file: '/screens/4_Smart_Mobility_System_Logs.png', desc: 'Slide-up terminal drawer with real-time stream of edge controller events.' },
  { id: '5', title: '5. Fleet Operations Dashboard', file: '/screens/5_Fleet_Operations.png', desc: 'Autonomous shuttle tracking, battery state of charge (SoC), and route dispatching.' },
  { id: '6', title: '6. Junctions Management Dashboard', file: '/screens/6_Junctions_Management.png', desc: 'Interactive 12-node controller, signal phase timing rings, and emergency preemption.' },
];

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState<'TOKENS' | 'ARCH' | 'SCREENS'>('ARCH');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5 h-full select-none">
      {/* Top Header & Tab Navigation */}
      <div className="glass-panel p-5 rounded border-outline-variant/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-on-surface">
              Songdo Smart Mobility • Design System & Architecture Specification
            </h2>
          </div>
          <p className="text-xs font-mono text-secondary mt-1">
            Cybernetic Minimalism • Technical Information Design • Hackathon Presentation Deck
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded bg-surface-container-lowest border border-outline-variant text-xs font-mono">
          <button
            onClick={() => setActiveTab('ARCH')}
            className={`px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'ARCH' ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(76,215,246,0.3)]' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>SYSTEM ARCHITECTURE</span>
          </button>

          <button
            onClick={() => setActiveTab('TOKENS')}
            className={`px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'TOKENS' ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(76,215,246,0.3)]' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>DESIGN SYSTEM TOKENS</span>
          </button>

          <button
            onClick={() => setActiveTab('SCREENS')}
            className={`px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'SCREENS' ? 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(76,215,246,0.3)]' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>STITCH SCREEN ASSETS</span>
          </button>
        </div>
      </div>

      {/* Tab 1: System Architecture Presentation */}
      {activeTab === 'ARCH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto">
          {/* 4 Layers Presentation */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="glass-panel p-5 rounded border-outline-variant/60">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">account_tree</span>
                Cyber-Physical Smart City Architecture
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                The Songdo Smart Mobility Command Center unifies edge-level IoT perception with real-time graph algorithms and autonomous vehicle fleets to eliminate urban congestion, prioritize emergency responses, and reduce carbon emissions.
              </p>

              <div className="space-y-3">
                {ARCHITECTURE_LAYERS.map((item, idx) => (
                  <div
                    key={item.layer}
                    className="p-4 rounded bg-surface-container-lowest/70 border border-outline-variant/40 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-secondary text-lg">{item.icon}</span>
                        <span className="font-mono text-xs font-bold text-on-surface">{item.layer}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                        STAGE 0{idx + 1}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-secondary mt-1.5 font-medium">{item.tech}</div>
                    <div className="text-xs text-outline mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Hackathon Pitch Summary Card */}
            <div className="glass-panel p-4 rounded border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest/60">
              <div>
                <div className="text-xs font-mono font-bold text-secondary">HACKATHON VALUE PROPOSITION:</div>
                <div className="text-xs text-on-surface mt-1">
                  Proven 18.4% carbon abatement & 4.2ms sub-system latency using autonomous green-wave synchronization.
                </div>
              </div>
              <span className="px-3 py-1 rounded bg-secondary/15 text-secondary border border-secondary/30 font-mono text-xs font-bold">
                READY FOR DEPLOYMENT
              </span>
            </div>
          </div>

          {/* Right Column: Key Technical Specs */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary pb-2 border-b border-outline-variant">
                Technical Blueprint
              </h4>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between pb-1.5 border-b border-outline-variant/40">
                  <span className="text-outline">City Deployment:</span>
                  <span className="text-on-surface font-semibold">Songdo IBD, Incheon</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-outline-variant/40">
                  <span className="text-outline">Total Monitored Nodes:</span>
                  <span className="text-primary font-bold">12 Major Junctions</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-outline-variant/40">
                  <span className="text-outline">Active Transit Units:</span>
                  <span className="text-secondary font-bold">24 Autonomous Units</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-outline-variant/40">
                  <span className="text-outline">Routing Engine:</span>
                  <span className="text-on-surface">Dynamic Weighted Dijkstra</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-outline-variant/40">
                  <span className="text-outline">Signal Preemption:</span>
                  <span className="text-error font-bold">L4 Emergency Green Wave</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Design Foundation:</span>
                  <span className="text-tertiary">Google Stitch MCP</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded border-outline-variant/60 flex-1 flex flex-col justify-center text-center p-6 bg-primary/5 border-primary/20">
              <span className="material-symbols-outlined text-primary text-4xl mb-2 mx-auto">verified</span>
              <h5 className="font-mono text-xs font-bold text-on-surface uppercase">Full Design Fidelity</h5>
              <p className="text-[11px] text-outline mt-1 leading-relaxed">
                All 6 screens from Stitch Project #16364102934058747839 are fully implemented with interactive telemetry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Design Tokens & Typography */}
      {activeTab === 'TOKENS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto">
          {/* Color Palette */}
          <div className="lg:col-span-6 glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 pb-2 border-b border-outline-variant">
              <Palette className="w-4 h-4" />
              Cybernetic Color Spectrum
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_SWATCHES.map(s => (
                <div key={s.name} className="p-3 rounded bg-surface-container-lowest/70 border border-outline-variant/40 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded ${s.bg} shrink-0 border border-white/15 shadow-sm`}></div>
                  <div className="font-mono text-xs overflow-hidden">
                    <div className="font-bold text-on-surface truncate">{s.name}</div>
                    <div className="text-[10px] text-secondary">{s.hex}</div>
                    <div className="text-[10px] text-outline truncate">{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Specimen & Layers */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 pb-2 border-b border-outline-variant">
                <Type className="w-4 h-4" />
                Typography System
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded bg-surface-container-lowest/60 border border-outline-variant/30">
                  <div className="text-[10px] font-mono text-outline mb-1">DISPLAY-LG (Geist Bold 32px / -0.02em)</div>
                  <div className="font-display text-2xl font-bold text-primary tracking-tight">
                    METRO-CORE OPERATIONS
                  </div>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest/60 border border-outline-variant/30">
                  <div className="text-[10px] font-mono text-outline mb-1">HEADLINE-MD (Geist SemiBold 20px)</div>
                  <div className="font-display text-lg font-semibold text-on-surface">
                    Junction Controller & Approach Telemetry
                  </div>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest/60 border border-outline-variant/30">
                  <div className="text-[10px] font-mono text-outline mb-1">TELEMETRY-VALUE (JetBrains Mono 14px / 600)</div>
                  <div className="font-mono text-sm font-semibold text-secondary">
                    4,820 veh/hr • -18.4% CO₂ • LATENCY 4.2ms
                  </div>
                </div>
              </div>
            </div>

            {/* Glassmorphic Layers */}
            <div className="glass-panel p-5 rounded border-outline-variant/60 flex flex-col gap-2">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Elevation & Glassmorphism
              </h4>
              <p className="text-xs text-outline leading-relaxed">
                Depth is created through <strong>Luminous Layers</strong> rather than muddy drop shadows. 80% opacity containers float with <code>backdrop-blur-md</code> over the dark base canvas, allowing subtle light from the city map to bleed through.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stitch Screen Assets Gallery */}
      {activeTab === 'SCREENS' && (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {STITCH_SCREENS.map(screen => (
              <div
                key={screen.id}
                className="glass-panel rounded border-outline-variant/60 overflow-hidden flex flex-col group hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setPreviewImage(screen.file)}
              >
                <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-outline-variant/40">
                  <img
                    src={screen.file}
                    alt={screen.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 rounded bg-black/80 text-primary border border-primary/40 font-mono text-xs font-bold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> CLICK TO EXPAND
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                  <h4 className="font-mono text-xs font-bold text-on-surface uppercase group-hover:text-primary transition-colors">
                    {screen.title}
                  </h4>
                  <p className="text-xs text-outline leading-relaxed">
                    {screen.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Preview for Full-Size Screenshot */}
          {previewImage && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              <div className="max-w-6xl max-h-[90vh] bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-2xl flex flex-col">
                <div className="p-3 border-b border-outline-variant flex items-center justify-between text-xs font-mono">
                  <span className="text-primary font-bold">STITCH CANVAS PREVIEW</span>
                  <span className="text-outline">CLICK ANYWHERE TO CLOSE</span>
                </div>
                <div className="overflow-auto p-2">
                  <img src={previewImage} alt="Preview" className="w-full h-auto rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
