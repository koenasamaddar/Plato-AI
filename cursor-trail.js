document.addEventListener('DOMContentLoaded', () => {
    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';
    document.body.appendChild(cursorTrail);

    // Store trail positions
    const trailPositions = [];
    const maxTrailLength = 10;

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Add new position to trail
        trailPositions.unshift({ x: e.clientX, y: e.clientY });

        // Remove old positions
        if (trailPositions.length > maxTrailLength) {
            trailPositions.pop();
        }

        // Update trail visualization
        updateTrail();
    });

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, select, .blood-drop');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });

    function updateTrail() {
        let trailHtml = '';
        trailPositions.forEach((pos, index) => {
            const size = 12 - index;
            const opacity = 1 - (index / maxTrailLength);
            trailHtml += `<div class="trail-dot" style="
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: ${size}px;
                height: ${size}px;
                opacity: ${opacity};
            "></div>`;
        });
        cursorTrail.innerHTML = trailHtml;
    }
});
