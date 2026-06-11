import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

// Novos caminhos para armazenamento de currículos
const RESUMES_DIR = join(app.getPath('userData'), 'resumes')
const INDEX_PATH = join(RESUMES_DIR, 'index.json')

// Janela
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Handlers para gerenciamento de currículos

// 1. Listar todos os currículos
ipcMain.handle('list-resumes', async () => {
  try {
    const raw = await fs.promises.readFile(INDEX_PATH, 'utf-8')
    return { success: true, data: JSON.parse(raw) }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// 2. Carregar um currículo pelo ID
ipcMain.handle('load-resume', async (_event, id) => {
  try {
    const filePath = path.join(RESUMES_DIR, `${id}.json`)
    await fs.promises.access(filePath) // verifica existência
    const raw = await fs.promises.readFile(filePath, 'utf-8')
    return { success: true, data: JSON.parse(raw) }
  } catch (e) {
    if (e.code === 'ENOENT') {
      return { success: false, error: 'Currículo não encontrado' }
    }
    return { success: false, error: e.message }
  }
})

// 3. Salvar um currículo (cria ou atualiza)
ipcMain.handle('save-resume', async (_event, { id, name, data }) => {
  try {
    const filePath = path.join(RESUMES_DIR, `${id}.json`)
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')

    // Atualiza o índice
    const raw = await fs.promises.readFile(INDEX_PATH, 'utf-8')
    const index = JSON.parse(raw)
    const existingIndex = index.findIndex((item) => item.id === id)
    const now = new Date().toISOString()

    if (existingIndex !== -1) {
      index[existingIndex].name = name
      index[existingIndex].updatedAt = now
    } else {
      index.push({
        id,
        name: name || 'Sem título',
        createdAt: now,
        updatedAt: now
      })
    }

    await fs.promises.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// 4. Excluir um currículo
ipcMain.handle('delete-resume', async (_event, id) => {
  try {
    const filePath = path.join(RESUMES_DIR, `${id}.json`)

    // Remove o arquivo se existir
    try {
      await fs.promises.unlink(filePath)
    } catch (e) {
      if (e.code !== 'ENOENT') throw e // ignora se já não existir
    }

    // Remove do índice
    const raw = await fs.promises.readFile(INDEX_PATH, 'utf-8')
    const index = JSON.parse(raw).filter((item) => item.id !== id)
    await fs.promises.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')

    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// 5. Criar um novo currículo vazio
ipcMain.handle('create-resume', async () => {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const newEntry = {
    id,
    name: 'Novo currículo',
    createdAt: now,
    updatedAt: now
  }

  try {
    // Atualiza o índice
    const raw = await fs.promises.readFile(INDEX_PATH, 'utf-8')
    const index = JSON.parse(raw)
    index.push(newEntry)
    await fs.promises.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')

    // Cria o arquivo de dados vazio
    const initialData = {
      personal: {
        name: '',
        title: '',
        location: '',
        email: '',
        phone: '',
        linkedin: '',
        github: ''
      },
      summary: '',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      languages: []
    }
    await fs.promises.writeFile(
      path.join(RESUMES_DIR, `${id}.json`),
      JSON.stringify(initialData, null, 2),
      'utf-8'
    )

    return { success: true, id }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// 6. Renomear um currículo
ipcMain.handle('rename-resume', async (_event, { id, name }) => {
  try {
    const raw = await fs.promises.readFile(INDEX_PATH, 'utf-8')
    const index = JSON.parse(raw)
    const item = index.find((i) => i.id === id)
    if (item) {
      item.name = name
      await fs.promises.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// Handler para exportar PDF usando a impressão nativa do Electron
ipcMain.handle('export-pdf', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return { success: false, error: 'Janela não encontrada' }

  // Abre janela para escolher onde salvar
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Salvar currículo como PDF',
    defaultPath: 'curriculo.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (!filePath) return { success: false, error: 'Salvamento cancelado' }

  try {
    const data = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      margins: {
        marginType: 'custom',
        top: 0.71, // 18 mm em polegadas
        bottom: 0.71,
        left: 0.71,
        right: 0.71
      }
    })
    fs.writeFileSync(filePath, data)
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// Ciclo de vida da aplicação
app.whenReady().then(() => {
  // garante que userData está disponível
  if (!fs.existsSync(RESUMES_DIR)) {
    fs.mkdirSync(RESUMES_DIR, { recursive: true })
  }
  if (!fs.existsSync(INDEX_PATH)) {
    fs.writeFileSync(INDEX_PATH, JSON.stringify([]), 'utf-8')
  }

  electronApp.setAppUserModelId('com.guicu.app')
  app.on('browser-window-created', (_, window) => {
    if (optimizer.watchShortcuts) optimizer.watchShortcuts(window)
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
