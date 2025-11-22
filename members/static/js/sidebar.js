const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

function initSidebarState() {
    try {
        const saved = localStorage.getItem('sidebarClosed');
        if (saved === 'true') {
            sidebar.classList.add('close');
            if (toggleButton) toggleButton.classList.add('rotate');
        } else {
            sidebar.classList.remove('close');
            if (toggleButton) toggleButton.classList.remove('rotate');
        }
    } catch (e) {
    }
}

function persistSidebarState() {
    try {
        localStorage.setItem('sidebarClosed', sidebar.classList.contains('close') ? 'true' : 'false');
    } catch (e) {
    }
}

function toggleSidebar() {
    if (!sidebar) return;
    sidebar.classList.toggle('close');
    if (toggleButton) toggleButton.classList.toggle('rotate');

    closeAllSubMenus();
    persistSidebarState();
}

function toggleSubMenu(button) {
    if (!button) return;
    const next = button.nextElementSibling;
    if (!next) return;

    if (!next.classList.contains('show')) {
        closeAllSubMenus();
    }

    next.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar && sidebar.classList.contains('close')) {
        sidebar.classList.remove('close');
        if (toggleButton) toggleButton.classList.remove('rotate');
        persistSidebarState();
    }
}

function closeAllSubMenus() {
    if (!sidebar) return;
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show');
        if (ul.previousElementSibling) ul.previousElementSibling.classList.remove('rotate');
    });
}

document.addEventListener('DOMContentLoaded', initSidebarState);