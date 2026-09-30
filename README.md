# 🚦 Traffic Congestion Monitor & Smart Mobility Operations

An intelligent, real-time traffic monitoring, adaptive signal control, and autonomous fleet operations platform modeled on the **Songdo Smart International Business District**.

The system ingests real aerial drone radar telemetry, performs dynamic multi-criteria routing (Dijkstra, A*, Green-Wave, Alley/Small Street bypasses), manages multi-phase junction signal timings with emergency preemption, and tracks autonomous V2X fleet operations with climate emissions monitoring.

---

## 🌟 Key Features

* **Real-Time Traffic Operations Console (`/`)**:
  * Live vector map with custom styled road layers, Google Maps integration, and satellite views.
  * Point-to-point pathfinding supporting multiple travel modes: Driving, Public Transit (BRT), and Eco/Bicycle.
  * Multi-candidate route computation: Primary Expressway, Small Side-Street/Alley Shortcut, and Green-Wave Corridors.
  * Turn-by-turn navigation cards with congestion badges (`clear`, `moderate`, `congested`, `severe`).
  * Live incident simulation with dynamic cost re-routing and incident avoidance metrics.
  * Drone aerial telemetry overlay displaying live vehicle counts, speeds, and corridor health.

* **Adaptive Junctions Management (`/junctions`)**:
  * Real-time countdown signal timers for multi-phase intersections (N-S vs. E-W).
  * Live signal split control (cycle time and green split tuning) with manual hold capability.
  * Automatic Emergency Vehicle Preemption (EVP) for priority emergency corridors.

* **Autonomous Fleet Operations (`/fleet`)**:
  * Live tracking of Level 4 Autonomous Shuttles and Bus Rapid Transit (BRT) units.
  * Telemetry monitoring for battery State-of-Charge (SoC), passenger load capacity, speed, and LiDAR health (`NOMINAL`, `CALIBRATING`, `ALERT`).
  * Interactive unit dispatch with instant route assignment.

* **Climate & Eco-Emissions Analytics (`/climate`)**:
  * Hourly emissions baseline vs. optimized reduction tracking via Recharts SVG curves.
  * Sector-by-sector microclimate monitoring: temperature, humidity, and Air Quality Index (AQI).
  * Automated IoT air-quality sensor calibration simulation.

* **System Design System & Logs (`/design-system`)**:
  * Dark-mode operations aesthetic featuring glassmorphism, responsive grids, and design tokens.
  * Real-time simulation log drawer tracking drone ingestion, signal optimizations, and V2X telemetry.

---

## 🧠 Algorithms & Mathematical Models

1. **Dijkstra's Algorithm with Dynamic Cost Functions**:
   $$\text{Weight}(u, v) = T_{\text{travel}}(u, v) + (\text{Congestion} \times 1.6) + \text{Penalty}_{\text{incident}}$$
   Edge costs dynamically adjust using live drone speed metrics, queue delays, and incident severity.

2. **A\* Search Algorithm**:
   $$f(n) = g(n) + h(n)$$
   Heuristic $h(n)$ is computed via the **Haversine Great-Circle Distance** formula between current intersection coordinates and the destination node, guaranteeing optimality.

3. **Green-Wave Corridor Progression**:
   $$\text{Weight} = (d \times 1.5) + (T_{\text{wait}} \times 1.8) - (T_{\text{green}} \times 0.4)$$
   Prioritizes signal-synchronized paths, reducing idle delay and fuel consumption.

4. **Candidate Route Generation (Iterative Edge Penalization / K-Shortest Paths)**:
   Generates distinct primary and secondary routes by applying penalty multipliers ($1.8\times - 3.0\times$) to previously traversed edges and modulating road-class coefficients.

5. **Kinematic Feature Extraction from Drone Telemetry**:
   Computes vehicle trajectories, instantaneous velocities, accelerations, road section occupancy, and lane-level speed distributions across corridors `N101` and `N102`.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, React Router 7, TypeScript
* **Build System**: Vite 5
* **Mapping**: `@vis.gl/react-google-maps` (Google Maps Platform)
* **Styling**: Tailwind CSS 3 (Dark Mode, Glassmorphic Panels)
* **Visualizations & Icons**: Recharts, Lucide React
* **Data Processing & Telemetry Pipelines**: Python 3 (`ingest_drone_data.py`, `scratch_csv.py`)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `yarn` / `pnpm`
* Python 3 (for running backend telemetry ingestion scripts)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tejeshkondeti123-glitch/Traffic-congestion-monitor.git
   cd Traffic-congestion-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. (Optional) Run the drone telemetry ingestion pipeline:
   ```bash
   python ingest_drone_data.py
   ```

5. Build for production:
   ```bash
   npm run build
   ```
