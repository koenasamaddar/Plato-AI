from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'})
        
        file = request.files['image']
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        img_array = np.array(img)
        
        # Basic image processing (placeholder for AI analysis)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Generate mock analysis data
        analysis = {
            'rbc_count': '4.8 million/mcL',
            'wbc_count': '7,500/mcL',
            'hemoglobin': '14.2 g/dL',
            'health_score': 92
        }
        
        return jsonify(analysis)
    
    return render_template('upload.html')

@app.route('/health-tips')
def health_tips():
    return render_template('health_tips.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)
