const { ipcRenderer } = require("electron")
const path = require('path')

// Text Editor
window.addEventListener('DOMContentLoaded', ()=> {

  const el = {
    documentName : document.getElementById('documentName'),
    fileTextarea: document.getElementById('fileTextarea'),
  }

  // function to handle file
  const handleDocumentChange = ( filePath, content = '' ) => {

    el.documentName.innerHTML = path.parse(filePath).base
    el.documentName.removeAttribute('disabled')
    el.fileTextarea.value = content
    el.fileTextarea.focus()
  }

  el.fileTextarea.addEventListener('click', (e) => {
    ipcRenderer.send('file-content-updated', e.target.value)
  })

  ipcRenderer.on('document-opened', (_ , {filePath, content}) => handleDocumentChange(filePath, content) )

  ipcRenderer.on('document-created', (_, filePath) => handleDocumentChange(filePath) )

  // Background Color
  let mainBackground = document.getElementById('mainBackground')
  // buttons for changing background
  const dark = document.getElementById("dark")
  const light = document.getElementById("light")

  function darkBackground(){
    mainBackground.style.backgroundColor = 'rgb(25, 25, 30)';
    mainBackground.style.color = 'white';
  }

  function lightBackground(){
    mainBackground.style.backgroundColor = 'rgb(236, 223, 214)';
    mainBackground.style.color = 'black';
  }

  dark.addEventListener("click", () => { darkBackground() })
  
  light.addEventListener("click", () => { lightBackground() })
})