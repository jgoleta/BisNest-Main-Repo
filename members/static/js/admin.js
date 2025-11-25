 document.addEventListener('DOMContentLoaded', () => {
            // Sample metrics data (replace with real API calls)
            const stats = { users: 1423, sessions: 57, errors: 2 };
            document.getElementById('totalUsers').textContent = stats.users.toLocaleString();
            document.getElementById('activeSessions').textContent = stats.sessions;
            document.getElementById('errors24').textContent = stats.errors;

            // Sample activity rows
            const activity = [
                ['2025-11-21 11:05', 'lance', 'Signed in', '192.168.1.4'],
                ['2025-11-21 10:42', 'system', 'Service restarted', '127.0.0.1'],
                ['2025-11-20 21:14', 'melissa', 'Updated settings', '54.12.33.7']
            ];

            const tbody = document.querySelector('#activityTable tbody');
            function renderRows(rows) {
                tbody.innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
            }
            renderRows(activity);

            // Search filter
            const search = document.getElementById('activitySearch');
            search.addEventListener('input', () => {
                const q = search.value.trim().toLowerCase();
                if (!q) return renderRows(activity);
                const filtered = activity.filter(r => r.join(' ').toLowerCase().includes(q));
                renderRows(filtered);
            });

            // Buttons
            document.getElementById('manageUsers')?.addEventListener('click', () => {
                window.location.href = '../customer.html';
            });
            document.getElementById('siteSettings')?.addEventListener('click', () => {
                alert('Open site settings (not implemented)');
            });
            document.getElementById('viewLogs')?.addEventListener('click', () => {
                alert('Open logs (not implemented)');
            });

            // Logout modal (confirmation)
            const logoutBtn = document.getElementById('logoutBtn');
            logoutBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                showLogoutModal();
            });

            // --- User Access management ---
            const users = [
                { id: 'lance', name: 'Lance', email: 'lance@example.com', perms: { add: true, edit: true, del: false } },
                { id: 'melissa', name: 'Melissa', email: 'melissa@example.com', perms: { add: false, edit: true, del: false } },
                { id: 'guest', name: 'Guest', email: 'guest@example.com', perms: { add: false, edit: false, del: false } }
            ];

            function permBadges(perms){
                const arr = [];
                if (perms.add) arr.push('<span class="perm-badge">Add</span>');
                if (perms.edit) arr.push('<span class="perm-badge">Edit</span>');
                if (perms.del) arr.push('<span class="perm-badge">Delete</span>');
                if (!arr.length) return '<span class="no-perms">No permissions</span>';
                return `<div class="perm-badges">${arr.join('')}</div>`;
            }

            function renderUserAccess(){
                const tbody = document.querySelector('#userAccessTable tbody');
                tbody.innerHTML = users.map((u, i) => `
                    <tr class="permission-row">
                        <td>${u.name} <div class="small">${u.email}</div></td>
                        <td>${permBadges(u.perms)}</td>
                        <td style="text-align:right"><button class="manage-btn" data-index="${i}">Manage</button></td>
                    </tr>
                `).join('');

                // attach handlers
                tbody.querySelectorAll('.manage-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = Number(btn.getAttribute('data-index'));
                        showPermissionsModal(idx);
                    });
                });
            }

            function showPermissionsModal(index){
                const user = users[index];
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `
                    <div class="modal" role="dialog" aria-modal="true" aria-label="Manage permissions for ${user.name}">
                        <h3>Manage permissions</h3>
                        <div class="small">User: <strong>${user.name}</strong> — ${user.email}</div>
                        <form class="perm-form">
                            <label><input type="checkbox" name="add" ${user.perms.add ? 'checked' : ''}> Allow Add</label>
                            <label><input type="checkbox" name="edit" ${user.perms.edit ? 'checked' : ''}> Allow Edit</label>
                            <label><input type="checkbox" name="del" ${user.perms.del ? 'checked' : ''}> Allow Delete</label>
                        </form>
                        <div class="row">
                            <button class="btn ghost" id="cancelPerm">Cancel</button>
                            <button class="btn" id="savePerm">Save</button>
                        </div>
                    </div>`;
                document.body.appendChild(backdrop);

                backdrop.querySelector('#cancelPerm').addEventListener('click', ()=>backdrop.remove());
                backdrop.querySelector('#savePerm').addEventListener('click', ()=>{
                    const form = backdrop.querySelector('.perm-form');
                    const newPerms = {
                        add: Boolean(form.querySelector('input[name="add"]').checked),
                        edit: Boolean(form.querySelector('input[name="edit"]').checked),
                        del: Boolean(form.querySelector('input[name="del"]').checked)
                    };
                    users[index].perms = newPerms;
                    renderUserAccess();
                    backdrop.remove();
                    // TODO: call backend API to persist permissions
                    console.log('Permissions saved for', users[index].id, newPerms);
                });
            }

            // initial render
            renderUserAccess();

            function showLogoutModal() {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `
                    <div class="modal" role="dialog" aria-modal="true">
                        <h3>Confirm logout</h3>
                        <p class="small">Are you sure you want to sign out? Unsaved admin changes may be lost.</p>
                        <div class="row">
                            <button class="btn ghost" id="cancelLogout">Cancel</button>
                            <button class="btn" id="confirmLogout">Sign out</button>
                        </div>
                    </div>`;
                document.body.appendChild(backdrop);
                backdrop.querySelector('#cancelLogout').addEventListener('click', () => backdrop.remove());
                backdrop.querySelector('#confirmLogout').addEventListener('click', () => {
                    // Replace with real logout endpoint or session clear
                    window.location.href = '../index.html';
                });
            }
        });