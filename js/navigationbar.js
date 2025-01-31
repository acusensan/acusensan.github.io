document.addEventListener('DOMContentLoaded', function() {
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Modal.init(document.querySelectorAll('.modal'));

    // Update the copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        updateSelectStyles(darkModeToggle.checked);
    });

    // Load saved theme
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        updateSelectStyles(true);
    }

    // Save theme preference
    darkModeToggle.addEventListener('change', function() {
        localStorage.setItem('dark-mode', darkModeToggle.checked);
    });

    // Add click event to cards to navigate to different pages
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            const link = card.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    });

    // Function to update select element styles
    function updateSelectStyles(isDarkMode) {
        const selects = document.querySelectorAll('.input-field select');
        selects.forEach(select => {
            if (isDarkMode) {
                select.style.backgroundColor = '#1e1e1e';
                select.style.color = '#ffffff'; // Ensure text color is white
                select.style.border = '1px solid #ffffff';
            } else {
                select.style.backgroundColor = '';
                select.style.color = ''; // Reset text color
                select.style.border = '';
            }
        });
    }
});
