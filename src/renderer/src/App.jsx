import { useState, useEffect, useCallback } from 'react'
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
import { DEFAULT_SECTION_TITLES } from './i18n/resumeLabels'
import './assets/main.css'
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX
} from 'react-icons/fi'

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

  const handleDelete = async () => {
    if (!activeResumeId) return
    if (!confirm('Tem certeza que deseja excluir este currículo?')) return
    await window.resumeAPI.deleteResume(activeResumeId)
    await loadResumeList()
    const list = await window.resumeAPI.listResumes()
    if (list.success && list.data.length > 0) {
      setActiveResumeId(list.data[0].id)
    } else {
      // Se não sobrou nenhum, cria um novo
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

  const updateData = (section, value) => {
    setResumeData((prev) => ({ ...prev, [section]: value }))
    setValidationErrors([]) // some com os erros
  }

  const next = () => {
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

  const back = () => {
    if (showResume) {
      setShowResume(false)
    } else {
      setStep((s) => s - 1)
    }
  }

  const goToStep = (i) => {
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
    <StepSkills key="skills" data={resumeData.skills} onChange={(v) => updateData('skills', v)} />,
    <StepExperience
      key="experience"
      data={resumeData.experience}
      onChange={(v) => updateData('experience', v)}
    />,
    <StepProjects
      key="projects"
      data={resumeData.projects}
      onChange={(v) => updateData('projects', v)}
    />,
    <StepEducation
      key="education"
      data={resumeData.education}
      onChange={(v) => updateData('education', v)}
    />,
    <StepCertifications
      key="certifications"
      data={resumeData.certifications}
      onChange={(v) => updateData('certifications', v)}
    />,
    <StepLanguages
      key="languages"
      data={resumeData.languages}
      onChange={(v) => updateData('languages', v)}
    />
  ]

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <h1>Guicu</h1>
          <span className="version">v{__APP_VERSION__}</span>

          {/* Seletor ou campo de renomeação */}
          {isRenaming ? (
            <>
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmRename()
                }}
                style={{
                  marginLeft: 12,
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
              <select
                className="resume-select"
                value={activeResumeId || ''}
                title={resumeList.find((r) => r.id === activeResumeId)?.name || ''}
                onChange={(e) => {
                  setActiveResumeId(e.target.value)
                  setStep(0)
                  setShowResume(false)
                  setMaxVisitedStep(0)
                }}
              >
                {resumeList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button className="btn-new" onClick={handleStartRename} title="Renomear currículo">
                <FiEdit2 size={14} style={{ marginRight: 4 }} />
                Renomear
              </button>
              <button className="btn-new" onClick={handleDelete} title="Excluir currículo">
                <FiTrash2 size={14} style={{ marginRight: 4 }} />
                Excluir
              </button>
            </>
          )}
          <button className="btn-new" onClick={handleCreateNew} title="Criar novo currículo">
            <FiPlus size={14} style={{ marginRight: 4 }} />
            Novo
          </button>

          <span
            className="save-status"
            title={lastSaveTime ? `Último salvamento: ${lastSaveTime.toLocaleString()}` : ''}
          >
            {getSaveStatusText()}
          </span>

          {updateAvailable && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.open('https://github.com/carvalho-jefferson/guicu/releases/latest')
              }}
              style={{
                marginLeft: 8,
                fontSize: 12,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: 10,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <FiArrowUp /> Nova versão disponível: {updateAvailable}
            </a>
          )}
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <ProgressBar steps={STEPS} current={step} onStepClick={goToStep} />
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
    </>
  )
}

export default App
