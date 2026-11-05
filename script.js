let topLayer = 1;
let gapX = 0;
let gapY = 0;

function bringToFront(windowBox) {
    topLayer++;
    windowBox.style.zIndex = topLayer;
}

const icons = document.querySelectorAll(".app-icon");
for (const icon of icons) {
    console.log(icon.dataset.window);
    icon.addEventListener("click", function () {
        const windowBox = document.getElementById(icon.dataset.window);
        windowBox.hidden = false;
        bringToFront(windowBox);
    });
}

const closeButtons = document.querySelectorAll(".close-button");
for (const button of closeButtons) {
    button.addEventListener("click", function () {
        const windowBox = button.closest(".window");
        windowBox.hidden = true;
    });
}

const windows = document.querySelectorAll(".window");
for (const windowBox of windows) {
    windowBox.addEventListener("mousedown", function () {
        bringToFront(windowBox);
    });
}

const titlebars = document.querySelectorAll(".titlebar");
for (const titlebar of titlebars) {
    titlebar.addEventListener("mousedown", function (event) {
        draggedWindow = titlebar.closest(".window");
        gapX = event.clientX - draggedWindow.offsetLeft;
        gapY = event.clientY - draggedWindow.offsetTop;
    });
}

document.addEventListener("mousemove", function(event){
    if(draggedWindow === null) return;
    draggedWindow.style.left = (event.clientX - gapX) + "px";
    draggedWindow.style.top = (event.clientY - gapY) + "px";
})

document.addEventListener("mouseup", function(){
    draggedWindow = null;
})