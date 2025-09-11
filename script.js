// Initialize table
let table = new Tabulator("#assignment-table", {
  layout: "fitColumns",
  columns: [
    { title: "Class", field: "class", headerSort: true },
    { title: "Assignment", field: "assignment", headerSort: true },
    { title: "Due Date", field: "due", sorter: "date", headerSort: true },
    {
      title: "Link",
      field: "link",
      formatter: "link",
      formatterParams: { labelField: "link" },
      headerSort: false,
    },
    {
      title: "Remove",
      field: "remove",
      formatter: () => "✖",
      hozAlign: "center",
      width: 70,
      cellClick: (e, cell) => {
        cell.getRow().delete();
      },
      headerSort: false,
    },
  ],
});

// Add assignment button
document.getElementById("add-btn").addEventListener("click", () => {
  let cls = document.getElementById("class-input").value;
  let assignment = document.getElementById("assignment-input").value;
  let due = document.getElementById("due-input").value;
  let link = document.getElementById("link-input").value;

  if (assignment && due) {
    table.addRow({ class: cls, assignment, due, link });
    document.getElementById("assignment-input").value = "";
    document.getElementById("due-input").value = "";
    document.getElementById("link-input").value = "";
  }
});

// Export data
document.getElementById("export-btn").addEventListener("click", () => {
  let data = table.getData();
  let blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "assignments.json";
  a.click();

  URL.revokeObjectURL(url);
});

// Import data
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (event) => {
  let file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = (e) => {
    let importedData = JSON.parse(e.target.result);
    table.setData(importedData);
  };
  reader.readAsText(file);
});
