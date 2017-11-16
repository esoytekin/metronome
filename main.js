const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let willQuitApp = false;


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow(
  {
    width: 360, 
    height: 560
    //resizable: false
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  /*win.on('closed', (event) => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    event.preventDefault();
    //win = null
  })*/

  //win.on('close', function(event){
    //event.preventDefault(); 
  //})
  //
  win.on('close', (e) => {
    win = null;
    /*if (willQuitApp) {
      [> the user tried to quit the app <]
      win= null;
    } else {
      [> the user only tried to close the window <]
      e.preventDefault();
      win.hide();
    }*/
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
   } 
})

/* 'before-quit' is emitted when Electron receives 
 * the signal to exit and wants to start closing windows */
app.on('before-quit', () => willQuitApp = true);
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
