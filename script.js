// Initialize Tabulator table
let table = new Tabulator("#assignment-table", {
  layout: "fitColumns",
  columns: [
    { title: "Class", field: "class", headerFilter: "input" },
    { title: "Assignment", field: "assignment", headerFilter: "input" },
    { title: "Due Date", field: "due", sorter: "date" },
    { title: "Link", field: "link", formatter: "link", formatterParams: { labelField: "link" } },
    {
      title: "Remove",
      formatter: "buttonCross",
      width: 100,
      hozAlign: "center",
      cellClick: function (e, cell) {
        cell.getRow().delete();
      },
    },
  ],
});

// Add assignment
document.getElementById("add-btn").addEventListener("click", function () {
  let cls = document.getElementById("class-input").value;
  let assignment = document.getElementById("assignment-input").value;
  let due = document.getElementById("due-input").value;
  let link = document.getElementById("link-input").value;

  if (assignment && due) {
    table.addRow({ class: cls, assignment: assignment, due: due, link: link });
    document.getElementById("assignment-input").value = "";
    document.getElementById("due-input").value = "";
    document.getElementById("link-input").value = "";
  }
});

// Export data
document.getElementById("export-btn").addEventListener("click", function () {
  table.download("json", "assignments.json");
});

// Import data
document.getElementById("import-btn").addEventListener("click", function () {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", function (e) {
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function (e) {
    let data = JSON.parse(e.target.result);
    table.setData(data);
  };
  reader.readAsText(file);
});
