// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

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
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    parent: mainWindow
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

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})


ipc.on('open:details', function (event, arg) {
  createDetailsWindow(arg);
})

ipc.on('update:subreddit', function (event, arg) {
  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS subreddit");

    db.run("CREATE TABLE IF NOT EXISTS subreddit (info TEXT)");
  
    db.run("INSERT INTO subreddit (info) VALUES ('" + arg + "')");
  });
  
  // mainWindow.subreddit = subreddit;
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