// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskTime = document.getElementById('task-time');
    const taskList = document.getElementById('task-list');

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(taskInput.value, taskTime.value);
        taskInput.value = '';
        taskTime.value = '';
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const li = e.target.parentElement;
            if (e.target.classList.contains('edit-btn')) {
                editTask(li);
            } else if (e.target.classList.contains('delete-btn')) {
                deleteTask(li);
            }
        }
    });

    function addTask(task, time) {
        if (task.trim() === '' || time.trim() === '') return; // Prevent adding empty tasks
        
        const li = document.createElement('li');
        
        const taskText = document.createElement('span');
        taskText.textContent = task;
        taskText.classList.add('task-text');
        
        const taskTime = document.createElement('span');
        taskTime.textContent = time;
        taskTime.classList.add('task-time');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '&#9998;';  // Pencil icon
        editBtn.classList.add('edit-btn');

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';  // "X" icon
        deleteBtn.classList.add('delete-btn');

        li.appendChild(taskText);
        li.appendChild(taskTime);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        
        taskList.appendChild(li);
    }

    function editTask(li) {
        const taskText = li.querySelector('.task-text').textContent;
        const taskTime = li.querySelector('.task-time').textContent;
        const newTask = prompt('Edit task', taskText);
        const newTime = prompt('Edit time', taskTime);
        if (newTask !== null && newTask.trim() !== '') {
            li.querySelector('.task-text').textContent = newTask;
        }
        if (newTime !== null && newTime.trim() !== '') {
            li.querySelector('.task-time').textContent = newTime;
        }
    }

    function deleteTask(li) {
        taskList.removeChild(li);
    }
});
