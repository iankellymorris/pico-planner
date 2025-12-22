const addBtn = document.getElementById('addBtn');
const tableBody = document.querySelector('#assignmentTable tbody');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let undoStack = [];
const MAX_UNDO = 15;

renderTable();

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        undoDelete();
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

    const newAssignment = { 
        id: Date.now(), 
        className, 
        name, 
        link, 
        date 
    };
    
    assignments.push(newAssignment);
    saveAndRender();
    
    document.getElementById('assignmentName').value = '';
    document.getElementById('assignmentLink').value = '';
    document.getElementById('dueDate').value = '';
});

function deleteAssignment(id) {
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
        undoStack.push(assignments[index]);
        // Limit undo stack to 15 items
        if (undoStack.length > MAX_UNDO) {
            undoStack.shift();
        }
        assignments.splice(index, 1);
        saveAndRender();
    }
}

function undoDelete() {
    if (undoStack.length > 0) {
        const restoredAssignment = undoStack.pop();
        assignments.push(restoredAssignment);
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

        const nameCell = document.createElement('td');
        if (task.link) {
            const a = document.createElement('a');
            a.href = task.link;
            a.target = "_blank";
            a.textContent = task.name;
            nameCell.appendChild(a);
        } else {
            nameCell.textContent = task.name;
        }

        const dateCell = document.createElement('td');
        dateCell.textContent = task.date;

        const actionCell = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&#10005;';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteAssignment(task.id);
        actionCell.appendChild(delBtn);

        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(assignments);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'assignments.json');
    linkElement.click();
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                assignments = importedData;
                saveAndRender();
            }
        } catch (err) {
            alert("Error parsing JSON file.");
        }
    };
    reader.readAsText(file);
});
