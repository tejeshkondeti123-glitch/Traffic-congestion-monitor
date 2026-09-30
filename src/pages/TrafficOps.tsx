import { useState, useMemo, useEffect } from 'react';
import trafficDataRaw from '../data/traffic.json';
import { 
  nodes, 
  streetEdges, 
  computeAllPossibleRoutes, 
  getNode, 
  getEdgeTrafficMetrics,
  droneTelemetry,
  CityNode, 
  CandidateRoute, 
  IncidentState,
  TrafficData 
} from '../utils/dijkstra';
import { 
  Search, 
  MapPin, 
  Car, 
  Bus, 
  Bike, 
  ArrowLeftRight, 
  X, 
  Star, 
  AlertOctagon, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Satellite, 
  Compass, 
  Activity,
  Navigation,
  CornerDownRight,
  Radio
} from 'lucide-react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useSimulation } from '../context/SimulationContext';

// Simple polyline component for vis.gl
const MapPolyline = ({ path, options, onClick }: { path: google.maps.LatLngLiteral[], options: google.maps.PolylineOptions, onClick?: () => void }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    const pl = new google.maps.Polyline({
      map,
      path,
      ...options
    });

    if (onClick) {
      const listener = pl.addListener('click', onClick);
      setPolyline(pl);
      return () => {
        google.maps.event.removeListener(listener);
        pl.setMap(null);
      };
    }

    setPolyline(pl);
    return () => pl.setMap(null);
  }, [map]);

  useEffect(() => {
    if (polyline) {
      polyline.setPath(path);
      polyline.setOptions(options);
    }
  }, [polyline, path, options]);

  return null;
};

const trafficData = trafficDataRaw as TrafficData[];

// Base center of Songdo International Business District
const MAP_CENTER = { lat: 37.391, lng: 126.643 };

type PlaceFilter = 'all' | 'famous' | 'park' | 'landmark' | 'shopping' | 'campus';

export default function TrafficOps() {
  const { averageSpeed, networkCongestion, emergencyOverride, addLog } = useSimulation();

  // Navigation & Directions State
  const [isDirectionsMode, setIsDirectionsMode] = useState<boolean>(false);
  const [originId, setOriginId] = useState<number | null>(null);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-fastest');
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'eco'>('driving');
  const [showSteps, setShowSteps] = useState<boolean>(false);

  // Search & Map Interaction State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('famous');
  const [selectedPlace, setSelectedPlace] = useState<CityNode | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'hybrid' | 'roadmap'>('satellite');
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [streetFilter, setStreetFilter] = useState<'all' | 'small' | 'major'>('all');
  const [showDroneModal, setShowDroneModal] = useState<boolean>(false);

  // Dynamic Incident State
  const [activeIncident, setActiveIncident] = useState<IncidentState | null>(null);

  // Filtered places for search and suggestions
  const filteredPlaces = useMemo(() => {
    return nodes.filter(place => {
      const matchesQuery = searchQuery === '' || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.highlight.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      if (placeFilter === 'famous') return place.isFamous;
      if (placeFilter === 'park') return place.type === 'park';
      if (placeFilter === 'landmark') return place.type === 'hub' || place.type === 'commercial';
      if (placeFilter === 'shopping') return place.type === 'commercial' || place.type === 'waterfront';
      if (placeFilter === 'campus') return place.type === 'campus' || place.type === 'tech';
      return true;
    });
  }, [searchQuery, placeFilter]);

  // Compute ALL possible candidate routes with full parameters
  const candidateRoutes = useMemo<CandidateRoute[]>(() => {
    if (!originId || !destinationId || originId === destinationId) return [];
    return computeAllPossibleRoutes(trafficData, originId, destinationId, activeIncident);
  }, [originId, destinationId, activeIncident]);

  // Active route
  const activeRoute = useMemo<CandidateRoute | null>(() => {
    if (candidateRoutes.length === 0) return null;
    return candidateRoutes.find(r => r.id === selectedRouteId) || candidateRoutes[0];
  }, [candidateRoutes, selectedRouteId]);

  // Sync selected route when candidate routes change
  useEffect(() => {
    if (candidateRoutes.length > 0 && !candidateRoutes.some(r => r.id === selectedRouteId)) {
      setSelectedRouteId(candidateRoutes[0].id);
    }
  }, [candidateRoutes, selectedRouteId]);

  // Log routing updates
  useEffect(() => {
    if (activeRoute && originId && destinationId) {
      addLog(
        'INFO', 
        'DIJKSTRA-AI', 
        `Directions computed: ${getNode(originId).shortName} → ${getNode(destinationId).shortName} (${candidateRoutes.length} options, ${activeRoute.totalTimeMin}m via ${activeRoute.viaStreet})`
      );
    }
  }, [activeRoute?.id, originId, destinationId]);

  // Start directions with selected place as destination
  const handleDirectionsTo = (place: CityNode) => {
    if (!originId) {
      // Default origin to Songdo Convensia Hub if not set
      setOriginId(1001);
    }
    setDestinationId(place.id);
    setIsDirectionsMode(true);
    setSelectedPlace(null);
  };

  // Set place as origin
  const handleSetAsOrigin = (place: CityNode) => {
    setOriginId(place.id);
    setIsDirectionsMode(true);
    if (!destinationId) {
      // Default destination to Technopark if not set
      setDestinationId(1006);
    }
    setSelectedPlace(null);
  };

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  // Clear directions and return to clean exploration mode
  const handleClearDirections = () => {
    setIsDirectionsMode(false);
    setOriginId(null);
    setDestinationId(null);
    setActiveIncident(null);
    setShowSteps(false);
  };

  // Toggle simulated bottleneck / incident on the active route
  const handleToggleIncident = () => {
    if (activeIncident) {
      setActiveIncident(null);
      addLog('INFO', 'INCIDENT-DISPATCH', 'Incident cleared on corridor. Nominal traffic restored.');
    } else if (activeRoute && activeRoute.segments.length > 0) {
      const targetSeg = activeRoute.segments[0];
      setActiveIncident({
        from: targetSeg.from.id,
        to: targetSeg.to.id,
        streetName: targetSeg.streetName,
        severity: 95,
        reason: 'Severe Gridlock & Multi-Vehicle Obstruction'
      });
      addLog('WARN', 'DIJKSTRA-AI', `Simulated 95% traffic bottleneck on ${targetSeg.streetName}! Candidate routes re-evaluated.`);
    }
  };

  // Get pin styling for places on the map
  const getPlacePin = (place: CityNode) => {
    if (originId === place.id) {
      return {
        bg: 'bg-emerald-500 text-white border-white',
        ring: 'shadow-[0_0_20px_rgba(16,185,129,0.9)] scale-110',
        icon: '📍',
        label: `Origin: ${place.shortName}`
      };
    }
    if (destinationId === place.id) {
      return {
        bg: 'bg-red-500 text-white border-white',
        ring: 'shadow-[0_0_20px_rgba(239,68,68,0.9)] scale-110',
        icon: '🏁',
        label: `Destination: ${place.shortName}`
      };
    }
    if (activeRoute && activeRoute.path.includes(place.id)) {
      return {
        bg: 'bg-cyan-500 text-white border-cyan-100',
        ring: 'shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105',
        icon: '🔷',
        label: place.shortName
      };
    }

    // Default Famous Spot / Landmark pin
    let icon = '📍';
    if (place.type === 'park') icon = '🌳';
    else if (place.type === 'hub') icon = '🏢';
    else if (place.type === 'commercial') icon = '🛍️';
    else if (place.type === 'campus') icon = '🎓';
    else if (place.type === 'waterfront') icon = '⛵';
    else if (place.type === 'tech') icon = '🔬';

    return {
      bg: place.isFamous ? 'bg-surface-container-lowest/90 border-primary/70 text-on-surface' : 'bg-surface-container-lowest/80 border-outline-variant/60 text-outline',
      ring: place.isFamous ? 'shadow-lg border-2' : 'shadow-sm',
      icon,
      label: place.shortName
    };
  };

  return (
    <div className="flex flex-col h-full w-full select-none relative overflow-hidden rounded-xl border border-outline-variant/60">
      {/* ========================================================================= */}
      {/* 1. FLOATING GOOGLE MAPS CONTROLS (TOP-LEFT)                               */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[420px] w-[calc(100%-24px)] pointer-events-none">
        
        {/* --- A. EXPLORATION SEARCH BAR (When NOT in Directions Mode) --- */}
        {!isDirectionsMode ? (
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Search Box */}
            <div className="glass-panel p-2 rounded-xl border border-outline-variant/80 shadow-2xl bg-surface-container-lowest/95 backdrop-blur-md flex items-center gap-2">
              <Search className="w-5 h-5 text-primary ml-1 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, streets, famous spots in Songdo..."
                className="flex-1 bg-transparent border-none text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:text-on-surface text-outline">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="h-5 w-[1px] bg-outline-variant/60 mx-0.5"></div>
              <button
                onClick={() => {
                  setIsDirectionsMode(true);
                  if (!originId) setOriginId(1001); // default Convensia
                  if (!destinationId) setDestinationId(1006); // default Technopark
                }}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
              >
                <Compass className="w-4 h-4" />
                Directions
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['famous', 'park', 'landmark', 'shopping', 'campus', 'all'] as PlaceFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setPlaceFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-all border shadow-sm ${
                    placeFilter === cat 
                      ? 'bg-primary text-on-primary font-bold border-primary shadow-[0_0_10px_rgba(76,215,246,0.3)]' 
                      : 'bg-surface-container-lowest/90 backdrop-blur text-outline hover:text-on-surface border-outline-variant/60'
                  }`}
                >
                  {cat === 'famous' && '⭐ Famous Spots'}
                  {cat === 'park' && '🌳 Parks'}
                  {cat === 'landmark' && '🏢 Landmarks'}
                  {cat === 'shopping' && '🛍️ Shopping & Malls'}
                  {cat === 'campus' && '🎓 Campuses'}
                  {cat === 'all' && '🌐 All Places'}
                </button>
              ))}
            </div>

            {/* Quick Suggestions list when searching */}
            {searchQuery && (
              <div className="glass-panel p-2 rounded-xl border border-outline-variant/80 bg-surface-container-lowest/95 backdrop-blur shadow-2xl max-h-[260px] overflow-y-auto space-y-1">
                {filteredPlaces.length === 0 ? (
                  <div className="p-3 text-center text-xs font-mono text-outline">No matching places in Songdo</div>
                ) : (
                  filteredPlaces.map(place => (
                    <div
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-lg hover:bg-surface-container-high/80 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="font-bold text-on-surface">{place.name}</div>
                          <div className="text-[10px] text-outline">{place.street} • {place.category}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">★ {place.rating}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* --- B. GOOGLE MAPS DIRECTIONS & MULTI-ROUTE PANEL --- */
          <div className="glass-panel rounded-xl border border-outline-variant/80 shadow-2xl bg-surface-container-lowest/95 backdrop-blur-md flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-top-3">
            
            {/* Directions Inputs Header */}
            <div className="p-3 border-b border-outline-variant/60 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                {/* Travel Modes (Car, Transit, Eco) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTravelMode('driving')}
                    className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-mono transition-all ${
                      travelMode === 'driving' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-outline hover:text-on-surface'
                    }`}
                    title="Driving Route"
                  >
                    <Car className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTravelMode('transit')}
                    className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-mono transition-all ${
                      travelMode === 'transit' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-outline hover:text-on-surface'
                    }`}
                    title="Public Transit / Green-Wave"
                  >
                    <Bus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTravelMode('eco')}
                    className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-mono transition-all ${
                      travelMode === 'eco' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-outline hover:text-on-surface'
                    }`}
                    title="Eco-Route"
                  >
                    <Bike className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {/* Simulate Incident Toggle Button */}
                  <button
                    onClick={handleToggleIncident}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                      activeIncident 
                        ? 'bg-amber-500 text-on-surface-variant border-amber-400 animate-pulse'
                        : 'bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface border-outline-variant'
                    }`}
                    title="Simulate congestion bottleneck on route"
                  >
                    {activeIncident ? <RotateCcw className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3 text-error" />}
                    {activeIncident ? 'Clear Jam' : 'Traffic Spike'}
                  </button>

                  {/* Close Directions Button */}
                  <button
                    onClick={handleClearDirections}
                    className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface ml-1"
                    title="Close directions and return to explore mode"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Origin & Destination Selectors with Swap */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 py-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  <span className="w-0.5 h-4 bg-outline-variant/60"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <select
                    value={originId || ''}
                    onChange={(e) => setOriginId(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-md px-2 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    <option value="" disabled>Choose starting point...</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.street})
                      </option>
                    ))}
                  </select>

                  <select
                    value={destinationId || ''}
                    onChange={(e) => setDestinationId(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-md px-2 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-error cursor-pointer"
                  >
                    <option value="" disabled>Choose destination...</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.street})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSwapLocations}
                  className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-outline hover:text-on-surface border border-outline-variant/60 transition-colors shrink-0"
                  title="Reverse starting point and destination"
                >
                  <ArrowLeftRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* Quick Route Preset Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
                <span className="text-[10px] font-mono text-outline shrink-0">Try:</span>
                {[
                  { label: 'Park ➔ Technopark', from: 1002, to: 1006 },
                  { label: 'Canal ➔ Triple St (Alleys)', from: 1003, to: 1031 },
                  { label: 'Convensia ➔ BioLogics', from: 1001, to: 1011 },
                  { label: 'Waterfront ➔ Campus', from: 1021, to: 1014 }
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setOriginId(preset.from);
                      setDestinationId(preset.to);
                    }}
                    className="px-2 py-0.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-[10px] font-mono text-outline hover:text-on-surface border border-outline-variant/60 whitespace-nowrap transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- ALL POSSIBLE ROUTES LIST WITH PARAMETERS --- */}
            <div className="p-2.5 max-h-[320px] overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-outline px-1">
                <span>FOUND {candidateRoutes.length} POSSIBLE ROUTES</span>
                <span>SORTED BY SPEED</span>
              </div>

              {candidateRoutes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const isCongested = route.avgCongestion > 50;

                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(76,215,246,0.2)]' 
                        : 'bg-surface-container-low/80 hover:bg-surface-container-high/80 border-outline-variant/50'
                    }`}
                  >
                    {/* Route Title & Duration */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-mono font-extrabold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            {route.totalTimeMin} min
                          </span>
                          <span className="text-xs font-mono text-outline">
                            ({route.totalDistanceKm} km)
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                            route.isFastest 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-surface-container-highest text-outline border-outline-variant/60'
                          }`}>
                            {route.badge}
                          </span>
                        </div>
                        <div className="text-xs font-mono font-bold text-on-surface mt-0.5">
                          {route.name}
                        </div>
                        <div className="text-[11px] font-mono text-outline">
                          via {route.viaStreet}
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        isCongested ? 'bg-amber-500/20 text-amber-300' : 'bg-secondary/20 text-secondary'
                      }`}>
                        {route.tagline}
                      </span>
                    </div>

                    {/* Small Streets / Alleys Highlight if present */}
                    {route.hasSmallStreets && (
                      <div className="px-2 py-1 rounded bg-secondary/15 border border-secondary/40 text-[10px] font-mono text-secondary flex items-center gap-1.5">
                        <span className="shrink-0">🛣️</span>
                        <span className="font-bold">Includes {route.smallStreetCount} Small Routes:</span>
                        <span className="text-on-surface truncate">{route.smallStreetNames.join(', ')}</span>
                      </div>
                    )}

                    {/* All Route Parameters Breakdown */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-outline-variant/30 text-[10px] font-mono text-outline">
                      <div>
                        <span className="block text-[9px]">TRAFFIC LOAD</span>
                        <span className={`font-semibold ${isCongested ? 'text-amber-400' : 'text-secondary'}`}>
                          {route.avgCongestion}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px]">AVG SPEED</span>
                        <span className="font-semibold text-on-surface">{route.avgSpeedKmH} km/h</span>
                      </div>
                      <div>
                        <span className="block text-[9px]">SIGNALS</span>
                        <span className="font-semibold text-on-surface">{route.signalCount} stops</span>
                      </div>
                      <div>
                        <span className="block text-[9px]">EST. CO₂</span>
                        <span className="font-semibold text-cyan-300">{route.co2Kg} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Turn-by-turn Navigation Accordion */}
              {activeRoute && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono text-primary flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Navigation className="w-3.5 h-3.5" />
                      {showSteps ? 'Hide Step-by-Step Directions' : 'View Step-by-Step Directions'}
                    </span>
                    {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSteps && (
                    <div className="mt-2 space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {activeRoute.directions.map((dir, i) => (
                        <div key={i} className="p-2 rounded bg-surface-container-low border border-outline-variant/40 text-[11px] font-mono flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-on-surface">{dir.instruction}</div>
                            <div className="text-[10px] text-outline mt-0.5 flex items-center justify-between">
                              <span>{dir.distance} • {dir.time}</span>
                              <span className="text-cyan-200">{dir.street}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Reroute Alert if incident is active */}
            {activeIncident && (
              <div className="p-2.5 bg-amber-950/80 border-t border-amber-500/60 text-xs font-mono text-amber-200 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <span>Rerouting active around {activeIncident.streetName} jam ({activeIncident.severity}%). Alternative routes prioritized!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. FLOATING PLACE DETAILS SHEET (WHEN A PLACE IS CLICKED)                 */}
      {/* ========================================================================= */}
      {selectedPlace && !isDirectionsMode && (
        <div className="absolute top-16 left-3 z-30 w-[360px] glass-panel rounded-2xl border border-outline-variant/80 shadow-2xl bg-surface-container-lowest/95 backdrop-blur-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-mono font-bold text-on-surface">{selectedPlace.name}</div>
              <div className="text-xs font-mono text-outline mt-0.5">{selectedPlace.street} • {selectedPlace.district}</div>
            </div>
            <button 
              onClick={() => setSelectedPlace(null)} 
              className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rating, Category & Highlight */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {selectedPlace.rating}
            </span>
            <span className="text-outline">({selectedPlace.reviewsCount} reviews)</span>
            <span className="text-outline">•</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
              {selectedPlace.category}
            </span>
          </div>

          <p className="text-xs font-mono text-on-surface-variant leading-relaxed bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/40">
            {selectedPlace.highlight}
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-outline">
            <span>Hours: <span className="text-on-surface">{selectedPlace.openHours}</span></span>
            {selectedPlace.id === 1001 ? (
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Drone Sector N101 (48.4 km/h)
              </span>
            ) : selectedPlace.id === 1002 ? (
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Drone Sector N102 (67.6 km/h)
              </span>
            ) : (
              <span className="text-secondary font-semibold">Live Traffic: Normal Flow</span>
            )}
          </div>

          {/* Google Maps Actions: Directions / Start Point */}
          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/40">
            <button
              onClick={() => handleSetAsOrigin(selectedPlace)}
              className="flex-1 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-mono text-xs font-bold border border-outline-variant flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              Start Here
            </button>

            <button
              onClick={() => handleDirectionsTo(selectedPlace)}
              className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              Directions
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FLOATING MAP TYPE & TRAFFIC CONTROLS (TOP-RIGHT)                        */}
      {/* ========================================================================= */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Toggle Drone Telemetry Modal */}
        <button
          onClick={() => setShowDroneModal(!showDroneModal)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all ${
            showDroneModal 
              ? 'bg-primary text-on-primary border-primary shadow-[0_0_15px_rgba(76,215,246,0.6)]' 
              : 'bg-surface-container-lowest/90 text-cyan-300 hover:text-cyan-200 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_8px_rgba(76,215,246,0.2)]'
          }`}
          title="Inspect ingested aerial drone trajectory data (220 samples, 66 vehicles)"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Drone Feed (220 Ingested)</span>
        </button>

        {/* Toggle Traffic Congestion Overlay */}
        <button
          onClick={() => setShowTrafficLayer(!showTrafficLayer)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all ${
            showTrafficLayer 
              ? 'bg-secondary text-on-secondary border-secondary shadow-[0_0_12px_rgba(78,222,163,0.4)]' 
              : 'bg-surface-container-lowest/90 text-outline hover:text-on-surface border-outline-variant/70'
          }`}
          title="Toggle live street traffic color flow on the map"
        >
          <Activity className="w-3.5 h-3.5" />
          Traffic Layer
        </button>

        {/* Map Type Switcher: Satellite / Hybrid / Roadmap */}
        <div className="flex items-center bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/80 rounded-lg p-0.5 shadow-lg">
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all flex items-center gap-1 ${
              mapType === 'satellite' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Satellite className="w-3 h-3" />
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all flex items-center gap-1 ${
              mapType === 'hybrid' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Layers className="w-3 h-3" />
            Hybrid
          </button>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all flex items-center gap-1 ${
              mapType === 'roadmap' ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. GOOGLE MAPS ENGINE CANVAS                                              */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full relative">
        <Map 
          defaultCenter={MAP_CENTER} 
          defaultZoom={14} 
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          disableDefaultUI={true}
          colorScheme="DARK"
          internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
        >
          {/* A. REAL-TIME TRAFFIC DENSITY LAYER (Shown on all streets, including small routes & alleys) */}
          {showTrafficLayer && streetEdges.map((edge) => {
            if (edge.from > edge.to) return null;

            // Filter by street category if selected
            if (streetFilter === 'small' && edge.roadType !== 'side-street' && edge.roadType !== 'alley') return null;
            if (streetFilter === 'major' && (edge.roadType === 'side-street' || edge.roadType === 'alley')) return null;

            const fromNode = getNode(edge.from);
            const toNode = getNode(edge.to);

            // Check if this edge is currently part of the active route
            const inActiveRoute = isDirectionsMode && activeRoute && 
              activeRoute.path.includes(edge.from) && activeRoute.path.includes(edge.to) &&
              Math.abs(activeRoute.path.indexOf(edge.from) - activeRoute.path.indexOf(edge.to)) === 1;

            if (inActiveRoute) return null; // Drawn with higher prominence in active route section

            const isIncident = activeIncident && (
              (activeIncident.from === edge.from && activeIncident.to === edge.to) ||
              (activeIncident.from === edge.to && activeIncident.to === edge.from)
            );

            const metric = getEdgeTrafficMetrics(trafficData, edge.from, edge.to, activeIncident);

            const isSmallRoad = edge.roadType === 'side-street' || edge.roadType === 'alley';
            const isExpressway = edge.roadType === 'expressway' || edge.roadType === 'boulevard';
            const strokeWeight = isIncident ? 6 : (isExpressway ? 4.5 : (isSmallRoad ? 2.5 : 3.5));
            const strokeOpacity = isDirectionsMode ? 0.35 : 0.85;

            return (
              <MapPolyline 
                key={`traffic-edge-${edge.from}-${edge.to}`}
                path={[{ lat: fromNode.lat, lng: fromNode.lng }, { lat: toNode.lat, lng: toNode.lng }]}
                options={{
                  strokeColor: metric.trafficColor,
                  strokeWeight,
                  strokeOpacity,
                  zIndex: isIncident ? 15 : (isExpressway ? 6 : 4),
                }}
              />
            );
          })}

          {/* B. ALL POSSIBLE ALTERNATIVE CANDIDATE ROUTES (Clickable with duration chips) */}
          {isDirectionsMode && candidateRoutes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            if (isSelected) return null; // Drawn prominently in active route layer

            const routePathCoords = route.path.map(id => ({
              lat: getNode(id).lat,
              lng: getNode(id).lng
            }));

            // Calculate midpoint of the route path for the interactive duration chip
            const midIndex = Math.floor(route.path.length / 2);
            const midNode = getNode(route.path[midIndex]);

            return (
              <div key={`alt-route-container-${route.id}`}>
                {/* Alternative Route Polyline */}
                <MapPolyline 
                  key={`alt-route-${route.id}`}
                  path={routePathCoords}
                  options={{
                    strokeColor: '#64748b',
                    strokeWeight: 4.5,
                    strokeOpacity: 0.7,
                    zIndex: 10,
                  }}
                  onClick={() => setSelectedRouteId(route.id)}
                />

                {/* On-Map Duration Chip */}
                <AdvancedMarker 
                  position={{ lat: midNode.lat, lng: midNode.lng }}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="px-2 py-0.5 rounded-full bg-slate-900/95 text-slate-200 border border-slate-500/80 shadow-lg text-[10px] font-mono font-bold cursor-pointer hover:scale-105 hover:bg-primary hover:text-black transition-all flex items-center gap-1">
                    <span>{route.totalTimeMin}m</span>
                    {route.hasSmallStreets && <span className="text-[9px] text-cyan-300">• side road</span>}
                  </div>
                </AdvancedMarker>
              </div>
            );
          })}

          {/* C. ACTIVE SELECTED PRIMARY ROUTE (Segmented by traffic density + dark casing) */}
          {isDirectionsMode && activeRoute && (
            <>
              {/* 1. Base Casing Outline */}
              <MapPolyline 
                key={`active-route-casing-${activeRoute.id}`}
                path={activeRoute.path.map(id => ({
                  lat: getNode(id).lat,
                  lng: getNode(id).lng
                }))}
                options={{
                  strokeColor: '#0f172a',
                  strokeWeight: 8,
                  strokeOpacity: 0.9,
                  zIndex: 20,
                }}
              />

              {/* 2. Leg-by-leg traffic density color coding on active route */}
              {activeRoute.segments.map((seg, idx) => (
                <MapPolyline 
                  key={`active-seg-${activeRoute.id}-${idx}`}
                  path={[
                    { lat: seg.from.lat, lng: seg.from.lng },
                    { lat: seg.to.lat, lng: seg.to.lng }
                  ]}
                  options={{
                    strokeColor: emergencyOverride ? '#ffb4ab' : seg.trafficColor,
                    strokeWeight: 5,
                    strokeOpacity: 1.0,
                    zIndex: 25,
                  }}
                />
              ))}
            </>
          )}

          {/* D. PLACES OF INTEREST, FAMOUS SPOTS & ROUTE MARKERS */}
          {nodes.map(place => {
            const isOrigin = originId === place.id;
            const isDestination = destinationId === place.id;
            const inRoute = activeRoute && activeRoute.path.includes(place.id);
            const pin = getPlacePin(place);

            // In directions mode, prioritize origin, destination, route waypoints, and famous spots
            if (isDirectionsMode && !isOrigin && !isDestination && !inRoute && !place.isFamous) {
              return null;
            }

            return (
              <AdvancedMarker 
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => {
                  if (isDirectionsMode) {
                    if (!originId) setOriginId(place.id);
                    else setDestinationId(place.id);
                  } else {
                    setSelectedPlace(place);
                  }
                }}
              >
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-mono text-xs cursor-pointer backdrop-blur-md transition-all border ${pin.bg} ${pin.ring}`}>
                  <span>{pin.icon}</span>
                  <span className="font-semibold whitespace-nowrap">{pin.label}</span>
                  {(place.id === 1001 || place.id === 1002) && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-bold flex items-center gap-0.5">
                      <Radio className="w-2.5 h-2.5 text-cyan-300 animate-pulse" />
                      {place.id === 1001 ? 'N101' : 'N102'}
                    </span>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>

        {/* Bottom-left Traffic Density Legend & Street Filter */}
        <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/80 rounded-xl p-2.5 shadow-2xl z-10 flex flex-col gap-2 max-w-[360px] pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE TRAFFIC DENSITY</span>
            </div>
            <span className="text-[10px] text-outline font-normal">Songdo V2X Network</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
              <span>&lt;30% Free</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0"></span>
              <span>30-60% Mod</span>
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0"></span>
              <span>60-85% Slow</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b] shrink-0"></span>
              <span>&gt;85% Jam</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-outline uppercase">Filter:</span>
              <button
                type="button"
                onClick={() => setStreetFilter('all')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  streetFilter === 'all' 
                    ? 'bg-primary text-on-primary font-bold shadow-xs' 
                    : 'text-outline hover:text-on-surface bg-surface-container-high/60'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStreetFilter('small')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  streetFilter === 'small' 
                    ? 'bg-primary text-on-primary font-bold shadow-xs' 
                    : 'text-outline hover:text-on-surface bg-surface-container-high/60'
                }`}
              >
                Small Routes
              </button>
              <button
                type="button"
                onClick={() => setStreetFilter('major')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  streetFilter === 'major' 
                    ? 'bg-primary text-on-primary font-bold shadow-xs' 
                    : 'text-outline hover:text-on-surface bg-surface-container-high/60'
                }`}
              >
                Boulevards
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTrafficLayer(!showTrafficLayer)}
              className="text-[9px] font-mono text-secondary hover:underline cursor-pointer"
            >
              {showTrafficLayer ? 'Hide Flow' : 'Show Flow'}
            </button>
          </div>
        </div>

        {/* Bottom-right Status & Tip Pill */}
        <div className="absolute bottom-3 right-3 bg-surface-container-lowest/85 backdrop-blur border border-outline-variant/60 px-3 py-1.5 rounded-lg text-[11px] font-mono text-outline z-10 pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {isDirectionsMode 
              ? `Dynamic Re-routing Active • Avg Speed: ${averageSpeed} km/h • Load: ${networkCongestion}%` 
              : `Songdo IBD V2X Online • ${averageSpeed} km/h avg • ${networkCongestion}% Congestion • Ingested Drone Mesh active`}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 5. AERIAL DRONE SURVEILLANCE & TRAJECTORY INGESTION MODAL                  */}
        {/* ========================================================================= */}
        {showDroneModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-surface-container-lowest border border-cyan-500/40 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-surface-container-low border-b border-outline-variant/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-base font-mono font-bold text-on-surface flex items-center gap-2">
                      <span>Aerial Drone Trajectory Ingestion Feed</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/10 text-secondary border border-secondary/30 font-semibold">
                        INGESTED & SYNCHRONIZED
                      </span>
                    </div>
                    <div className="text-xs font-mono text-outline mt-0.5">
                      Drones 1–5 Surveillance Mesh • Window: 08:30:15.000 – 08:30:36.900 UTC • CRS: EPSG:5186 & WGS84
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDroneModal(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex flex-col gap-5 font-mono">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="glass-panel p-3 rounded-xl border border-outline-variant/50">
                    <div className="text-[10px] text-outline uppercase tracking-wider">Total Trajectories</div>
                    <div className="text-2xl font-bold text-cyan-300 mt-1">{droneTelemetry.metadata.total_samples} <span className="text-xs text-outline font-normal">pts</span></div>
                    <div className="text-[10px] text-secondary mt-0.5">100% full visibility</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl border border-outline-variant/50">
                    <div className="text-[10px] text-outline uppercase tracking-wider">Unique Vehicles</div>
                    <div className="text-2xl font-bold text-on-surface mt-1">{droneTelemetry.metadata.unique_vehicles} <span className="text-xs text-outline font-normal">veh</span></div>
                    <div className="text-[10px] text-primary mt-0.5">Tracked IDs 101–166</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl border border-outline-variant/50">
                    <div className="text-[10px] text-outline uppercase tracking-wider">Global Drone Speed</div>
                    <div className="text-2xl font-bold text-secondary mt-1">{droneTelemetry.metadata.global_avg_speed_kmh} <span className="text-xs text-outline font-normal">km/h</span></div>
                    <div className="text-[10px] text-outline mt-0.5">{droneTelemetry.metadata.min_speed_kmh} – {droneTelemetry.metadata.max_speed_kmh} km/h</div>
                  </div>
                  <div className="glass-panel p-3 rounded-xl border border-outline-variant/50">
                    <div className="text-[10px] text-outline uppercase tracking-wider">Fleet Mix</div>
                    <div className="text-xs font-bold text-on-surface mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      <span className="text-emerald-300">27 Cars</span>
                      <span className="text-amber-300">14 Buses</span>
                      <span className="text-rose-300">12 Trucks</span>
                      <span className="text-cyan-300">13 Motos</span>
                    </div>
                    <div className="text-[10px] text-outline mt-0.5">Multimodal traffic</div>
                  </div>
                </div>

                {/* Road Sections Breakdown */}
                <div>
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Monitored Road Corridors & Dynamic Speed Flow</span>
                    <span className="text-[10px] text-outline font-normal">Live Calibrated into Dijkstra Routing Engine</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(droneTelemetry.sections).map(([secName, secData]: [string, any]) => (
                      <div key={secName} className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/40 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30">
                              {secName}
                            </span>
                            <span className="text-xs text-on-surface font-semibold">
                              {secName === 'N101_G1' && 'Convensia Blvd North Approach'}
                              {secName === 'N101_G2' && 'Convensia East Approach (Industrial)'}
                              {secName === 'N101_G3' && 'Convensia South Approach (Boulevard)'}
                              {secName === 'N102_G1' && 'Central Park North Canal Way'}
                              {secName === 'N102_G2' && 'Gyeongwon Expressway Corridor'}
                            </span>
                          </div>
                          <span className={`text-xs font-bold ${secData.avg_speed_kmh > 60 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                            {secData.avg_speed_kmh} km/h
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-outline pt-1 border-t border-outline-variant/30">
                          <span>{secData.unique_vehicles} Vehicles ({secData.samples_count} pings)</span>
                          <span className="flex items-center gap-2 text-on-surface-variant">
                            <span>Lanes: {Object.keys(secData.lanes).join(', ')}</span>
                            <span>•</span>
                            <span className="text-secondary font-semibold">Flow: OPTIMAL</span>
                          </span>
                        </div>

                        {/* Lane speed pills */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {Object.entries(secData.lanes).map(([laneNum, lData]: [string, any]) => (
                            <div key={laneNum} className="flex-1 px-2 py-1 rounded bg-surface-container-high/60 border border-outline-variant/30 text-[10px] flex items-center justify-between">
                              <span className="text-outline">Lane {laneNum}</span>
                              <span className="text-on-surface font-semibold">{lData.avg_speed_kmh} km/h ({lData.vehicle_count}v)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Stream Feed Preview */}
                <div>
                  <div className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Ingested Vehicle Trajectory Stream Sample</span>
                    <span className="text-[10px] text-outline font-normal">First 8 of 220 Telemetry Records</span>
                  </div>
                  <div className="rounded-xl border border-outline-variant/50 overflow-hidden bg-surface-container-low/50">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-surface-container-high text-outline text-[10px] uppercase border-b border-outline-variant/40">
                          <th className="p-2">Veh ID</th>
                          <th className="p-2">Time</th>
                          <th className="p-2">Drone</th>
                          <th className="p-2">Section</th>
                          <th className="p-2">Lane</th>
                          <th className="p-2">Class</th>
                          <th className="p-2">Speed</th>
                          <th className="p-2">Accel</th>
                          <th className="p-2">GPS (Lat, Lng)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-mono">
                        {droneTelemetry.samples.slice(0, 8).map((s: any, idx: number) => {
                          const classLabel = s.vehicle_class === 0 ? 'Car' : s.vehicle_class === 1 ? 'Bus' : s.vehicle_class === 2 ? 'Truck' : 'Moto';
                          return (
                            <tr key={idx} className="hover:bg-surface-container-high/40 text-on-surface-variant">
                              <td className="p-2 font-bold text-cyan-300">#{s.vehicle_id}</td>
                              <td className="p-2 text-outline">{s.local_time}</td>
                              <td className="p-2">Drone-{s.drone_id}</td>
                              <td className="p-2 font-semibold text-on-surface">{s.road_section}</td>
                              <td className="p-2">Lane {s.lane_number}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  s.vehicle_class === 0 ? 'bg-emerald-500/10 text-emerald-300' :
                                  s.vehicle_class === 1 ? 'bg-amber-500/10 text-amber-300' :
                                  s.vehicle_class === 2 ? 'bg-rose-500/10 text-rose-300' : 'bg-cyan-500/10 text-cyan-300'
                                }`}>
                                  {classLabel}
                                </span>
                              </td>
                              <td className="p-2 font-bold text-on-surface">{s.vehicle_speed} km/h</td>
                              <td className="p-2 text-outline">{s.vehicle_acceleration > 0 ? `+${s.vehicle_acceleration}` : s.vehicle_acceleration} m/s²</td>
                              <td className="p-2 text-outline text-[10px]">{s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                <span className="text-outline">Engine: Dijkstra Edge Weight Evaluator synced with Drone Trajectory Matrix</span>
                <button
                  onClick={() => setShowDroneModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-bold transition-all shadow-md"
                >
                  Close & Continue Operations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
