const toggleInput = document.getElementById("table-toggle");
const root = document.documentElement;
const titleEl = document.querySelector(".title-banner h1");

function getCurrentTableWidth(){
  const val = getComputedStyle(root).getPropertyValue("--tableWidthPercent").trim();
  return val || "80%";
}
toggleInput.checked = (getCurrentTableWidth() === "100%");

function applyToggleState(isMobile){
  const widthVal = isMobile ? "100%" : "80%";
  const fontVal = isMobile
    ? getComputedStyle(root).getPropertyValue("--titleFontSizeMobile").trim()
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
