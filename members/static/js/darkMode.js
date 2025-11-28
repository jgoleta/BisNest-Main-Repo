let darkmode = localStorage.getItem('darkmode')
const themeToggle = document.getElementById('theme-toggle');

const enableDarkMode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
    if (themeToggle) themeToggle.checked = true;
}

const disableDarkMode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', 'null');
    if (themeToggle) themeToggle.checked = false;
}

if (darkmode === 'active') {
    enableDarkMode();
} else if (themeToggle) {
    themeToggle.checked = false;
}

if (themeToggle) {
    themeToggle.addEventListener('change', () => { 
        darkmode = localStorage.getItem('darkmode')
        darkmode !== 'active' ? enableDarkMode() : disableDarkMode();
    });
}