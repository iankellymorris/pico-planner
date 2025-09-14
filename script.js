document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element and Variable Initialization ---
    const assignmentForm = document.getElementById('assignment-form');
    const classSelect = document.getElementById('class-select');
    const assignmentNameInput = document.getElementById('assignment-name');
    const assignmentLinkInput = document.getElementById('assignment-link');
    const dueDateInput = document.getElementById('due-date');
    const widthToggle = document.getElementById('width-toggle');
    const titleElement = document.querySelector('.title');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');

    // --- Tabulator Table Setup ---
    let table = new Tabulator("#assignment-table", {
        layout: "fitColumns",
        history: true,
        data: [], // Initial empty data, will be loaded from localStorage
        groupBy: "class",
        groupHeader: function(value, count, data, group){
            return value;
        },
        columns: [
            {
                title: "Class", 
                field: "class", 
                width: 150, 
                sorter: "string", 
                headerFilter: true, 
                editor: "select", 
                editorParams: {
                    values: ["MATH 1210", "PHYS 2210", "ECE 1400"]
                }
            },
            {
                title: "Assignment", 
                field: "assignment", 
                sorter: "string", 
                formatter: function(cell, formatterParams, onRendered) {
                    const link = cell.getRow().getData().link;
                    const value = cell.getValue();
                    if (link) {
                        return `<a href="${link}" target="_blank" style="color: blue; text-decoration: underline;">${value}</a>`;
                    }
                    return value;
                },
                editor: true
            },
            {
                title: "Due Date", 
                field: "dueDate", 
                width: 120, 
                sorter: "date", 
                formatter: "datetime", 
                formatterParams: {
                    inputFormat: "YYYY-MM-DD",
                    outputFormat: "MM/DD/YYYY"
                },
                editor: "date",
                editorParams: {
                    format: "YYYY-MM-DD"
                }
            },
            {
                title: "Link", 
                field: "link", 
                visible: false,
                editor: true
            },
            {
                formatter: "buttonCross",
                width: 40,
                align: "center",
                cellClick: function(e, cell) {
                    cell.getRow().delete();
                },
                cssClass: "delete-cell"
            }
        ],
        rowDeleted: function(row) {
            saveData();
        },
        cellEdited: function(cell) {
            saveData();
        }
    });

    // --- Local Storage Management ---
    const saveData = () => {
        localStorage.setItem('assignments', JSON.stringify(table.getData()));
    };

    const loadData = () => {
        const storedData = localStorage.getItem('assignments');
        if (storedData) {
            table.setData(JSON.parse(storedData));
        }
    };

    // --- Event Listeners ---
    assignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newAssignment = {
            class: classSelect.value,
            assignment: assignmentNameInput.value,
            link: assignmentLinkInput.value,
            dueDate: dueDateInput.value,
            id: Date.now() // Unique ID for each row
        };

        table.addData([newAssignment], false);
        saveData();

        // Clear the form fields
        assignmentNameInput.value = '';
        assignmentLinkInput.value = '';
        dueDateInput.value = '';
    });

    widthToggle.addEventListener('change', (e) => {
        const tableElement = document.getElementById('assignment-table');
        const root = document.documentElement;

        if (e.target.checked) {
            // Full width mode
            root.style.setProperty('--tableWidthPercent', '100%');
            root.style.setProperty('--currentTitleFontSize', 'var(--mobileTitleFontSize)');
            tableElement.style.removeProperty('margin-right');
            document.querySelector('.data-buttons-container').style.alignSelf = 'center';
            document.querySelector('.data-buttons-container').style.marginRight = '0';
        } else {
            // Compact mode
            root.style.setProperty('--tableWidthPercent', '80%');
            root.style.setProperty('--currentTitleFontSize', 'var(--desktopTitleFontSize)');
            document.querySelector('.data-buttons-container').style.alignSelf = 'flex-end';
            document.querySelector('.data-buttons-container').style.marginRight = 'calc(100% - var(--tableWidthPercent) - var(--tableRightEdgePadding))';
        }

        table.redraw(true); // Redraw the table to adjust to new width
    });

    // --- Export/Import Functionality ---
    exportDataBtn.addEventListener('click', () => {
        table.download("json", "assignments.json");
    });

    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    table.setData(importedData);
                    saveData();
                } catch (error) {
                    alert("Invalid JSON file. Please ensure the file is in the correct format.");
                    console.error("Error importing file:", error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Initial load of data when the page loads
    loadData();
});
