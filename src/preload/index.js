import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('resumeAPI', {
  // Listar todos os currículos salvos
  listResumes: () => ipcRenderer.invoke('list-resumes'),

  // Carregar um currículo específico pelo ID
  loadResume: (id) => ipcRenderer.invoke('load-resume', id),

  // Salvar um currículo (cria/atualiza o arquivo e o índice)
  saveResume: (payload) => ipcRenderer.invoke('save-resume', payload),

  // Excluir um currículo
  deleteResume: (id) => ipcRenderer.invoke('delete-resume', id),

  // Criar um novo currículo em branco e retornar o ID
  createResume: () => ipcRenderer.invoke('create-resume'),

  // Renomear um currículo
  renameResume: (payload) => ipcRenderer.invoke('rename-resume', payload),

  exportPDF: (payload) => ipcRenderer.invoke('export-pdf', payload),

  checkUpdate: () => ipcRenderer.invoke('check-update')
})
