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

    // --- Core Functions ---

    /**
     * Loads assignments from Local Storage or returns an empty array.
     * Initializes dark mode setting.
     */
    function loadAssignments() {
        const storedAssignments = localStorage.getItem('assignments');
        // Initial state is dark mode, so we check if the stored value is explicitly 'false'
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';

        // Set initial dark mode state from storage or default to dark (checked=true)
        darkModeToggle.checked = isDarkMode;
        body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        // Initial check for grouping mode (default to off)
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
        let displayList = [...assignments]; // Create a copy for manipulation

        // 1. Sorting by Date (Primary requirement)
        displayList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // 2. Grouping Logic (If toggle is on)
        if (groupByClassToggle.checked) {
            const grouped = {};
            displayList.forEach(a => {
                const className = a.class.replace(' ', ''); // e.g., MATH1210
                if (!grouped[className]) {
                    grouped[className] = [];
                }
                grouped[className].push(a);
            });

            // Re-order by Class Group (MATH, PHYS, ECE)
            const classOrder = ['MATH 1210', 'PHYS 2210', 'ECE 1400'].map(c => c.replace(' ', ''));
            displayList = []; // Clear and rebuild
            classOrder.forEach(classNameKey => {
                if (grouped[classNameKey]) {
                    displayList.push(...grouped[classNameKey]);
                }
            });
        }


        // 3. Render Rows
        displayList.forEach(assignment => {
            const row = tableBody.insertRow();
            const classKey = assignment.class.split(' ')[0]; // MATH, PHYS, ECE

            // Apply color coding class
            row.classList.add(`row-${classKey}`);

            // Assignment Cell (Clickable link)
            const assignmentCell = row.insertCell(0);
            const assignmentElement = document.createElement('span');

            if (assignment.link) {
                const linkElement = document.createElement('a');
                linkElement.href = assignment.link;
                linkElement.target = '_blank'; // Open in new tab
                linkElement.textContent = `${assignment.class}: ${assignment.name}`;
                assignmentElement.appendChild(linkElement);
            } else {
                assignmentElement.textContent = `${assignment.class}: ${assignment.name}`;
            }
            assignmentCell.appendChild(assignmentElement);

            // Due Date Cell
            const dateCell = row.insertCell(1);
            dateCell.textContent = assignment.dueDate;
        });
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
        classDropdown.value = 'MATH 1210'; // Reset to first option
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
        renderAssignments(); // Re-render to apply grouping
    });

    // Export Data Button
    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(assignments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'assignment_tracker_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click(); // Programmatically click the link to trigger download
    });

    // Import Data Button
    importDataBtn.addEventListener('click', () => {
        // Programmatically click the hidden file input
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
                    // Overwrite current data with imported data
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

    // Initial render
    renderAssignments();
});
