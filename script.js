document.addEventListener('DOMContentLoaded', () => {
    // --- Auth State ---
    let users = JSON.parse(localStorage.getItem('smartUsers')) || [];
    let currentUser = localStorage.getItem('smartCurrentUser') || null;
    let activeUserObj = null; // The full record of the current logged-in user

    // --- Task State ---
    let tasks = [];
    let currentMenuFilter = 'all'; 
    let currentCategoryFilter = 'all'; 
    let currentStatusFilter = 'all'; 
    let searchQuery = '';
    
    // Calendar & Notifications
    let navMonth = new Date().getMonth();
    let navYear = new Date().getFullYear();
    let notificationsEnabled = false;

    // --- DOM Elements ---
    const body = document.body;
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const loginUserIn = document.getElementById('login-username');
    const loginPassIn = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    const regUserIn = document.getElementById('register-username');
    const regPassIn = document.getElementById('register-password');
    const regError = document.getElementById('register-error');

    // User Profile Widget DOM
    const userProfileBtn = document.getElementById('user-profile-btn');
    const currentUserDisplay = document.getElementById('current-user-display');
    const currentBioDisplay = document.getElementById('current-bio-display');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    // Profile Modal DOM
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    const closeProfileModalBtn = document.getElementById('close-profile-modal');
    const cancelProfileBtn = document.getElementById('cancel-profile');
    
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const profileAvatarPreview = document.getElementById('profile-avatar-preview');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileBio = document.getElementById('profile-bio');

    const themeToggleBtn = document.getElementById('theme-toggle');
    const notificationBtn = document.getElementById('notification-btn');
    const addTaskForm = document.getElementById('add-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskCategoryInput = document.getElementById('task-category');
    const taskDatetimeInput = document.getElementById('task-datetime');

    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterStatusBtns = document.querySelectorAll('.filter-btn');
    const sidebarNavBtns = document.querySelectorAll('#category-filter-list li');
    const sidebarCategoryBtns = document.querySelectorAll('.tags-list li');

    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const statTotal = document.getElementById('stat-total');
    const statCompleted = document.getElementById('stat-completed');
    const statOverdue = document.getElementById('stat-overdue');

    const editModal = document.getElementById('edit-modal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const editTaskCategory = document.getElementById('edit-task-category');
    const editTaskDatetime = document.getElementById('edit-task-datetime');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const calendarDays = document.getElementById('calendar-days');
    const monthYearText = document.getElementById('calendar-month-year');
    const btnPrevMonth = document.getElementById('prev-month');
    const btnNextMonth = document.getElementById('next-month');

    // --- Initialization --- //
    if (localStorage.getItem('theme') === 'light') {
        body.classList.remove('dark-mode');
        themeToggleBtn.querySelector('i').className = 'bx bx-moon';
    }

    if (currentUser) {
        syncActiveUser();
        showDashboard();
    } else {
        showAuth();
    }

    // --- Auth Routing --- //
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            authTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            if (e.target.dataset.target === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                loginError.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                regError.classList.add('hidden');
            }
        });
    });

    function createNewUserObject(username, password) {
        return {
            username: username,
            password: password,
            displayName: username, // defaults to username
            bio: 'Click here to setup profile',
            avatar: null // base64 representation later
        };
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = regUserIn.value.trim();
        const password = regPassIn.value;

        if (users.find(u => u.username === username)) {
            regError.classList.remove('hidden');
            return;
        }

        const newUser = createNewUserObject(username, password);
        users.push(newUser);
        saveUsers();
        
        currentUser = username;
        localStorage.setItem('smartCurrentUser', currentUser);
        syncActiveUser();
        regUserIn.value = ''; regPassIn.value = ''; regError.classList.add('hidden');
        showDashboard();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginUserIn.value.trim();
        const password = loginPassIn.value;

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = username;
            localStorage.setItem('smartCurrentUser', currentUser);
            syncActiveUser();
            loginUserIn.value = ''; loginPassIn.value = ''; loginError.classList.add('hidden');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening profile modal
        currentUser = null;
        activeUserObj = null;
        localStorage.removeItem('smartCurrentUser');
        showAuth();
    });

    function saveUsers() {
        localStorage.setItem('smartUsers', JSON.stringify(users));
    }

    function syncActiveUser() {
        activeUserObj = users.find(u => u.username === currentUser);
        // Migration patch for old users missing new profile schemas
        if (activeUserObj && activeUserObj.displayName === undefined) {
            activeUserObj.displayName = activeUserObj.username;
            activeUserObj.bio = 'Click here to setup profile';
            activeUserObj.avatar = null;
            saveUsers();
        }
    }

    function showAuth() {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    function showDashboard() {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        updateSidebarProfileUI();
        loadUserTasks();
        renderTasks();
        renderCalendar();
    }


    // --- Profile Editing Flow --- //
    userProfileBtn.addEventListener('click', openProfileModal);
    closeProfileModalBtn.addEventListener('click', closeProfileModal);
    cancelProfileBtn.addEventListener('click', closeProfileModal);

    function updateSidebarProfileUI() {
        if (!activeUserObj) return;
        currentUserDisplay.textContent = activeUserObj.displayName;
        currentBioDisplay.textContent = activeUserObj.bio || 'Setup Profile';
        
        if (activeUserObj.avatar) {
            sidebarAvatar.innerHTML = `<img src="${activeUserObj.avatar}" alt="Avatar">`;
        } else {
            sidebarAvatar.innerHTML = `<i class='bx bx-user'></i>`;
        }
    }

    function openProfileModal() {
        profileDisplayName.value = activeUserObj.displayName;
        profileBio.value = activeUserObj.bio;
        
        if(activeUserObj.avatar) {
            profileAvatarPreview.innerHTML = `<img src="${activeUserObj.avatar}">`;
            profileAvatarPreview.dataset.base64 = activeUserObj.avatar;
        } else {
            profileAvatarPreview.innerHTML = `<i class='bx bx-camera'></i>`;
            profileAvatarPreview.dataset.base64 = '';
        }
        
        profileModal.classList.remove('hidden');
    }

    function closeProfileModal() {
        profileModal.classList.add('hidden');
        profileForm.reset();
    }

    // Process Avatar Uploads with Canvas Compression
    profileAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const CTX = canvas.getContext('2d');
                canvas.width = 150;
                canvas.height = 150;
                // Crop square from center mapping
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                CTX.drawImage(img, sx, sy, minSide, minSide, 0, 0, 150, 150);
                
                // Compress via JPEG encoding 0.8 scale
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                profileAvatarPreview.innerHTML = `<img src="${dataUrl}">`;
                profileAvatarPreview.dataset.base64 = dataUrl;
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        activeUserObj.displayName = profileDisplayName.value.trim();
        activeUserObj.bio = profileBio.value.trim();
        
        const avatarData = profileAvatarPreview.dataset.base64;
        if(avatarData && avatarData.length > 0) {
            activeUserObj.avatar = avatarData;
        }
        
        saveUsers();
        updateSidebarProfileUI();
        closeProfileModal();
    });


    // --- Task Engine ---
    function loadUserTasks() {
        if(!currentUser) return;
        const key = `smartTasks_${currentUser}`;
        let rawData = localStorage.getItem(key);
        
        if (!rawData) {
            const legacyData = localStorage.getItem('smartTasks');
            if (legacyData) {
                rawData = legacyData;
                localStorage.removeItem('smartTasks');
            } else {
                rawData = "[]";
            }
        }
        
        tasks = JSON.parse(rawData);
        tasks = tasks.map(t => ({
            ...t,
            category: t.category || 'none',
            datetime: t.datetime || t.dueDate || '',
            isPinned: t.isPinned || false,
            notified: t.notified || false
        }));
    }

    function saveTasks() {
        if(!currentUser) return;
        localStorage.setItem(`smartTasks_${currentUser}`, JSON.stringify(tasks));
    }


    // --- Global Dashboard Event Listeners --- //
    setInterval(checkNotifications, 60000);

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggleBtn.querySelector('i').className = isDark ? 'bx bx-sun' : 'bx bx-moon';
    });

    notificationBtn.addEventListener('click', async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }
        let permission = await Notification.requestPermission();
        if(permission === 'granted') {
            notificationsEnabled = true;
            notificationBtn.querySelector('i').className = 'bx bxs-bell-ring';
            alert("Notifications enabled for upcoming tasks!");
        }
    });

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;

        tasks.unshift({
            id: Date.now().toString(),
            title: title,
            priority: taskPriorityInput.value,
            category: taskCategoryInput.value,
            datetime: taskDatetimeInput.value,
            completed: false,
            createdAt: new Date().toISOString(),
            isPinned: false,
            notified: false
        });

        saveTasks();
        addTaskForm.reset();
        renderTasks();
        renderCalendar();
    });

    searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); renderTasks(); });

    filterStatusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterStatusBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.status;
            renderTasks();
        });
    });

    sidebarNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            clearSidebarActives();
            btn.classList.add('active');
            currentMenuFilter = btn.dataset.category;
            currentCategoryFilter = 'all'; 
            renderTasks();
        });
    });

    sidebarCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            clearSidebarActives();
            btn.classList.add('active');
            currentCategoryFilter = btn.dataset.category;
            currentMenuFilter = 'all'; 
            renderTasks();
        });
    });

    function clearSidebarActives() {
        sidebarNavBtns.forEach(b => b.classList.remove('active'));
        sidebarCategoryBtns.forEach(b => b.classList.remove('active'));
    }

    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editTaskId.value;
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.title = editTaskTitle.value.trim();
            task.priority = editTaskPriority.value;
            task.category = editTaskCategory.value;
            if(task.datetime !== editTaskDatetime.value) { task.notified = false; }
            task.datetime = editTaskDatetime.value;
        }
        saveTasks();
        closeEditModal();
        renderTasks();
        renderCalendar();
    });

    btnPrevMonth.addEventListener('click', () => { navMonth--; if(navMonth < 0){navMonth=11;navYear--;} renderCalendar(); });
    btnNextMonth.addEventListener('click', () => { navMonth++; if(navMonth > 11){navMonth=0;navYear++;} renderCalendar(); });

    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const li = target.closest('li.task-item');
        if (!li) return;
        const id = li.dataset.id;

        if (target.classList.contains('task-checkbox') || target.closest('.task-checkbox')) {
            const task = tasks.find(t => t.id === id);
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        } 
        else if (target.closest('.btn-delete')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            renderCalendar();
        } 
        else if (target.closest('.btn-edit')) {
            openEditModalTask(id);
        }
        else if (target.closest('.btn-pin')) {
            const task = tasks.find(t => t.id === id);
            task.isPinned = !task.isPinned;
            saveTasks();
            renderTasks();
        }
    });

    function openEditModalTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskPriority.value = task.priority;
        editTaskCategory.value = task.category || 'none';
        editTaskDatetime.value = task.datetime || '';
        editModal.classList.remove('hidden');
    }

    // --- Drag and Drop Logic --- //
    let draggedItemIdx = null;
    taskList.addEventListener('dragstart', (e) => {
        const li = e.target.closest('.task-item');
        if(!li) return;
        const allCurrentLis = Array.from(taskList.children);
        draggedItemIdx = allCurrentLis.indexOf(li);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', li.dataset.id);
        setTimeout(() => li.classList.add('dragging'), 0);
    });

    taskList.addEventListener('dragend', (e) => {
        const li = e.target.closest('.task-item');
        if(li) li.classList.remove('dragging');
        draggedItemIdx = null;
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
        const draggingEl = document.querySelector('.dragging');
        if(!draggingEl) return;
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) { taskList.appendChild(draggingEl); } 
        else { taskList.insertBefore(draggingEl, afterElement); }
    });

    taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if(!draggedId) return;
        reorderTasksDataBasedOnDOM();
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else { return closest; }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function reorderTasksDataBasedOnDOM() {
        if(currentMenuFilter !== 'all' || currentCategoryFilter !== 'all' || searchQuery || currentStatusFilter !== 'all') {
            renderTasks(); 
            return;
        }
        const visuallyOrderedIds = Array.from(taskList.children).map(li => li.dataset.id);
        const newTasksArray = [];
        visuallyOrderedIds.forEach(id => {
            const task = tasks.find(t => t.id === id);
            if(task) newTasksArray.push(task);
        });
        tasks.forEach(t => {
            if(!visuallyOrderedIds.includes(t.id)) { newTasksArray.push(t); }
        });
        tasks = newTasksArray;
        saveTasks();
        renderTasks();
    }


    // --- Util Functions & Renderers ---
    function isOverdue(datetime) {
        if (!datetime) return false;
        return new Date(datetime).getTime() < new Date().getTime();
    }

    function isToday(datetime) {
        if (!datetime) return false;
        const d = new Date(datetime);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }

    function checkNotifications() {
        if (!notificationsEnabled || Notification.permission !== 'granted' || !currentUser) return;
        const now = new Date().getTime();
        tasks.forEach(task => {
            if (task.completed || task.notified || !task.datetime) return;
            const timeDiffMins = (new Date(task.datetime).getTime() - now) / 60000;
            if (timeDiffMins <= 15 && timeDiffMins > -60) {
                new Notification("Task Reminder", {
                    body: `"${task.title}" is due soon.`,
                    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'/></svg>"
                });
                task.notified = true;
                saveTasks();
            }
        });
    }

    function renderTasks() {
        if (!currentUser) return;
        let filtered = tasks.filter(task => {
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;
            if (currentStatusFilter === 'completed' && !task.completed) return false;
            if (currentStatusFilter === 'pending' && task.completed) return false;
            if (currentMenuFilter === 'today' && !isToday(task.datetime)) return false;
            if (currentMenuFilter === 'upcoming') {
                if(!task.datetime) return false;
                const d = new Date(task.datetime);
                const today = new Date(); today.setHours(23,59,59,999);
                if(d.getTime() <= today.getTime()) return false;
            }
            if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;
            return true;
        });

        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0; 
        });

        taskList.innerHTML = '';
        let overdueCount = 0;

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            filtered.forEach(task => {
                const isTaskOverdue = !task.completed && isOverdue(task.datetime);
                if (isTaskOverdue) overdueCount++;

                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''} ${isTaskOverdue ? 'overdue' : ''}`;
                li.dataset.id = task.id;
                li.draggable = true;

                let priorityClass = task.priority === 'high' ? 'badge-priority-high' : 
                                    task.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low';
                
                let dateBadge = '';
                if (task.datetime) {
                    const d = new Date(task.datetime);
                    const formatted = d.toLocaleDateString(undefined, {month:'short', day:'numeric'}) + ' ' +
                                      d.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit', hour12:true});
                    dateBadge = `<span><i class='bx bx-time-five'></i> ${formatted}</span>`;
                }

                let categoryTag = '';
                if (task.category && task.category !== 'none') {
                    categoryTag = `<span class="task-badge tag-${task.category}">${task.category}</span>`;
                }

                li.innerHTML = `
                    <div class="task-checkbox-container">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    </div>
                    <div class="task-content">
                        <div class="task-header-line">
                            <span class="task-badge ${priorityClass}">${task.priority}</span>
                            ${categoryTag}
                        </div>
                        <div class="task-title">${escapeHTML(task.title)}</div>
                        <div class="task-meta">
                            ${dateBadge}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-pin ${task.isPinned ? 'pinned' : ''}" aria-label="Pin task">
                            <i class='bx bxs-pin'></i>
                        </button>
                        <button class="btn-edit" aria-label="Edit task">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        <button class="btn-delete" aria-label="Delete task">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }

        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        statTotal.textContent = total;
        statCompleted.textContent = completed;
        statOverdue.textContent = overdueCount;

        let pTotal = total; let pDone = completed;
        if(currentMenuFilter === 'today') {
            const todayTasks = tasks.filter(t => isToday(t.datetime));
            pTotal = todayTasks.length; pDone = todayTasks.filter(t => t.completed).length;
        }

        progressText.textContent = `${pDone} / ${pTotal} tasks completed`;
        const percentage = pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100);
        progressFill.style.width = `${percentage}%`;
    }

    function renderCalendar() {
        if (!currentUser) return;
        calendarDays.innerHTML = '';
        const firstDay = new Date(navYear, navMonth, 1).getDay();
        const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
        monthYearText.textContent = new Date(navYear, navMonth).toLocaleDateString(undefined, {month: 'long', year: 'numeric'});

        const taskDatesThisMonth = new Set();
        tasks.forEach(task => {
            if(!task.datetime) return;
            const d = new Date(task.datetime);
            if(d.getMonth() === navMonth && d.getFullYear() === navYear) { taskDatesThisMonth.add(d.getDate()); }
        });

        const realToday = new Date();
        const isCurrentMonth = realToday.getMonth() === navMonth && realToday.getFullYear() === navYear;

        for(let i = 0; i < firstDay; i++) { calendarDays.appendChild(document.createElement('div')); }
        for(let i = 1; i <= daysInMonth; i++) {
            const div = document.createElement('div');
            div.className = 'cal-day'; div.textContent = i;
            if(isCurrentMonth && i === realToday.getDate()) { div.classList.add('today'); }
            if(taskDatesThisMonth.has(i)) { div.classList.add('has-tasks'); }
            calendarDays.appendChild(div);
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    }
});
