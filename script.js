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
let repairEntry = null;
const acceptedJobs = [];
let hackWindows = 0;
let hackLoss = 0;
let hackTimer = null;
let chosenCard = null;
const waitingJobs = jobs.slice();
const virusSound = new Audio("assets/virussound.mp3");
virusSound.volume = 0.4;
const screenWidth = 240;
const screenHeight = 400;
const picture = document.createElement("canvas");
picture.width = screenWidth;
picture.height = screenHeight;
const pictureCtx = picture.getContext("2d");
let targetWobble = 0;
let targetStatic = 0;
let targetRoll = 0;
let wavePhase = 0;
let frequencyTimer = null;
const phoneCanvas = document.getElementById("static-canvas");
const phoneCtx = phoneCanvas.getContext("2d");
const sliderWobble = document.getElementById("slider-wobble");
const sliderStatic = document.getElementById("slider-static");
const sliderRoll = document.getElementById("slider-roll");
const signalText = document.getElementById("signal-text");
let frequencySolved = false;
const cols = 80;
const rows = 50;
const cell = 12;
let grid = [];
let player = { x: 0, y:0};
let enemies = [];
let direction = "";
let isDrawing = false;
let lives = 3;
let recoveryTimer = null;
let recoveryWon = false;
const targetPercent = 88;
const keyDirections = {
    ArrowUp: "up",
    w:"up",
    ArrowDown: "down",
    s: "down",
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right"
};
const moves ={
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
};

const opposite = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
};
let lastDirection = "";
let gameStarted = false;
let introIndex = 0;
const introSlides=[
    {
        title:"Open for business",
        text:"You run a tiny repair shop from one very suspicious computer. Each day runs from 09:00 to 18:00, which is about 9 real minutes. Open the Jobs app to see who needs help. Some customers are scammers, so read the stories carefully."
    },
    {
        title:"The waiting game",
        text:"Accept a job and you get a tracking ID. Paste it into the Tracking app to follow your parcel. When it is delivered, it appears in the Workbench so you can repair it and get paid. If it says Packed wait some time, the game is not broken. The courier is just slow."
    }
];
let fastParcelsLeft = 1;



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
    if(gameStarted === false) return;
    minutes += 50;
    totalMinutes +=50;
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
    const progress = (totalMinutes - entry.acceptedAt) / entry.deliveryTime;
    if(progress < 0.25) return "Packed";
    if(progress < 0.6) return "In transit";
    if(progress < 1) return "Out for delivery";
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
const stage = document.getElementById("repair-stage");
const frequencyGame = document.getElementById("frequency-game");
const caption = document.getElementById("stage-caption");
const recoveryGame = document.getElementById("recovery-game");
const recoveryCanvas = document.getElementById("recovery-canvas");
const recoveryCtx = recoveryCanvas.getContext("2d");
const livesText = document.getElementById("lives-text");
const percentText = document.getElementById("percent-text");
const introPopup = document.getElementById("intro-popup");
const introTitle = document.getElementById("intro-title");
const introText = document.getElementById("intro-text");
const introCount = document.getElementById("intro-count");
const introNext = document.getElementById("intro-next");
const introSkip = document.getElementById("intro-skip");

document.addEventListener("keydown", function(event){
    if(recoveryGame.hidden) return;
    const dir = keyDirections[event.key];
    if(isDrawing && dir === opposite[lastDirection]) return;
    if(dir){
        direction = dir;
    }
});
document.addEventListener("keyup", function(event){
    if(keyDirections[event.key] === direction){
        direction = "";
    }
});

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
                startRepair(entry);
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

function startFrequency(){
    frequencySolved = false;
    targetWobble = Math.floor(Math.random() * 81) + 10;
    targetStatic = Math.floor(Math.random() * 81) + 10;
    targetRoll = Math.floor(Math.random() * 81) + 10;
    sliderWobble.value = Math.floor(Math.random() * 101);
    sliderStatic.value = Math.floor(Math.random() * 101);
    sliderRoll.value = Math.floor(Math.random() * 101);

    sliderWobble.disabled = false;
    sliderStatic.disabled = false;
    sliderRoll.disabled = false;
    frequencyTimer = setInterval(drawPhone, 60);

}

function startRecovery(entry){
    recoveryWon = false;
    repairEntry = entry;
    stage.hidden = false;
    recoveryGame.hidden = false;
    caption.textContent = "";
    recoveryPhoto.src = entry.job.photo;
    makeGrid();
    enemies=[];
    for(let i=0; i<2; i++){
        enemies.push({
            x:Math.floor(Math.random() * (cols - 20)) + 10,
            y:Math.floor(Math.random() * (rows - 20)) + 10,
            dx: Math.random() < 0.5 ? 1 : -1,
            dy: Math.random() < 0.5 ? 1 : -1
        });
    }
    player.x = 0;
    player.y = 0;
    direction = "";
    isDrawing = false;
    lives = 3;
    drawRecovery();
    recoveryTimer = setInterval(updateRecovery, 60);
}


function startRepair(entry) {
    if (entry.job.minigame === "frequency") {
        repairEntry = entry;
        stage.hidden = false;
        frequencyGame.hidden = false;
        caption.textContent = "Adjust the sliders until the picture is still and clear.";
        startFrequency();
    } else {
        startRecovery(entry);
    }
}

const iconColors = ["#c45538", "#d9a22b", "#7a9a4a", "#e9dfc8", "#c45538", "#d9a22b"];
const iconNames = ["Mail","Maps","Music","Notes","Photos","Clock"];
const iconImages =[];

for(const name of iconNames){
    const img = new Image();
    img.src = "assets/" + name.toLowerCase() + ".png";
    img.onload = drawPicture;
    iconImages.push(img); 
}

function drawPicture(){
    pictureCtx.fillStyle = "#5fa8a0";
    pictureCtx.fillRect(0, 0, screenWidth, screenHeight);
    for(let i=0; i<6; i++){
        const column = i%2;
        const row = Math.floor(i / 2);
        const x = 36 + column * 96;
        const y = 40 + row * 110;
        pictureCtx.fillStyle = iconColors[i];
        pictureCtx.lineWidth = 3;
        pictureCtx.strokeStyle = "#2b2622";

        pictureCtx.beginPath();
        pictureCtx.roundRect(x, y, 72, 72, 16);
        pictureCtx.fill();
        pictureCtx.stroke();

        if(iconImages[i].complete){
            pictureCtx.drawImage(iconImages[i], x + 16, y + 16, 40, 40);
        }

        pictureCtx.fillStyle = "#2b2622";
        pictureCtx.font = "16px monospace";
        pictureCtx.textAlign = "center";
        pictureCtx.fillText(iconNames[i], x + 36, y + 94);
    }
}
drawPicture();

function offBy(slider, target){
    return Math.max(0 , Math.abs(slider.value - target) - 4);
}

function drawPhone(){
    const wobbleOff = offBy(sliderWobble, targetWobble);
    const staticOff = offBy(sliderStatic, targetStatic);
    const rollOff = offBy(sliderRoll, targetRoll);
    const wobble = wobbleOff * 0.5;
    const staticAmount = staticOff * 40;
    const roll = rollOff * 0.8;

    wavePhase += 0.3;
    phoneCtx.clearRect(0, 0, screenWidth, screenHeight);

    for(let y=0; y < screenHeight; y += 2){
        const shift = Math.sin(y * 0.15 + wavePhase) * wobble;
        phoneCtx.drawImage(picture, 0, y, screenWidth, 2, shift, y + roll, screenWidth, 2);
    }
    for(let i=0; i<staticAmount; i++){
        phoneCtx.fillStyle = Math.random() < 0.5 ? "#e9dfc8" : "#2b2622";
        const x = Math.random()*screenWidth;
        const y = Math.random() * screenHeight;
        phoneCtx.fillRect(x, y, 3, 3);
    }
    const signal = Math.max(0, 100 - Math.ceil((wobbleOff + staticOff + rollOff) / 3));
    signalText.textContent = "Signal: " + signal + "%";
}

const blankColor = "#2c4a47";
let photoX = 0;
let photoY = 0;
let photoW = 0;
let photoH = 0;
const recoveryPhoto = new Image();
recoveryPhoto.onload = function(){
    const areaW = (cols - 2) * cell;
    const areaH = (rows - 2) * cell;
    const scale = Math.min(
        areaW / recoveryPhoto.naturalWidth,
        areaH / recoveryPhoto.naturalHeight
    );
    photoW = recoveryPhoto.naturalWidth * scale;
    photoH = recoveryPhoto.naturalHeight * scale;
    photoX = cell + (areaW - photoW) / 2;
    photoY = cell + (areaH - photoH) / 2;
    drawRecovery();
};


function makeGrid(){
    grid = [];
    for(let y=0; y<rows; y++){
        const line = [];
        for(let x=0; x<cols; x++){
            if(x===0 || y===0 || x===cols - 1 || y===rows - 1){
                line.push(1);
            } else {
                line.push(0);
            }
        }
        grid.push(line);
    }
}

function getPercent(){
    let count = 0;
    for(let y = 1; y < rows - 1; y++){
        for(let x = 1; x < cols - 1; x++){
            if(grid[y][x] === 1){
                count++;
            }
        }
    }
    return Math.floor(count / ((cols - 2) * (rows - 2)) * 100);
}

function drawRecovery(){
    recoveryCtx.fillStyle = blankColor;
    recoveryCtx.fillRect(0, 0, cols * cell, rows * cell);
    if(recoveryPhoto.complete && recoveryPhoto.naturalWidth > 0){
        recoveryCtx.drawImage(recoveryPhoto, photoX, photoY, photoW, photoH);
    }
    if(recoveryWon === false){
        for(let y = 0; y<rows; y++){
            for(let x = 0; x<cols; x++){
                if(grid[y][x] === 0){
                    recoveryCtx.fillStyle = "#1d1a17";
                    recoveryCtx.fillRect(x * cell, y * cell, cell, cell);
                }
                if(grid[y][x] === 2){
                    recoveryCtx.fillStyle = "#d9a22b";
                    recoveryCtx.fillRect(x * cell, y * cell, cell, cell);
                }
            }
        }
        recoveryCtx.fillStyle = "#5fa8a0";
        recoveryCtx.fillRect(player.x * cell - 1, player.y * cell - 1, cell +2, cell+2);
        recoveryCtx.fillStyle = "#c45538";
        for(const enemy of enemies){
            recoveryCtx.fillRect(enemy.x * cell - 1, enemy.y * cell - 1, cell + 2, cell + 2);
        }
    }
    livesText.textContent = "♥ ".repeat(lives);
    const shown = recoveryWon ? 100 : getPercent();
    percentText.textContent = "Recovered: " + shown + "%";
}

function loseLife(){
    lives--;
    for(let y = 0; y<rows; y++){
        for(let x = 0; x<cols; x++){
            if(grid[y][x] === 2){
                grid[y][x] = 0;
            }
        }
    }
    player.x = 0;
    player.y = 0;
    isDrawing = false;
    direction = "";
    if(lives === 0){
        failRecovery();
    }
}

function floodFrom(startX, startY, reached){
    const stack = [[startX, startY]];
    while(stack.length > 0){
        const spot = stack.pop();
        const x = spot[0];
        const y = spot[1];
        if(reached[y][x] || grid[y][x] !== 0){
            continue;
        }
        reached[y][x] = true;
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }
}

function finishTrail(){
    for(let y = 0; y < rows; y++){
        for(let x = 0; x < cols; x++){
            if(grid[y][x] === 2){
                grid[y][x] = 1;
            }
        }
    }
    const reached = [];
    for(let y = 0; y < rows; y++){
        reached.push(new Array(cols).fill(false));
    }
    for(const enemy of enemies){
        floodFrom(enemy.x, enemy.y, reached);
    }
    for(let y = 0; y < rows; y++){
        for(let x = 0; x < cols; x++){
            if(grid[y][x] === 0 && reached[y][x] === false){
                grid[y][x] = 1;
            }
        }
    }
    isDrawing = false;
}


function movePlayer(){
    if(direction === "") return;
    const step = moves[direction];
    const nextX = player.x + step[0];
    const nextY = player.y + step[1];
    if(nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows){
        return;
    }
    const target = grid[nextY][nextX];
    if(target === 2){
        loseLife();
        return;
    }
    if(target === 0){
        grid[nextY][nextX] = 2;
        isDrawing = true;
    }
    player.x = nextX;
    player.y = nextY;
    lastDirection = direction;
    if(target === 1 && isDrawing === true){
        finishTrail();
    }
}

function moveEnemies(){
    for(const enemy of enemies){
        if(grid[enemy.y][enemy.x + enemy.dx] === 1){
            enemy.dx = -enemy.dx;
        }
        if(grid[enemy.y + enemy.dy][enemy.x] === 1){
            enemy.dy = -enemy.dy;
        }
        if(grid[enemy.y + enemy.dy][enemy.x + enemy.dx] === 1){
            enemy.dx = -enemy.dx;
            enemy.dy = -enemy.dy;
        }
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        if(grid[enemy.y][enemy.x] === 2){
            loseLife();
            return;
        }
    }
}

function updateRecovery(){
    movePlayer();
    moveEnemies();
    drawRecovery();
    if(getPercent() >= targetPercent){
        winRecovery();
    }
}

function winRecovery(){
    clearInterval(recoveryTimer);
    recoveryWon = true;
    drawRecovery();
    money += repairEntry.job.pay;
    showMoney();
    repairEntry.repaired = true;
    caption.textContent = "Data recovered! +$" + repairEntry.job.pay;
    setTimeout(closeStage, 3500);
}

function failRecovery(){
    clearInterval(recoveryTimer);
    caption.textContent = "Recovery failed. The device is still on your workbench.";
    setTimeout(closeStage, 2000);
}

function closeStage(){
    clearInterval(frequencyTimer);
    clearInterval(recoveryTimer);
    stage.hidden = true;
    frequencyGame.hidden = true;
    recoveryGame.hidden = true;
    refreshWorkbench();
}

function checkFrequency(){
    if(frequencySolved === true) return;
    if(
        offBy(sliderWobble, targetWobble) === 0 &&
        offBy(sliderStatic, targetStatic) === 0 &&
        offBy(sliderRoll, targetRoll) === 0
    ){
        frequencySolved = true;
        sliderWobble.disabled = true;
        sliderStatic.disabled = true;
        sliderRoll.disabled = true;
        money += repairEntry.job.pay;
        showMoney();
        repairEntry.repaired = true;
        caption.textContent = "Signal restored! +$" + repairEntry.job.pay;
        setTimeout(closeStage, 2000);
    }
}
sliderWobble.addEventListener("input",checkFrequency);
sliderStatic.addEventListener("input",checkFrequency);
sliderRoll.addEventListener("input",checkFrequency);


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
    let deliveryTime = 80;
    if(fastParcelsLeft > 0 && chosenJob.scam === false){
        deliveryTime = 25;
        fastParcelsLeft--;
    }
    acceptedJobs.push({
        job:chosenJob,
        trackingId: trackingId,
        acceptedAt: totalMinutes,
        deliveryTime: deliveryTime,
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

document.getElementById("leave-button").addEventListener("click", function() {
    closeStage();
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

function showIntroSlide(){
    const slide = introSlides[introIndex];
    introTitle.textContent = slide.text;
    introText.textConten = slide.text;
    introCount.textContent = (introIndex + 1) + " / " + introSlides.length;
    introNext.textContent = introIndex === introSlides.length - 1 ? "Start" : "Next";
}

function closeIntro(){
    introPopup.hidden = true;
    gameStarted = true;
}

introNext.addEventListener("click",function(){
    if(introIndex === introSlides.length - 1){
        closeIntro();
    } else {
        introIndex++;
        showIntroSlide();
    }
});
introSkip.addEventListener("click",function(){
    closeIntro();
});

refreshWorkbench();
showIntroSlide();