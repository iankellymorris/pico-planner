document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const toggleInput = document.getElementById("table-toggle");
  const titleEl = document.querySelector(".title-banner h1");

  const cssVar = (name, fallback="") => getComputedStyle(root).getPropertyValue(name) || fallback;

  // Saved table width preference
  const savedWidth = (() => {
    try { return localStorage.getItem("tableWidthChoice"); } catch(e) { return null; }
  })();

  function applyWidthChoice(useMobile){
    const widthVal = useMobile ? cssVar("--tableMobileWidthPercent","100%").trim() : cssVar("--tableWidthPercent","80%").trim();
    root.style.setProperty("--tableWidthPercent", widthVal);
    const tSize = useMobile ? cssVar("--titleFontSizeMobile").trim() : cssVar("--titleFontSizeDesktop").trim();
    titleEl.style.fontSize = tSize;
    try { localStorage.setItem("tableWidthChoice", widthVal); } catch(e){}
  }

  if (savedWidth) {
    const useMobile = savedWidth.indexOf("100") !== -1 || savedWidth === "100%";
    toggleInput.checked = useMobile;
    applyWidthChoice(useMobile);
  } else {
    toggleInput.checked = false;
    applyWidthChoice(false);
  }

  toggleInput.addEventListener("change", () => applyWidthChoice(toggleInput.checked));

  // --- Tabulator setup ---
  function escapeHtml(str){
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const COLORS = {
    PHYS: { even: "#dbe7f8", odd: "#edf4fc", header: cssVar("--coursePhysHeader","#5b78b0") },
    ECE:  { even: "#f8dbdb", odd: "#fceeee", header: cssVar("--courseECEHeader","#b04b4b") },
    MATH: { even: cssVar("--tableMathOdd","#faf3d1"), odd: cssVar("--tableMathEven","#fffceb"), header: cssVar("--courseMathHeader","#FFB400") }
  };

  function parseISODateSafe(str){
    if (!str) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (!m) return null;
    return new Date(+m[1], +m[2]-1, +m[3]);
  }
  function formatDueDateISOToDDMONYYYY(iso){
    const d = parseISODateSafe(iso);
    if (!d) return "";
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return String(d.getDate()).padStart(2,"0") + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  let savedData = JSON.parse(localStorage.getItem("assignments") || "null") || [
    { class: "MATH 1210", assignment: "HW 1", due: "2025-09-01", link: "" },
    { class: "PHYS 2210", assignment: "Lab 1", due: "2025-09-03", link: "" },
    { class: "ECE 1400", assignment: "Project Proposal", due: "2025-09-05", link: "" }
  ];

  function applyRowBackground(row){
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

  function assignmentFormatter(cell){
    const data = cell.getRow().getData();
    const val = escapeHtml(cell.getValue());
    return data.link ? `<a href="${escapeHtml(data.link)}" target="_blank" rel="noopener noreferrer">${val}</a>` : val;
  }

  function dueFormatter(cell){
    return formatDueDateISOToDDMONYYYY(cell.getValue());
  }

  function deleteFormatter(){
    return `<div class="delete-btn">&times;</div>`;
  }

  const table = new Tabulator("#assignment-table", {
    data: savedData,
    layout: "fitColumns",
    reactiveData: true,
    groupBy: "class",
    groupStartOpen: true,
    groupHeader: function(value){
      let bg = "#ddd", fg = "#fff";
      if (value === "PHYS 2210"){ bg = COLORS.PHYS.header; fg = "#fff"; }
      if (value === "ECE 1400"){ bg = COLORS.ECE.header; fg = "#fff"; }
      if (value === "MATH 1210"){ bg = COLORS.MATH.header; fg = "#fff"; }
      return `<div style="background:${bg};color:${fg};padding:6px 10px;border-radius:6px;font-weight:bold;">${value}</div>`;
    },
    columns:[
      { title:"Class", field:"class", visible:false },
      { title:"Assignment", field:"assignment", editor:"input", formatter:assignmentFormatter },
      { title:"Due Date", field:"due", sorter:(a,b)=> (parseISODateSafe(a)||0) - (parseISODateSafe(b)||0), editor:"date", formatter:dueFormatter },
      { title:"Link", field:"link", visible:false },
      {
        title:"",
        field:"delete",
        width:40,
        hozAlign:"center",
        headerSort:false,
        formatter:deleteFormatter,
        cellClick:function(e,cell){
          cell.getRow().delete();
          saveData();
        }
      }
    ],
    rowFormatter: applyRowBackground,
    renderComplete:function(){ this.getRows().forEach(applyRowBackground); },
    cellEdited:function(cell){ saveData(); applyRowBackground(cell.getRow()); }
  });

  function saveData(){ try { localStorage.setItem("assignments", JSON.stringify(table.getData())); } catch(e){ console.error(e); } }

  document.getElementById("add-btn").addEventListener("click", () => {
    const newRow = {
      class: document.getElementById("class-input").value,
      assignment: document.getElementById("assignment-input").value.trim(),
      due: document.getElementById("due-input").value,
      link: document.getElementById("link-input").value.trim()
    };
    table.addRow(newRow).then(row=>{
      saveData();
      applyRowBackground(row);
    });
    document
