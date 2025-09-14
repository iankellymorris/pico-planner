document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assignmentForm');
    const assignmentsTableBody = document.querySelector('#assignmentsTable tbody');
    const viewToggle = document.getElementById('viewToggle');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const tableContainer = document.querySelector('.table-container');
    const title = document.querySelector('.title');

    let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    let isEditing = false;
    let editIndex = -1;
    let currentSortColumn = 'class';
    let sortDirection = 'asc';

    const renderTable = (data) => {
        assignmentsTableBody.innerHTML = '';
        if (data.length === 0) {
            assignmentsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No assignments added yet.</td></tr>';
            return;
        }
        
        // Group and sort data
        const groupedData = data.reduce((acc, assignment) => {
            (acc[assignment.class] = acc[assignment.class] || []).push(assignment);
            return acc;
        }, {});

        const sortedClasses = Object.keys(groupedData).sort();
        let groupCounter = 0;

        sortedClasses.forEach(className => {
            const classAssignments = groupedData[className].sort((a, b) => {
                if (a.dueDate < b.dueDate) return -1;
                if (a.dueDate > b.dueDate) return 1;
                return 0;
            });
            const rowClass = groupCounter % 2 === 0 ? 'row-group-even' : 'row-group-odd';
            groupCounter++;
            
            classAssignments.forEach(assignment => {
                const row = document.createElement('tr');
                row.className = rowClass;
                
                const linkHTML = assignment.link ? `<a href="${assignment.link}" target="_blank">${assignment.name}</a>` : assignment.name;
                
                row.innerHTML = `
                    <td>${assignment.class}</td>
                    <td>${linkHTML}</td>
                    <td>${assignment.dueDate}</td>
                    <td class="actions-cell">
                        <button class="edit-btn">✏️</button>
                        <button class="delete-btn">❌</button>
                    </td>
                `;

                assignmentsTableBody.appendChild(row);

                row.querySelector('.edit-btn').addEventListener('click', () => editAssignment(assignment));
                row.querySelector('.delete-btn').addEventListener('click', () => deleteAssignment(assignment));
            });
        });
    };

    const saveAssignments = () => {
        localStorage.setItem('assignments', JSON.stringify(assignments));
        renderTable(assignments);
    };

    const addOrUpdateAssignment = (e) => {
        e.preventDefault();
        const newAssignment = {
            class: document.getElementById('class').value,
            name: document.getElementById('name').value,
            dueDate: document.getElementById('dueDate').value,
            link: document.getElementById('link').value || null
        };

        if (isEditing) {
            assignments[editIndex] = newAssignment;
            isEditing = false;
            editIndex = -1;
            document.getElementById('addBtn').textContent = 'Add Assignment';
        } else {
            assignments.push(newAssignment);
        }
        
        form.reset();
        saveAssignments();
    };

    const editAssignment = (assignmentToEdit) => {
        const index = assignments.indexOf(assignmentToEdit);
        if (index > -1) {
            document.getElementById('class').value = assignmentToEdit.class;
            document.getElementById('name').value = assignmentToEdit.name;
            document.getElementById('dueDate').value = assignmentToEdit.dueDate;
            document.getElementById('link').value = assignmentToEdit.link || '';
            document.getElementById('addBtn').textContent = 'Update Assignment';
            isEditing = true;
            editIndex = index;
        }
    };

    const deleteAssignment = (assignmentToDelete) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            assignments = assignments.filter(a => a !== assignmentToDelete);
            saveAssignments();
        }
    };
    
    // Initial render
    renderTable(assignments);
    
    // Event Listeners
    form.addEventListener('submit', addOrUpdateAssignment);

    viewToggle.addEventListener('change', () => {
        if (viewToggle.checked) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    });

    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(assignments, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'assignments.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    assignments = importedData;
                    saveAssignments();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid JSON file format. Please import a JSON array.');
                }
            } catch (error) {
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
    });

    const sortTable = (column) => {
        if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            sortDirection = 'asc';
        }

        const sortedAssignments = [...assignments].sort((a, b) => {
            const valA = a[column];
            const valB = b[column];
            if (valA < valB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        renderTable(sortedAssignments);
    };

    document.querySelectorAll('#assignmentsTable th[data-sort]').forEach(header => {
        header.addEventListener('click', (e) => {
            sortTable(e.target.dataset.sort);
        });
    });
});
