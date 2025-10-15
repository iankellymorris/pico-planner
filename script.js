document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#assignmentsTable tbody');
    const classDropdown = document.getElementById('classDropdown');
    const assignmentNameInput = document.getElementById('assignmentName');
    const assignmentLinkInput = document.getElementById('assignmentLink');
    const dueDateInput = document.getElementById('dueDate');
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');

    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const body = document.body;

    // Undo Constants
    const UNDO_HISTORY_LIMIT = 10;
    let undoHistory = []; 

    let assignments = loadAssignments();
    
    // --- Utility Functions ---

    /**
     * Formats a date string (YYYY-MM-DD) into DD MON YYYY format.
     * FIX: Directly parses the YYYY-MM-DD string to reliably extract day/month/year.
     * @param {string} dateString - The date in YYYY-MM-DD format.
     * @returns {string} The date in DD MON YYYY format (e.g., 05 OCT 2025).
     */
    function formatDueDate(dateString) {
        if (!dateString) return '';
        
        const [year, month, day] = dateString.split('-');
        
        // Month is 1-indexed (1=Jan, 12=Dec)
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const shortMonth = monthNames[parseInt(month, 10) - 1];

        // Ensure leading zero on the day
        const paddedDay = day.padStart(2, '0');

        return `${paddedDay} ${shortMonth} ${year}`;
    }

    // --- State Management Functions ---
    
    function loadAssignments() {
        const storedAssignments = localStorage.getItem('assignments');
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
            undoHistory.pop(); 
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
        
        // 1. Sorting by Date 
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
            deleteBtn.addEventListener('click', () => deleteAssignment(assignment));
            deleteCell.appendChild(deleteBtn);
        });
        
        recordState();
    }

    function deleteAssignment(assignmentToDelete) {
        recordState(); 
        
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
        const dueDate = dueDateInput.value; // Stored as YYYY-MM-DD

        if (!name || !dueDate) {
            // New assignments were failing here because the subsequent renderAssignments failed
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
        renderAssignments(); // This now correctly renders the table

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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoState();
        }
    });

    // Initial render
    renderAssignments();
});
