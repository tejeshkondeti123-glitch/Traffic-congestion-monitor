import { BrowserRouter, Routes, Route } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Layout } from "./components/Layout";
import TrafficOps from "./pages/TrafficOps";
import Junctions from "./pages/Junctions";
import FleetOps from "./pages/FleetOps";
import Climate from "./pages/Climate";
import DesignSystem from "./pages/DesignSystem";
import { SimulationProvider } from "./context/SimulationContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <APIProvider apiKey="AIzaSyBtMRL2yBHEpzVuvJEmVHKQzgqOBxOTu3k">
        <SimulationProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<TrafficOps />} />
              <Route path="junctions" element={<Junctions />} />
              <Route path="fleet" element={<FleetOps />} />
              <Route path="climate" element={<Climate />} />
              <Route path="design-system" element={<DesignSystem />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
      </APIProvider>
    </ErrorBoundary>
  );
}

export default App;
