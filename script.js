// everything from before is the same, only toggle logic changes

/* ------------------------
   Table-width toggle logic
   ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;

// initialize based on saved choice
function getCurrentTableWidth(){
  const val = getComputedStyle(root).getPropertyValue("--tableWidthPercent").trim();
  return val || "80%";
}
let current = getCurrentTableWidth();
toggleInput.checked = (current === "100%");

// listen for changes
toggleInput.addEventListener("change", () => {
  const newVal = toggleInput.checked ? "100%" : "80%";
  root.style.setProperty("--tableWidthPercent", newVal);
  try { localStorage.setItem("tableWidthChoice", newVal); } catch(e){}
});

// restore saved toggle state if present
try {
  const saved = localStorage.getItem("tableWidthChoice");
  if (saved) {
    root.style.setProperty("--tableWidthPercent", saved);
    toggleInput.checked = (saved === "100%");
  }
} catch(e){}
