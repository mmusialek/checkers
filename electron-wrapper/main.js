const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1152,
        height: 900,
        maximizable: false,
        minimizable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, "_site", "index.html"));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
