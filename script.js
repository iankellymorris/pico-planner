document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#assignmentsTable tbody');
    const classDropdown = document.getElementById('classDropdown');
    const assignmentNameInput = document.getElementById('assignmentName');
    const assignmentLinkInput = document.getElementById('assignmentLink');
    const dueDateInput = document.getElementById('dueDate');
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const groupByClassToggle = document.getElementById('groupByClassToggle');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const body = document.body;

    let assignments = loadAssignments();
    let deletedAssignment = null; // Cache for the last deleted assignment

    // --- Core Functions ---

    /**
     * Loads assignments from Local Storage and initializes settings.
     */
    function loadAssignments() {
        const storedAssignments = localStorage.getItem('assignments');
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';

        darkModeToggle.checked = isDarkMode;
        body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        groupByClassToggle.checked = localStorage.getItem('groupByClass') === 'true';

        return storedAssignments ? JSON.parse(storedAssignments) : [];
    }

    /**
     * Saves the current assignments array to Local Storage.
     */
    function saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }

    /**
     * Renders the assignments into the table, applying sorting and grouping.
     */
    function renderAssignments() {
        tableBody.innerHTML = '';
        let displayList = [...assignments];

        // 1. Sorting by Date
        displayList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // 2. Grouping Logic
        if (groupByClassToggle.checked) {
            const grouped = {};
            displayList.forEach(a => {
                const className = a.class.replace(' ', '');
                if (!grouped[className]) {
                    grouped[className] = [];
                }
                grouped[className].push(a);
            });

            const classOrder = ['MATH 1210', 'PHYS 2210', 'ECE 1400'].map(c => c.replace(' ', ''));
            displayList = [];
            classOrder.forEach(classNameKey => {
                if (grouped[classNameKey]) {
                    displayList.push(...grouped[classNameKey]);
                }
            });
        }


        // 3. Render Rows
        displayList.forEach((assignment, index) => {
            const row = tableBody.insertRow();
            const classKey = assignment.class.split(' ')[0];

            row.classList.add(`row-${classKey}`);
            // Store the original index for identification during deletion
            row.dataset.index = index; 

            // Assignment Cell (Clickable link, no class title)
            const assignmentCell = row.insertCell(0);
            
            if (assignment.link) {
                const linkElement = document.createElement('a');
                linkElement.href = assignment.link;
                linkElement.target = '_blank';
                linkElement.textContent = assignment.name; // No class title
                assignmentCell.appendChild(linkElement);
            } else {
                assignmentCell.textContent = assignment.name; // No class title
            }
            
            // Due Date Cell
            const dateCell = row.insertCell(1);
            dateCell.textContent = assignment.dueDate;
            
            // Delete Button Cell
            const deleteCell = row.insertCell(2);
            deleteCell.classList.add('delete-column');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.classList.add('delete-btn');
            
            // Attach delete handler
            deleteBtn.addEventListener('click', () => deleteAssignment(assignment));
            deleteCell.appendChild(deleteBtn);
        });
    }

    /**
     * Finds and removes an assignment from the array.
     * Caches the deleted item for undo functionality.
     * @param {object} assignmentToDelete - The assignment object to remove.
     */
    function deleteAssignment(assignmentToDelete) {
        const index = assignments.findIndex(a => 
            a.class === assignmentToDelete.class && 
            a.name === assignmentToDelete.name && 
            a.dueDate === assignmentToDelete.dueDate
        );

        if (index > -1) {
            // Remove the assignment and cache it
            deletedAssignment = assignments.splice(index, 1)[0];
            saveAssignments();
            renderAssignments();
        }
    }

    /**
     * Restores the last deleted assignment if it exists.
     */
    function undoDelete() {
        if (deletedAssignment) {
            assignments.push(deletedAssignment);
            deletedAssignment = null; // Clear the cache
            saveAssignments();
            renderAssignments();
            // A visual confirmation (like a temporary notification) could be added here
        }
    }


    // --- Event Listeners ---

    // Add Assignment Button
    addAssignmentBtn.addEventListener('click', () => {
        const className = classDropdown.value;
        const name = assignmentNameInput.value.trim();
        const link = assignmentLinkInput.value.trim();
        const dueDate = dueDateInput.value;

        if (!name || !dueDate) {
            alert('Please enter an assignment name and a due date.');
            return;
        }

        const newAssignment = {
            class: className,
            name: name,
            link: link,
            dueDate: dueDate,
        };

        assignments.push(newAssignment);
        saveAssignments();
        renderAssignments();

        // Clear form
        assignmentNameInput.value = '';
        assignmentLinkInput.value = '';
        dueDateInput.value = '';
        classDropdown.value = 'MATH 1210';
    });

    // Dark/Light Mode Toggle
    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDark);
    });

    // Group by Class Toggle
    groupByClassToggle.addEventListener('change', () => {
        localStorage.setItem('groupByClass', groupByClassToggle.checked);
        renderAssignments();
    });

    // Export Data Button
    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(assignments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'assignment_tracker_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });

    // Import Data Button
    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    // Import File Handler
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    assignments = importedData;
                    saveAssignments();
                    renderAssignments();
                    alert('Data imported successfully!');
                } else {
                    alert('Import failed: File content is not a valid assignment list.');
                }
            } catch (error) {
                alert('Import failed: Could not parse JSON file.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    });

    // Global Keyboard Listener for Ctrl+Z (Undo)
    document.addEventListener('keydown', (e) => {
        // Check for Ctrl (or Cmd on Mac) and 'Z' key
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault(); // Prevent browser default undo
            undoDelete();
        }
    });

    // Initial render
    renderAssignments();
});
