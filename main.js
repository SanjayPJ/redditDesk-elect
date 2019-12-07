// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let detailsWindow
let settingsWindow

//custom constants

let subreddit = 'aww'

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('index.html')

  mainWindow.subreddit = subreddit;

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function createDetailsWindow (arg) {
  detailsWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
  })

  // Custom variables

  detailsWindow.postId = arg;
  detailsWindow.subreddit = subreddit;

  detailsWindow.loadFile('details.html')

  detailsWindow.on('closed', function () {
    detailsWindow = null
  })

  detailsWindow.setMenuBarVisibility(false)
}

function createSettingsWindow () {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    parent: mainWindow,
    modal: true, 
  })

  settingsWindow.loadFile('settings.html')

  settingsWindow.subreddit = subreddit;

  settingsWindow.on('closed', function () {
    settingsWindow = null
  })

  settingsWindow.setMenuBarVisibility(false)
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipc.on('open:details', function (event, arg) {
  createDetailsWindow(arg);
})

ipc.on('update:subreddit', function (event, arg) {
  subreddit = arg;
  mainWindow.subreddit = subreddit;
  mainWindow.reload()
})

let menuTemplate = [
  {
      label: 'File',
      submenu: [
          {
            label:'Settings',
            click() { 
              createSettingsWindow();
            },
            accelerator: 'CmdOrCtrl+L'
        },
        {type:'separator'},  // Add this
        {
            label:'Exit', 
            click() { 
                app.quit() 
            } 
        }
      ]
  }
];

if(process.env.NODE_ENV !== 'production'){
menuTemplate.push({
  label: 'Developer Tools',
  submenu:[
    {
      role: 'reload'
    },
    {
      label: 'Toggle DevTools',
      accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow){
        focusedWindow.toggleDevTools();
      }
    }
  ]
});
}

let menu = Menu.buildFromTemplate(menuTemplate)

Menu.setApplicationMenu(menu); 