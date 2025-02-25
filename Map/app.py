from flask import Flask, render_template, jsonify, request, send_from_directory
from pathfinding import generate_path
import os

app = Flask(__name__, static_folder='dist', template_folder='dist')

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

# Bus route data
bus_routes = {
    'stop1': {
        'name': 'Main Campus Loop',
        'stops': ['stop1', 'stop2', 'stop3', 'stop4'],
        'color': '#FF4444',
        'path': [
            [45, 0, 20],    # Arts area
            [35, 0, 20],    # Near Arts
            [0, 0, 20],     # Student Center
            [-35, 0, 20],   # Near Cafeteria
            [-35, 0, -15],  # Near Library
            [-35, 0, -40],  # Near Science
            [0, 0, -40],    # Main road
            [35, 0, -40],   # Near Engineering
            [35, 0, -15],   # Near Admin
            [35, 0, 20],    # Back to Arts
            [45, 0, 20]     # Complete loop
        ]
    },
    'stop2': {
        'name': 'East Campus Express',
        'stops': ['stop2', 'stop4'],
        'color': '#44FF44',
        'path': [
            [-45, 0, 20],   # Cafeteria area
            [-35, 0, 20],   # Near Cafeteria
            [-35, 0, -40],  # Near Science
            [0, 0, -40],    # Main road
            [35, 0, -40],   # Near Engineering
            [35, 0, -15],   # Complete route
            [-45, 0, 20]    # Back to start
        ]
    }
}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/path', methods=['POST'])
def get_path():
    data = request.get_json()
    start_room = data.get('startRoom')
    end_room = data.get('endRoom')
    
    if not start_room or not end_room:
        return jsonify({'error': 'Start and end rooms are required'}), 400
        
    path = generate_path(start_room, end_room)
    return jsonify({'path': path})

@app.route('/api/bus-routes')
def get_bus_routes():
    return jsonify(bus_routes)

if __name__ == '__main__':
    app.run(debug=True)