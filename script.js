function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const COLORS = {
  PHYS: {
    even: "#dbe7f8",
    odd: "#edf4fc",
    header: "#5b78b0"
  },
  ECE: {
    even: "#f8dbdb",
    odd: "#fceeee",
    header: "#b04b4b"
  },
  MATH: {
    even: "#faf3d1",
    odd: "#fffceb",
    header: "#FFB400"
  }
};

function parseISODateSafe(str) {
  if (!str) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function formatDueDateISOToDDMONYYYY(iso) {
  const d = parseISODateSafe(iso);
  if (!d) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return String(d.getDate()).padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear();
}

let savedData = JSON.parse(localStorage.getItem("assignments")) || [
  {
    class: "MATH 1210",
    assignment: "HW 1",
    due: "2025-09-01",
    link: ""
  },
  {
    class: "PHYS 2210",
    assignment: "Lab 1",
    due: "2025-09-03",
    link: ""
  },
  {
    class: "ECE 1400",
    assignment: "Project Proposal",
    due: "2025-09-05",
    link: ""
  }
];

function applyRowBackground(row) {
  const cls = row.getData().class;
  const rows = table.getRows().filter(r => r.getData().class === cls);
  const idx = rows.indexOf(row);
  const even = idx % 2 === 0;
  let bg = "";
  if (cls === "PHYS 2210") bg = even ? COLORS.PHYS.even : COLORS.PHYS.odd;
  if (cls === "ECE 1400") bg = even ? COLORS.ECE.even : COLORS.ECE.odd;
  if (cls === "MATH 1210") bg = even ? COLORS.MATH.even : COLORS.MATH.odd;
  row.getElement().querySelectorAll(".tabulator-cell").forEach(c => c.style.background = bg);
}

function assignmentFormatter(cell) {
  const data = cell.getRow().getData();
  return data.link ? `<a href="${escapeHtml(data.link)}" target="_blank">${escapeHtml(cell.getValue())}</a>` : escapeHtml(cell.getValue());
}

function dueFormatter(cell) {
  return formatDueDateISOToDDMONYYYY(cell.getValue());
}

function deleteFormatter() {
  return "<span class='delete-btn'>&times;</span>";
}

const table = new Tabulator("#assignment-table", {
  data: savedData,
  layout: "fitColumns",
  reactiveData: true,
  groupBy: "class",
  groupStartOpen: true,
  groupHeader: function(value) {
    let bg = "#ddd",
      fg = "#fff";
    if (value === "PHYS 2210") {
      bg = COLORS.PHYS.header;
      fg = "#fff";
    }
    if (value === "ECE 1400") {
      bg = COLORS.ECE.header;
      fg = "#fff";
    }
    if (value === "MATH 1210") {
      bg = COLORS.MATH.header;
      fg = "#fff";
    }
    return `<div style="background:${bg};color:${fg};padding:6px 10px;border-radius:6px;font-weight:bold;">${value}</div>`;
  },
  columns: [
    {
      title: "Class",
      field: "class",
      visible: false
    },
    {
      title: "Assignment",
      field: "assignment",
      editor: "input",
      formatter: assignmentFormatter
    },
    {
      title: "Due Date",
      field: "due",
      sorter: (a, b) => parseISODateSafe(a) - parseISODateSafe(b),
      editor: "date",
      formatter: dueFormatter
    },
    {
      title: "Link",
      field: "link",
      visible: false
    },
    {
      title: "",
      field: "delete",
      width: 40,
      hozAlign: "center",
      headerSort: false,
      formatter: deleteFormatter,
      cellClick: (e, cell) => {
        cell.getRow().delete();
        saveData();
      }
    }
  ],
  rowFormatter: applyRowBackground,
  renderComplete: function() {
    this.getRows().forEach(applyRowBackground);
  },
  cellEdited: function(cell) {
    saveData();
    applyRowBackground(cell.getRow());
  }
});

function saveData() {
  localStorage.setItem("assignments", JSON.stringify(table.getData()));
}

document.getElementById("add-btn").addEventListener("click", () => {
  const newRow = {
    class: document.getElementById("class-input").value,
    assignment: document.getElementById("assignment-input").value,
    due: document.getElementById("due-input").value,
    link: document.getElementById("link-input").value
  };
  table.addRow(newRow).then(row => {
    saveData();
    applyRowBackground(row);
  });
  document.getElementById("assignment-input").value = "";
  document.getElementById("due-input").value = "";
  document.getElementById("link-input").value = "";
});

document.getElementById("export-btn").addEventListener("click", () => {
  const dataStr = JSON.stringify(table.getData(), null, 2);
  const blob = new Blob([dataStr], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assignments.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      table.replaceData(imported);
      saveData();
    } catch {
      alert("Invalid file format. Please select a valid JSON export.");
    }
  };
  reader.readAsText(file);
});

/* ------------------------
   Table-width & Title-size toggle logic
   ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleElement = document.querySelector(".title-banner h1");

function setDisplayMode(mode) {
  const tableWidth = (mode === "compact") ? "100%" : "80%";
  const titleSize = (mode === "compact") ? "var(--mobileTitleFontSize)" : "var(--desktopTitleFontSize)";
  root.style.setProperty("--tableWidthPercent", tableWidth);
  titleElement.style.fontSize = titleSize;
  try {
    localStorage.setItem("displayMode", mode);
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Initial state setup
const savedMode = localStorage.getItem("displayMode");
if (savedMode) {
  toggleInput.checked = (savedMode === "compact");
  setDisplayMode(savedMode);
} else {
  // Default to full mode if no preference is saved
  setDisplayMode("full");
  toggleInput.checked = false;
}

toggleInput.addEventListener("change", () => {
  const newMode = toggleInput.checked ? "compact" : "full";
  setDisplayMode(newMode);
});
