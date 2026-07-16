import { useState, useEffect, useCallback, useRef } from 'react'
import ProgressBar from './components/Wizard/ProgressBar'
import StepPersonal from './components/Steps/StepPersonal'
import StepSummary from './components/Steps/StepSummary'
import StepSkills from './components/Steps/StepSkills'
import StepExperience from './components/Steps/StepExperience'
import StepProjects from './components/Steps/StepProjects'
import StepEducation from './components/Steps/StepEducation'
import StepCertifications from './components/Steps/StepCertifications'
import StepLanguages from './components/Steps/StepLanguages'
import Resume from './components/Resume/Resume'
import CustomSelect from './components/common/CustomSelect'
import { DEFAULT_SECTION_TITLES } from './i18n/resumeLabels'
import { DEFAULT_DESIGN } from './utils/designTokens'
import './assets/main.css'
import ChangelogModal from './components/ChangelogModal'
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiCopy,
  FiMinus,
  FiSquare,
  FiSettings,
  FiGithub
} from 'react-icons/fi'
import OnboardingModal from './components/OnboardingModal'

const STEPS = [
  'Dados Pessoais',
  'Resumo',
  'Habilidades',
  'Experiência',
  'Projetos',
  'Formação',
  'Cursos e Certificações',
  'Idiomas'
]

const initialData = {
  personal: { name: '', title: '', location: '', email: '', phone: '', linkedin: '', github: '' },
  summary: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  languages: [],
  font: 'Calibri',
  design: { ...DEFAULT_DESIGN },
  sectionTitles: { ...DEFAULT_SECTION_TITLES }
}

function App() {
  const [step, setStep] = useState(0)
  const [showResume, setShowResume] = useState(false)
  const [resumeData, setResumeData] = useState(initialData)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [maxVisitedStep, setMaxVisitedStep] = useState(0)
  const [updateAvailable, setUpdateAvailable] = useState(null) // null | string (versão)
  const [downloadProgress, setDownloadProgress] = useState(null) // null = não está baixando
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Executado apenas uma vez, na montagem do componente
    return !localStorage.getItem('guicu-onboarding')
  })

  const [showChangelog, setShowChangelog] = useState(() => {
    // Só exibe changelog para quem já conhece o app (já fechou o onboarding).
    if (localStorage.getItem('guicu-onboarding') !== 'true') return false
    return localStorage.getItem('guicu-changelog-version') !== __APP_VERSION__
  })

  const stepRefs = useRef([])
  const pendingNavRef = useRef(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)

  const [showCommitErrorModal, setShowCommitErrorModal] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Estados para múltiplos currículos
  const [resumeList, setResumeList] = useState([])
  const [activeResumeId, setActiveResumeId] = useState(null)

  // Carrega a lista de currículos ao iniciar
  const loadResumeList = useCallback(async () => {
    const result = await window.resumeAPI.listResumes()
    if (result.success) {
      setResumeList(result.data)
    }
  }, [])

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('guicu-theme') || 'system')

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('guicu-theme', theme)
  }, [theme])

  // Reseta o formulário quando não há currículo ativo
  useEffect(() => {
    if (!activeResumeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResumeData(initialData)
      setLoaded(true)
    }
  }, [activeResumeId])

  // Carrega os dados do currículo ativo
  useEffect(() => {
    if (!activeResumeId) return
    const loadData = async () => {
      const result = await window.resumeAPI.loadResume(activeResumeId)
      if (result.success && result.data) {
        setResumeData(result.data)
        // Se o currículo já tem dados, libera todas as etapas
        const hasData = result.data.personal?.name?.trim()
        setMaxVisitedStep(hasData ? STEPS.length - 1 : 0)
      } else {
        setResumeData(initialData)
        setMaxVisitedStep(0)
      }
      setLoaded(true)
    }
    loadData()
  }, [activeResumeId])

  // Inicialização: carrega lista e seleciona o primeiro currículo
  useEffect(() => {
    const init = async () => {
      const result = await window.resumeAPI.listResumes()
      if (result.success) {
        setResumeList(result.data) // atualiza a lista
        if (result.data.length > 0) {
          const lastId = localStorage.getItem('lastActiveResumeId')
          const idToOpen =
            lastId && result.data.find((r) => r.id === lastId) ? lastId : result.data[0].id
          setActiveResumeId(idToOpen)
        } else {
          const createResult = await window.resumeAPI.createResume()
          if (createResult.success) {
            await loadResumeList()
            setActiveResumeId(createResult.id)
          }
        }
      }
      setLoaded(true)
    }
    init()
  }, [loadResumeList])

  // Persiste o último currículo ativo
  useEffect(() => {
    if (activeResumeId) {
      localStorage.setItem('lastActiveResumeId', activeResumeId)
    }
  }, [activeResumeId])

  // Salvamento automático
  const saveCurrentResume = useCallback(
    async (data) => {
      if (!activeResumeId) return
      const currentName = resumeList.find((r) => r.id === activeResumeId)?.name || 'Sem título'
      setSaveStatus('saving')
      try {
        const result = await window.resumeAPI.saveResume({
          id: activeResumeId,
          name: currentName,
          data
        })
        if (result.success) {
          setSaveStatus('saved')
          setLastSaveTime(new Date())
        } else {
          console.error('Erro ao salvar:', result.error)
          setSaveStatus('error')
        }
      } catch (err) {
        console.error('Exceção ao salvar:', err)
        setSaveStatus('error')
      }
    },
    [activeResumeId, resumeList]
  )

  // Fecha o modal e registra que o onboarding foi concluído
  const closeOnboarding = () => {
    localStorage.setItem('guicu-onboarding', 'true')
    setShowOnboarding(false)
  }

  const closeChangelog = () => {
    localStorage.setItem('guicu-changelog-version', __APP_VERSION__)
    setShowChangelog(false)
  }

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => saveCurrentResume(resumeData), 800)
    return () => clearTimeout(timer)
  }, [resumeData, loaded, saveCurrentResume])

  useEffect(() => {
    const checkUpdate = async () => {
      const result = await window.resumeAPI.checkUpdate()
      if (!result.success) return
      const latest = result.latestVersion.replace('v', '')
      const current = __APP_VERSION__
      if (latest !== current) setUpdateAvailable(result.latestVersion)
    }
    checkUpdate()
  }, [])

  useEffect(() => {
    if (window.resumeAPI.onUpdateDownloadProgress) {
      window.resumeAPI.onUpdateDownloadProgress((percent) => {
        setDownloadProgress(percent)
      })
    }
  }, [])

  // Handlers de gerenciamento de currículos
  const handleCreateNew = async () => {
    const result = await window.resumeAPI.createResume()
    if (result.success) {
      await loadResumeList()
      setActiveResumeId(result.id)
      setStep(0)
      setShowResume(false)
      setMaxVisitedStep(0)
    }
  }

  const handleStartRename = () => {
    const current = resumeList.find((r) => r.id === activeResumeId)
    setRenameValue(current?.name || '')
    setIsRenaming(true)
  }

  const handleConfirmRename = async () => {
    if (renameValue.trim() && activeResumeId) {
      await window.resumeAPI.renameResume({ id: activeResumeId, name: renameValue.trim() })
      await loadResumeList()
    }
    setIsRenaming(false)
    setRenameValue('')
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    setRenameValue('')
  }

  const handleDelete = () => {
    if (!activeResumeId) return
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setShowDeleteModal(false)
    await window.resumeAPI.deleteResume(activeResumeId)
    await loadResumeList()
    const list = await window.resumeAPI.listResumes()
    if (list.success && list.data.length > 0) {
      setActiveResumeId(list.data[0].id)
    } else {
      const createResult = await window.resumeAPI.createResume()
      if (createResult.success) {
        await loadResumeList()
        setActiveResumeId(createResult.id)
      } else {
        setActiveResumeId(null)
        setResumeData(initialData)
      }
    }
    setStep(0)
    setShowResume(false)
  }

  const handleDuplicate = async () => {
    if (!activeResumeId) return
    const result = await window.resumeAPI.duplicateResume(activeResumeId)
    if (result.success) {
      await loadResumeList()
      setActiveResumeId(result.id)
      setStep(0)
      setShowResume(false)
      setMaxVisitedStep(0)
    } else {
      console.error('Erro ao duplicar:', result.error)
    }
  }

  const updateData = (section, value) => {
    setResumeData((prev) => ({ ...prev, [section]: value }))
    setValidationErrors([]) // some com os erros
  }

  const doNext = () => {
    if (step < STEPS.length - 1) {
      // Validações antes de avançar
      const errors = []

      if (step === 0) {
        if (!resumeData.personal.name.trim()) errors.push('Nome completo')
        if (!resumeData.personal.title.trim()) errors.push('Título profissional')
        if (!resumeData.personal.email.trim()) errors.push('Email')
        if (!resumeData.personal.location.trim()) errors.push('Localização')
      }
      if (step === 1) {
        const wordCount = resumeData.summary.trim().split(/\s+/).filter(Boolean).length
        if (wordCount < 40) errors.push('Resumo profissional (mínimo 40 palavras)')
      }
      if (step === 2) {
        if (resumeData.skills.length < 10)
          errors.push('No mínimo 10 habilidades (recomendado 15 para pontuação ATS máxima)')
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
        setShowValidationModal(true)
        return // não avança
      }

      // Se passou, avança
      setValidationErrors([])
      setMaxVisitedStep((prev) => Math.max(prev, step + 1))

      setStep((s) => s + 1)
    } else {
      // Último passo (Idiomas) – geração direta, sem validação extra
      setValidationErrors([])
      setShowValidationModal(false)
      setShowResume(true)
    }
  }

  const doBack = () => {
    if (showResume) {
      setShowResume(false)
    } else {
      setStep((s) => s - 1)
    }
  }

  const doGoToStep = (i) => {
    if (i > maxVisitedStep) return // bloqueia steps futuros
    setShowResume(false)
    setStep(i)
  }

  const getSaveStatusText = () => {
    if (saveStatus === 'saving') return 'Salvando...'
    if (saveStatus === 'saved') return 'Salvo'
    if (saveStatus === 'error') return 'Erro ao salvar'
    return ''
  }

  const guardNav = (fn) => {
    const ref = stepRefs.current[step]
    if (ref?.hasUnsavedChanges?.()) {
      pendingNavRef.current = fn
      setShowUnsavedModal(true)
    } else {
      fn()
    }
  }

  const next = () => guardNav(doNext)
  const back = () => guardNav(doBack)
  const goToStep = (i) => guardNav(() => doGoToStep(i))

  const handleUnsavedSaveAndContinue = () => {
    const ref = stepRefs.current[step]
    const ok = ref?.commit ? ref.commit() : true
    setShowUnsavedModal(false)
    if (ok) {
      const fn = pendingNavRef.current
      pendingNavRef.current = null
      fn?.()
    } else {
      pendingNavRef.current = null
      setShowCommitErrorModal(true)
    }
  }

  const handleUnsavedDiscardAndContinue = () => {
    stepRefs.current[step]?.discard?.()
    setShowUnsavedModal(false)
    const fn = pendingNavRef.current
    pendingNavRef.current = null
    fn?.()
  }

  const handleUnsavedCancel = () => {
    setShowUnsavedModal(false)
    pendingNavRef.current = null
  }

  if (!loaded) return <div className="loading-screen">Carregando...</div>
  if (showResume) return <Resume resumeData={resumeData} onBack={back} onUpdate={updateData} />

  const steps = [
    <StepPersonal
      key="personal"
      data={resumeData.personal}
      onChange={(v) => updateData('personal', v)}
    />,
    <StepSummary
      key="summary"
      data={resumeData.summary}
      onChange={(v) => updateData('summary', v)}
    />,
    <StepSkills
      key="skills"
      ref={(el) => (stepRefs.current[2] = el)}
      data={resumeData.skills}
      onChange={(v) => updateData('skills', v)}
    />,
    <StepExperience
      key="experience"
      ref={(el) => (stepRefs.current[3] = el)}
      data={resumeData.experience}
      onChange={(v) => updateData('experience', v)}
    />,
    <StepProjects
      key="projects"
      ref={(el) => (stepRefs.current[4] = el)}
      data={resumeData.projects}
      onChange={(v) => updateData('projects', v)}
    />,
    <StepEducation
      key="education"
      ref={(el) => (stepRefs.current[5] = el)}
      data={resumeData.education}
      onChange={(v) => updateData('education', v)}
    />,
    <StepCertifications
      key="certifications"
      ref={(el) => (stepRefs.current[6] = el)}
      data={resumeData.certifications}
      onChange={(v) => updateData('certifications', v)}
    />,
    <StepLanguages
      key="languages"
      ref={(el) => (stepRefs.current[7] = el)}
      data={resumeData.languages}
      onChange={(v) => updateData('languages', v)}
    />
  ]

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <h1>Guicu</h1>
          </div>

          <div className="header-center">
            {isRenaming ? (
              <>
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename()
                  }}
                  style={{
                    padding: '4px 8px',
                    width: 200,
                    maxWidth: 200,
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <button className="btn-new" onClick={handleConfirmRename} title="Confirmar">
                  <FiCheck size={16} />
                </button>
                <button className="btn-new" onClick={handleCancelRename} title="Cancelar">
                  <FiX size={16} />
                </button>
              </>
            ) : (
              <>
                <CustomSelect
                  className="resume-select-wrap"
                  triggerClassName="pill"
                  value={activeResumeId || ''}
                  onChange={(id) => {
                    setActiveResumeId(id)
                    setStep(0)
                    setShowResume(false)
                    setMaxVisitedStep(0)
                  }}
                  options={resumeList.map((r) => ({ value: r.id, label: r.name }))}
                />
                <button className="btn-new" onClick={handleStartRename} title="Renomear currículo">
                  <FiEdit2 size={14} style={{ marginRight: 4 }} />
                  Renomear
                </button>
                <button className="btn-new" onClick={handleDelete} title="Excluir currículo">
                  <FiTrash2 size={14} style={{ marginRight: 4 }} />
                  Excluir
                </button>
                <button className="btn-new" onClick={handleDuplicate} title="Duplicar currículo">
                  <FiCopy size={14} style={{ marginRight: 4 }} />
                  Duplicar
                </button>
                <button className="btn-new" onClick={handleCreateNew} title="Criar novo currículo">
                  <FiPlus size={14} style={{ marginRight: 4 }} />
                  Novo
                </button>
              </>
            )}

            <span
              className="save-status"
              title={lastSaveTime ? `Último salvamento: ${lastSaveTime.toLocaleString()}` : ''}
            >
              {getSaveStatusText()}
            </span>
          </div>

          {/* Botões de controle da janela */}
          <div className="window-controls">
            <button
              onClick={() => window.resumeAPI.minimizeWindow()}
              className="window-btn"
              title="Minimizar"
            >
              <FiMinus size={14} />
            </button>
            <button
              onClick={() => window.resumeAPI.maximizeWindow()}
              className="window-btn"
              title="Maximizar/Restaurar"
            >
              <FiSquare size={12} />
            </button>
            <button
              onClick={() => window.resumeAPI.closeWindow()}
              className="window-btn window-close"
              title="Fechar"
            >
              <FiX size={14} />
            </button>
          </div>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <ProgressBar steps={STEPS} current={step} onStepClick={goToStep} />
            <button
              type="button"
              className="sidebar-settings-btn"
              onClick={() => setShowSettingsModal(true)}
              title="Configurações"
            >
              <FiSettings size={18} />
            </button>
          </aside>
          <div className="wizard-content">
            <div className="wizard-card">
              {steps[step]}

              <div className="wizard-nav">
                {step > 0 ? (
                  <button className="btn-secondary" onClick={back}>
                    <FiArrowLeft />
                    Voltar
                  </button>
                ) : (
                  <span />
                )}
                <button className="btn-primary" onClick={next}>
                  {step === STEPS.length - 1 ? (
                    <>
                      Gerar Currículo <FiArrowRight />
                    </>
                  ) : (
                    <>
                      Próximo <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificação de atualização — fica fixa no canto inferior direito, fora do fluxo do header, pra nunca sobrepor os botões de janela nem o link manual de atualização */}
      {(downloadProgress !== null || updateAvailable) && (
        <div className="update-toast">
          {downloadProgress !== null ? (
            <>
              <span className="update-toast-label">
                Baixando atualização… {Math.round(downloadProgress)}%
              </span>
              <div className="update-toast-bar">
                <div
                  className="update-toast-bar-fill"
                  style={{ width: `${Math.round(downloadProgress)}%` }}
                />
              </div>
            </>
          ) : (
            <a
              href="#"
              className="update-toast-link"
              onClick={(e) => {
                e.preventDefault()
                window.open('https://github.com/carvalho-jefferson/guicu/releases/latest')
              }}
            >
              <FiArrowUp /> Nova versão disponível: {updateAvailable}
            </a>
          )}
        </div>
      )}
      {/* Modal de validação */}
      {showValidationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              color: '#757474'
            }}
          >
            <h2 style={{ marginTop: 0, color: '#a91a1a' }}>Campos obrigatórios não preenchidos</h2>
            <p style={{ marginBottom: 20, marginTop: 10 }}>Por favor, preencha os campos abaixo:</p>
            <ul style={{ margin: '0 0 24px 20px', padding: 0 }}>
              {validationErrors.map((err, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  {err}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowValidationModal(false)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <h2 style={{ marginTop: 0, color: '#a91a1a' }}>Excluir currículo</h2>
            <p style={{ marginBottom: 24 }}>
              Tem certeza que deseja excluir este currículo? Essa ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, background: '#e53e3e' }}
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Alterações não salvas</h2>
            <p style={{ marginBottom: 24 }}>
              Você iniciou o preenchimento de algum campo mas não o salvou. Deseja salvar as
              alterações antes de continuar?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-primary" onClick={handleUnsavedSaveAndContinue}>
                Salvar e continuar
              </button>
              <button className="btn-secondary" onClick={handleUnsavedDiscardAndContinue}>
                Descartar alterações e continuar
              </button>
              <button className="btn-secondary" onClick={handleUnsavedCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showCommitErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <h2 style={{ marginTop: 0, color: '#a91a1a' }}>Não foi possível salvar</h2>
            <p style={{ marginBottom: 24 }}>
              Preencha os campos obrigatórios desta etapa antes de continuar.
            </p>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowCommitErrorModal(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Configurações</h2>

            <div className="settings-section">
              <h3 className="settings-section-title">Aparência</h3>
              <div className="theme-options">
                <label className="theme-option">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'system'}
                    onChange={() => setTheme('system')}
                  />
                  Padrão do sistema
                </label>
                <label className="theme-option">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  Claro
                </label>
                <label className="theme-option">
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  Escuro
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">Sobre</h3>
              <p className="settings-about-text">
                Guicu — seu currículo guiado. Crie, edite, analise e exporte currículos offline, com
                total privacidade.
              </p>
              <p className="settings-version">Versão {__APP_VERSION__}</p>
              <a
                href="https://github.com/carvalho-jefferson/guicu"
                target="_blank"
                rel="noopener noreferrer"
                className="settings-github-link"
              >
                <FiGithub size={16} /> Ver repositório no GitHub
              </a>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setShowSettingsModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
      {showChangelog && <ChangelogModal onClose={closeChangelog} />}
    </>
  )
}

export default App
