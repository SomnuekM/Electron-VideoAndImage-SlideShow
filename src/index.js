const { app, BrowserWindow, globalShortcut } = require('electron');

const dns = require("dns");
let isConnected = false;

app.commandLine.appendSwitch("disable-http-cache");

const AutoLaunch = require('auto-launch');
const path = require("path");

process.env.NODE_ENV !== "production";
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (require('electron-squirrel-startup')) {
    app.quit();
}

//Loading: create a global var, wich will keep a reference to out loadingScreen window
let loadingScreen;
const createLoadingScreen = () => {
    //🔄Loading: create a browser window 
    loadingScreen = new BrowserWindow(
        Object.assign({
            //🔄Loading: define width and height for the window
            width: 500,
            height: 400,
            //🔄Loading: remove the window frame, so it will become a frameless window
            frame: false,
            //🔄Loading: and set the transparency, to remove any window background color
            transparent: true,
            icon: __dirname + 'img/icon.ico',
            center: true
        })
    );
    loadingScreen.setResizable(false);
    loadingScreen.loadURL(
        'file://' + __dirname + '/loading.html'
    );
    loadingScreen.on('closed', () => (loadingScreen = null));
    loadingScreen.webContents.on('did-finish-load', () => {
        loadingScreen.show();
    });
};

var autoLauncher = new AutoLaunch({
    name: "Display Monitor",
    path: app.getPath('exe')
});

autoLauncher.isEnabled().then(function(isEnabled) {
    if (isEnabled) {
        return;
    }
    autoLauncher.enable();
}).catch(function(err) {
    throw err;
});


function createWindow() {

    const urls = ["https://somnuekm.github.io/VideoAndImages-Slideshow-V2/example1.html"];

    win = new BrowserWindow({
        center: true,
        backgroundColor: '#000000',
        resizable: true,
        autoHideMenuBar: true,
        icon: __dirname + 'img/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            show: false,
            frame: false
        }
    });

    win.loadURL(urls[0]);

    win.maximize();
    win.setFullScreen(true);

    // Exit Full Screen
    globalShortcut.register('Esc', () => {
        if (win.isFullScreen()) {
            win.setFullScreen(false)
        }
    });
    // Open DevTools
    globalShortcut.register('Ctrl+Shift+i', () => {
        if (!win.webContents.openDevTools()) {
            win.webContents.openDevTools();
        }
    });
    // Do Force Reload
    globalShortcut.register('Ctrl+F5', () => {
        win.webContents.reloadIgnoringCache();
    });
    // win.webContents.openDevTools();
    // console.log(urls[0]);
    win.once('ready-to-show', () => {
        win.show();
        win.setMenu(null);
    });

    //🔄Loading: keep listening on the did-finish-load event, when the win content has loaded
    win.webContents.on('did-finish-load', () => {
        //🔄Loading: then close the loading screen window and show the main window
        if (loadingScreen) {
            loadingScreen.close();
        }
        win.show();
    });

    win.on('closed', () => {
        win = null;
    });

}


app.whenReady().then(() => {

    createLoadingScreen();

    function liveCheck() {
        dns.resolve("www.google.com", function(err, addr) {
            if (err) {
                if (isConnected) {
                    createLoadingScreen();
                }
                isConnected = false;
            } else {
                if (isConnected) {
                    //connection is still up and running, do nothing
                    if (loadingScreen) {
                        loadingScreen.close();
                    }
                } else {

                    //🔄Loading: add a little bit of delay for tutorial purposes, remove when not needed
                    createWindow();

                }
                isConnected = true;
            }
        });
    }

    setInterval(function() {
        liveCheck();
    }, 2 * 1000);


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});