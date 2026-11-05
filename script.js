const icons = document.querySelectorAll(".app-icon");

for (const icon of icons) {
    console.log(icon.dataset.window);

    icon.addEventListener("click", function () {
        const windowBox = document.getElementById(icon.dataset.window);
        windowBox.hidden = false;
    });
}