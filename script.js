document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('assignment-table');
    const assignmentForm = document.getElementById('assignment-form');
    const classInput = document.getElementById('class-input');
    const assignmentInput = document.getElementById('assignment-input');
    const dueDateInput = document.getElementById('due-date-input');
    const linkInput = document.getElementById('link-input');
    const modeToggle = document.getElementById('mode-toggle');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importDataInput = document.getElementById('import-data-input');
    
    let table;

    // Load data from local storage
    const loadData = () => {
        const data = localStorage.getItem('assignments');
        return data ? JSON.parse(data) : [];
    };

    // Save data to local storage
    const saveData = (data) => {
        localStorage.setItem('assignments', JSON.stringify(data));
    };

    // Initialize the Tabulator table
    const initializeTable = () => {
        const initialData = loadData();
        
        table = new Tabulator(tableContainer, {
            data: initialData,
            layout: "fitColumns",
            groupHeader: (value, count, data) => `${value} <span style="color:#fff; margin-left:10px; font-weight:normal;">(${count} Assignments)</span>`,
            group: "class",
            groupToggleElement: "header",
            columns: [
                { title: "Class", field: "class", visible: false },
                {
                    title: "Assignment",
                    field: "assignment",
                    formatter: (cell, formatterParams, onRendered) => {
                        const data = cell.getRow().getData();
                        if (data.link) {
                            return `<a href="${data.link}" target="_blank" style="color: #4b2e83; text-decoration: none;">${data.assignment}</a>`;
                        }
                        return data.assignment;
                    }
                },
                {
                    title: "Due Date",
                    field: "dueDate",
                    sorter: "date",
                    formatter: (cell) => {
                        const date = new Date(cell.getValue());
                        return isNaN(date) ? "" : date.toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        }).toUpperCase().replace(/\./g, '');
                    }
                },
                {
                    title: "Delete",
                    field: "delete",
                    formatter: () => `<span class="delete-btn">❌</span>`,
                    width: 50,
                    hozAlign: "center",
                    cellClick: (e, cell) => {
                        cell.getRow().delete();
                    }
                },
            ],
            rowDeleted: (row) => {
                saveData(table.getData());
            },
            dataLoaded: (data) => {
                saveData(data);
            }
        });
    };

    // Handle form submission
    assignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAssignment = {
            class: classInput.value,
            assignment: assignmentInput.value,
            dueDate: dueDateInput.value,
            link: linkInput.value || null,
        };
        table.addData([newAssignment], true);
        saveData(table.getData());
        assignmentForm.reset();
    });

    // Handle toggle switch
    modeToggle.addEventListener('change', () => {
        document.body.classList.toggle('mobile-mode', modeToggle.checked);
    });

    // Handle export button
    exportDataBtn.addEventListener('click', () => {
        table.download("json", "assignments.json");
    });

    // Handle import button
    importDataBtn.addEventListener('click', () => {
        importDataInput.click();
    });

    importDataInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                table.setData(importedData);
                saveData(importedData);
                alert("Data imported successfully!");
            } catch (error) {
                alert("Failed to import data. Please ensure the file is a valid JSON.");
                console.error("Import error:", error);
            }
        };
        reader.readAsText(file);
    });
    
    // Initialize the table when the page loads
    initializeTable();
});
