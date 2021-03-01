const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
var $ = require('jQuery');

// require('update-electron-app')({
//   repo: 'fmrodrigues92/niot.git',
//   updateInterval: '1 hour',
//   logger: require('electron-log')
// })

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const store = new Store();


// receive message from index.html 
ipcMain.on('asynchronous-message', (event, arg) => {
    store.set('preferences', arg);

    event.sender.send('first-reply', store.get('preferences') );
  // send message to index.html
  //event.sender.send('asynchronous-reply', 'hello' );
});

ipcMain.on('first-message', (event, arg) => {

  // send message to index.html
  event.sender.send('first-reply', store.get('preferences') );
});





let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
}





const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 550,
    title: "NIOT",
    icon:'favicon.png',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      devTools: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'html/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('minimize',function(event){
    event.preventDefault();
    //mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if(!app.isQuiting){
        event.preventDefault();
        //mainWindow.hide();
    }
});

  // Behaviour on second instance for parent process- Pretty much optional
  app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })


};


let appIcon = null
app.whenReady().then(() => {
  appIcon = new Tray('favicon.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir', click:  function(){
        mainWindow.show();
    } },
    { label: 'Fechar', click:  function(){
      app.isQuiting = true;
      app.quit();
    } }
  ]);

  // Make a change to the context menu
  contextMenu.items[1].checked = false

  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu)
})



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

