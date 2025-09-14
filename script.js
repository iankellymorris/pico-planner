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
    even: getComputedStyle(document.documentElement).getPropertyValue('--PHYS-even-bg').trim(),
    odd: getComputedStyle(document.documentElement).getPropertyValue('--PHYS-odd-bg').trim(),
    header: getComputedStyle(document.documentElement).getPropertyValue('--PHYS-header-bg').trim()
  },
  ECE: {
    even: getComputedStyle(document.documentElement).getPropertyValue('--ECE-even-bg').trim(),
    odd: getComputedStyle(document.documentElement).getPropertyValue('--ECE-odd-bg').trim(),
    header: getComputedStyle(document.documentElement).getPropertyValue('--ECE-header-bg').trim()
  },
  MATH: {
    even: getComputedStyle(document.documentElement).getPropertyValue('--MATH-even-bg').trim(),
    odd: getComputedStyle(document.documentElement).getPropertyValue('--MATH-odd-bg').trim(),
    header: getComputedStyle(document.documentElement).getPropertyValue('--MATH-header-bg').trim()
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

  // Use the new CSS variables for colors
  let bg = "";
  if (cls === "PHYS 2210") bg = even ? getComputedStyle(document.documentElement).getPropertyValue('--PHYS-even-bg').trim() : getComputedStyle(document.documentElement).getPropertyValue('--PHYS-odd-bg').trim();
  if (cls === "ECE 1400") bg = even ? getComputedStyle(document.documentElement).getPropertyValue('--ECE-even-bg').trim() : getComputedStyle(document.documentElement).getPropertyValue('--ECE-odd-bg').trim();
  if (cls === "MATH 1210") bg = even ? getComputedStyle(document.documentElement).getPropertyValue('--MATH-even-bg').trim() : getComputedStyle(document.documentElement).getPropertyValue('--MATH-odd-bg').trim();
  
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
      bg = getComputedStyle(document.documentElement).getPropertyValue('--PHYS-header-bg').trim();
      fg = "#fff";
    }
    if (value === "ECE 1400") {
      bg = getComputedStyle(document.documentElement).getPropertyValue('--ECE-header-bg').trim();
      fg = "#fff";
    }
    if (value === "MATH 1210") {
      bg = getComputedStyle(document.documentElement).getPropertyValue('--MATH-header-bg').trim();
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
    Theme and Table-width toggle logic
    ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Initial state setup
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  toggleInput.checked = (savedTheme === 'dark');
  setTheme(savedTheme);
} else {
  // Default to light mode if no preference is saved
  setTheme('light');
  toggleInput.checked = false;
}

toggleInput.addEventListener("change", () => {
  const newTheme = toggleInput.checked ? "dark" : "light";
  setTheme(newTheme);
});

// Update table colors when the theme changes
const observer = new MutationObserver(() => {
  table.getRows().forEach(applyRowBackground);
  table.redraw(true); // Redraw the table to update header colors
});
observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
