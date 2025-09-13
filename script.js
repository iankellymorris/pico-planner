// Initialize Tabulator
let table = new Tabulator("#assignment-table", {
  layout: "fitColumns",
  columns: [
    { title: "Class", field: "class", headerSort: false },
    { title: "Assignment", field: "assignment", headerSort: false },
    { title: "Due Date", field: "dueDate", headerSort: false },
    { title: "Link", field: "link", formatter: "link", headerSort: false },
    {
      title: "Delete",
      formatter: function () {
        return "<span class='delete-btn'>×</span>";
      },
      width: 80,
      hozAlign: "center",
      headerSort: false
    }
  ],
});

// Add assignment
document.getElementById("add-btn").addEventListener("click", function () {
  let cls = document.getElementById("class-input").value;
  let assignment = document.getElementById("assignment-input").value;
  let dueDate = document.getElementById("due-input").value;
  let link = document.getElementById("link-input").value;

  if (assignment.trim() !== "") {
    table.addRow({ class: cls, assignment, dueDate, link });
    document.getElementById("assignment-input").value = "";
    document.getElementById("due-input").value = "";
    document.getElementById("link-input").value = "";
  }
});

// Delete assignment
document
  .getElementById("assignment-table")
  .addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
      let row = Tabulator.prototype.findTable("#assignment-table")[0].getRowFromElement(e.target.closest(".tabulator-row"));
      row.delete();
    }
  });

// Export data
document.getElementById("export-btn").addEventListener("click", function () {
  let data = table.getData();
  let blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "assignments.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

// Toggle table width + font size (desktop ↔ mobile)
const toggle = document.getElementById("modeToggle");
const tableContainer = document.querySelector(".table-container");

toggle.addEventListener("change", function () {
  if (toggle.checked) {
    // Mobile mode
    document.documentElement.style.setProperty("--tableWidthPercent", "100%");
    tableContainer.classList.add("mobile");
  } else {
    // Desktop mode
    document.documentElement.style.setProperty("--tableWidthPercent", "80%");
    tableContainer.classList.remove("mobile");
  }
});
