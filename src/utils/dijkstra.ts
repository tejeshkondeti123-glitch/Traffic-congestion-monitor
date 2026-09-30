import droneTelemetryRaw from '../data/drone_telemetry.json';

export const droneTelemetry = droneTelemetryRaw;

export interface TrafficData {
  cycle_id: number;
  lane_id: string;
  two_wheeler_count: number;
  car_count: number;
  heavy_vehicle_count: number;
  emergency_vehicle: number;
  current_wait_time_sec: number;
  cross_traffic_density: number;
  weather_condition: string;
  allocated_green_time_sec: number;
}

export type LocationType = 'hub' | 'station' | 'commercial' | 'park' | 'tech' | 'campus' | 'waterfront' | 'cross' | 'alley';

export interface CityNode {
  id: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
  name: string;
  shortName: string;
  street: string;
  district: string;
  type: LocationType;
  rating: number;
  reviewsCount: number;
  category: string;
  highlight: string;
  openHours: string;
  isFamous?: boolean;
}

export interface StreetEdge {
  from: number;
  to: number;
  streetName: string;
  distanceKm: number;
  baseSpeedKmH: number;
  roadType: 'expressway' | 'boulevard' | 'avenue' | 'side-street' | 'alley';
}

export interface RouteSegment {
  from: CityNode;
  to: CityNode;
  streetName: string;
  distanceKm: number;
  timeMin: number;
  speedKmH: number;
  congestion: number; // 0 - 100%
  trafficColor: string; // '#10b981' | '#f59e0b' | '#ef4444' | '#991b1b'
  hasIncident?: boolean;
}

export interface RouteDirection {
  step: number;
  instruction: string;
  street: string;
  distance: string;
  time: string;
  status: 'clear' | 'moderate' | 'congested' | 'severe';
  congestion: number;
}

export interface RouteResult {
  path: number[];
  cost: number;
  totalDistanceKm: number;
  totalTimeMin: number;
  avgSpeedKmH: number;
  avgCongestion: number;
  segments: RouteSegment[];
  directions: RouteDirection[];
  rerouted: boolean;
  timeSavedMin: number;
  incidentAvoided: string | null;
  algorithm: string;
}

export interface CandidateRoute {
  id: string;
  name: string;
  viaStreet: string;
  routeType: string;
  path: number[];
  segments: RouteSegment[];
  totalDistanceKm: number;
  totalTimeMin: number;
  avgSpeedKmH: number;
  avgCongestion: number;
  trafficDelayMin: number;
  signalCount: number;
  co2Kg: number;
  badge: string;
  tagline: string;
  isFastest: boolean;
  hasSmallStreets: boolean;
  smallStreetCount: number;
  smallStreetNames: string[];
  directions: RouteDirection[];
}

export interface IncidentState {
  from: number;
  to: number;
  streetName: string;
  severity: number; // e.g. 90-99% congestion
  reason: string;
}

export type RoutingAlgorithm = 'dijkstra-traffic' | 'astar' | 'greenwave' | 'distance';

// Helper to determine traffic color based on congestion
export function getTrafficColor(congestion: number, isIncident = false): string {
  if (isIncident || congestion >= 85) return '#991b1b'; // Severe / Gridlock
  if (congestion >= 60) return '#ef4444'; // Heavy congestion
  if (congestion >= 30) return '#f59e0b'; // Moderate slowdown
  return '#10b981'; // Free-flowing green
}

// 36 realistic Songdo locations, famous spots, intersections, and cross streets
export const nodes: CityNode[] = [
  // 1-25: Main Landmarks & Intersections
  { 
    id: 1001, x: 50, y: 50, lat: 37.3895, lng: 126.6480, 
    name: "Songdo Convensia Hub", shortName: "Songdo Convensia", street: "Convensia-daero", district: "Convention Zone", 
    type: "hub", rating: 4.7, reviewsCount: 2310, category: "Convention & Events", 
    highlight: "Premier exhibition center with wave-inspired architecture", openHours: "08:00 - 20:00", isFamous: true 
  },
  { 
    id: 1002, x: 200, y: 50, lat: 37.3935, lng: 126.6350, 
    name: "Songdo Central Park", shortName: "Central Park", street: "Central-ro", district: "Central Park", 
    type: "park", rating: 4.9, reviewsCount: 8450, category: "Iconic Public Park", 
    highlight: "Seawater canal, water taxis, deer garden & sunset promenade", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1003, x: 350, y: 50, lat: 37.3980, lng: 126.6335, 
    name: "G-Tower Observatory", shortName: "G-Tower", street: "Incheon-tower-daero", district: "Int'l District", 
    type: "hub", rating: 4.8, reviewsCount: 3940, category: "Landmark & Observatory", 
    highlight: "33-floor UN hub with free 29F 360° panoramic observation deck", openHours: "10:00 - 21:00", isFamous: true 
  },
  { 
    id: 1004, x: 500, y: 50, lat: 37.3920, lng: 126.6260, 
    name: "Tri-Bowl & Art Center", shortName: "Tri-Bowl Arts", street: "Art-center-daero", district: "Waterfront Arts", 
    type: "commercial", rating: 4.7, reviewsCount: 1820, category: "Futuristic Cultural Center", 
    highlight: "Unique inverted-bowl architecture floating over reflective pond", openHours: "10:00 - 18:00", isFamous: true 
  },
  { 
    id: 1005, x: 650, y: 50, lat: 37.3750, lng: 126.6330, 
    name: "Incheon National University", shortName: "Incheon Nat'l Univ", street: "Academy-ro", district: "University Sector", 
    type: "campus", rating: 4.5, reviewsCount: 1200, category: "State University Campus", 
    highlight: "Modern smart-city higher education campus & research libraries", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1006, x: 50, y: 200, lat: 37.3825, lng: 126.6570, 
    name: "Technopark & Hyundai Outlets", shortName: "Technopark Hub", street: "Technopark-ro", district: "Tech & Innovation", 
    type: "tech", rating: 4.7, reviewsCount: 5240, category: "Shopping & Tech Complex", 
    highlight: "Triple Street lifestyle complex and mega premium shopping mall", openHours: "10:30 - 22:00", isFamous: true 
  },
  { 
    id: 1007, x: 200, y: 200, lat: 37.3910, lng: 126.6420, 
    name: "Harmony Transit Plaza", shortName: "Harmony Plaza", street: "Harmony-ro", district: "Central Corridor", 
    type: "station", rating: 4.4, reviewsCount: 630, category: "Metro & Bus Exchange", 
    highlight: "Intermodal transit connection linking Central Park & Convensia", openHours: "05:00 - 00:30", isFamous: false 
  },
  { 
    id: 1008, x: 350, y: 200, lat: 37.3900, lng: 126.6440, 
    name: "POSCO World Trade Tower", shortName: "POSCO Tower", street: "Gukje-daero", district: "Financial Core", 
    type: "commercial", rating: 4.8, reviewsCount: 4120, category: "68-Story Skyscraper", 
    highlight: "305m iconic skyscraper, Oakwood Premier hotel & skyline dining", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1009, x: 500, y: 200, lat: 37.3860, lng: 126.6530, 
    name: "Michuhol Traditional Park", shortName: "Michuhol Park", street: "Michuhol-daero", district: "Urban Greenery", 
    type: "park", rating: 4.6, reviewsCount: 1450, category: "Cultural Heritage Park", 
    highlight: "Traditional Korean pavilions, lotus pond, and tranquil walking trail", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1010, x: 650, y: 200, lat: 37.4080, lng: 126.6470, 
    name: "Aam Coastal Gateway", shortName: "Aam Coastal Link", street: "Aam-daero", district: "North Gateway", 
    type: "hub", rating: 4.5, reviewsCount: 890, category: "Expressway Coastal Junction", 
    highlight: "Fast corridor connecting Incheon Bridge to central metropolitan Incheon", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1011, x: 50, y: 350, lat: 37.3760, lng: 126.6620, 
    name: "Songdo Bio-Cluster Core", shortName: "Bio-Cluster Hub", street: "Bio-daero", district: "Bio-Med Hub", 
    type: "tech", rating: 4.6, reviewsCount: 780, category: "Global Bio Hub", 
    highlight: "World-class biopharmaceutical manufacturing & research district", openHours: "08:00 - 19:00", isFamous: false 
  },
  { 
    id: 1012, x: 200, y: 350, lat: 37.3710, lng: 126.6660, 
    name: "Celltrion Bio Research Hub", shortName: "Celltrion Campus", street: "Songdo-bio-daero", district: "Bio-Pharma R&D", 
    type: "tech", rating: 4.6, reviewsCount: 650, category: "Biotech Campus", 
    highlight: "Global biologics development facilities & state-of-the-art labs", openHours: "09:00 - 18:00", isFamous: false 
  },
  { 
    id: 1013, x: 350, y: 350, lat: 37.3800, lng: 126.6600, 
    name: "Knowledge Information Complex", shortName: "Knowledge Valley", street: "Knowledge-ro", district: "R&D District", 
    type: "tech", rating: 4.4, reviewsCount: 510, category: "Innovation Valley", 
    highlight: "Incubation center for deep-tech, AI, and smart mobility startups", openHours: "08:30 - 20:00", isFamous: false 
  },
  { 
    id: 1014, x: 500, y: 350, lat: 37.3720, lng: 126.6710, 
    name: "Incheon Global Campus (IGC)", shortName: "Global Campus", street: "Global-campuses-ro", district: "Int'l University", 
    type: "campus", rating: 4.7, reviewsCount: 1980, category: "Multinational University Campus", 
    highlight: "Home to SUNY Korea, George Mason, Utah Asia, and Ghent campuses", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1015, x: 650, y: 350, lat: 37.3960, lng: 126.6520, 
    name: "Sinsong Central Square", shortName: "Sinsong Square", street: "Sinsong-ro", district: "Residential East", 
    type: "commercial", rating: 4.4, reviewsCount: 820, category: "Urban Shopping Plaza", 
    highlight: "Bustling community dining, cafes, and residential center", openHours: "09:00 - 23:00", isFamous: false 
  },
  { 
    id: 1016, x: 50, y: 500, lat: 37.3940, lng: 126.6610, 
    name: "Haedoji Sunrise Park", shortName: "Haedoji Park", street: "Haedoji-ro", district: "Haedoji Sector", 
    type: "park", rating: 4.8, reviewsCount: 3100, category: "Botanical & Sunrise Park", 
    highlight: "Famous rose garden, musical water fountain, and sledding hill", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1017, x: 200, y: 500, lat: 37.3985, lng: 126.6580, 
    name: "Sunrise Garden Promenade", shortName: "Sunrise Garden", street: "Sunrise-ro", district: "Eastern Gateway", 
    type: "park", rating: 4.5, reviewsCount: 680, category: "Sculpture Garden", 
    highlight: "Lush green buffer park with outdoor modern art sculptures", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1018, x: 350, y: 500, lat: 37.4050, lng: 126.6310, 
    name: "Landmark City Gate", shortName: "Landmark Gate", street: "Landmark-ro", district: "Landmark Sector", 
    type: "hub", rating: 4.4, reviewsCount: 940, category: "Grand Gateway", 
    highlight: "Northern gateway connecting Songdo to the Incheon Grand Bridge", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1019, x: 500, y: 500, lat: 37.4090, lng: 126.6230, 
    name: "Ocean View Promenade", shortName: "Ocean Promenade", street: "Ocean-daero", district: "Coastal District", 
    type: "waterfront", rating: 4.9, reviewsCount: 4200, category: "Sunset Coastline", 
    highlight: "Spectacular oceanfront sunsets facing the West Sea and cable-stayed bridge", openHours: "Open 24 hours", isFamous: true 
  },
  { 
    id: 1020, x: 650, y: 500, lat: 37.4040, lng: 126.6200, 
    name: "Songdo Waterfront Marina", shortName: "Waterfront Marina", street: "Marina-daero", district: "Marina West", 
    type: "waterfront", rating: 4.7, reviewsCount: 2650, category: "Yacht Harbor & Marina", 
    highlight: "Recreational yacht harbor, watersports clubhouse, and sunset deck", openHours: "09:00 - 21:00", isFamous: true 
  },
  { 
    id: 1021, x: 50, y: 650, lat: 37.3990, lng: 126.6240, 
    name: "Canal Walk (NC Cube)", shortName: "Canal Walk Mall", street: "Waterfront-ro", district: "Canal Walk", 
    type: "waterfront", rating: 4.6, reviewsCount: 6800, category: "European Canal Boulevard", 
    highlight: "800m open-air European shopping canal with themed seasonal blocks", openHours: "10:30 - 22:00", isFamous: true 
  },
  { 
    id: 1022, x: 200, y: 650, lat: 37.3870, lng: 126.6650, 
    name: "Songdo Science Park North", shortName: "Science Park", street: "Songdogwahak-ro", district: "Science Complex", 
    type: "tech", rating: 4.5, reviewsCount: 710, category: "Science & Technology Park", 
    highlight: "Advanced materials and industrial electronics development cluster", openHours: "08:30 - 19:30", isFamous: false 
  },
  { 
    id: 1023, x: 350, y: 650, lat: 37.3880, lng: 126.6550, 
    name: "Songdo Grand Avenue", shortName: "Grand Boulevard", street: "Songdogukje-daero", district: "Grand Boulevard", 
    type: "commercial", rating: 4.5, reviewsCount: 1100, category: "Central Boulevard", 
    highlight: "Wide 10-lane landscaped smart corridor crossing central Songdo", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1024, x: 500, y: 650, lat: 37.3840, lng: 126.6620, 
    name: "Future Mobility Center", shortName: "Mobility Hub", street: "Songdomirae-ro", district: "Smart Mobility", 
    type: "station", rating: 4.6, reviewsCount: 890, category: "Autonomous Transit Station", 
    highlight: "V2X testbed, autonomous shuttle terminal, and EV ultra-fast charging", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1025, x: 650, y: 650, lat: 37.3765, lng: 126.6680, 
    name: "Songdo Global Education Hub", shortName: "Education Hub", street: "Songdogyoyuk-ro", district: "Education Hub", 
    type: "campus", rating: 4.5, reviewsCount: 740, category: "International Education Center", 
    highlight: "Chadwick International School and global educational testing grounds", openHours: "08:00 - 18:00", isFamous: false 
  },

  // 26-36: Intermediate Connectors, Cross-Streets & Alleys (The "Small Routes")
  { 
    id: 1026, x: 280, y: 120, lat: 37.3970, lng: 126.6275, 
    name: "Canal Walk Spring Block", shortName: "Canal Spring", street: "Canal-1-gil", district: "Canal Walk", 
    type: "cross", rating: 4.5, reviewsCount: 420, category: "Canal Cross Street", 
    highlight: "Small charming boutique lane connecting G-Tower to Canal Walk", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1027, x: 270, y: 80, lat: 37.3915, lng: 126.6385, 
    name: "Central Park East Crossing", shortName: "Central East Gate", street: "Central-inner-gil", district: "Central Park", 
    type: "cross", rating: 4.4, reviewsCount: 310, category: "Park East Access", 
    highlight: "Inner bypass road between Central Park and POSCO Tower", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1028, x: 120, y: 90, lat: 37.3930, lng: 126.6495, 
    name: "Convensia North Cross", shortName: "Convensia North", street: "Convensia-2-gil", district: "Convention Zone", 
    type: "cross", rating: 4.3, reviewsCount: 280, category: "Exhibition Bypass Lane", 
    highlight: "Fast side-street bypass avoiding Convensia main intersection delays", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1029, x: 420, y: 180, lat: 37.3910, lng: 126.6560, 
    name: "Haedoji West Crossing", shortName: "Haedoji West", street: "Haedoji-side-ro", district: "Haedoji Sector", 
    type: "cross", rating: 4.4, reviewsCount: 340, category: "Residential Bypass Road", 
    highlight: "Local road linking POSCO tower directly into Haedoji rose garden", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1030, x: 80, y: 260, lat: 37.3795, lng: 126.6540, 
    name: "Technopark South Crossing", shortName: "Technopark South", street: "Technopark-service-ro", district: "Tech Sector", 
    type: "cross", rating: 4.2, reviewsCount: 190, category: "Service Road", 
    highlight: "Industrial service bypass connecting Technopark directly to Bio Cluster", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1031, x: 120, y: 240, lat: 37.3810, lng: 126.6635, 
    name: "Triple Street Promenade", shortName: "Triple Street", street: "Triple-street-gil", district: "Shopping District", 
    type: "alley", rating: 4.7, reviewsCount: 3890, category: "Pedestrian & Service Way", 
    highlight: "Lively shopping alley with subterranean dining corridors", openHours: "10:30 - 22:00", isFamous: true 
  },
  { 
    id: 1032, x: 420, y: 520, lat: 37.4020, lng: 126.6280, 
    name: "Songdo Waterfront Boardwalk", shortName: "Waterfront Boardwalk", street: "Waterfront-boardwalk", district: "Marina West", 
    type: "alley", rating: 4.6, reviewsCount: 880, category: "Lakeside Lane", 
    highlight: "Scenic lakeside access road skirting the water taxi terminal", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1033, x: 310, y: 160, lat: 37.3840, lng: 126.6500, 
    name: "Michuhol South Bypass", shortName: "Michuhol Bypass", street: "Michuhol-inner-ro", district: "Parks Sector", 
    type: "cross", rating: 4.3, reviewsCount: 220, category: "Park South Lane", 
    highlight: "Quiet two-lane avenue running along the southern park perimeter", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1034, x: 140, y: 580, lat: 37.3890, lng: 126.6690, 
    name: "Songdo High-Tech Bypass", shortName: "Hi-Tech Bypass", street: "Hitech-connector-ro", district: "Science Complex", 
    type: "cross", rating: 4.4, reviewsCount: 310, category: "Technology Link", 
    highlight: "Fast perimeter expressway bypass skirting eastern industrial R&D", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1035, x: 580, y: 420, lat: 37.3995, lng: 126.6540, 
    name: "Sinsong East Cross", shortName: "Sinsong East", street: "Sinsong-east-gil", district: "Eastern Gateway", 
    type: "cross", rating: 4.3, reviewsCount: 260, category: "Residential Cross Street", 
    highlight: "Local residential lane offering smooth transit toward Aam gateway", openHours: "Open 24 hours", isFamous: false 
  },
  { 
    id: 1036, x: 560, y: 390, lat: 37.3755, lng: 126.6740, 
    name: "Global Campus North Gate", shortName: "Campus North Gate", street: "Campus-link-ro", district: "Global Campus", 
    type: "cross", rating: 4.5, reviewsCount: 410, category: "University Access Way", 
    highlight: "Secondary campus gate road connecting university dorms to Science Park", openHours: "Open 24 hours", isFamous: false 
  }
];

// Rich, realistic street network with boulevards, secondary avenues, and small side routes
const rawEdges: [number, number, string, number, number, 'expressway' | 'boulevard' | 'avenue' | 'side-street' | 'alley'][] = [
  // Major Coastal & Waterfront Corridors
  [1019, 1020, "Marina-daero", 0.7, 50, 'boulevard'],
  [1020, 1021, "Waterfront-ro", 0.6, 50, 'boulevard'],
  [1021, 1004, "Art-center-daero", 0.8, 55, 'boulevard'],
  [1021, 1003, "Incheon-tower-daero", 0.9, 60, 'boulevard'],
  [1019, 1018, "Landmark-ro", 0.9, 50, 'boulevard'],
  [1018, 1003, "Incheon-tower-daero", 0.8, 60, 'boulevard'],
  [1018, 1010, "Aam-daero", 1.4, 70, 'expressway'],

  // Small Waterfront Side Roads & Boardwalk
  [1003, 1032, "Waterfront-boardwalk", 0.5, 35, 'side-street'],
  [1032, 1018, "Waterfront-boardwalk", 0.4, 35, 'side-street'],
  [1032, 1021, "Waterfront-access-lane", 0.4, 30, 'alley'],
  [1003, 1026, "Canal-1-gil", 0.4, 35, 'side-street'],
  [1026, 1004, "Canal-1-gil", 0.5, 35, 'side-street'],
  [1026, 1021, "Canal-walkway", 0.3, 30, 'alley'],

  // Central Park & IBD Spine (Main + Inner Bypass)
  [1003, 1002, "Central-ro", 0.6, 50, 'boulevard'],
  [1004, 1002, "Central-ro", 0.8, 50, 'boulevard'],
  [1002, 1007, "Harmony-ro", 0.7, 50, 'boulevard'],
  [1002, 1027, "Central-inner-gil", 0.3, 35, 'side-street'],
  [1027, 1007, "Central-inner-gil", 0.4, 35, 'side-street'],
  [1027, 1008, "POSCO-service-way", 0.3, 30, 'alley'],
  [1007, 1008, "Gukje-daero", 0.3, 50, 'boulevard'],
  [1008, 1001, "Convensia-daero", 0.4, 60, 'boulevard'],
  [1001, 1007, "Convensia-daero", 0.5, 60, 'boulevard'],
  [1004, 1005, "Academy-ro", 1.9, 60, 'avenue'],
  [1007, 1005, "Academy-ro", 1.8, 60, 'avenue'],
  [1005, 1008, "Gukje-daero", 1.8, 60, 'boulevard'],

  // Convensia & Michuhol Small Connectors
  [1001, 1028, "Convensia-2-gil", 0.4, 35, 'side-street'],
  [1028, 1015, "Convensia-2-gil", 0.4, 35, 'side-street'],
  [1007, 1028, "Harmony-cross-gil", 0.6, 40, 'side-street'],
  [1001, 1033, "Michuhol-inner-ro", 0.4, 35, 'side-street'],
  [1033, 1009, "Michuhol-inner-ro", 0.3, 35, 'side-street'],
  [1007, 1033, "Harmony-south-connector", 0.8, 45, 'avenue'],
  [1001, 1009, "Michuhol-daero", 0.6, 50, 'boulevard'],
  [1008, 1029, "POSCO-east-link", 0.7, 45, 'side-street'],
  [1029, 1009, "Michuhol-park-link", 0.5, 40, 'side-street'],
  [1029, 1016, "Haedoji-side-ro", 0.4, 35, 'side-street'],
  [1029, 1023, "Haedoji-cross-link", 0.4, 40, 'side-street'],

  // Eastern Park & Arterials
  [1010, 1017, "Sunrise-ro", 1.4, 60, 'avenue'],
  [1010, 1015, "Sinsong-ro", 1.4, 60, 'avenue'],
  [1015, 1016, "Haedoji-ro", 0.8, 50, 'avenue'],
  [1016, 1017, "Sunrise-ro", 0.6, 50, 'avenue'],
  [1015, 1001, "Convensia-daero", 0.8, 60, 'boulevard'],
  [1015, 1035, "Sinsong-east-gil", 0.5, 35, 'side-street'],
  [1035, 1017, "Sunrise-east-lane", 0.4, 35, 'side-street'],
  [1035, 1010, "Aam-inner-bypass", 1.0, 50, 'avenue'],
  [1009, 1023, "Songdogukje-daero", 0.3, 50, 'boulevard'],
  [1008, 1023, "Songdogukje-daero", 0.9, 60, 'boulevard'],
  [1016, 1022, "Songdogwahak-ro", 0.9, 50, 'avenue'],
  [1023, 1022, "Songdogwahak-ro", 0.9, 50, 'avenue'],
  [1016, 1034, "Hitech-connector-ro", 0.6, 45, 'side-street'],
  [1034, 1022, "Hitech-connector-ro", 0.4, 45, 'side-street'],
  [1034, 1017, "Sunrise-hitech-lane", 0.8, 50, 'avenue'],

  // Technopark, Triple Street & Small Commercial Alleys
  [1009, 1006, "Technopark-ro", 0.5, 50, 'boulevard'],
  [1006, 1013, "Knowledge-ro", 0.4, 50, 'avenue'],
  [1006, 1024, "Songdomirae-ro", 0.5, 50, 'avenue'],
  [1006, 1031, "Triple-street-gil", 0.3, 30, 'alley'],
  [1031, 1024, "Triple-street-gil", 0.3, 30, 'alley'],
  [1031, 1013, "Knowledge-alley", 0.3, 30, 'alley'],
  [1023, 1031, "Grand-triple-link", 0.6, 40, 'side-street'],
  [1024, 1022, "Songdogwahak-ro", 0.4, 50, 'avenue'],
  [1013, 1024, "Songdomirae-ro", 0.5, 50, 'avenue'],

  // Bio-Cluster, Global Campus & Campus Links
  [1006, 1011, "Bio-daero", 0.8, 60, 'boulevard'],
  [1006, 1030, "Technopark-service-ro", 0.4, 35, 'side-street'],
  [1030, 1011, "Technopark-service-ro", 0.5, 40, 'side-street'],
  [1030, 1005, "Campus-south-connector", 1.8, 50, 'avenue'],
  [1030, 1013, "Knowledge-south-connector", 0.4, 35, 'side-street'],
  [1011, 1012, "Songdo-bio-daero", 0.6, 60, 'avenue'],
  [1011, 1025, "Songdogyoyuk-ro", 0.6, 50, 'avenue'],
  [1012, 1014, "Global-campuses-ro", 0.6, 50, 'avenue'],
  [1013, 1025, "Songdogyoyuk-ro", 0.8, 50, 'avenue'],
  [1025, 1014, "Global-campuses-ro", 0.6, 50, 'avenue'],
  [1005, 1011, "Bio-daero", 2.5, 60, 'boulevard'],
  [1024, 1036, "Campus-link-ro", 0.6, 40, 'side-street'],
  [1036, 1014, "Campus-link-ro", 0.4, 40, 'side-street'],
  [1036, 1025, "Education-campus-lane", 0.4, 35, 'side-street'],
  [1022, 1036, "Science-campus-connector", 0.7, 45, 'side-street'],

  // Additional Dense Small Routes, Back Alleys & Local Connectors
  [1009, 1031, "Michuhol-triple-alley", 0.4, 30, 'alley'],
  [1001, 1029, "Convensia-service-lane", 0.5, 35, 'side-street'],
  [1007, 1026, "Tribowl-canal-link", 0.5, 35, 'side-street'],
  [1004, 1032, "West-coastal-link", 0.6, 40, 'side-street'],
  [1017, 1023, "Sunrise-smart-link", 0.7, 40, 'side-street'],
  [1023, 1024, "Smart-tech-lane", 0.5, 35, 'side-street'],
  [1030, 1025, "Bio-library-lane", 0.5, 35, 'side-street'],
  [1028, 1027, "Central-convensia-cutoff", 0.4, 30, 'alley'],
  [1033, 1028, "Michuhol-convensia-alley", 0.4, 30, 'alley'],
  [1031, 1030, "Triple-technopark-bypass", 0.3, 30, 'alley'],
  [1026, 1027, "Park-side-connector", 0.4, 30, 'alley'],
  [1029, 1033, "Michuhol-east-passage", 0.3, 30, 'alley'],
  [1034, 1024, "Hitech-mirae-link", 0.5, 35, 'side-street'],
  [1035, 1016, "Sinsong-haedoji-lane", 0.4, 35, 'side-street']
];

export const streetEdges: StreetEdge[] = [];
rawEdges.forEach(([from, to, streetName, distanceKm, baseSpeedKmH, roadType]) => {
  streetEdges.push({ from, to, streetName, distanceKm, baseSpeedKmH, roadType });
  streetEdges.push({ from: to, to: from, streetName, distanceKm, baseSpeedKmH, roadType });
});

export function getNode(id: number): CityNode {
  return nodes.find(n => n.id === id) || nodes[0];
}

export interface EdgeTrafficMetric {
  congestion: number; 
  currentSpeed: number; 
  travelTimeSec: number; 
  waitTimeSec: number; 
  greenTimeSec: number; 
  trafficColor: string; 
  isIncident: boolean;
  droneCalibrated?: boolean;
  droneSection?: string;
}

// Compute dynamic traffic density, speed, wait time, and traffic color for every edge
export function getEdgeTrafficMetrics(
  data: TrafficData[],
  from: number,
  to: number,
  incident?: IncidentState | null
): EdgeTrafficMetric {
  const edge = streetEdges.find(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
  const baseSpeed = edge ? edge.baseSpeedKmH : 50;
  const distance = edge ? edge.distanceKm : 1.0;

  // Calibrate with real aerial drone surveillance telemetry for N101 (Node 1001) & N102 (Node 1002)
  let droneCalibrated = false;
  let droneSection: string | undefined = undefined;
  let measuredDroneSpeed: number | null = null;
  let measuredCongestion: number | null = null;

  if (from === 1001 || to === 1001) {
    if (from === 1015 || to === 1015 || from === 1028 || to === 1028) {
      droneSection = 'N101_G1'; // Approach North: 24 veh, avg 48.4 km/h
      measuredDroneSpeed = 48.4;
      measuredCongestion = 24;
      droneCalibrated = true;
    } else if (from === 1009 || to === 1009 || from === 1033 || to === 1033) {
      droneSection = 'N101_G2'; // Approach East: 19 veh, avg 51.2 km/h
      measuredDroneSpeed = 51.2;
      measuredCongestion = 21;
      droneCalibrated = true;
    } else if (from === 1008 || to === 1008 || from === 1007 || to === 1007) {
      droneSection = 'N101_G3'; // Approach South: 15 veh, avg 51.4 km/h
      measuredDroneSpeed = 51.4;
      measuredCongestion = 19;
      droneCalibrated = true;
    }
  } else if (from === 1002 || to === 1002) {
    if (from === 1003 || to === 1003 || from === 1027 || to === 1027) {
      droneSection = 'N102_G1'; // Approach East Gate: 4 veh, avg 49.7 km/h
      measuredDroneSpeed = 49.7;
      measuredCongestion = 16;
      droneCalibrated = true;
    } else if (from === 1004 || to === 1004 || from === 1007 || to === 1007) {
      droneSection = 'N102_G2'; // Expressway Corridor: 4 veh, avg 67.6 km/h (free flow)
      measuredDroneSpeed = 67.6;
      measuredCongestion = 11;
      droneCalibrated = true;
    }
  }

  // Use sensor data from traffic.json
  const fromData = data.filter(d => d.cycle_id === from);
  let avgDensity = 25;
  let waitTime = 10;
  let greenTime = 25;

  if (fromData.length > 0) {
    const totalDensity = fromData.reduce((acc, curr) => acc + curr.cross_traffic_density, 0);
    avgDensity = Math.round((totalDensity / fromData.length) * 10);
    waitTime = Math.round(fromData.reduce((acc, curr) => acc + curr.current_wait_time_sec, 0) / fromData.length);
    greenTime = Math.round(fromData.reduce((acc, curr) => acc + curr.allocated_green_time_sec, 0) / fromData.length);
  } else {
    // Generate organic simulated traffic based on node IDs
    avgDensity = ((from * 7 + to * 13) % 65) + 15;
    waitTime = Math.round(avgDensity * 0.25);
  }

  if (droneCalibrated && measuredCongestion !== null) {
    avgDensity = measuredCongestion;
  }

  // Check for simulated incident
  let isIncident = false;
  if (incident && ((incident.from === from && incident.to === to) || (incident.from === to && incident.to === from))) {
    avgDensity = Math.max(avgDensity, incident.severity);
    isIncident = true;
  }

  // Speed drops as congestion increases or follows empirical drone radar speeds
  let currentSpeed = baseSpeed;
  if (droneCalibrated && measuredDroneSpeed !== null && !isIncident) {
    currentSpeed = Math.round(measuredDroneSpeed);
  } else {
    const speedFactor = Math.max(0.12, 1 - (avgDensity / 100) * 0.88);
    currentSpeed = Math.round(baseSpeed * speedFactor);
  }

  const drivingTimeSec = Math.round((distance / currentSpeed) * 3600);
  const travelTimeSec = drivingTimeSec + waitTime;
  const trafficColor = getTrafficColor(avgDensity, isIncident);

  return {
    congestion: avgDensity,
    currentSpeed,
    travelTimeSec,
    waitTimeSec: waitTime,
    greenTimeSec: greenTime,
    trafficColor,
    isIncident,
    droneCalibrated,
    droneSection
  };
}

function haversineDistance(a: CityNode, b: CityNode): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * (Math.PI / 180)) * Math.cos(b.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export interface FindRouteOptions {
  algorithm?: RoutingAlgorithm;
  incident?: IncidentState | null;
  emergencyOverride?: boolean;
  penalizedEdges?: Set<string>;
  penaltyMultiplier?: number;
  preferSideStreets?: boolean;
}

// Master pathfinding function supporting Dijkstra, A*, Green-Wave, and Secondary Routes
export function computeOptimizedRoute(
  data: TrafficData[],
  start: number,
  end: number,
  options: FindRouteOptions = {}
): RouteResult {
  const { 
    algorithm = 'dijkstra-traffic', 
    incident = null, 
    emergencyOverride = false,
    penalizedEdges = new Set<string>(),
    penaltyMultiplier = 3.0,
    preferSideStreets = false
  } = options;

  const adj = new Map<number, { to: number; weight: number; edge: StreetEdge }[]>();
  nodes.forEach(n => adj.set(n.id, []));

  streetEdges.forEach(edge => {
    const metrics = getEdgeTrafficMetrics(data, edge.from, edge.to, incident);
    let weight = 0;

    switch (algorithm) {
      case 'distance':
        weight = edge.distanceKm;
        break;

      case 'greenwave':
        weight = (edge.distanceKm * 1.5) + (metrics.waitTimeSec * 1.8) - (metrics.greenTimeSec * 0.4);
        if (metrics.isIncident) weight += 200;
        break;

      case 'astar':
      case 'dijkstra-traffic':
      default:
        weight = metrics.travelTimeSec + (metrics.congestion * 1.6);
        if (metrics.isIncident) weight += 700;
        if (emergencyOverride) weight *= 0.4;
        break;
    }

    if (preferSideStreets) {
      if (edge.roadType === 'side-street' || edge.roadType === 'alley') {
        weight *= 0.25; // Strongly prioritize small alleys and side streets
      } else if (edge.roadType === 'boulevard' || edge.roadType === 'expressway') {
        weight *= 3.5; // Heavily disfavor major highways when searching for small routes
      }
    }

    const edgeKey1 = `${edge.from}-${edge.to}`;
    const edgeKey2 = `${edge.to}-${edge.from}`;
    if (penalizedEdges.has(edgeKey1) || penalizedEdges.has(edgeKey2)) {
      weight *= penaltyMultiplier;
    }

    adj.get(edge.from)?.push({ to: edge.to, weight: Math.max(0.1, weight), edge });
  });

  const distances = new Map<number, number>();
  const fScores = new Map<number, number>();
  const previous = new Map<number, { from: number; edge: StreetEdge } | null>();
  const unvisited = new Set<number>();

  nodes.forEach(n => {
    distances.set(n.id, Infinity);
    fScores.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(start, 0);
  const endNode = getNode(end);
  fScores.set(start, haversineDistance(getNode(start), endNode));

  while (unvisited.size > 0) {
    let curr = -1;
    let minScore = Infinity;

    for (const node of unvisited) {
      const score = algorithm === 'astar' ? fScores.get(node)! : distances.get(node)!;
      if (score < minScore) {
        minScore = score;
        curr = node;
      }
    }

    if (curr === -1 || curr === end) break;
    unvisited.delete(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;

      const alt = distances.get(curr)! + neighbor.weight;
      if (alt < distances.get(neighbor.to)!) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, { from: curr, edge: neighbor.edge });

        if (algorithm === 'astar') {
          const h = haversineDistance(getNode(neighbor.to), endNode) * 20;
          fScores.set(neighbor.to, alt + h);
        }
      }
    }
  }

  const path: number[] = [];
  const segments: RouteSegment[] = [];
  let u: number | null = end;

  while (u !== null && u !== start) {
    path.unshift(u);
    const prevInfo = previous.get(u);
    if (!prevInfo) break;

    const fromNode = getNode(prevInfo.from);
    const toNode = getNode(u);
    const metrics = getEdgeTrafficMetrics(data, fromNode.id, toNode.id, incident);

    segments.unshift({
      from: fromNode,
      to: toNode,
      streetName: prevInfo.edge.streetName,
      distanceKm: prevInfo.edge.distanceKm,
      timeMin: Number((metrics.travelTimeSec / 60).toFixed(1)),
      speedKmH: metrics.currentSpeed,
      congestion: metrics.congestion,
      trafficColor: metrics.trafficColor,
      hasIncident: metrics.isIncident
    });

    u = prevInfo.from;
  }

  if (u === start) {
    path.unshift(start);
  } else {
    return {
      path: [start],
      cost: 0,
      totalDistanceKm: 0,
      totalTimeMin: 0,
      avgSpeedKmH: 0,
      avgCongestion: 0,
      segments: [],
      directions: [],
      rerouted: false,
      timeSavedMin: 0,
      incidentAvoided: null,
      algorithm: algorithm.toUpperCase()
    };
  }

  const totalDistanceKm = Number(segments.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1));
  const totalTimeMin = Number(segments.reduce((acc, s) => acc + s.timeMin, 0).toFixed(1));
  const avgSpeedKmH = segments.length > 0 ? Math.round(segments.reduce((acc, s) => acc + s.speedKmH, 0) / segments.length) : 50;
  const avgCongestion = segments.length > 0 ? Math.round(segments.reduce((acc, s) => acc + s.congestion, 0) / segments.length) : 20;

  let rerouted = false;
  let timeSavedMin = 0;
  let incidentAvoided: string | null = null;

  if (incident) {
    const incidentOnRoute = segments.some(s => s.hasIncident);
    if (!incidentOnRoute) {
      rerouted = true;
      incidentAvoided = incident.streetName;
      timeSavedMin = Number((incident.severity * 0.12).toFixed(1));
    }
  }

  const directions: RouteDirection[] = segments.map((seg, idx) => ({
    step: idx + 1,
    instruction: idx === 0 
      ? `Depart ${seg.from.name} and proceed along ${seg.streetName}`
      : idx === segments.length - 1
      ? `Continue on ${seg.streetName} to arrive at ${seg.to.name}`
      : `Turn onto ${seg.streetName} toward ${seg.to.shortName}`,
    street: seg.streetName,
    distance: `${seg.distanceKm} km`,
    time: `${seg.timeMin} min`,
    status: seg.congestion >= 85 ? 'severe' : seg.congestion >= 60 ? 'congested' : seg.congestion >= 30 ? 'moderate' : 'clear',
    congestion: seg.congestion
  }));

  return {
    path,
    cost: distances.get(end) || 0,
    totalDistanceKm,
    totalTimeMin,
    avgSpeedKmH,
    avgCongestion,
    segments,
    directions,
    rerouted,
    timeSavedMin,
    incidentAvoided,
    algorithm: algorithm.toUpperCase()
  };
}

function extractSmallStreetsInfo(segments: RouteSegment[]) {
  const smallNames: string[] = [];
  segments.forEach(s => {
    const e = streetEdges.find(edge => (edge.from === s.from.id && edge.to === s.to.id) || (edge.from === s.to.id && edge.to === s.from.id));
    if (e && (e.roadType === 'side-street' || e.roadType === 'alley')) {
      if (!smallNames.includes(s.streetName)) {
        smallNames.push(s.streetName);
      }
    }
  });
  return {
    hasSmallStreets: smallNames.length > 0,
    smallStreetCount: smallNames.length,
    smallStreetNames: smallNames
  };
}

// Computes ALL possible candidate routes (Primary, Small Side Street Shortcut, Alternate Avenue, Green Wave)
export function computeAllPossibleRoutes(
  data: TrafficData[],
  start: number,
  end: number,
  incident?: IncidentState | null
): CandidateRoute[] {
  if (start === end) return [];

  const candidateRoutes: CandidateRoute[] = [];
  const penalized = new Set<string>();

  // 1. Primary Route: Fastest traffic-aware route (Main Boulevards)
  const r1 = computeOptimizedRoute(data, start, end, { 
    algorithm: 'dijkstra-traffic', 
    incident 
  });

  if (r1.path.length < 2) return [];

  const streetsR1 = Array.from(new Set(r1.segments.map(s => s.streetName)));
  const viaTextR1 = streetsR1.slice(0, 3).join(' & ');
  const smallInfoR1 = extractSmallStreetsInfo(r1.segments);

  candidateRoutes.push({
    id: 'route-fastest',
    name: 'Main Expressway Corridor',
    viaStreet: viaTextR1,
    routeType: 'Primary Boulevard',
    path: r1.path,
    segments: r1.segments,
    totalDistanceKm: r1.totalDistanceKm,
    totalTimeMin: r1.totalTimeMin,
    avgSpeedKmH: r1.avgSpeedKmH,
    avgCongestion: r1.avgCongestion,
    trafficDelayMin: Number((r1.totalTimeMin * (r1.avgCongestion / 100) * 0.35).toFixed(1)),
    signalCount: r1.segments.length + 1,
    co2Kg: Number((r1.totalDistanceKm * 0.12).toFixed(2)),
    badge: 'Fastest Route',
    tagline: r1.avgCongestion > 55 ? 'Heavy traffic slowdown' : 'Optimal flow • Direct highway',
    isFastest: true,
    hasSmallStreets: smallInfoR1.hasSmallStreets,
    smallStreetCount: smallInfoR1.smallStreetCount,
    smallStreetNames: smallInfoR1.smallStreetNames,
    directions: r1.directions
  });

  // Penalize edges of R1
  for (let i = 0; i < r1.path.length - 1; i++) {
    penalized.add(`${r1.path[i]}-${r1.path[i + 1]}`);
    penalized.add(`${r1.path[i + 1]}-${r1.path[i]}`);
  }

  // 2. Alternative Route A: Small side streets & shortcut bypasses
  const r2 = computeOptimizedRoute(data, start, end, { 
    algorithm: 'dijkstra-traffic', 
    incident,
    penalizedEdges: penalized,
    penaltyMultiplier: 1.8,
    preferSideStreets: true
  });

  const isDifferentR2 = r2.path.length >= 2 && r2.path.join('-') !== r1.path.join('-');
  if (isDifferentR2) {
    const streetsR2 = Array.from(new Set(r2.segments.map(s => s.streetName)));
    const viaTextR2 = streetsR2.slice(0, 3).join(' & ');
    const diffTime = Number((r2.totalTimeMin - r1.totalTimeMin).toFixed(1));
    const smallInfoR2 = extractSmallStreetsInfo(r2.segments);

    candidateRoutes.push({
      id: 'route-alt-small-streets',
      name: smallInfoR2.hasSmallStreets ? 'Small Street & Alley Shortcut' : 'Inner Bypass Corridor',
      viaStreet: viaTextR2,
      routeType: 'Side Roads & Bypasses',
      path: r2.path,
      segments: r2.segments,
      totalDistanceKm: r2.totalDistanceKm,
      totalTimeMin: r2.totalTimeMin,
      avgSpeedKmH: r2.avgSpeedKmH,
      avgCongestion: r2.avgCongestion,
      trafficDelayMin: Number((r2.totalTimeMin * (r2.avgCongestion / 100) * 0.35).toFixed(1)),
      signalCount: r2.segments.length,
      co2Kg: Number((r2.totalDistanceKm * 0.12).toFixed(2)),
      badge: diffTime <= 0 ? 'Equally Fast' : `+${diffTime} min`,
      tagline: smallInfoR2.hasSmallStreets 
        ? `Via ${smallInfoR2.smallStreetNames.slice(0, 2).join(', ')} • Avoids jams`
        : 'Avoids main boulevard signals & jams',
      isFastest: false,
      hasSmallStreets: smallInfoR2.hasSmallStreets,
      smallStreetCount: smallInfoR2.smallStreetCount,
      smallStreetNames: smallInfoR2.smallStreetNames,
      directions: r2.directions
    });

    for (let i = 0; i < r2.path.length - 1; i++) {
      penalized.add(`${r2.path[i]}-${r2.path[i + 1]}`);
      penalized.add(`${r2.path[i + 1]}-${r2.path[i]}`);
    }
  }

  // 3. Alternative Route B: Alternate Avenue / Perimeter Ring
  const r3 = computeOptimizedRoute(data, start, end, { 
    algorithm: 'astar', 
    incident,
    penalizedEdges: penalized,
    penaltyMultiplier: 2.4
  });

  const isDifferentR3 = r3.path.length >= 2 && 
    r3.path.join('-') !== r1.path.join('-') && 
    (!isDifferentR2 || r3.path.join('-') !== r2.path.join('-'));

  if (isDifferentR3) {
    const streetsR3 = Array.from(new Set(r3.segments.map(s => s.streetName)));
    const viaTextR3 = streetsR3.slice(0, 3).join(' & ');
    const diffTime = Number((r3.totalTimeMin - r1.totalTimeMin).toFixed(1));
    const smallInfoR3 = extractSmallStreetsInfo(r3.segments);

    candidateRoutes.push({
      id: 'route-alt-avenue',
      name: 'Perimeter Avenue Corridor',
      viaStreet: viaTextR3,
      routeType: 'Outer Ring Route',
      path: r3.path,
      segments: r3.segments,
      totalDistanceKm: r3.totalDistanceKm,
      totalTimeMin: r3.totalTimeMin,
      avgSpeedKmH: r3.avgSpeedKmH,
      avgCongestion: r3.avgCongestion,
      trafficDelayMin: Number((r3.totalTimeMin * (r3.avgCongestion / 100) * 0.35).toFixed(1)),
      signalCount: r3.segments.length + 2,
      co2Kg: Number((r3.totalDistanceKm * 0.12).toFixed(2)),
      badge: diffTime <= 0 ? 'Smooth Flow' : `+${diffTime} min`,
      tagline: 'Wide perimeter thoroughfare',
      isFastest: false,
      hasSmallStreets: smallInfoR3.hasSmallStreets,
      smallStreetCount: smallInfoR3.smallStreetCount,
      smallStreetNames: smallInfoR3.smallStreetNames,
      directions: r3.directions
    });

    for (let i = 0; i < r3.path.length - 1; i++) {
      penalized.add(`${r3.path[i]}-${r3.path[i + 1]}`);
      penalized.add(`${r3.path[i + 1]}-${r3.path[i]}`);
    }
  }

  // 4. Alternative Route C: Green-Wave Signal Priority / Canal Scenic Route
  const r4 = computeOptimizedRoute(data, start, end, { 
    algorithm: 'greenwave', 
    incident,
    penalizedEdges: penalized,
    penaltyMultiplier: 3.0
  });

  const existingPaths = candidateRoutes.map(c => c.path.join('-'));
  const isDifferentR4 = r4.path.length >= 2 && !existingPaths.includes(r4.path.join('-'));

  if (isDifferentR4) {
    const streetsR4 = Array.from(new Set(r4.segments.map(s => s.streetName)));
    const viaTextR4 = streetsR4.slice(0, 3).join(' & ');
    const diffTime = Number((r4.totalTimeMin - r1.totalTimeMin).toFixed(1));
    const smallInfoR4 = extractSmallStreetsInfo(r4.segments);

    candidateRoutes.push({
      id: 'route-alt-greenwave',
      name: 'Green-Wave Scenic Bypass',
      viaStreet: viaTextR4,
      routeType: 'Scenic / Eco-Route',
      path: r4.path,
      segments: r4.segments,
      totalDistanceKm: r4.totalDistanceKm,
      totalTimeMin: r4.totalTimeMin,
      avgSpeedKmH: r4.avgSpeedKmH,
      avgCongestion: r4.avgCongestion,
      trafficDelayMin: Number((r4.totalTimeMin * (r4.avgCongestion / 100) * 0.35).toFixed(1)),
      signalCount: Math.max(2, r4.segments.length - 1),
      co2Kg: Number((r4.totalDistanceKm * 0.12).toFixed(2)),
      badge: diffTime <= 0 ? 'Eco Choice' : `+${diffTime} min`,
      tagline: 'Fewer stops • Max green signal phases',
      isFastest: false,
      hasSmallStreets: smallInfoR4.hasSmallStreets,
      smallStreetCount: smallInfoR4.smallStreetCount,
      smallStreetNames: smallInfoR4.smallStreetNames,
      directions: r4.directions
    });
  }

  // Sort candidate routes by actual travel duration
  candidateRoutes.sort((a, b) => a.totalTimeMin - b.totalTimeMin);
  candidateRoutes.forEach((route, idx) => {
    route.isFastest = idx === 0;
    if (idx === 0) {
      route.badge = 'Fastest Route';
    }
  });

  return candidateRoutes;
}

// Backward compatible export for existing components
export function findShortestPath(data: TrafficData[], start: number, end: number) {
  return computeOptimizedRoute(data, start, end, { algorithm: 'dijkstra-traffic' });
}
