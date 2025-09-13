document.addEventListener("DOMContentLoaded", function () {
  const table = new Tabulator("#assignment-table", {
    layout: "fitColumns",
    columns: [
      { title: "Class", field: "class" },
      { title: "Assignment", field: "assignment" },
      { title: "Due Date", field: "due" },
      { title: "Link", field: "link", formatter: "link" }
    ],
  });

  const toggle = document.getElementById("table-toggle");
  const titleText = document.getElementById("title-text");

  // Toggle table width + title font size
  toggle.addEventListener("change", function () {
    const tableElement = document.getElementById("assignment-table");
    if (toggle.checked) {
      tableElement.style.width = "100%";
      titleText.style.fontSize = `calc(2.5rem * var(--mobileTitleScale))`;
    } else {
      tableElement.style.width = "80%";
      titleText.style.fontSize = "2.5rem";
    }
    table.redraw();
  });
});
