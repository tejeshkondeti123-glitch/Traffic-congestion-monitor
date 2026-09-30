import requests
import json
import time

API_KEY = "AIzaSyBtMRL2yBHEpzVuvJEmVHKQzgqOBxOTu3k"
BASE_LAT = 37.395
BASE_LNG = 126.630
LAT_STEP = 0.006
LNG_STEP = 0.008

results = {}

print("Starting reverse geocoding for 25 nodes...")
for node_id in range(1001, 1026):
    row = (node_id - 1001) // 5
    col = (node_id - 1001) % 5
    lat = BASE_LAT - (row * LAT_STEP)
    lng = BASE_LNG + (col * LNG_STEP)
    
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"
    response = requests.get(url).json()
    
    if response['status'] == 'OK':
        # Get the formatted address of the first result, or just the route name
        # We will try to extract a concise street name, if possible, or fallback to formatted_address
        address_components = response['results'][0]['address_components']
        street = None
        for comp in address_components:
            if 'route' in comp['types']:
                street = comp['short_name']
                break
        
        if street:
            name = street
        else:
            name = response['results'][0]['formatted_address'].split(',')[0]
        
        results[str(node_id)] = name
        print(f"Node J-{str(node_id)[-2:]}: {name}")
    else:
        print(f"Failed for Node J-{str(node_id)[-2:]}: {response['status']}")
        results[str(node_id)] = f"Junction J-{str(node_id)[-2:]}"
        
    time.sleep(0.1) # Small delay to respect rate limits

with open('src/data/location_names.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Done. Saved to src/data/location_names.json")
