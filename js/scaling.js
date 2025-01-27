scaleP.value = scaleСoef * 100;
scale = document.getElementById("scale");

scale.onclick = function () {
  svgPanel.style.cursor = "zoom-in";
  scale_panel.style.display = "flex";
  if (currentObject != null) currentObject.removePanel();
  svgPanel.onmousedown = function (event) {
    svgPanel.style.transform = "translate(0, 0)";
    if (event.ctrlKey) {
      scaleСoef *= 4 / 5;
      shiftCoef = 1 / 5;
    } else {
      scaleСoef *= 5 / 4;
      shiftCoef = -1 / 4;
    }
    scaleСoef = Math.round(scaleСoef * 100) / 100;
    svgPanel.style.width = firstWidth * scaleСoef + "px";
    svgPanel.style.height = firstHeight * scaleСoef + "px";

    let shiftX = event.pageX - svgPanelCoords.left; //расстояние м/у курсором
    let shiftY = event.pageY - svgPanelCoords.top; //и границей холста

    svgPanelX = svgPanelCoords.left - scrollcoords.left; //svgPanel.style.top == svgPanelY
    svgPanelY = svgPanelCoords.top - scrollcoords.top;

    let left = svgPanelX + shiftX * shiftCoef + scrollPanel.scrollLeft;
    let top = svgPanelY + shiftY * shiftCoef + scrollPanel.scrollTop;
    if (left > 15) {
      svgPanel.style.left = left + "px";
    } else {
      svgPanel.style.left = "15px";
    }
    if (top > 15) {
      svgPanel.style.top = top + "px";
    } else {
      svgPanel.style.top = "15px";
    }
    svgPanelCoords = getCoords(svgPanel);
    updateRulers();
    scaleP.value = scaleСoef * 100;
  };
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && wasPressed == "scale") {
      svgPanel.style.cursor = "zoom-out";
    }
  });
  document.addEventListener("keyup", function (event) {
    if (event.key == "Control" && wasPressed == "scale") {
      svgPanel.style.cursor = "zoom-in";
    }
  });
};

scaleP.onchange = () => {
  let s = scaleP.value;
  if (s<1) {
    s = 1;
    scaleP.value = 1
  }
  scaleСoef = s / 100;
  updateScale();
}

function updateScale() {
  w = firstWidth * scaleСoef, h = firstHeight * scaleСoef;
  centralLocation(w, h);
  svgPanel.style.width = w + "px";
  svgPanel.style.height = h + "px";
  svgPanelCoords = getCoords(svgPanel);
  updateRulers();
}