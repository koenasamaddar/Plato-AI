from flask import Flask, request, jsonify, send_from_directory, render_template
from ultralytics import YOLO
import cv2
import numpy as np
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'static/output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Load YOLO model
MODEL_NAME = "yolov8n.pt"
MODEL_PATH = os.path.join(os.getcwd(), MODEL_NAME)
model = YOLO(MODEL_PATH)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Process the image with YOLO
    results = model.predict(file_path, conf=0.25, imgsz=416, save=True, save_txt=True)
    
    detected_cells = {}
    for result in results:
        class_names = result.names  # Class labels
        detections = result.boxes.cls.cpu().numpy()  # Detected class indices
        
        for class_index in detections:
            class_name = class_names[int(class_index)]
            detected_cells[class_name] = detected_cells.get(class_name, 0) + 1
    
    # Save the output image
    output_path = os.path.join(RESULT_FOLDER, "output.jpg")
    for result in results:
        if hasattr(result, 'save'):
            result.save(filename=output_path)
    
    return jsonify({
        "image_url": "/output",
        "detections": [{"count": detected_cells}]
    })

@app.route('/output', methods=['GET'])
def get_output():
    return send_from_directory(RESULT_FOLDER, "output.jpg")

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)