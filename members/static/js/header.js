document.addEventListener('DOMContentLoaded', () => {
	const userButton = document.getElementById('userButton');
	const userMenu = document.getElementById('userMenu');
	const userDropdown = document.getElementById('userDropdown');
	const logoutBtn = document.getElementById('logoutBtn');

	const notificationButton = document.getElementById('notificationButton');
	const notificationMenu = document.getElementById('notificationMenu');
	const notificationDropdown = document.getElementById('notificationDropdown');
	const notificationCount = document.getElementById('notificationCount');
	const notificationList = document.getElementById('notificationList');

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

	// ----------------------------
	// Stock alert notifications
	// ----------------------------
	if (notificationButton && notificationMenu && notificationDropdown && notificationList && notificationCount) {
		const NOTIF_ENDPOINT = '/product/low-stock/';

		function isNotifOpen() {
			return !notificationMenu.hidden;
		}

		function openNotifMenu() {
			notificationMenu.hidden = false;
			notificationButton.setAttribute('aria-expanded', 'true');
			notificationDropdown.classList.add('open');
		}

		function closeNotifMenu() {
			notificationMenu.hidden = true;
			notificationButton.setAttribute('aria-expanded', 'false');
			notificationDropdown.classList.remove('open');
		}

		notificationButton.addEventListener('click', (e) => {
			e.stopPropagation();
			if (isNotifOpen()) {
				closeNotifMenu();
			} else {
				openNotifMenu();
			}
		});

		// Close when clicking outside
		document.addEventListener('click', (e) => {
			if (isNotifOpen() && !notificationDropdown.contains(e.target)) {
				closeNotifMenu();
			}
		});

		// Keyboard support
		notificationButton.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeNotifMenu();
			}
		});

		async function fetchStockAlerts() {
			try {
				const response = await fetch(NOTIF_ENDPOINT, {
					headers: { 'X-Requested-With': 'XMLHttpRequest' },
				});

				if (!response.ok) {
					console.error('Failed to fetch stock alerts', response.status);
					return;
				}

				const payload = await response.json();
				const alerts = payload && payload.alerts ? payload.alerts : [];

				// Update badge
				if (alerts.length > 0) {
					notificationCount.textContent = alerts.length;
					notificationCount.hidden = false;
				} else {
					notificationCount.hidden = true;
				}

				// Render list
				notificationList.innerHTML = '';

				if (!alerts.length) {
					const emptyEl = document.createElement('p');
					emptyEl.className = 'notification-empty';
					emptyEl.textContent = 'No stock alerts';
					notificationList.appendChild(emptyEl);
					return;
				}

				alerts.forEach((alert) => {
					const item = document.createElement('div');
					item.className = 'notification-item alert-low-stock';

					const title = document.createElement('div');
					title.className = 'notification-item-title';
					title.textContent = `${alert.name} (${alert.product_id || 'No ID'})`;

					const meta = document.createElement('div');
					meta.className = 'notification-item-meta';
					meta.textContent = `Stock ${alert.stock}/${alert.original_stock} • ${alert.percent_remaining}% remaining`;

					item.appendChild(title);
					item.appendChild(meta);

					notificationList.appendChild(item);
				});
			} catch (err) {
				console.error('Error loading stock alerts', err);
			}
		}

		// Initial fetch and periodic refresh
		fetchStockAlerts();
		setInterval(fetchStockAlerts, 60000); // every 60 seconds
	}
});

