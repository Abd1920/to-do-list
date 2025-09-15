class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        const taskForm = document.getElementById('task-form');
        const taskList = document.getElementById('task-list');
        const filters = document.querySelectorAll('.filter-btn');

        taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        taskList.addEventListener('click', (e) => this.handleTaskClick(e));

        filters.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        const taskTime = document.getElementById('task-time');

        if (this.validateForm(taskInput.value, taskTime.value)) {
            this.addTask(taskInput.value.trim(), taskTime.value);
            taskInput.value = '';
            taskTime.value = '';
            this.clearErrors();
        }
    }

    validateForm(task, time) {
        let isValid = true;

        if (!task.trim()) {
            this.showError('task-input', 'Please enter a task');
            isValid = false;
        }

        if (!time) {
            this.showError('task-time', 'Please select a time');
            isValid = false;
        }

        return isValid;
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorMsg = input.parentNode.querySelector('.error-message');

        input.classList.add('error');
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    }

    addTask(text, time) {
        const task = {
            id: Date.now(),
            text,
            time,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    editTask(id, newText, newTime) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            task.time = newTime;
            this.saveTasks();
            this.render();
        }
    }

    handleTaskClick(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);

        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(taskId);
        } else if (e.target.classList.contains('btn-edit')) {
            this.showEditForm(taskItem);
        } else if (e.target.classList.contains('btn-delete')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('btn-save')) {
            this.saveEdit(taskItem);
        } else if (e.target.classList.contains('btn-cancel')) {
            this.cancelEdit(taskItem);
        }
    }

    showEditForm(taskItem) {
        const editForm = taskItem.querySelector('.edit-form');
        const task = this.tasks.find(t => t.id === parseInt(taskItem.dataset.id));

        editForm.querySelector('.edit-text').value = task.text;
        editForm.querySelector('.edit-time').value = task.time;
        editForm.classList.add('active');

        taskItem.querySelector('.task-actions').style.display = 'none';
    }

    saveEdit(taskItem) {
        const editForm = taskItem.querySelector('.edit-form');
        const newText = editForm.querySelector('.edit-text').value;
        const newTime = editForm.querySelector('.edit-time').value;
        const taskId = parseInt(taskItem.dataset.id);

        if (newText.trim() && newTime) {
            this.editTask(taskId, newText, newTime);
        }
    }

    cancelEdit(taskItem) {
        const editForm = taskItem.querySelector('.edit-form');
        editForm.classList.remove('active');
        taskItem.querySelector('.task-actions').style.display = 'flex';
    }

    handleFilter(e) {
        document.querySelector('.filter-btn.active').classList.remove('active');
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    getFilteredTasks() {
        const now = new Date();
        const today = now.toDateString();

        return this.tasks.filter(task => {
            switch (this.currentFilter) {
                case 'pending':
                    return !task.completed;
                case 'completed':
                    return task.completed;
                case 'today':
                    return new Date(task.createdAt).toDateString() === today;
                default:
                    return true;
            }
        });
    }

    render() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state"><p>📝 No tasks found for this filter!</p></div>';
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
                    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="task-content">
                            <div class="task-checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}">
                                ${task.completed ? '✓' : ''}
                            </div>
                            <span class="task-text">${this.escapeHtml(task.text)}</span>
                            <span class="task-time">${this.formatTime(task.time)}</span>
                        </div>
                        <div class="task-actions">
                            <button class="btn btn-small btn-edit">✏️ Edit</button>
                            <button class="btn btn-small btn-delete">🗑️ Delete</button>
                        </div>
                        <div class="edit-form">
                            <input type="text" class="edit-text" value="${this.escapeHtml(task.text)}">
                            <input type="time" class="edit-time" value="${task.time}">
                            <button class="btn btn-small btn-save">💾 Save</button>
                            <button class="btn btn-small btn-cancel">❌ Cancel</button>
                        </div>
                    </li>
                `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
    }

    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});