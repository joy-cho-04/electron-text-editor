const { BrowserWindow, app, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow;
let openFilePath;

const createWindow = () => {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(),'renderer.js'),
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(createWindow)

const menuTemplate = [
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role : 'quit' }
    ]},
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'toggleDevTools' },
            { role: 'zoomIn' },
            { role: 'zoomOut' }
        
        ]
    },
    {
        label: 'File',
        submenu: [

            {
                label: 'Add New File',
                click: () => ipcMain.emit('open-document-triggered')
            },
            {
                label: 'Create New File',
                click: () => ipcMain.emit('create-document-triggered')
            },
            {
                label: 'Open Recent',
                role: 'recentdocuments',
                submenu: [
                    {
                        label: 'Clear Recent',
                        role: 'clearrecentdocuments'
                    }
                ]
            }   
        ]
    }
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

const handleError = () => {
    new Notification({
        title: 'Error',
        body: 'Sorry, something went wrong'
    }).show()
}

const openFile = (filePath) => {

    fs.readFile(filePath, 'utf8', (error, content) => {
        if(error){
            handleError()
        } else {
            app.addRecentDocument(filePath)
            openFilePath = filePath
            mainWindow.webContents.send('document-opened', { filePath, content })
        }
    })
}

app.on('open-file', (_, filePath) => { openFile(filePath) })

ipcMain.on('open-document-triggered', () => {

    dialog.showOpenDialog({
        properties: ['openFiles'],
        filters:[{name: 'text files', extensions: ['txt']}],
        defaultPath:'C:\\Users\\yewon\\Desktop\\electron'
    }).then(({ filePaths }) => {
        const filePath = filePaths[0]
        openFile(filePath)
    })
})

ipcMain.on('create-document-triggered', () => {

    dialog.showSaveDialog(mainWindow, {
        filters:[{name: 'text files', extensions: ['txt']}],
        defaultPath:'C:\\Users\\yewon\\Desktop\\electron'
    }).then(({ filePath }) => {
        fs.writeFile( filePath , '', (error) => {
            if(error){
                handleError()
            } else {
                app.addRecentDocument(filePath)
                openFilePath = filePath
                mainWindow.webContents.send('document-created', filePath)
            }
        })
    })
})


ipcMain.on('file-content-updated', (_, textareaContent) => {

    fs.writeFile(openFilePath, textareaContent, (error) => {
        if(error){
            handleError()
        }
    })
})