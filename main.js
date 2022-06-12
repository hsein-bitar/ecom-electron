const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
  // nativeTheme.themeSource = 'dark';
  // Create new window
  mainWindow = new BrowserWindow({
    show: false,
    // frame: false,
    backgroundColor: '#f6f6f6',
    minWidth: 800,
    minHeight: 600,
  });

  mainWindow.maximize();
  mainWindow.show();
  // Load html in window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'adminPanel.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});


// Create menu template
const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: 'Actions',
    submenu: [
      {
        label: 'Add Item',
        click() {
          mainWindow.webContents.send('addItem');
        }
      },
      {
        label: 'Add Category',
        click() {
          mainWindow.webContents.send('addCategory');
        }
      },
      {
        label: 'Go Home',
        click() {
          mainWindow.webContents.send('home');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}