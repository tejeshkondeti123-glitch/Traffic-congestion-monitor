import fs from 'fs';

const API_KEY = "AIzaSyBtMRL2yBHEpzVuvJEmVHKQzgqOBxOTu3k";
const BASE_LAT = 37.395;
const BASE_LNG = 126.630;
const LAT_STEP = 0.006;
const LNG_STEP = 0.008;

const results = {};

async function fetchNames() {
  console.log("Starting reverse geocoding for 25 nodes...");
  for (let nodeId = 1001; nodeId <= 1025; nodeId++) {
    const row = Math.floor((nodeId - 1001) / 5);
    const col = (nodeId - 1001) % 5;
    const lat = BASE_LAT - (row * LAT_STEP);
    const lng = BASE_LNG + (col * LNG_STEP);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const addressComponents = data.results[0].address_components;
        let street = null;
        for (const comp of addressComponents) {
          if (comp.types.includes('route')) {
            street = comp.short_name || comp.long_name;
            break;
          }
        }
        
        let name = street;
        if (!name) {
          name = data.results[0].formatted_address.split(',')[0];
        }
        
        results[nodeId.toString()] = name;
        console.log(`Node J-${nodeId.toString().slice(-2)}: ${name}`);
      } else {
        console.log(`Failed for Node J-${nodeId.toString().slice(-2)}: ${data.status} - ${data.error_message || ''}`);
        results[nodeId.toString()] = `Junction J-${nodeId.toString().slice(-2)}`;
      }
    } catch (e) {
      console.log(`Error on Node J-${nodeId}: ${e.message}`);
      results[nodeId.toString()] = `Junction J-${nodeId.toString().slice(-2)}`;
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  fs.writeFileSync('src/data/location_names.json', JSON.stringify(results, null, 2));
  console.log("Done. Saved to src/data/location_names.json");
}

fetchNames();
