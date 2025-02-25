def distance(point1, point2):
    return ((point2[0] - point1[0]) ** 2 +
            (point2[1] - point1[1]) ** 2 +
            (point2[2] - point1[2]) ** 2) ** 0.5

def parse_room_id(room_id):
    building, floor, side = room_id.split('-')
    return {'building': building, 'floor': int(floor), 'side': side}

def get_room_position(building, floor, side, road_graph):
    base_position = road_graph[building]['position']
    x_offset = -5 if side == 'L' else 5
    return [base_position[0] + x_offset, floor * 4, base_position[2]]

def find_shortest_path(start, end, road_graph):
    distances = {}
    previous = {}
    unvisited = set(road_graph.keys())
    
    # Initialize distances
    for node in road_graph:
        distances[node] = 0 if node == start else float('inf')
    
    while unvisited:
        # Find closest unvisited node
        current = None
        shortest_distance = float('inf')
        
        for node in unvisited:
            if distances[node] < shortest_distance:
                shortest_distance = distances[node]
                current = node
        
        if current == end:
            break
        if current is None:
            break
        
        unvisited.remove(current)
        
        # Update distances to neighbors
        for neighbor in road_graph[current]['connections']:
            if neighbor not in unvisited:
                continue
            
            alt = distances[current] + distance(
                road_graph[current]['position'],
                road_graph[neighbor]['position']
            )
            
            if alt < distances[neighbor]:
                distances[neighbor] = alt
                previous[neighbor] = current
    
    # Reconstruct path
    path = []
    current = end
    
    while current is not None:
        path.insert(0, current)
        current = previous.get(current)
    
    return path

def generate_path(start_room, end_room):
    # Graph representation of the campus with road intersections
    road_graph = {
        # Buildings
        'academic': {'position': [0, 0, -10], 'connections': ['academic-main']},
        'library': {'position': [-35, 0, -15], 'connections': ['library-main']},
        'admin': {'position': [35, 0, -15], 'connections': ['admin-main']},
        'sports': {'position': [0, 0, -60], 'connections': ['sports-main']},
        'cafeteria': {'position': [-35, 0, 20], 'connections': ['cafeteria-main']},
        'science': {'position': [-35, 0, -40], 'connections': ['science-main']},
        'engineering': {'position': [35, 0, -40], 'connections': ['engineering-main']},
        'arts': {'position': [35, 0, 20], 'connections': ['arts-main']},
        'student_center': {'position': [0, 0, 20], 'connections': ['center-main']},
        
        # Building to main road connections
        'academic-main': {'position': [0, 0, -10], 'connections': ['academic', 'main-vertical']},
        'library-main': {'position': [-35, 0, -15], 'connections': ['library', 'left-vertical']},
        'admin-main': {'position': [35, 0, -15], 'connections': ['admin', 'right-vertical']},
        'sports-main': {'position': [0, 0, -60], 'connections': ['sports', 'main-vertical']},
        'cafeteria-main': {'position': [-35, 0, 20], 'connections': ['cafeteria', 'left-horizontal']},
        'science-main': {'position': [-35, 0, -40], 'connections': ['science', 'left-vertical']},
        'engineering-main': {'position': [35, 0, -40], 'connections': ['engineering', 'right-vertical']},
        'arts-main': {'position': [35, 0, 20], 'connections': ['arts', 'right-horizontal']},
        'center-main': {'position': [0, 0, 20], 'connections': ['student_center', 'main-vertical']},
        
        # Main road intersections
        'main-vertical': {
            'position': [0, 0, 0],
            'connections': ['academic-main', 'center-main', 'sports-main', 'left-horizontal', 'right-horizontal']
        },
        'left-vertical': {
            'position': [-35, 0, -27.5],
            'connections': ['library-main', 'science-main', 'left-horizontal']
        },
        'right-vertical': {
            'position': [35, 0, -27.5],
            'connections': ['admin-main', 'engineering-main', 'right-horizontal']
        },
        'left-horizontal': {
            'position': [-17.5, 0, 20],
            'connections': ['main-vertical', 'left-vertical', 'cafeteria-main']
        },
        'right-horizontal': {
            'position': [17.5, 0, 20],
            'connections': ['main-vertical', 'right-vertical', 'arts-main']
        }
    }
    
    start = parse_room_id(start_room)
    end = parse_room_id(end_room)
    
    # Find path through road network
    building_path = find_shortest_path(start['building'], end['building'], road_graph)
    path = []
    
    # Add start room position
    start_room_pos = get_room_position(start['building'], start['floor'], start['side'], road_graph)
    path.append(start_room_pos)
    
    # Add road intersection points
    for node in building_path:
        path.append(road_graph[node]['position'])
    
    # Add end room position
    end_room_pos = get_room_position(end['building'], end['floor'], end['side'], road_graph)
    path.append(end_room_pos)
    
    return path