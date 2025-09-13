/* ------------------------
   Table-width + font-size toggle logic
   ------------------------ */
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleEl = document.querySelector(".title-banner h1");

function applyToggleState(isMobile){
  const widthVal = isMobile ? "100%" : "80%";
  const fontVal = isMobile 
    ? getComputedStyle(root).getPropertyValue("--titleFontSizeMobile").trim() 
    : getComputedStyle(root).getPropertyValue("--titleFontSizeDesktop").trim();

  // update CSS vars directly
  root.style.setProperty("--tableWidthPercent", widthVal);
  titleEl.style.fontSize = fontVal;

  try { localStorage.setItem("tableWidthChoice", widthVal); } catch(e){}
}

// Always make sure we start with a defined value
let saved = null;
try {
  saved = localStorage.getItem("tableWidthChoice");
} catch(e){}

if (saved) {
  const isMobile = (saved === "100%");
  toggleInput.checked = isMobile;
  applyToggleState(isMobile);
} else {
  // default to desktop (80%)
  toggleInput.checked = false;
  applyToggleState(false);
}

// listen for user toggling
toggleInput.addEventListener("change", () => {
  applyToggleState(toggleInput.checked);
});
