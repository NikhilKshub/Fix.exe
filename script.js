let topLayer = 1;
let draggedWindow = null;
let gapX = 0;
let gapY = 0;
let day = 1;
let minutes = 9 * 60;
let totalMinutes = 0;
let nextJobTime = 9 * 60 + 5;
let chosenJob = null;
let money = 50;
const acceptedJobs = [];
let hackWindows = 0;
let hackLoss = 0;
let hackTimer = null;
let chosenCard = null;
const waitingJobs = jobs.slice();
const virusSound = new Audio("assets/virussound.mp3");
virusSound.volume = 0.4;

// time 
function showTime(){
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hoursText = String(hours).padStart(2, "0");
    const minsText = String(mins).padStart(2,"0");
    document.getElementById("clock").textContent = hoursText + ":" + minsText;
}
showTime();
setInterval(function(){
    minutes += 10;
    totalMinutes +=10;
    if(minutes >= 18*60){
        day++;
        minutes = 9 * 60;
        nextJobTime = 9 * 60 + 5;
        document.getElementById("day").textContent = "Day " + day;
    }
    if(minutes >= nextJobTime){
        const howMany = Math.floor(Math.random() * 3) + 1;
        const hadJobs = waitingJobs.length > 0;
        for(let i = 0; i < howMany; i++){
            postRandomJob();
        }
        if(hadJobs){
            showNotice("New job posted");
        }
        nextJobTime = minutes + 20 + Math.floor(Math.random()*70);
    }
    showTime();
    for(const entry of acceptedJobs){
        if(!entry.delivered && !entry.job.scam && getStatus(entry) === "Delivered"){
            entry.delivered = true;
            refreshWorkbench();
            showNotice("Parcel delivered: " + entry.job.customer);
        }
    }
}, 1000);

function showMoney(){
    document.getElementById("money").textContent = "$" + money;
}
showMoney();

const hackMessages = [
    "Totally Real Antivirus found 47 viruses!!! 🦠",
    "You are visitor number 1,000,000! Claim NOW! 🎉",
    "Your computer has been selected for a FREE upgrade!  💻",
    "ERROR! Your sandwich has been compromised! 🥪",
    "Congratulations! You won absolutely nothing! 🎁",
    "Your keyboard is now legally our property! ⌨️"
];

function showNotice(text){
    const notice = document.getElementById("notice");
    notice.textContent = text;
    notice.hidden = false;
    setTimeout(function(){
        notice.hidden = true;
    }, 2500);
}




// accepting jobs (tracking)
function makeTrackingId(){
    const number = Math.floor(Math.random() * 90000) + 10000;
    return "PX-" + number + "-IN";
}

function getStatus(entry){
    if(entry.job.scam === true) return "Cancelled by sender. Possible fraud.";
    const age = totalMinutes - entry.acceptedAt;
    if(age < 30)return "Packed";
    if(age < 90)return "In transit";
    if(age< 150)return "Out for delivery";
    return "Delivered";
}

// window functions 
function bringToFront(windowBox) {
    topLayer++;
    windowBox.style.zIndex = topLayer;
}

const icons = document.querySelectorAll(".app-icon");
for (const icon of icons) {
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
    draggedWindow.style.top = Math.max(0, event.clientY - gapY) + "px";
})

document.addEventListener("mouseup", function(){
    draggedWindow = null;
})

// job cards
const jobList = document.getElementById("job-list");
const acceptButton = document.getElementById("accept-button");
const repairList = document.getElementById("repair-list");

function addAcceptedLine(customer, trackingId){
    const line = document.createElement("p");
    line.textContent = customer + " - " + trackingId;
    document.getElementById("accepted-list").appendChild(line);
}

function refreshWorkbench(){
    repairList.textContent ="";
    let count = 0;
    for(const entry of acceptedJobs){
        if(entry.delivered === true && entry.repaired === false){
            const row = document.createElement("div");
            row.className = "repair-row";
            
            const details = document.createElement("p");
            details.textContent = entry.job.customer + " - " + entry.job.device;

            const repairButton = document.createElement("button");
            repairButton.textContent = "Repair";

            repairButton.addEventListener("click", function(){
                console.log(entry.job.minigame);
            });
            row.appendChild(details);
            row.appendChild(repairButton);
            repairList.append(row);
            count++;
        }
    }
    if(count === 0){
        const message = document.createElement("p");
        message.textContent = "No parcels to repair yet. Check Tracking.";
        repairList.appendChild(message);
    }
}

function showJob(job) {
    const card = document.createElement("div");
    card.className = "job-card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const customer = document.createElement("p");
    customer.textContent = job.customer;

    const device = document.createElement("p");
    device.textContent = job.device;

    const viewButton = document.createElement("button");
    viewButton.textContent = "View";
    viewButton.addEventListener("click",function(){
        chosenJob = job;
        chosenCard = card;
        acceptButton.disabled = false;
        document.getElementById("popup-customer").textContent = job.customer;
        document.getElementById("popup-story").textContent = job.story;
        document.getElementById("popup-contact").textContent = job.contact;
        if(job.link !== ""){
            document.getElementById("popup-link").textContent = "see the damage: " + job.link;
        } else {
            document.getElementById("popup-link").textContent = "";
        }
        document.getElementById("popup-pay").textContent = "pay: $" + job.pay;
        document.getElementById("job-popup").hidden = false;
    });
    card.appendChild(avatar);
    card.appendChild(customer);
    card.appendChild(device);
    card.appendChild(viewButton);
    jobList.appendChild(card);
}

function postRandomJob(){
    if(waitingJobs.length === 0) return;
    const index = Math.floor(Math.random() * waitingJobs.length);
    const job = waitingJobs.splice(index,1)[0];
    showJob(job);
}
postRandomJob();

function makeHackWindow(){
    const desktop = document.getElementById("desktop");
    const box = document.createElement("div");
    box.className = "hack-window";

    const header = document.createElement("span");
    header.className = "hack-header";

    const title = document.createElement("span");
    title.textContent = "SYSTEM WARNING";

    const closeButton = document.createElement("button");
    closeButton.textContent = "x";

    const body = document.createElement("div");
    body.className = "hack-body";

    const message = document.createElement("p");
    const index = Math.floor(Math.random() * hackMessages.length);
    message.textContent = hackMessages[index];

    header.appendChild(title);
    header.appendChild(closeButton);
    body.appendChild(message);
    box.appendChild(header);
    box.appendChild(body);

    box.style.left = Math.floor(Math.random() * (desktop.clientWidth - 280)) + "px";
    box.style.top = Math.floor(Math.random() * (desktop.clientHeight - 160)) + "px";
    topLayer++;
    box.style.zIndex = topLayer;
    
    closeButton.addEventListener("click", function(){
        box.remove();
        hackWindows--;
        if(hackWindows === 0){
            clearInterval(hackTimer);
            virusSound.pause();
            virusSound.currentTime = 0;
            showNotice("Haha you actually fell for that!, its fine. Virus removed. It cost you $" + hackLoss);
            hackLoss = 0;
        }
    });
    desktop.appendChild(box);
}

function startHack(){
    if(hackWindows > 0) return;
    document.getElementById("job-popup").hidden = true;
    hackWindows = 8;
    hackLoss = 0 ;
    virusSound.play();
    for(let i=0; i<8; i++){
        setTimeout(makeHackWindow, i * 400);
    }
    hackTimer = setInterval(function(){
        if(hackLoss >= 30) return;
        money = Math.max(0 , money - 2);
        hackLoss +=2;
        showMoney();
    },1000);
}



document.getElementById("accept-button").addEventListener("click",function(){
    acceptButton.disabled = true;
    const trackingId = makeTrackingId();
    acceptedJobs.push({
        job:chosenJob,
        trackingId: trackingId,
        acceptedAt: totalMinutes,
        delivered:false,
        repaired: false
    });
    addAcceptedLine(chosenJob.customer, trackingId);
    document.getElementById("popup-story").textContent = "Accepted. Your tracking ID is " + trackingId;
    chosenCard.remove();
    setTimeout(function(){
        document.getElementById("job-popup").hidden = true;
    },1500);
});


document.getElementById("later-button").addEventListener("click", function(){
    document.getElementById("job-popup").hidden = true;
});

document.getElementById("popup-close").addEventListener("click", function(){
    document.getElementById("job-popup").hidden = true;
})

document.getElementById("popup-link").addEventListener("click", function(){
    if(chosenJob.scam){
        startHack();
    }
});

// tracking 
const trackingInput = document.getElementById("tracking-input");
const trackButton = document.getElementById("track-button");
const trackingResult = document.getElementById("tracking-result");
trackButton.addEventListener("click", function(){
    const typedId = trackingInput.value.trim().toUpperCase();
    let found = null;
    for (const entry of acceptedJobs) {
        if (entry.trackingId === typedId) {
            found = entry;
            break;
        }
    }
    if (found === null) {
        trackingResult.textContent = "No parcel found for this ID.";
    } else {
        trackingResult.textContent = "";
        const parcelLine = document.createElement("p");
        parcelLine.textContent = "Parcel for " + found.job.customer + " (" + found.job.device + ")";

        const statusLine =document.createElement("p");
        statusLine.textContent = "Status: " + getStatus(found);
        trackingResult.appendChild(parcelLine);
        trackingResult.appendChild(statusLine);
    }
});

refreshWorkbench();