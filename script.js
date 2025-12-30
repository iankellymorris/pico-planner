const addBtn = document.getElementById('addBtn');
const tableBody = document.querySelector('#assignmentTable tbody');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const toggleBtn = document.getElementById('toggleControlsBtn');
const controlWrapper = document.getElementById('collapsibleWrapper');
const footerWrapper = document.getElementById('footerWrapper');

let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let undoStack = [];
const MAX_UNDO = 15;

let scrollTimeout;
window.addEventListener('scroll', () => {
    document.body.classList.remove('hide-scrollbar');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        document.body.classList.add('hide-scrollbar');
    }, 1500);
});

let isVisible = localStorage.getItem('controlsVisible') !== 'false';
applyToggleState();
renderTable();

toggleBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    localStorage.setItem('controlsVisible', isVisible);
    applyToggleState();
});

function applyToggleState() {
    if (isVisible) {
        controlWrapper.classList.remove('collapsed');
        footerWrapper.classList.remove('collapsed');
    } else {
        controlWrapper.classList.add('collapsed');
        footerWrapper.classList.add('collapsed');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const [year, month, day] = dateStr.split('-');
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (undoStack.length > 0) {
            assignments.push(undoStack.pop());
            saveAndRender();
        }
    }
});

addBtn.addEventListener('click', () => {
    const className = document.getElementById('classSelect').value;
    const name = document.getElementById('assignmentName').value;
    const link = document.getElementById('assignmentLink').value;
    const date = document.getElementById('dueDate').value;

    if (!name || !date) {
        alert("Please fill in the assignment name and due date.");
        return;
    }

    assignments.push({ id: Date.now(), className, name, link, date });
    saveAndRender();
    
    document.getElementById('assignmentName').value = '';
    document.getElementById('assignmentLink').value = '';
    document.getElementById('dueDate').value = '';
});

function completeAssignment(id, rowElement) {
    rowElement.classList.add('crossing-out', 'fading');
    setTimeout(() => {
        deleteAssignment(id);
    }, 1000);
}

function deleteAssignment(id) {
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
        undoStack.push(assignments[index]);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        assignments.splice(index, 1);
        saveAndRender();
    }
}

function saveAndRender() {
    assignments.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    renderTable();
}

function renderTable() {
    tableBody.innerHTML = '';
    assignments.forEach((task) => {
        const row = document.createElement('tr');
        if (task.className === 'Calculus II') row.classList.add('bg-calculus');
        else if (task.className === 'Computer Programming') row.classList.add('bg-programming');
        else if (task.className === 'Digital Circuits') row.classList.add('bg-circuits');

        const checkCell = document.createElement('td');
        checkCell.className = "col-check";
        const checkBtn = document.createElement('button');
        checkBtn.className = "action-icon-btn check-btn";
        checkBtn.innerHTML = `
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.65 13.26">
                <polygon points="16.65 2.94 13.71 0 6.32 7.39 2.94 4 0 6.94 6.32 13.26 16.65 2.94"/>
            </svg>
        `;
        checkBtn.onclick = () => completeAssignment(task.id, row);
        checkCell.appendChild(checkBtn);

        const nameCell = document.createElement('td');
        nameCell.className = "col-name";
        if (task.link) {
            const a = document.createElement('a');
            a.href = task.link; a.target = "_blank"; a.textContent = task.name;
            nameCell.appendChild(a);
        } else {
            nameCell.textContent = task.name;
        }

        const dateCell = document.createElement('td');
        dateCell.className = "col-date";
        dateCell.textContent = formatDate(task.date);

        const actionCell = document.createElement('td');
        actionCell.className = "col-delete";
        const delBtn = document.createElement('button');
        delBtn.className = 'action-icon-btn delete-btn';
        delBtn.innerHTML = `
            <svg viewBox="0 0 16.65 16.65" xmlns="http://www.w3.org/2000/svg">
                <polygon class="del-icon" points="16.65 2.94 13.71 0 8.32 5.39 2.94 0 0 2.94 5.39 8.32 0 13.71 2.94 16.65 8.32 11.26 13.71 16.65 16.65 13.71 11.26 8.32 16.65 2.94"/>
            </svg>
        `;
        delBtn.onclick = () => deleteAssignment(task.id);
        actionCell.appendChild(delBtn);

        row.appendChild(checkCell);
        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

exportBtn.addEventListener('click', () => {
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(assignments));
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'assignments.json');
    link.click();
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data)) { assignments = data; saveAndRender(); }
        } catch (err) { alert("Error parsing JSON."); }
    };
    reader.readAsText(file);
});
