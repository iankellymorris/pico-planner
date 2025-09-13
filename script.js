/* ------------------------
   Table-width + font-size toggle logic
   ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleEl = document.querySelector(".title-banner h1");

function getCurrentTableWidth(){
  const val = getComputedStyle(root).getPropertyValue("--tableWidthPercent").trim();
  return val || "80%";
}
let current = getCurrentTableWidth();
toggleInput.checked = (current === "100%");

function applyToggleState(isMobile){
  const widthVal = isMobile ? "100%" : "80%";
  const fontVal = isMobile ? getComputedStyle(root).getPropertyValue("--titleFontSizeMobile").trim() 
                           : getComputedStyle(root).getPropertyValue("--titleFontSizeDesktop").trim();

  root.style.setProperty("--tableWidthPercent", widthVal);
  titleEl.style.fontSize = fontVal;

  try { localStorage.setItem("tableWidthChoice", widthVal); } catch(e){}
}

toggleInput.addEventListener("change", () => {
  applyToggleState(toggleInput.checked);
});

// restore saved state
try {
  const saved = localStorage.getItem("tableWidthChoice");
  if (saved) {
    const isMobile = (saved === "100%");
    toggleInput.checked = isMobile;
    applyToggleState(isMobile);
  } else {
    applyToggleState(toggleInput.checked);
  }
} catch(e){
  applyToggleState(toggleInput.checked);
}


/* ------------------------
   Tabulator setup
   ------------------------ */
const table = new Tabulator("#assignment-table", {
  layout: "fitColumns",
  responsiveLayout: "collapse",
  columns: [
    { title: "Class", field: "class", widthGrow: 1 },
    { title: "Assignment", field: "assignment", widthGrow: 3 },
    { title: "Due Date", field: "due", widthGrow: 1 },
    { title: "Link", field: "link", formatter: "link", widthGrow: 2 },
    {
      title: "Delete",
      formatter: function(){
        return "<span class='delete-btn'>✕</span>";
      },
      width: 70,
      hozAlign: "center",
      headerSort: false
    }
  ]
});

// handle adding assignments
document.getElementById("add-btn").addEventListener("click", () => {
  const classVal = document.getElementById("class-input").value;
  const assignmentVal = document.getElementById("assignment-input").value;
  const dueVal = document.getElementById("due-input").value;
  const linkVal = document.getElementById("link-input").value;

  if (assignmentVal.trim() !== "") {
    table.addRow({ class: classVal, assignment: assignmentVal, due: dueVal, link: linkVal });
    document.getElementById("assignment-input").value = "";
    document.getElementById("due-input").value = "";
    document.getElementById("link-input").value = "";
  }
});

// delete row handler
document.getElementById("assignment-table").addEventListener("click", e => {
  if (e.target.classList.contains("delete-btn")) {
    const row = Tabulator.findTable("#assignment-table")[0].getRowFromElement(e.target.closest(".tabulator-row"));
    row.delete();
  }
});

// export data
document.getElementById("export-btn").addEventListener("click", () => {
  const data = table.getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assignments.json";
  a.click();
  URL.revokeObjectURL(url);
});

// import data
document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const importedData = JSON.parse(ev.target.result);
      table.setData(importedData);
    } catch(err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
});
