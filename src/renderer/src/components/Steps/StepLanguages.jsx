import { useState, forwardRef, useImperativeHandle } from 'react'
import CustomSelect from '../common/CustomSelect'

const CEFR_LABELS = {
  pt: {
    A1: 'Iniciante',
    A2: 'Básico',
    B1: 'Intermediário',
    B2: 'Intermediário avançado',
    C1: 'Avançado',
    C2: 'Proficiente'
  },
  en: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient'
  }
}

// Gera as opções do seletor conforme o idioma ativo
function getCefrOptions(lang) {
  const labels = CEFR_LABELS[lang] || CEFR_LABELS.pt
  return [
    { value: 'A1', label: `A1 – ${labels.A1}` },
    { value: 'A2', label: `A2 – ${labels.A2}` },
    { value: 'B1', label: `B1 – ${labels.B1}` },
    { value: 'B2', label: `B2 – ${labels.B2}` },
    { value: 'C1', label: `C1 – ${labels.C1}` },
    { value: 'C2', label: `C2 – ${labels.C2}` }
  ]
}

const StepLanguages = forwardRef(function StepLanguages(
  { data, onChange, languageDisplay, onLanguageDisplayChange },
  ref
) {
  const [displayLang, setDisplayLang] = useState(languageDisplay || 'pt')
  const [form, setForm] = useState({ language: '', level: 'A1' })

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const add = () => {
    if (!form.language.trim()) return
    onChange([...data, form])
    setForm({ language: '', level: 'A1' })
  }

  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))

  const changeDisplayLang = (lang) => {
    setDisplayLang(lang)
    onLanguageDisplayChange?.(lang)
  }

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => form.language.trim() !== '',
    commit: () => {
      if (form.language.trim()) add()
      return true
    },
    discard: () => setForm({ language: '', level: 'A1' })
  }))

  const cefrOptions = getCefrOptions(displayLang)

  return (
    <div className="step">
      <h2>Idiomas (opcional)</h2>
      <p className="step-desc">
        Considere preencher esta etapa se você está se candidatando para uma vaga internacional,
        para uma empresa multinacional ou para áreas em que idiomas são frequentemente exigidos.
        Nesses contextos, idiomas são valorizados por ATS e recrutadores.
      </p>

      {data.map((lang, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>
              {lang.language} — {CEFR_LABELS[displayLang][lang.level] || lang.level} ({lang.level}{' '}
              CEFR)
            </strong>
          </div>
          <button className="btn-remove" onClick={() => remove(i)}>
            Remover
          </button>
        </div>
      ))}

      <div className="sub-form">
        <h3>Novo idioma</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Idioma</label>
            <input
              name="language"
              value={form.language}
              onChange={handle}
              placeholder="Ex.: Inglês, Espanhol..."
            />
          </div>
          <div className="form-group">
            <label>Nível</label>
            <CustomSelect
              className="form"
              triggerClassName="form"
              value={form.level}
              onChange={(level) => setForm((p) => ({ ...p, level }))}
              options={cefrOptions}
            />
            {/* Toggle bilíngue */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => changeDisplayLang('pt')}
                title="Português"
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  borderRadius: 20,
                  border:
                    displayLang === 'pt'
                      ? '1.5px solid var(--primary)'
                      : '1.5px solid var(--border)',
                  background: displayLang === 'pt' ? 'var(--primary)' : 'transparent',
                  color: displayLang === 'pt' ? 'white' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: displayLang === 'pt' ? 600 : 400,
                  transition: 'all 0.15s'
                }}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => changeDisplayLang('en')}
                title="English"
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  borderRadius: 20,
                  border:
                    displayLang === 'en'
                      ? '1.5px solid var(--primary)'
                      : '1.5px solid var(--border)',
                  background: displayLang === 'en' ? 'var(--primary)' : 'transparent',
                  color: displayLang === 'en' ? 'white' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: displayLang === 'en' ? 600 : 400,
                  transition: 'all 0.15s'
                }}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="sub-form-actions">
          <button className="btn-primary" onClick={add}>
            + Adicionar idioma
          </button>
        </div>
      </div>
    </div>
  )
})

export default StepLanguages
