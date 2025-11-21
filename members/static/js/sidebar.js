const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// Initialize state from localStorage so the sidebar doesn't unexpectedly open/close
// when navigating between pages.
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
        // ignore localStorage errors (e.g., private mode)
    }
}

function persistSidebarState() {
    try {
        localStorage.setItem('sidebarClosed', sidebar.classList.contains('close') ? 'true' : 'false');
    } catch (e) {
        // ignore
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

    // Note: Do NOT open the sidebar when toggling submenus. The sidebar should
    // only be opened/closed via `toggleSidebar()` (user clicking the main
    // toggle). This keeps the sidebar state predictable across navigation.
    // When a submenu is toggled we want the sidebar to expand so the submenu
    // items are visible — same behavior as clicking the main toggle. Persist
    // that state so the expanded sidebar survives navigation.
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

// Init on load
document.addEventListener('DOMContentLoaded', initSidebarState);