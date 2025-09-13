/* ------------------------
   Table-width + font-size toggle logic
   ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleEl = document.querySelector(".title-banner h1");
const tableEl = document.querySelector(".table-container .tabulator");

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

  // update CSS var for table width
  root.style.setProperty("--tableWidthPercent", widthVal);

  // smooth font resize
  titleEl.style.fontSize = fontVal;

  // smooth table width transition
  if (tableEl) {
    tableEl.style.width = widthVal;
  }

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
