// Grab toggle
const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleEl = document.querySelector(".title-banner h1");

function applyToggleState(isMobile){
  const widthVal = isMobile ? "100%" : "80%";
  const fontVal = isMobile 
    ? getComputedStyle(root).getPropertyValue("--titleFontSizeMobile").trim() 
    : getComputedStyle(root).getPropertyValue("--titleFontSizeDesktop").trim();

  root.style.setProperty("--tableWidthPercent", widthVal);
  titleEl.style.fontSize = fontVal;

  try { localStorage.setItem("tableWidthChoice", widthVal); } catch(e){}
}

// Load saved preference or set default
let saved = null;
try {
  saved = localStorage.getItem("tableWidthChoice");
} catch(e){}

if (saved) {
  const isMobile = (saved === "100%");
  toggleInput.checked = isMobile;
  applyToggleState(isMobile);
} else {
  toggleInput.checked = false; // desktop default
  applyToggleState(false);
}

// Listen for toggle
toggleInput.addEventListener("change", () => {
  applyToggleState(toggleInput.checked);
});
