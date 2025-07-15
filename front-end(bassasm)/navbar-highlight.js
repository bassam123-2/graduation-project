// Navbar Highlight Script for All Pages (Arabic & English)
(function() {
    function highlightCurrentNav() {
        const path = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.navbar > li > a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href') ? link.getAttribute('href').split('?')[0] : '';
            if (href && (href === path || (href === 'home.html' && (path === '' || path === 'index.html')))) {
                link.classList.add('active');
            }
        });
    }
    document.addEventListener('DOMContentLoaded', highlightCurrentNav);
})(); 