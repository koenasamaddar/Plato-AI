// Welcome popup handling
function closePopup() {
    document.getElementById('welcomePopup').style.display = 'none';
}

// Image upload and analysis
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const analysisResults = document.getElementById('analysisResults');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(uploadForm);
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
            analysisResults.innerHTML = '';
            analysisResults.appendChild(loadingDiv);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    analysisResults.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    return;
                }

                // Create charts using Plotly
                const healthScoreChart = {
                    values: [data.health_score, 100 - data.health_score],
                    labels: ['Health Score', 'Remaining'],
                    type: 'pie',
                    hole: 0.7,
                    marker: {
                        colors: ['#ef5350', '#ffebee']
                    }
                };

                const bloodCountsChart = {
                    x: ['RBC Count', 'WBC Count', 'Hemoglobin'],
                    y: [
                        parseFloat(data.rbc_count),
                        parseFloat(data.wbc_count),
                        parseFloat(data.hemoglobin)
                    ],
                    type: 'bar',
                    marker: {
                        color: '#ef5350'
                    }
                };

                analysisResults.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <div id="healthScore"></div>
                        </div>
                        <div class="col-md-6">
                            <div id="bloodCounts"></div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3>Analysis Results:</h3>
                        <ul class="list-group">
                            <li class="list-group-item">RBC Count: ${data.rbc_count}</li>
                            <li class="list-group-item">WBC Count: ${data.wbc_count}</li>
                            <li class="list-group-item">Hemoglobin: ${data.hemoglobin}</li>
                            <li class="list-group-item">Overall Health Score: ${data.health_score}%</li>
                        </ul>
                    </div>
                `;

                Plotly.newPlot('healthScore', [healthScoreChart], {
                    title: 'Health Score',
                    height: 300,
                    margin: { t: 40, b: 0, l: 0, r: 0 }
                });

                Plotly.newPlot('bloodCounts', [bloodCountsChart], {
                    title: 'Blood Components',
                    height: 300,
                    margin: { t: 40, b: 40, l: 40, r: 40 }
                });

            } catch (error) {
                analysisResults.innerHTML = '<div class="alert alert-danger">An error occurred during analysis.</div>';
            }
        });
    }
});
