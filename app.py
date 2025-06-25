from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from ultralytics import YOLO
import os
import uuid

app = Flask(__name__, static_folder='static', template_folder='templates')

# Enable CORS
CORS(app)

# Set upload and result folder paths
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'static/output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Set maximum upload size to 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

# Set hyperparameters
MODEL_NAME = "BCCD Project/blood_cell_detection_model.pt"  # Path to your saved model
TRAIN_IMGSZ = 416  # Image size for inference (same as the model was trained on)

# Load YOLOv8 model
model = YOLO(MODEL_NAME)

# Reference ranges for blood counts
REFERENCE_RANGES = {
    "Platelets": (150, 410),  # in Thousand/μL
    "RBC": (4.7, 6.1),  # in Million/μL (Male) / 4.2-5.4 (Female)
    "WBC": (4.0, 11.0)  # in Thousand/μL
}

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
    
    # Save uploaded file to the 'uploads' folder with a unique filename
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Run inference on uploaded file using the trained YOLO model
    results = model.predict(source=file_path, conf=0.25, imgsz=TRAIN_IMGSZ, save=True, save_txt=True)

    # Initialize counts for the three cell types
    platelets_count = 0
    rbcs_count = 0
    wbcs_count = 0

    # Loop through results to count detected cell types
    for result in results:
        names = result.names  # Dictionary of class names
        for label_index in result.boxes.cls:
            label = names[int(label_index)]
            if label == 'Platelets':
                platelets_count += 1
            elif label == 'RBC':
                rbcs_count += 1
            elif label == 'WBC':
                wbcs_count += 1

    # Save processed image
    output_filename = f"output_{uuid.uuid4().hex}.jpg"
    for result in results:
        if hasattr(result, 'save'):
            result.save(filename=os.path.join(RESULT_FOLDER, output_filename))

    def determine_status(value, range_tuple):
        low, high = range_tuple
        if value < low:
            return "Low"
        elif value > high:
            return "High"
        return "Normal"

    # **Convert to correct units**
    platelets_in_thousand = platelets_count  # Already in Thousand/μL
    rbcs_in_million = round(rbcs_count / 10, 2)  # Convert RBCs to Million/μL
    wbcs_in_thousand = wbcs_count  # WBCs remain in Thousand/μL

    report = {
        "image_url": f"/static/output/{output_filename}",
        "raw_counts": {  # Keeping separate raw detection counts
            "Platelets": platelets_count,
            "RBCs": rbcs_count,
            "WBCs": wbcs_count
        },
        "report": [
            {
                "test": "Platelets",
                "result": f"{platelets_in_thousand} Thousand/μL",
                "reference_range": "150 - 410",
                "status": determine_status(platelets_in_thousand, REFERENCE_RANGES["Platelets"])
            },
            {
                "test": "Red Blood Cells (RBC)",
                "result": f"{rbcs_in_million} Million/μL",
                "reference_range": "4.7 - 6.1 (Male) / 4.2 - 5.4 (Female)",
                "status": determine_status(rbcs_in_million, REFERENCE_RANGES["RBC"])
            },
            {
                "test": "White Blood Cells (WBC)",
                "result": f"{wbcs_in_thousand} Thousand/μL",
                "reference_range": "4.0 - 11.0",
                "status": determine_status(wbcs_in_thousand, REFERENCE_RANGES["WBC"])
            }
        ]
    }

    return jsonify(report)

@app.route('/static/output/<path:path>')
def send_output(path):
    return send_from_directory(RESULT_FOLDER, path)

if __name__ == '__main__':
    app.run(debug=True)
