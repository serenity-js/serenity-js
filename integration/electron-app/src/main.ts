import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Creates the main application window.
 */
function createWindow(): BrowserWindow {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

    return mainWindow;
}

/**
 * Creates a secondary window for multi-window testing.
 */
function createSecondaryWindow(): BrowserWindow {
    const secondaryWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    secondaryWindow.loadFile(path.join(__dirname, '..', 'secondary.html'));

    return secondaryWindow;
}

// Handle IPC request to open a new window
ipcMain.handle('open-secondary-window', () => {
    createSecondaryWindow();
    return { success: true };
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS, re-create a window when the dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
