// Theme switcher functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }

    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            // Update blood drop mascots for dark mode
            document.querySelectorAll('.blood-drop').forEach(mascot => {
                mascot.style.filter = 'brightness(0.8) saturate(1.2)';
            });
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            // Reset blood drop mascots
            document.querySelectorAll('.blood-drop').forEach(mascot => {
                mascot.style.filter = 'none';
            });
        }
    }

    toggleSwitch.addEventListener('change', switchTheme);

    // Apply initial mascot styles if in dark mode
    if (currentTheme === 'dark') {
        document.querySelectorAll('.blood-drop').forEach(mascot => {
            mascot.style.filter = 'brightness(0.8) saturate(1.2)';
        });
    }
});
