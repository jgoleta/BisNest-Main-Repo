document.addEventListener('DOMContentLoaded', () => {
	const userButton = document.getElementById('userButton');
	const userMenu = document.getElementById('userMenu');
	const userDropdown = document.getElementById('userDropdown');
	const logoutBtn = document.getElementById('logoutBtn');

	if (!userButton || !userMenu || !userDropdown) return;

	function isOpen() {
		return !userMenu.hidden;
	}

	function openMenu() {
		userMenu.hidden = false;
		userButton.setAttribute('aria-expanded', 'true');
		userDropdown.classList.add('open');
		const first = userMenu.querySelector('.menu-item');
		if (first) first.focus();
	}

	function closeMenu() {
		userMenu.hidden = true;
		userButton.setAttribute('aria-expanded', 'false');
		userDropdown.classList.remove('open');
		userButton.focus();
	}

	userButton.addEventListener('click', (e) => {
		e.stopPropagation();
		if (isOpen()) closeMenu(); else openMenu();
	});

	document.addEventListener('click', () => {
		if (isOpen()) closeMenu();
	});

	userMenu.addEventListener('click', (e) => e.stopPropagation());

	userButton.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(); }
		if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
	});

	userMenu.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			const items = Array.from(userMenu.querySelectorAll('.menu-item'));
			if (!items.length) return;
			const idx = items.indexOf(document.activeElement);
			let next = 0;
			if (e.key === 'ArrowDown') next = (idx + 1) % items.length;
			if (e.key === 'ArrowUp') next = (idx - 1 + items.length) % items.length;
			items[next].focus();
		}
	});

	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			console.log('Logout clicked');
		});
	}
});

