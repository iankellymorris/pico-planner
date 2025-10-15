document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#assignmentsTable tbody');
    const classDropdown = document.getElementById('classDropdown');
    const assignmentNameInput = document.getElementById('assignmentName');
    const assignmentLinkInput = document.getElementById('assignmentLink');
    const dueDateInput = document.getElementById('dueDate');
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    // Removed groupByClassToggle and its functionality

    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const body = document.body;

    // Undo Constants
    const UNDO_HISTORY_LIMIT = 10;
    let undoHistory = []; 

    // Initialize assignments by loading them
    let assignments = loadAssignments();
    
    // --- Utility Functions ---

    /**
     * Formats a date string (YYYY-MM-DD) into DD MON YYYY format.
     */
    function formatDueDate(dateString) {
        if (!dateString) return '';
        // Use T00:00:00 to treat the date as midnight UTC, avoiding timezone shifts
        const date = new Date(dateString + 'T00:00:00'); 
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        
        let formattedDate = formatter.format(date).replace(',', '');
        const [month, day, year] = formattedDate.split('/');
        
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const shortMonth = monthNames[parseInt(month, 10) - 1];

        const paddedDay = day.length === 1 ? '0' + day : day;

        return `${paddedDay} ${shortMonth.toUpperCase()} ${year}`;
    }

    // --- State Management Functions ---
    
    function loadAssignments() {
        const storedAssignments = localStorage.getItem('assignments');
        // Default to dark mode if no setting is found
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';
        
        darkModeToggle.checked = isDarkMode;
        body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        // Ensure we return an array
        return storedAssignments ? JSON.parse(storedAssignments) : [];
    }

    function saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }

    function recordState() {
        // Only push if the current state is different from the last recorded state
        if (undoHistory.length > 0 && JSON.stringify(undoHistory[undoHistory.length - 1]) === JSON.stringify(assignments)) {
            return;
        }

        undoHistory.push(JSON.stringify(assignments)); 
        if (undoHistory.length > UNDO_HISTORY_LIMIT) {
            undoHistory.shift(); 
        }
    }
    
    function undoState() {
        if (undoHistory.length > 1) {
            // Remove the *current* state (the one we want to revert from)
            undoHistory.pop(); 
            
            // Load the * previous* state
            const previousState = undoHistory[undoHistory.length - 1];
            assignments = JSON.parse(previousState);
            saveAssignments();
            renderAssignments();
        }
    }

    // --- Core Rendering Functions ---
    
    function renderAssignments() {
        tableBody.innerHTML = '';
        let displayList = [...assignments];
        
        // 1. Sorting by Date (Primary requirement)
        // Ensure valid date objects are used for sorting
        displayList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        displayList.forEach((assignment) => {
            const row = tableBody.insertRow();
            const classKey = assignment.class.split(' ')[0];
            row.classList.add(`row-${classKey}`);

            // Assignment Cell 
            const assignmentCell = row.insertCell(0);
            if (assignment.link) {
                const linkElement = document.createElement('a');
                linkElement.href = assignment.link;
                linkElement.target = '_blank';
                linkElement.textContent = assignment.name; 
                assignmentCell.appendChild(linkElement);
            } else {
                assignmentCell.textContent = assignment.name; 
            }
            
            // Due Date Cell - Applying DD MON YYYY format
            const dateCell = row.insertCell(1);
            dateCell.textContent = formatDueDate(assignment.dueDate);
            
            // Delete Button Cell
            const deleteCell = row.insertCell(2);
            deleteCell.classList.add('delete-column');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.classList.add('delete-btn');
            // Ensure delete button is correctly linked to the delete function
            deleteBtn.addEventListener('click', () => deleteAssignment(assignment));
            deleteCell.appendChild(deleteBtn);
        });
        
        recordState();
    }

    function deleteAssignment(assignmentToDelete) {
        // Record state BEFORE deletion
        recordState(); 
        
        // Use a robust way to find the assignment to delete
        const index = assignments.findIndex(a => 
            a.class === assignmentToDelete.class && 
            a.name === assignmentToDelete.name && 
            a.dueDate === assignmentToDelete.dueDate
        );
        if (index > -1) {
            assignments.splice(index, 1);
            saveAssignments();
            renderAssignments();
        }
    }

    // --- Event Listeners ---

    addAssignmentBtn.addEventListener('click', () => {
        const className = classDropdown.value;
        const name = assignmentNameInput.value.trim();
        const link = assignmentLinkInput.value.trim();
        const dueDate = dueDateInput.value; // Store as YYYY-MM-DD

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

    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDark);
    });

    // Event listener for grouping toggle removed

    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(assignments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'assignment_tracker_data.json');
        linkElement.click();
    });

    importDataBtn.addEventListener('click', () => { importFileInput.click(); });
    
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
                    undoHistory = []; 
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
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoState();
        }
    });

    // Initial render
    renderAssignments();
});
