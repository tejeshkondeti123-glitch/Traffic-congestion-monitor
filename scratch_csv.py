import csv
import json

csv_data = """cycle_id,lane_id,two_wheeler_count,car_count,heavy_vehicle_count,emergency_vehicle,current_wait_time_sec,cross_traffic_density,weather_condition,allocated_green_time_sec
1001,Lane_1_North,12,4,2,0,6,9,Clear,28
1001,Lane_2_East,9,4,1,0,14,3,Rain,20
1001,Lane_3_South,6,3,1,0,12,8,Fog,14
1001,Lane_4_West,15,3,2,0,8,4,Fog,11
1002,Lane_1_North,1,1,0,0,19,8,Fog,23
1002,Lane_2_East,6,1,2,0,20,0,Rain,13
1002,Lane_3_South,8,2,2,0,6,6,Fog,11
1002,Lane_4_West,12,2,0,0,14,0,Clear,13
1003,Lane_1_North,4,4,2,0,10,3,Fog,28
1003,Lane_2_East,9,5,2,0,15,8,Clear,19
1003,Lane_3_South,2,0,1,0,12,5,Clear,23
1003,Lane_4_West,8,5,0,0,7,8,Rain,30
1004,Lane_1_North,10,3,2,0,18,2,Clear,10
1004,Lane_2_East,6,1,1,0,20,1,Rain,23
1004,Lane_3_South,6,1,1,0,12,3,Rain,14
1004,Lane_4_West,10,3,0,0,14,4,Fog,22
1005,Lane_1_North,1,1,0,0,13,2,Rain,19
1005,Lane_2_East,0,1,0,0,6,5,Clear,12
1005,Lane_3_South,1,3,0,0,7,4,Clear,10
1005,Lane_4_West,8,1,2,0,17,9,Rain,15
1006,Lane_1_North,8,2,2,0,9,1,Rain,26
1006,Lane_2_East,9,2,1,0,7,4,Fog,27
1006,Lane_3_South,14,0,0,0,17,10,Rain,25
1006,Lane_4_West,8,1,0,0,12,3,Fog,14
1007,Lane_1_North,9,5,1,1,18,10,Rain,23
1007,Lane_2_East,5,1,0,1,7,2,Rain,27
1007,Lane_3_South,15,4,1,0,17,7,Fog,12
1007,Lane_4_West,9,3,1,0,16,7,Fog,13
1008,Lane_1_North,10,5,2,0,10,6,Fog,27
1008,Lane_2_East,8,3,0,0,6,0,Rain,21
1008,Lane_3_South,10,4,0,0,10,4,Fog,15
1008,Lane_4_West,15,2,2,0,8,2,Clear,11
1009,Lane_1_North,15,4,2,0,19,3,Fog,15
1009,Lane_2_East,0,5,0,0,16,1,Rain,20
1009,Lane_3_South,4,1,2,0,12,0,Rain,24
1009,Lane_4_West,0,1,0,1,19,1,Clear,15
1010,Lane_1_North,7,1,2,0,17,9,Fog,26
1010,Lane_2_East,5,3,0,0,16,6,Fog,22
1010,Lane_3_South,0,2,0,0,20,10,Clear,10
1010,Lane_4_West,9,1,0,0,16,6,Fog,10
1011,Lane_1_North,3,1,2,0,9,0,Clear,30
1011,Lane_2_East,12,5,1,0,12,5,Clear,30
1011,Lane_3_South,4,4,2,0,10,7,Rain,26
1011,Lane_4_West,5,5,2,0,12,0,Fog,22
1012,Lane_1_North,0,1,0,0,6,9,Rain,23
1012,Lane_2_East,6,3,0,0,15,0,Rain,16
1012,Lane_3_South,5,2,2,0,16,2,Fog,28
1012,Lane_4_West,1,3,2,0,13,5,Rain,12
1013,Lane_1_North,8,2,1,0,12,0,Fog,13
1013,Lane_2_East,10,4,1,0,5,3,Fog,25
1013,Lane_3_South,10,3,0,0,8,2,Clear,14
1013,Lane_4_West,2,3,1,0,8,0,Clear,13
1014,Lane_1_North,14,3,1,0,9,0,Clear,15
1014,Lane_2_East,12,0,2,0,6,6,Rain,16
1014,Lane_3_South,10,3,0,0,6,8,Clear,15
1014,Lane_4_West,1,5,1,0,18,7,Rain,13
1015,Lane_1_North,10,4,1,0,6,3,Rain,25
1015,Lane_2_East,9,2,2,0,9,8,Fog,30
1015,Lane_3_South,11,4,0,0,10,1,Clear,29
1015,Lane_4_West,3,0,2,0,13,4,Fog,14
1016,Lane_1_North,3,5,1,0,20,8,Clear,26
1016,Lane_2_East,2,3,1,0,5,2,Clear,17
1016,Lane_3_South,13,4,1,0,17,10,Fog,19
1016,Lane_4_West,7,1,2,0,9,1,Fog,18
1017,Lane_1_North,7,2,0,0,18,10,Fog,26
1017,Lane_2_East,14,5,2,0,19,4,Fog,13
1017,Lane_3_South,8,2,0,0,8,3,Clear,14
1017,Lane_4_West,15,3,1,0,16,5,Fog,28
1018,Lane_1_North,9,5,0,0,6,2,Rain,14
1018,Lane_2_East,7,0,1,0,5,0,Rain,29
1018,Lane_3_South,8,5,2,0,13,1,Clear,20
1018,Lane_4_West,6,5,1,0,8,10,Clear,13
1019,Lane_1_North,12,1,2,0,15,5,Fog,16
1019,Lane_2_East,1,4,2,0,10,0,Fog,29
1019,Lane_3_South,2,2,0,0,5,0,Rain,23
1019,Lane_4_West,10,5,2,0,14,7,Clear,27
1020,Lane_1_North,11,2,1,0,6,8,Fog,28
1020,Lane_2_East,13,3,0,0,20,1,Fog,16
1020,Lane_3_South,0,0,1,0,18,8,Rain,13
1020,Lane_4_West,7,4,2,1,10,3,Fog,27
1021,Lane_1_North,10,2,1,0,20,5,Fog,21
1021,Lane_2_East,1,4,2,0,8,5,Rain,13
1021,Lane_3_South,10,3,0,0,12,1,Clear,26
1021,Lane_4_West,1,5,0,0,10,7,Clear,19
1022,Lane_1_North,2,5,1,0,18,1,Fog,18
1022,Lane_2_East,7,4,2,0,20,6,Clear,11
1022,Lane_3_South,7,2,1,0,9,10,Rain,23
1022,Lane_4_West,7,3,1,0,11,6,Fog,23
1023,Lane_1_North,7,0,1,0,11,1,Clear,23
1023,Lane_2_East,4,4,2,0,17,1,Clear,25
1023,Lane_3_South,11,1,1,0,5,10,Fog,16
1023,Lane_4_West,10,1,2,0,14,4,Fog,30
1024,Lane_1_North,15,5,1,1,7,4,Clear,12
1024,Lane_2_East,8,0,1,0,9,4,Clear,30
1024,Lane_3_South,5,5,0,0,14,0,Fog,14
1024,Lane_4_West,5,1,0,0,14,3,Clear,11
1025,Lane_1_North,3,2,2,0,9,7,Clear,27
1025,Lane_2_East,10,2,0,0,8,9,Clear,29
1025,Lane_3_South,15,2,2,0,5,8,Clear,27
1025,Lane_4_West,3,5,1,0,12,9,Clear,16"""

reader = csv.DictReader(csv_data.strip().splitlines())
result = []
for row in reader:
    # Convert numerical fields to integers where appropriate
    for key in row:
        if key not in ['lane_id', 'weather_condition']:
            row[key] = int(row[key])
    result.append(row)

with open('src/data/traffic.json', 'w') as f:
    json.dump(result, f, indent=2)

print("Successfully written to src/data/traffic.json")
