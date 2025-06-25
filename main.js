// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar color change on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('bg-dark');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.add('bg-transparent');
            navbar.classList.remove('bg-dark');
        }
    });

    // Image upload and processing
    const imageUpload = document.getElementById('imageUpload');
    const processButton = document.getElementById('processImage');
    const resultPreview = document.getElementById('resultPreview');

    if (imageUpload && processButton && resultPreview) {
        processButton.addEventListener('click', function() {
            if (imageUpload.files.length > 0) {
                // Show loading state
                resultPreview.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3">Processing image...</p>
                    </div>
                `;

                let formData = new FormData();
                formData.append("file", imageUpload.files[0]);

                // Send image to backend
                fetch("http://127.0.0.1:5000/upload", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.image_url) {
                        // Display processed image and detection results
                        resultPreview.innerHTML = `
                            <div class="alert alert-success">
                                <h4>Analysis Complete!</h4>
                                <p>Detected Platelets: ${data.detections[0].count}</p>
                                <p>Processing Time: ~2 seconds</p>
                            </div>
                            <img src="http://127.0.0.1:5000/output" class="img-fluid mt-3" alt="Processed Image">
                        `;
                    } else {
                        resultPreview.innerHTML = `
                            <div class="alert alert-danger">
                                Error processing image. Please try again.
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    resultPreview.innerHTML = `
                        <div class="alert alert-danger">
                            Server error. Please try again later.
                        </div>
                    `;
                });
            } else {
                resultPreview.innerHTML = `
                    <div class="alert alert-warning">
                        Please select an image first.
                    </div>
                `;
            }
        });

        // Preview uploaded image
        imageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resultPreview.innerHTML = `
                        <img src="${e.target.result}" class="img-fluid mb-3" alt="Uploaded Image">
                        <p>Click "Process Image" to analyze</p>
                    `;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Form submission handling.
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Show success message
            const formElements = contactForm.elements;
            for (let element of formElements) {
                element.disabled = true;
            }
            contactForm.innerHTML += `
                <div class="alert alert-success mt-3">
                    Thank you for your message! We'll get back to you soon.
                </div>
            `;
        });
    }

    // Add animation classes to elements when they come into view
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1
    });

    document.querySelectorAll('.card, .timeline-step, .benefits > div').forEach(element => {
        observer.observe(element);
    });
});
