import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script that exposes a safe API to the renderer process.
 * This follows Electron's security best practices with context isolation.
 */
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Opens a secondary window for multi-window testing.
     */
    openSecondaryWindow: (): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke('open-secondary-window');
    },
});
