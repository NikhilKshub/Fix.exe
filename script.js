let topLayer = 1;
let draggedWindow = null;
let gapX = 0;
let gapY = 0;
let day = 1;
let minutes = 9 * 60;

function showTime(){
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hoursText = String(hours).padStart(2, "0");
    const minsText = String(mins).padStart(2,"0");
    document.getElementById("clock").textContent = hoursText + ":" + minsText;
}
showTime();
setInterval(function(){
    minutes += 1;
    if(minutes >= 18 * 60){
        day++;
        minutes = 9 * 60;
        document.getElementById("day").textContent = "Day " + day;
    }
    showTime();
}, 1000);

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

const jobList = document.getElementById("job-list");
for(const job of jobs){
    const card = document.createElement("div");
    card.className = "job-card";

    const customer = document.createElement("p");
    customer.textContent = job.customer;

    const device = document.createElement("p");
    device.textContent = job.device;

    const viewButton = document.createElement("button");
    viewButton.textContent = "View";

    card.appendChild(customer);
    card.appendChild(device);
    card.appendChild(viewButton);
    jobList.appendChild(card);
}