document.addEventListener("DOMContentLoaded", () => {
  // Initialize Tabulator
  const table = new Tabulator("#assignment-table", {
    layout: "fitColumns",
    columns: [
      { title: "Class", field: "class", width: 150 },
      { title: "Assignment", field: "assignment" },
      { title: "Due Date", field: "due" },
      { title: "Link", field: "link", formatter: "link" },
    ],
  });

  // Add assignment button
  document.getElementById("add-btn").addEventListener("click", () => {
    const newData = {
      class: document.getElementById("class-input").value,
      assignment: document.getElementById("assignment-input").value,
      due: document.getElementById("due-input").value,
      link: document.getElementById("link-input").value,
    };
    table.addRow(newData);
  });

  // Export button
  document.getElementById("export-btn").addEventListener("click", () => {
    table.download("json", "assignments.json");
  });

  // Import button
  document.getElementById("import-btn").addEventListener("click", () => {
    document.getElementById("import-file").click();
  });

  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      table.setData(data);
    };
    reader.readAsText(file);
  });

  // Toggle behavior (table width + title size)
  const toggle = document.getElementById("width-toggle");
  const tableContainer = document.querySelector(".table-container");
  const title = document.querySelector(".title-banner h1");

  function applyToggleState(isMobile) {
    if (isMobile) {
      tableContainer.classList.add("full-width");
      tableContainer.classList.remove("limited-width");
      title.style.fontSize = "var(--mobileTitleFontSize)";
    } else {
      tableContainer.classList.add("limited-width");
      tableContainer.classList.remove("full-width");
      title.style.fontSize = "var(--desktopTitleFontSize)";
    }
  }

  toggle.addEventListener("change", () => {
    applyToggleState(toggle.checked);
  });

  // Default to desktop mode
  applyToggleState(false);
});
